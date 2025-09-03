/**
 * Main JavaScript for Candgig Blogger Template
 * Core functionality and theme features
 * Version: 2.0.0
 * Target: Vietnamese parenting blog (candgig.blogspot.com)
 */

(function(window, document) {
  'use strict';

  // Theme namespace
  const CandgigTheme = {
    // Configuration
    config: {
      searchEndpoint: '/search',
      animationDuration: 300,
      debounceDelay: 250,
      lazyLoadOffset: 100,
      cacheExpiry: 300000, // 5 minutes
      breakpoints: {
        mobile: 768,
        tablet: 992,
        desktop: 1200
      }
    },

    // Cache for performance
    cache: new Map(),

    // Utility functions
    utils: {
      // Debounce function for performance optimization
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

      // Check if element is in viewport
      isInViewport(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        return (
          rect.top >= -offset &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
      },

      // Get current breakpoint
      getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width < CandgigTheme.config.breakpoints.mobile) return 'mobile';
        if (width < CandgigTheme.config.breakpoints.tablet) return 'tablet';
        if (width < CandgigTheme.config.breakpoints.desktop) return 'desktop';
        return 'wide';
      },

      // Smooth scroll to element
      smoothScrollTo(target, offset = 0) {
        const element = typeof target === 'string' ? document.querySelector(target) : target;
        if (!element) return;

        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      },

      // Local storage helper with expiry
      storage: {
        set(key, value, expiry = CandgigTheme.config.cacheExpiry) {
          const item = {
            value: value,
            expiry: Date.now() + expiry
          };
          try {
            localStorage.setItem(key, JSON.stringify(item));
          } catch (e) {
            console.warn('LocalStorage not available:', e);
          }
        },

        get(key) {
          try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const parsed = JSON.parse(item);
            if (Date.now() > parsed.expiry) {
              localStorage.removeItem(key);
              return null;
            }
            return parsed.value;
          } catch (e) {
            console.warn('Error reading from localStorage:', e);
            return null;
          }
        },

        remove(key) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.warn('Error removing from localStorage:', e);
          }
        }
      }
    },

    // Navigation functionality
    navigation: {
      init() {
        this.setupMobileNav();
        this.setupActiveStates();
        this.setupSmoothScrolling();
      },

      setupMobileNav() {
        const navToggle = document.querySelector('.nav-toggle');
        const mainNav = document.querySelector('.main-nav');
        
        if (!navToggle || !mainNav) return;

        navToggle.addEventListener('click', () => {
          const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
          
          navToggle.setAttribute('aria-expanded', !isExpanded);
          mainNav.classList.toggle('active');
          
          // Prevent body scroll when mobile menu is open
          document.body.classList.toggle('nav-open', !isExpanded);
          
          // Focus management
          if (!isExpanded) {
            const firstLink = mainNav.querySelector('.nav-link');
            if (firstLink) firstLink.focus();
          }
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', (e) => {
          if (!navToggle.contains(e.target) && !mainNav.contains(e.target)) {
            navToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.classList.remove('nav-open');
          }
        });

        // Close mobile nav on escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && mainNav.classList.contains('active')) {
            navToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.classList.remove('nav-open');
            navToggle.focus();
          }
        });

        // Close mobile nav on resize to desktop
        window.addEventListener('resize', CandgigTheme.utils.debounce(() => {
          if (window.innerWidth >= CandgigTheme.config.breakpoints.mobile) {
            navToggle.setAttribute('aria-expanded', 'false');
            mainNav.classList.remove('active');
            document.body.classList.remove('nav-open');
          }
        }, 100));
      },

      setupActiveStates() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
          if (link.getAttribute('href') === currentPath || 
              (currentPath === '/' && link.getAttribute('href') === '/')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          }
        });
      },

      setupSmoothScrolling() {
        // Handle anchor links
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        anchorLinks.forEach(link => {
          link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
              e.preventDefault();
              CandgigTheme.utils.smoothScrollTo(target, 20);
              
              // Update URL without triggering scroll
              if (history.pushState) {
                history.pushState(null, null, href);
              }
            }
          });
        });
      }
    },

    // Search functionality
    search: {
      init() {
        this.setupSearchForm();
        this.setupInstantSearch();
      },

      setupSearchForm() {
        const searchInput = document.querySelector('.search-input');
        const searchButton = document.querySelector('.search-button');
        
        if (!searchInput || !searchButton) return;

        // Handle search submission
        const performSearch = () => {
          const query = searchInput.value.trim();
          if (!query) return;
          
          // Store recent search
          this.addToRecentSearches(query);
          
          // Redirect to search results
          window.location.href = `${CandgigTheme.config.searchEndpoint}?q=${encodeURIComponent(query)}`;
        };

        searchButton.addEventListener('click', performSearch);
        
        searchInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
          }
        });

        // Load recent searches
        this.loadRecentSearches();
      },

      setupInstantSearch() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        let searchResults = null;

        const showSuggestions = CandgigTheme.utils.debounce(async (query) => {
          if (query.length < 2) {
            this.hideSuggestions();
            return;
          }

          try {
            const suggestions = await this.getSuggestions(query);
            this.displaySuggestions(suggestions, searchInput);
          } catch (error) {
            console.warn('Search suggestions failed:', error);
          }
        }, CandgigTheme.config.debounceDelay);

        searchInput.addEventListener('input', (e) => {
          showSuggestions(e.target.value.trim());
        });

        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.search-container')) {
            this.hideSuggestions();
          }
        });
      },

      async getSuggestions(query) {
        // Simple mock implementation - in real scenario, this would call Blogger's search API
        const cacheKey = `search_${query}`;
        const cached = CandgigTheme.utils.storage.get(cacheKey);
        
        if (cached) return cached;

        // Mock suggestions based on common parenting topics
        const mockSuggestions = [
          'nuôi dạy con',
          'chăm sóc em bé',
          'phát triển trẻ em',
          'giáo dục sớm',
          'sức khỏe trẻ em',
          'dinh dưỡng cho bé',
          'kỹ năng sống',
          'tâm lý trẻ em'
        ].filter(item => item.toLowerCase().includes(query.toLowerCase()));

        CandgigTheme.utils.storage.set(cacheKey, mockSuggestions);
        return mockSuggestions;
      },

      displaySuggestions(suggestions, inputElement) {
        this.hideSuggestions();
        
        if (!suggestions.length) return;

        const container = inputElement.closest('.search-container');
        const suggestionsList = document.createElement('div');
        suggestionsList.className = 'search-suggestions';
        suggestionsList.setAttribute('role', 'listbox');

        suggestions.forEach((suggestion, index) => {
          const item = document.createElement('button');
          item.className = 'search-suggestion-item';
          item.textContent = suggestion;
          item.setAttribute('role', 'option');
          item.setAttribute('tabindex', '-1');
          
          item.addEventListener('click', () => {
            inputElement.value = suggestion;
            this.hideSuggestions();
            inputElement.focus();
          });

          suggestionsList.appendChild(item);
        });

        container.appendChild(suggestionsList);
        
        // Keyboard navigation for suggestions
        this.setupSuggestionKeyboardNav(inputElement, suggestionsList);
      },

      setupSuggestionKeyboardNav(input, suggestionsList) {
        const items = suggestionsList.querySelectorAll('.search-suggestion-item');
        let currentIndex = -1;

        input.addEventListener('keydown', (e) => {
          if (!suggestionsList.parentNode) return;

          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              currentIndex = Math.min(currentIndex + 1, items.length - 1);
              this.updateSuggestionFocus(items, currentIndex);
              break;
            case 'ArrowUp':
              e.preventDefault();
              currentIndex = Math.max(currentIndex - 1, -1);
              if (currentIndex === -1) {
                input.focus();
              } else {
                this.updateSuggestionFocus(items, currentIndex);
              }
              break;
            case 'Enter':
              if (currentIndex >= 0) {
                e.preventDefault();
                items[currentIndex].click();
              }
              break;
            case 'Escape':
              this.hideSuggestions();
              break;
          }
        });
      },

      updateSuggestionFocus(items, index) {
        items.forEach((item, i) => {
          item.classList.toggle('highlighted', i === index);
          if (i === index) {
            item.focus();
          }
        });
      },

      hideSuggestions() {
        const suggestions = document.querySelector('.search-suggestions');
        if (suggestions) {
          suggestions.remove();
        }
      },

      addToRecentSearches(query) {
        const recent = CandgigTheme.utils.storage.get('recent_searches') || [];
        const updated = [query, ...recent.filter(item => item !== query)].slice(0, 5);
        CandgigTheme.utils.storage.set('recent_searches', updated);
      },

      loadRecentSearches() {
        const recent = CandgigTheme.utils.storage.get('recent_searches') || [];
        // Could display recent searches in UI if needed
      }
    },

    // Social sharing functionality
    social: {
      init() {
        this.setupShareButtons();
      },

      setupShareButtons() {
        const shareButtons = document.querySelectorAll('[data-share]');
        
        shareButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const platform = button.dataset.share;
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            this.shareOn(platform, url, title);
          });
        });

        // Native Web Share API support
        if (navigator.share) {
          const nativeShareButtons = document.querySelectorAll('.native-share');
          nativeShareButtons.forEach(button => {
            button.addEventListener('click', async () => {
              try {
                await navigator.share({
                  title: document.title,
                  url: window.location.href
                });
              } catch (error) {
                console.log('Share cancelled or failed:', error);
              }
            });
          });
        }
      },

      shareOn(platform, url, title) {
        const shareUrls = {
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
          twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
          pinterest: `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
          whatsapp: `https://wa.me/?text=${title}%20${url}`
        };

        const shareUrl = shareUrls[platform];
        if (shareUrl) {
          window.open(shareUrl, 'share', 'width=600,height=400,resizable=yes,scrollbars=yes');
        }
      }
    },

    // Accessibility enhancements
    accessibility: {
      init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupAriaLabels();
        this.setupReducedMotion();
      },

      setupKeyboardNavigation() {
        // Skip to main content functionality
        const skipLink = document.querySelector('.skip-link');
        if (skipLink) {
          skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(skipLink.getAttribute('href'));
            if (target) {
              target.setAttribute('tabindex', '-1');
              target.focus();
              target.addEventListener('blur', () => {
                target.removeAttribute('tabindex');
              }, { once: true });
            }
          });
        }

        // Enhanced keyboard navigation for interactive elements
        document.addEventListener('keydown', (e) => {
          // Handle Enter key on buttons and links
          if (e.key === 'Enter' && e.target.matches('button, [role="button"]')) {
            e.target.click();
          }

          // Handle arrow keys in navigation
          if (e.target.closest('.main-nav')) {
            const navItems = Array.from(document.querySelectorAll('.nav-link'));
            const currentIndex = navItems.indexOf(e.target);
            
            switch (e.key) {
              case 'ArrowRight':
              case 'ArrowDown':
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % navItems.length;
                navItems[nextIndex].focus();
                break;
              case 'ArrowLeft':
              case 'ArrowUp':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + navItems.length) % navItems.length;
                navItems[prevIndex].focus();
                break;
            }
          }
        });
      },

      setupFocusManagement() {
        // Focus trap for modal dialogs (if any)
        const focusableSelectors = 'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])';
        
        // Enhance focus visibility
        document.addEventListener('focusin', (e) => {
          e.target.classList.add('focus-visible');
        });

        document.addEventListener('focusout', (e) => {
          e.target.classList.remove('focus-visible');
        });
      },

      setupAriaLabels() {
        // Auto-generate aria-labels for social links
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
          if (!link.getAttribute('aria-label')) {
            const platform = link.classList.toString().match(/social-(\w+)/)?.[1] || 'social media';
            link.setAttribute('aria-label', `Follow us on ${platform}`);
          }
        });

        // Auto-generate aria-labels for read more links
        const readMoreLinks = document.querySelectorAll('.read-more');
        readMoreLinks.forEach(link => {
          if (!link.getAttribute('aria-label')) {
            const postTitle = link.closest('.post')?.querySelector('.post-title')?.textContent?.trim();
            if (postTitle) {
              link.setAttribute('aria-label', `Read more about ${postTitle}`);
            }
          }
        });
      },

      setupReducedMotion() {
        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          document.documentElement.style.setProperty('--transition-fast', '0s');
          document.documentElement.style.setProperty('--transition-base', '0s');
          document.documentElement.style.setProperty('--transition-slow', '0s');
        }
      }
    },

    // Performance monitoring
    performance: {
      init() {
        this.measureCoreWebVitals();
        this.setupLazyLoading();
        this.optimizeImages();
      },

      measureCoreWebVitals() {
        // Simple Core Web Vitals measurement
        if ('PerformanceObserver' in window) {
          // Largest Contentful Paint (LCP)
          new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            console.log('LCP:', lastEntry.startTime);
            
            // Report to analytics if available
            if (typeof gtag === 'function') {
              gtag('event', 'LCP', {
                event_category: 'Web Vitals',
                value: Math.round(lastEntry.startTime),
                non_interaction: true
              });
            }
          }).observe({entryTypes: ['largest-contentful-paint']});

          // First Input Delay (FID)
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              const fid = entry.processingStart - entry.startTime;
              console.log('FID:', fid);
              
              if (typeof gtag === 'function') {
                gtag('event', 'FID', {
                  event_category: 'Web Vitals',
                  value: Math.round(fid),
                  non_interaction: true
                });
              }
            }
          }).observe({entryTypes: ['first-input']});

          // Cumulative Layout Shift (CLS)
          let clsScore = 0;
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
              }
            }
            console.log('CLS:', clsScore);
          }).observe({entryTypes: ['layout-shift']});
        }
      },

      setupLazyLoading() {
        // Enhanced lazy loading for images not handled by browser
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
          const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                img.classList.add('loaded');
                imageObserver.unobserve(img);
              }
            });
          }, {
            rootMargin: `${CandgigTheme.config.lazyLoadOffset}px`
          });

          lazyImages.forEach(img => imageObserver.observe(img));
        } else {
          // Fallback for older browsers
          lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            img.classList.add('loaded');
          });
        }
      },

      optimizeImages() {
        // Add loading="lazy" to images that don't have it
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
          if (!CandgigTheme.utils.isInViewport(img, 100)) {
            img.setAttribute('loading', 'lazy');
          }
        });
      }
    },

    // Theme initialization
    init() {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initializeTheme());
      } else {
        this.initializeTheme();
      }
    },

    initializeTheme() {
      console.log('Initializing Candgig Theme v2.0.0');
      
      try {
        // Initialize all modules
        this.navigation.init();
        this.search.init();
        this.social.init();
        this.accessibility.init();
        this.performance.init();

        // Mark theme as loaded
        document.documentElement.classList.add('theme-loaded');
        
        // Dispatch custom event
        const themeLoadedEvent = new CustomEvent('themeLoaded', {
          detail: { version: '2.0.0' }
        });
        document.dispatchEvent(themeLoadedEvent);

        console.log('Candgig Theme initialized successfully');
      } catch (error) {
        console.error('Error initializing theme:', error);
      }
    }
  };

  // Initialize theme
  CandgigTheme.init();

  // Expose theme object globally for debugging and extensions
  window.CandgigTheme = CandgigTheme;

})(window, document);