/**
 * Advanced Lazy Loading Implementation
 * CandGig Blogger Template
 */

(function() {
  'use strict';

  class LazyLoader {
    constructor(options = {}) {
      this.options = {
        root: null,
        rootMargin: '50px 0px',
        threshold: 0.01,
        loadingClass: 'lazy-loading',
        loadedClass: 'lazy-loaded',
        errorClass: 'lazy-error',
        ...options
      };

      this.observer = null;
      this.images = [];
      this.iframes = [];
      this.videos = [];
      
      this.init();
    }

    init() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver(
          this.handleIntersection.bind(this),
          this.options
        );
        this.scanElements();
      } else {
        // Fallback for older browsers
        this.loadAllElements();
      }
    }

    scanElements() {
      // Lazy load images
      this.images = document.querySelectorAll('img[data-src], img[data-srcset]');
      this.images.forEach(img => {
        img.classList.add(this.options.loadingClass);
        this.observer.observe(img);
      });

      // Lazy load iframes
      this.iframes = document.querySelectorAll('iframe[data-src]');
      this.iframes.forEach(iframe => {
        iframe.classList.add(this.options.loadingClass);
        this.observer.observe(iframe);
      });

      // Lazy load videos
      this.videos = document.querySelectorAll('video[data-src], video source[data-src]');
      this.videos.forEach(video => {
        video.classList.add(this.options.loadingClass);
        this.observer.observe(video);
      });
    }

    handleIntersection(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          if (element.tagName === 'IMG') {
            this.loadImage(element);
          } else if (element.tagName === 'IFRAME') {
            this.loadIframe(element);
          } else if (element.tagName === 'VIDEO' || element.tagName === 'SOURCE') {
            this.loadVideo(element);
          }
          
          this.observer.unobserve(element);
        }
      });
    }

    loadImage(img) {
      return new Promise((resolve, reject) => {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;
        const sizes = img.dataset.sizes;

        if (!src) {
          reject(new Error('No src provided'));
          return;
        }

        // Create new image to preload
        const imageLoader = new Image();
        
        imageLoader.onload = () => {
          // Update the actual image
          img.src = src;
          if (srcset) img.srcset = srcset;
          if (sizes) img.sizes = sizes;
          
          // Remove loading class and add loaded class
          img.classList.remove(this.options.loadingClass);
          img.classList.add(this.options.loadedClass);
          
          // Remove data attributes
          delete img.dataset.src;
          delete img.dataset.srcset;
          delete img.dataset.sizes;
          
          resolve(img);
        };

        imageLoader.onerror = () => {
          img.classList.remove(this.options.loadingClass);
          img.classList.add(this.options.errorClass);
          reject(new Error('Failed to load image'));
        };

        // Start loading
        imageLoader.src = src;
        if (srcset) imageLoader.srcset = srcset;
      });
    }

    loadIframe(iframe) {
      const src = iframe.dataset.src;
      
      if (!src) return;

      iframe.src = src;
      iframe.classList.remove(this.options.loadingClass);
      iframe.classList.add(this.options.loadedClass);
      
      delete iframe.dataset.src;
    }

    loadVideo(video) {
      const src = video.dataset.src;
      
      if (!src) return;

      if (video.tagName === 'SOURCE') {
        video.src = src;
        video.parentElement.load(); // Reload video element
      } else {
        video.src = src;
        video.load();
      }
      
      video.classList.remove(this.options.loadingClass);
      video.classList.add(this.options.loadedClass);
      
      delete video.dataset.src;
    }

    loadAllElements() {
      // Fallback: load all elements immediately
      [...this.images, ...this.iframes, ...this.videos].forEach(element => {
        if (element.tagName === 'IMG') {
          this.loadImage(element);
        } else if (element.tagName === 'IFRAME') {
          this.loadIframe(element);
        } else if (element.tagName === 'VIDEO' || element.tagName === 'SOURCE') {
          this.loadVideo(element);
        }
      });
    }

    // Public method to add new elements
    observe(element) {
      if (this.observer) {
        element.classList.add(this.options.loadingClass);
        this.observer.observe(element);
      } else {
        this.loadAllElements();
      }
    }

    // Public method to disconnect observer
    disconnect() {
      if (this.observer) {
        this.observer.disconnect();
      }
    }
  }

  // Progressive image loading with blur effect
  class ProgressiveImageLoader {
    constructor() {
      this.init();
    }

    init() {
      const progressiveImages = document.querySelectorAll('img[data-progressive]');
      
      progressiveImages.forEach(img => {
        this.loadProgressiveImage(img);
      });
    }

    loadProgressiveImage(img) {
      const lowResSrc = img.dataset.lowRes || img.src;
      const highResSrc = img.dataset.highRes || img.dataset.src;
      
      if (!highResSrc) return;

      // Show low-res image immediately
      img.src = lowResSrc;
      img.style.filter = 'blur(5px)';
      img.style.transition = 'filter 0.3s ease';

      // Load high-res image
      const highResImg = new Image();
      highResImg.onload = () => {
        img.src = highResSrc;
        img.style.filter = 'none';
        img.classList.add('progressive-loaded');
      };

      highResImg.src = highResSrc;
    }
  }

  // Background image lazy loading
  class BackgroundImageLoader {
    constructor() {
      this.init();
    }

    init() {
      const elements = document.querySelectorAll('[data-bg]');
      
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const element = entry.target;
              const bgImage = element.dataset.bg;
              
              if (bgImage) {
                element.style.backgroundImage = `url(${bgImage})`;
                element.classList.add('bg-loaded');
                observer.unobserve(element);
              }
            }
          });
        }, { rootMargin: '50px 0px' });

        elements.forEach(el => observer.observe(el));
      } else {
        // Fallback
        elements.forEach(el => {
          const bgImage = el.dataset.bg;
          if (bgImage) {
            el.style.backgroundImage = `url(${bgImage})`;
            el.classList.add('bg-loaded');
          }
        });
      }
    }
  }

  // Initialize lazy loading when DOM is ready
  function initLazyLoading() {
    // Main lazy loader
    window.lazyLoader = new LazyLoader({
      rootMargin: '100px 0px',
      threshold: 0.01
    });

    // Progressive image loader
    window.progressiveLoader = new ProgressiveImageLoader();

    // Background image loader
    window.backgroundLoader = new BackgroundImageLoader();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoading);
  } else {
    initLazyLoading();
  }

  // Export for global access
  window.CandGigLazyLoading = {
    LazyLoader,
    ProgressiveImageLoader,
    BackgroundImageLoader
  };

})();