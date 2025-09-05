/**
 * Performance Optimization Utilities
 * CandGig Blogger Template
 */

(function() {
  'use strict';

  // Performance monitoring
  const performance = {
    // Measure Core Web Vitals
    measureWebVitals: function() {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            console.log('FID:', entry.processingStart - entry.startTime);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          console.log('CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }
    },

    // Preload critical resources
    preloadResources: function() {
      const criticalResources = [
        { href: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap', as: 'style' },
        { href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', as: 'style' }
      ];

      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.as === 'style') {
          link.onload = function() {
            this.rel = 'stylesheet';
          };
        }
        document.head.appendChild(link);
      });
    },

    // Optimize images
    optimizeImages: function() {
      const images = document.querySelectorAll('img[data-src]');
      
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              img.classList.add('loaded');
              observer.unobserve(img);
            }
          });
        }, {
          rootMargin: '50px 0px',
          threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
      } else {
        // Fallback for older browsers
        images.forEach(img => {
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          img.classList.add('loaded');
        });
      }
    },

    // Defer non-critical JavaScript
    deferScripts: function() {
      const scripts = document.querySelectorAll('script[data-defer]');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.src = script.src;
        newScript.async = true;
        script.parentNode.replaceChild(newScript, script);
      });
    },

    // Optimize fonts
    optimizeFonts: function() {
      // Add font-display: swap to existing font links
      const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
      fontLinks.forEach(link => {
        if (!link.href.includes('display=swap')) {
          link.href += (link.href.includes('?') ? '&' : '?') + 'display=swap';
        }
      });
    },

    // Initialize performance optimizations
    init: function() {
      // Run immediately
      this.optimizeFonts();
      this.preloadResources();
      
      // Run when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          this.optimizeImages();
          this.deferScripts();
        });
      } else {
        this.optimizeImages();
        this.deferScripts();
      }

      // Run when page is fully loaded
      window.addEventListener('load', () => {
        this.measureWebVitals();
      });
    }
  };

  // Service Worker registration for caching
  const serviceWorker = {
    register: function() {
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js')
            .then(registration => {
              console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
              console.log('SW registration failed: ', registrationError);
            });
        });
      }
    }
  };

  // Resource hints optimization
  const resourceHints = {
    addPreconnect: function(domains) {
      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        document.head.appendChild(link);
      });
    },

    addPrefetch: function(resources) {
      resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
      });
    }
  };

  // Initialize all optimizations
  performance.init();
  serviceWorker.register();
  
  // Add resource hints for common domains
  resourceHints.addPreconnect([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://cdnjs.cloudflare.com',
    'https://cdn.jsdelivr.net'
  ]);

  // Export for global access
  window.CandGigPerformance = {
    performance,
    serviceWorker,
    resourceHints
  };

})();