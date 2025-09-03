/**
 * Lazy Loading JavaScript for Candgig Blogger Template
 * Advanced lazy loading implementation with Intersection Observer
 * Version: 2.0.0
 * Target: Vietnamese parenting blog (candgig.blogspot.com)
 */

(function(window, document) {
  'use strict';

  const LazyLoader = {
    // Configuration
    config: {
      imageSelector: 'img[data-src], img[loading="lazy"]',
      iframeSelector: 'iframe[data-src]',
      backgroundSelector: '[data-bg]',
      rootMargin: '50px 0px',
      threshold: 0.01,
      enableNativeLazyLoading: true,
      placeholderClass: 'lazy-placeholder',
      loadedClass: 'lazy-loaded',
      errorClass: 'lazy-error',
      fadeInDuration: 300
    },

    // State management
    state: {
      isInitialized: false,
      supportsIntersectionObserver: 'IntersectionObserver' in window,
      supportsNativeLazyLoading: 'loading' in HTMLImageElement.prototype,
      observers: new Map(),
      loadedElements: new Set(),
      retryAttempts: new Map()
    },

    // Utility functions
    utils: {
      // Check if element is in viewport (fallback)
      isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        return (
          rect.top <= windowHeight * (1 + threshold) &&
          rect.bottom >= -windowHeight * threshold &&
          rect.left <= windowWidth &&
          rect.right >= 0
        );
      },

      // Throttle function for scroll events
      throttle(func, limit) {
        let inThrottle;
        return function() {
          const args = arguments;
          const context = this;
          if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
          }
        };
      },

      // Generate placeholder image
      generatePlaceholder(width, height, backgroundColor = '#f0f0f0') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = width || 1;
        canvas.height = height || 1;
        
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        return canvas.toDataURL('image/png');
      },

      // Create blur placeholder from original image
      createBlurPlaceholder(src) {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Small canvas for blur effect
            canvas.width = 10;
            canvas.height = 10;
            
            ctx.filter = 'blur(5px)';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            resolve(canvas.toDataURL('image/jpeg', 0.1));
          };
          img.onerror = () => resolve(null);
          img.src = src;
        });
      },

      // Debounce function
      debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
          const later = () => {
            clearTimeout(timeout);
            func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        };
      }
    },

    // Image lazy loading
    images: {
      init() {
        console.log('Initializing image lazy loading...');
        
        // Use native lazy loading if supported and enabled
        if (LazyLoader.state.supportsNativeLazyLoading && LazyLoader.config.enableNativeLazyLoading) {
          this.setupNativeLazyLoading();
        }
        
        // Always setup intersection observer for advanced features
        if (LazyLoader.state.supportsIntersectionObserver) {
          this.setupIntersectionObserver();
        } else {
          this.setupScrollBasedLazyLoading();
        }
        
        this.setupPlaceholders();
      },

      setupNativeLazyLoading() {
        const images = document.querySelectorAll('img:not([loading])');
        
        images.forEach(img => {
          // Skip images that are already in viewport
          if (!LazyLoader.utils.isInViewport(img, 0.1)) {
            img.loading = 'lazy';
          }
        });
        
        console.log(`Applied native lazy loading to ${images.length} images`);
      },

      setupIntersectionObserver() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: LazyLoader.config.rootMargin,
          threshold: LazyLoader.config.threshold
        });

        // Store observer reference
        LazyLoader.state.observers.set('images', imageObserver);

        // Observe all lazy images
        const lazyImages = document.querySelectorAll(LazyLoader.config.imageSelector);
        lazyImages.forEach(img => {
          if (!LazyLoader.state.loadedElements.has(img)) {
            imageObserver.observe(img);
            this.prepareImage(img);
          }
        });

        console.log(`Set up intersection observer for ${lazyImages.length} images`);
      },

      setupScrollBasedLazyLoading() {
        const checkImages = LazyLoader.utils.throttle(() => {
          const lazyImages = document.querySelectorAll(LazyLoader.config.imageSelector);
          
          lazyImages.forEach(img => {
            if (LazyLoader.utils.isInViewport(img, 0.1) && !LazyLoader.state.loadedElements.has(img)) {
              this.loadImage(img);
            }
          });
        }, 200);

        window.addEventListener('scroll', checkImages, { passive: true });
        window.addEventListener('resize', LazyLoader.utils.debounce(checkImages, 250));
        
        // Initial check
        checkImages();
        
        console.log('Set up scroll-based lazy loading fallback');
      },

      prepareImage(img) {
        // Add loading classes
        img.classList.add(LazyLoader.config.placeholderClass);
        
        // Create placeholder if not already set
        if (!img.src || img.src === window.location.href) {
          const width = img.getAttribute('width') || img.offsetWidth || 300;
          const height = img.getAttribute('height') || img.offsetHeight || 200;
          img.src = LazyLoader.utils.generatePlaceholder(width, height);
        }

        // Set up error handling
        img.addEventListener('error', () => this.handleImageError(img), { once: true });
      },

      async loadImage(img) {
        if (LazyLoader.state.loadedElements.has(img)) return;
        
        const src = img.dataset.src || img.getAttribute('data-src');
        if (!src) return;

        try {
          // Mark as being loaded
          LazyLoader.state.loadedElements.add(img);
          
          // Create new image for preloading
          const imageLoader = new Image();
          
          // Set up success handler
          imageLoader.onload = () => {
            // Apply the source
            img.src = src;
            
            // Remove data-src to prevent reloading
            img.removeAttribute('data-src');
            delete img.dataset.src;
            
            // Handle fade-in animation
            this.animateImageLoad(img);
            
            // Update loading state
            img.classList.remove(LazyLoader.config.placeholderClass);
            img.classList.add(LazyLoader.config.loadedClass);
            
            // Dispatch custom event
            const loadEvent = new CustomEvent('imageLoaded', {
              detail: { element: img, src: src }
            });
            img.dispatchEvent(loadEvent);
            
            console.log('Lazy loaded image:', src);
          };
          
          // Set up error handler
          imageLoader.onerror = () => {
            this.handleImageError(img);
          };
          
          // Start loading
          imageLoader.src = src;
          
          // Set loading attributes for SEO and accessibility
          if (!img.hasAttribute('alt')) {
            img.setAttribute('alt', '');
          }
          
          if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
          }
          
        } catch (error) {
          console.error('Error loading image:', src, error);
          this.handleImageError(img);
        }
      },

      animateImageLoad(img) {
        // Skip animation if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }

        // Fade-in animation
        img.style.opacity = '0';
        img.style.transition = `opacity ${LazyLoader.config.fadeInDuration}ms ease-in-out`;
        
        // Force reflow
        img.offsetHeight;
        
        // Trigger fade-in
        requestAnimationFrame(() => {
          img.style.opacity = '1';
        });
        
        // Clean up styles after animation
        setTimeout(() => {
          img.style.opacity = '';
          img.style.transition = '';
        }, LazyLoader.config.fadeInDuration);
      },

      handleImageError(img) {
        const retryCount = LazyLoader.state.retryAttempts.get(img) || 0;
        
        if (retryCount < 2) {
          // Retry loading
          LazyLoader.state.retryAttempts.set(img, retryCount + 1);
          LazyLoader.state.loadedElements.delete(img);
          
          setTimeout(() => {
            this.loadImage(img);
          }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
          
        } else {
          // Give up and show error state
          img.classList.remove(LazyLoader.config.placeholderClass);
          img.classList.add(LazyLoader.config.errorClass);
          
          // Use fallback image if available
          const fallback = img.dataset.fallback;
          if (fallback) {
            img.src = fallback;
          }
          
          console.error('Failed to load image after retries:', img.dataset.src || img.src);
        }
      },

      setupPlaceholders() {
        // Create CSS for placeholders if not already defined
        if (!document.getElementById('lazy-loading-styles')) {
          const style = document.createElement('style');
          style.id = 'lazy-loading-styles';
          style.textContent = `
            .${LazyLoader.config.placeholderClass} {
              background-color: #f0f0f0;
              background-image: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading-shimmer 1.5s infinite ease-in-out;
            }
            
            .${LazyLoader.config.loadedClass} {
              background: none;
              animation: none;
            }
            
            .${LazyLoader.config.errorClass} {
              background-color: #ffebee;
              border: 1px dashed #f44336;
              opacity: 0.7;
            }
            
            @keyframes loading-shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            
            @media (prefers-reduced-motion: reduce) {
              .${LazyLoader.config.placeholderClass} {
                animation: none;
              }
            }
          `;
          document.head.appendChild(style);
        }
      }
    },

    // Background image lazy loading
    backgrounds: {
      init() {
        if (!LazyLoader.state.supportsIntersectionObserver) {
          this.setupScrollBasedLoading();
          return;
        }

        const backgroundObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadBackground(entry.target);
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: LazyLoader.config.rootMargin,
          threshold: LazyLoader.config.threshold
        });

        LazyLoader.state.observers.set('backgrounds', backgroundObserver);

        const lazyBackgrounds = document.querySelectorAll(LazyLoader.config.backgroundSelector);
        lazyBackgrounds.forEach(element => {
          backgroundObserver.observe(element);
        });

        console.log(`Set up background lazy loading for ${lazyBackgrounds.length} elements`);
      },

      setupScrollBasedLoading() {
        const checkBackgrounds = LazyLoader.utils.throttle(() => {
          const lazyBackgrounds = document.querySelectorAll(LazyLoader.config.backgroundSelector);
          
          lazyBackgrounds.forEach(element => {
            if (LazyLoader.utils.isInViewport(element, 0.1) && !LazyLoader.state.loadedElements.has(element)) {
              this.loadBackground(element);
            }
          });
        }, 200);

        window.addEventListener('scroll', checkBackgrounds, { passive: true });
        window.addEventListener('resize', LazyLoader.utils.debounce(checkBackgrounds, 250));
        
        checkBackgrounds();
      },

      loadBackground(element) {
        if (LazyLoader.state.loadedElements.has(element)) return;
        
        const bgSrc = element.dataset.bg;
        if (!bgSrc) return;

        LazyLoader.state.loadedElements.add(element);

        // Preload background image
        const img = new Image();
        img.onload = () => {
          element.style.backgroundImage = `url(${bgSrc})`;
          element.classList.add(LazyLoader.config.loadedClass);
          element.removeAttribute('data-bg');
          
          const loadEvent = new CustomEvent('backgroundLoaded', {
            detail: { element: element, src: bgSrc }
          });
          element.dispatchEvent(loadEvent);
          
          console.log('Lazy loaded background:', bgSrc);
        };
        
        img.onerror = () => {
          console.error('Failed to load background image:', bgSrc);
          element.classList.add(LazyLoader.config.errorClass);
        };
        
        img.src = bgSrc;
      }
    },

    // iframe lazy loading
    iframes: {
      init() {
        if (!LazyLoader.state.supportsIntersectionObserver) {
          this.setupScrollBasedLoading();
          return;
        }

        const iframeObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadIframe(entry.target);
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: LazyLoader.config.rootMargin,
          threshold: LazyLoader.config.threshold
        });

        LazyLoader.state.observers.set('iframes', iframeObserver);

        const lazyIframes = document.querySelectorAll(LazyLoader.config.iframeSelector);
        lazyIframes.forEach(iframe => {
          this.prepareIframe(iframe);
          iframeObserver.observe(iframe);
        });

        console.log(`Set up iframe lazy loading for ${lazyIframes.length} elements`);
      },

      setupScrollBasedLoading() {
        const checkIframes = LazyLoader.utils.throttle(() => {
          const lazyIframes = document.querySelectorAll(LazyLoader.config.iframeSelector);
          
          lazyIframes.forEach(iframe => {
            if (LazyLoader.utils.isInViewport(iframe, 0.1) && !LazyLoader.state.loadedElements.has(iframe)) {
              this.loadIframe(iframe);
            }
          });
        }, 200);

        window.addEventListener('scroll', checkIframes, { passive: true });
        window.addEventListener('resize', LazyLoader.utils.debounce(checkIframes, 250));
        
        checkIframes();
      },

      prepareIframe(iframe) {
        // Add placeholder styling
        iframe.classList.add(LazyLoader.config.placeholderClass);
        
        // Set up loading indicator
        const placeholder = document.createElement('div');
        placeholder.className = 'iframe-placeholder';
        placeholder.innerHTML = `
          <div class="iframe-loading">
            <div class="spinner"></div>
            <p>Loading content...</p>
          </div>
        `;
        
        iframe.parentNode.insertBefore(placeholder, iframe);
        iframe.style.display = 'none';
      },

      loadIframe(iframe) {
        if (LazyLoader.state.loadedElements.has(iframe)) return;
        
        const src = iframe.dataset.src;
        if (!src) return;

        LazyLoader.state.loadedElements.add(iframe);

        // Set the src to start loading
        iframe.src = src;
        iframe.removeAttribute('data-src');
        
        // Handle load event
        iframe.onload = () => {
          iframe.style.display = '';
          iframe.classList.remove(LazyLoader.config.placeholderClass);
          iframe.classList.add(LazyLoader.config.loadedClass);
          
          // Remove placeholder
          const placeholder = iframe.parentNode.querySelector('.iframe-placeholder');
          if (placeholder) {
            placeholder.remove();
          }
          
          const loadEvent = new CustomEvent('iframeLoaded', {
            detail: { element: iframe, src: src }
          });
          iframe.dispatchEvent(loadEvent);
          
          console.log('Lazy loaded iframe:', src);
        };
        
        iframe.onerror = () => {
          console.error('Failed to load iframe:', src);
          iframe.classList.add(LazyLoader.config.errorClass);
        };
      }
    },

    // Content lazy loading (for dynamic content)
    content: {
      init() {
        this.setupContentObserver();
      },

      setupContentObserver() {
        if (!LazyLoader.state.supportsIntersectionObserver) return;

        const contentObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadContent(entry.target);
            }
          });
        }, {
          rootMargin: '100px 0px',
          threshold: 0.01
        });

        LazyLoader.state.observers.set('content', contentObserver);

        // Observe elements with data-lazy-content
        const lazyContentElements = document.querySelectorAll('[data-lazy-content]');
        lazyContentElements.forEach(element => {
          contentObserver.observe(element);
        });

        console.log(`Set up content lazy loading for ${lazyContentElements.length} elements`);
      },

      async loadContent(element) {
        if (LazyLoader.state.loadedElements.has(element)) return;
        
        const contentUrl = element.dataset.lazyContent;
        if (!contentUrl) return;

        LazyLoader.state.loadedElements.add(element);

        try {
          const response = await fetch(contentUrl);
          const content = await response.text();
          
          element.innerHTML = content;
          element.classList.add(LazyLoader.config.loadedClass);
          
          // Process any new lazy elements in the loaded content
          this.processNewContent(element);
          
          const loadEvent = new CustomEvent('contentLoaded', {
            detail: { element: element, url: contentUrl }
          });
          element.dispatchEvent(loadEvent);
          
          console.log('Lazy loaded content:', contentUrl);
          
        } catch (error) {
          console.error('Failed to load content:', contentUrl, error);
          element.classList.add(LazyLoader.config.errorClass);
          element.innerHTML = '<p>Failed to load content.</p>';
        }
      },

      processNewContent(container) {
        // Re-initialize lazy loading for new images
        const newImages = container.querySelectorAll(LazyLoader.config.imageSelector);
        const imageObserver = LazyLoader.state.observers.get('images');
        
        if (imageObserver) {
          newImages.forEach(img => {
            LazyLoader.images.prepareImage(img);
            imageObserver.observe(img);
          });
        }

        // Re-initialize for new backgrounds
        const newBackgrounds = container.querySelectorAll(LazyLoader.config.backgroundSelector);
        const backgroundObserver = LazyLoader.state.observers.get('backgrounds');
        
        if (backgroundObserver) {
          newBackgrounds.forEach(element => {
            backgroundObserver.observe(element);
          });
        }
      }
    },

    // Public API
    api: {
      // Manually trigger loading of an element
      loadElement(element) {
        if (element.tagName === 'IMG') {
          LazyLoader.images.loadImage(element);
        } else if (element.tagName === 'IFRAME') {
          LazyLoader.iframes.loadIframe(element);
        } else if (element.dataset.bg) {
          LazyLoader.backgrounds.loadBackground(element);
        } else if (element.dataset.lazyContent) {
          LazyLoader.content.loadContent(element);
        }
      },

      // Force load all lazy elements
      loadAll() {
        const allLazyElements = document.querySelectorAll(`
          ${LazyLoader.config.imageSelector},
          ${LazyLoader.config.iframeSelector},
          ${LazyLoader.config.backgroundSelector},
          [data-lazy-content]
        `);

        allLazyElements.forEach(element => {
          this.loadElement(element);
        });
      },

      // Get loading statistics
      getStats() {
        return {
          initialized: LazyLoader.state.isInitialized,
          supportsIntersectionObserver: LazyLoader.state.supportsIntersectionObserver,
          supportsNativeLazyLoading: LazyLoader.state.supportsNativeLazyLoading,
          loadedElements: LazyLoader.state.loadedElements.size,
          retryAttempts: LazyLoader.state.retryAttempts.size
        };
      },

      // Refresh observers (useful after adding new content)
      refresh() {
        LazyLoader.init();
      }
    },

    // Main initialization
    init() {
      if (LazyLoader.state.isInitialized) {
        console.warn('LazyLoader already initialized');
        return;
      }

      console.log('Initializing LazyLoader...');
      
      try {
        LazyLoader.images.init();
        LazyLoader.backgrounds.init();
        LazyLoader.iframes.init();
        LazyLoader.content.init();
        
        LazyLoader.state.isInitialized = true;
        
        // Dispatch initialization event
        const initEvent = new CustomEvent('lazyLoaderInitialized', {
          detail: LazyLoader.api.getStats()
        });
        document.dispatchEvent(initEvent);
        
        console.log('LazyLoader initialized successfully');
        
      } catch (error) {
        console.error('Error initializing LazyLoader:', error);
      }
    },

    // Cleanup function
    destroy() {
      LazyLoader.state.observers.forEach(observer => {
        observer.disconnect();
      });
      
      LazyLoader.state.observers.clear();
      LazyLoader.state.loadedElements.clear();
      LazyLoader.state.retryAttempts.clear();
      LazyLoader.state.isInitialized = false;
      
      console.log('LazyLoader destroyed');
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LazyLoader.init());
  } else {
    LazyLoader.init();
  }

  // Handle dynamic content changes
  if ('MutationObserver' in window) {
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Re-initialize for new nodes after a delay
          setTimeout(() => {
            LazyLoader.api.refresh();
          }, 100);
        }
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Expose LazyLoader API globally
  window.LazyLoader = LazyLoader.api;

  // Add to CandgigTheme if available
  if (window.CandgigTheme) {
    window.CandgigTheme.LazyLoader = LazyLoader;
  }

})(window, document);