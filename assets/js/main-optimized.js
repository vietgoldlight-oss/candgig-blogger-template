/**
 * Optimized Main JavaScript for CandGig Blogger Template
 * Modern ES6+ implementation without jQuery dependency
 */

(function() {
  'use strict';

  // Configuration
  const config = window.CandGigConfig || {
    postPerPage: 8,
    fixedSidebar: true,
    commentsSystem: 'blogger',
    disqusShortname: '',
    theme: {
      name: 'CandGig',
      version: '2.0',
      author: 'CandGig Team'
    }
  };

  // Utility functions
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);
  const ready = (fn) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  // Main application class
  class CandGigApp {
    constructor() {
      this.init();
    }

    init() {
      ready(() => {
        this.initializeMainMenu();
        this.initializeBackToTop();
        this.initializeComments();
        this.initializeSidebar();
        this.initializeSearch();
        this.initializeSocialSharing();
        this.initializePerformanceOptimizations();
      });
    }

    // Mega Menu & Sub-menu Handler
    initializeMainMenu() {
      const mainMenu = $('#main-menu .LinkList > ul');
      if (!mainMenu) return;

      const items = Array.from(mainMenu.children);
      const stack = [];
      let currentParent = mainMenu;

      items.forEach(item => {
        const link = item.querySelector('a');
        if (!link) return;

        let text = link.textContent.trim();
        let level = 0;

        if (text.startsWith('__')) {
          level = 2;
        } else if (text.startsWith('_')) {
          level = 1;
        }

        link.textContent = text.replace(/^_+/, '');

        if (level > 0) {
          while (stack.length >= level) {
            stack.pop();
          }

          const parentLi = stack[stack.length - 1];
          if (parentLi) {
            let subMenu = parentLi.querySelector('ul');
            if (!subMenu) {
              subMenu = document.createElement('ul');
              subMenu.className = 'sub-menu m-sub';
              parentLi.appendChild(subMenu);
              parentLi.classList.add('has-sub');
            }
            subMenu.appendChild(item);
          }
        } else {
          stack.length = 0;
          currentParent = mainMenu;
          currentParent.appendChild(item);
          stack.push(item);
        }
      });

      // Add mobile menu toggle
      this.addMobileMenuToggle();
    }

    addMobileMenuToggle() {
      const menu = $('#main-menu');
      if (!menu) return;

      const toggle = document.createElement('button');
      toggle.className = 'mobile-menu-toggle';
      toggle.innerHTML = '<i class="fas fa-bars"></i>';
      toggle.setAttribute('aria-label', 'Toggle menu');
      
      menu.insertBefore(toggle, menu.firstChild);

      toggle.addEventListener('click', () => {
        menu.classList.toggle('mobile-open');
        toggle.setAttribute('aria-expanded', 
          menu.classList.contains('mobile-open')
        );
      });
    }

    // Back to Top Button
    initializeBackToTop() {
      const backTop = document.createElement('button');
      backTop.className = 'back-top';
      backTop.setAttribute('aria-label', 'Back to top');
      document.body.appendChild(backTop);

      const showBackTop = () => {
        if (window.pageYOffset > 300) {
          backTop.classList.add('show');
        } else {
          backTop.classList.remove('show');
        }
      };

      window.addEventListener('scroll', this.throttle(showBackTop, 100));
      
      backTop.addEventListener('click', () => {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }

    // Comments System
    initializeComments() {
      const commentContainers = $$('.comments-container');
      
      commentContainers.forEach(container => {
        const system = container.dataset.system || config.commentsSystem;
        this.loadComments(container, system);
      });
    }

    loadComments(container, system) {
      if (system === 'disqus' && config.disqusShortname) {
        this.loadDisqus(container);
      } else if (system === 'facebook') {
        this.loadFacebookComments(container);
      } else if (system === 'hide') {
        container.style.display = 'none';
      } else {
        container.classList.add('comments-system-default');
      }
    }

    loadDisqus(container) {
      if (typeof disqus_blogger_current_url !== 'undefined') {
        const script = document.createElement('script');
        script.src = `//${config.disqusShortname}.disqus.com/embed.js`;
        script.async = true;
        document.head.appendChild(script);

        const disqusDiv = document.createElement('div');
        disqusDiv.id = 'disqus_thread';
        container.innerHTML = '';
        container.appendChild(disqusDiv);
        container.classList.add('comments-system-disqus');
      }
    }

    loadFacebookComments(container) {
      const currentUrl = window.location.href;
      const facebookDiv = document.createElement('div');
      facebookDiv.className = 'fb-page';
      facebookDiv.setAttribute('data-href', currentUrl);
      facebookDiv.setAttribute('data-tabs', 'timeline');
      facebookDiv.setAttribute('data-adapt-container-width', 'true');
      facebookDiv.setAttribute('data-hide-cover', 'false');
      facebookDiv.setAttribute('data-show-facepile', 'true');

      container.innerHTML = '';
      container.appendChild(facebookDiv);
      container.classList.add('comments-system-facebook');
    }

    // Sidebar Management
    initializeSidebar() {
      if (!config.fixedSidebar) return;

      const sidebar = $('.sidebar');
      if (!sidebar) return;

      const makeSticky = () => {
        const rect = sidebar.getBoundingClientRect();
        const isSticky = rect.top <= 20;
        
        if (isSticky && !sidebar.classList.contains('sticky')) {
          sidebar.classList.add('sticky');
        } else if (!isSticky && sidebar.classList.contains('sticky')) {
          sidebar.classList.remove('sticky');
        }
      };

      window.addEventListener('scroll', this.throttle(makeSticky, 100));
    }

    // Search Functionality
    initializeSearch() {
      const searchForm = $('.search-form');
      if (!searchForm) return;

      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchForm.querySelector('input[type="search"]').value;
        if (query.trim()) {
          window.location.href = `/search?q=${encodeURIComponent(query)}`;
        }
      });
    }

    // Social Sharing
    initializeSocialSharing() {
      const shareButtons = $$('.social-share');
      
      shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const platform = button.dataset.platform;
          const url = encodeURIComponent(window.location.href);
          const title = encodeURIComponent(document.title);
          
          let shareUrl = '';
          
          switch (platform) {
            case 'facebook':
              shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
              break;
            case 'twitter':
              shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
              break;
            case 'linkedin':
              shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
              break;
            case 'pinterest':
              shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&description=${title}`;
              break;
          }
          
          if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
          }
        });
      });
    }

    // Performance Optimizations
    initializePerformanceOptimizations() {
      // Preload critical resources
      this.preloadCriticalResources();
      
      // Optimize images
      this.optimizeImages();
      
      // Add performance monitoring
      this.addPerformanceMonitoring();
    }

    preloadCriticalResources() {
      const criticalResources = [
        { href: '/assets/css/responsive.css', as: 'style' },
        { href: '/assets/js/utils.js', as: 'script' }
      ];

      criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        document.head.appendChild(link);
      });
    }

    optimizeImages() {
      const images = $$('img[data-src]');
      
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
        }, { rootMargin: '50px 0px' });

        images.forEach(img => imageObserver.observe(img));
      }
    }

    addPerformanceMonitoring() {
      if ('PerformanceObserver' in window) {
        // Monitor Core Web Vitals
        const observer = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            console.log(`${entry.name}: ${entry.startTime}`);
          });
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation'] });
      }
    }

    // Utility functions
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
    }

    debounce(func, wait, immediate) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        const later = function() {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    }
  }

  // Initialize the application
  window.CandGigApp = new CandGigApp();

})();