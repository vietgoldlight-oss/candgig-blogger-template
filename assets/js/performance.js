/**
 * Performance JavaScript for Candgig Blogger Template
 * Core Web Vitals monitoring and optimization
 * Version: 2.0.0
 * Target: Vietnamese parenting blog (candgig.blogspot.com)
 */

(function(window, document) {
  'use strict';

  const PerformanceMonitor = {
    // Configuration
    config: {
      enableWebVitals: true,
      enableResourceTiming: true,
      enableUserTiming: true,
      enableNetworkTiming: true,
      reportingEndpoint: null, // Set to your analytics endpoint
      bufferSize: 50,
      reportingInterval: 30000, // 30 seconds
      vitalsThresholds: {
        lcp: { good: 2500, needsImprovement: 4000 },
        fid: { good: 100, needsImprovement: 300 },
        cls: { good: 0.1, needsImprovement: 0.25 },
        fcp: { good: 1800, needsImprovement: 3000 },
        ttfb: { good: 800, needsImprovement: 1800 }
      }
    },

    // State management
    state: {
      isInitialized: false,
      metrics: new Map(),
      buffer: [],
      observers: new Map(),
      deviceInfo: null,
      connectionInfo: null
    },

    // Device and connection detection
    device: {
      init() {
        PerformanceMonitor.state.deviceInfo = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          },
          screen: {
            width: screen.width,
            height: screen.height,
            colorDepth: screen.colorDepth
          },
          memory: navigator.deviceMemory || 'unknown',
          hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
        };

        // Connection information
        if ('connection' in navigator) {
          PerformanceMonitor.state.connectionInfo = {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
          };

          // Listen for connection changes
          navigator.connection.addEventListener('change', () => {
            this.updateConnectionInfo();
          });
        }

        console.log('Device info collected:', PerformanceMonitor.state.deviceInfo);
      },

      updateConnectionInfo() {
        if ('connection' in navigator) {
          PerformanceMonitor.state.connectionInfo = {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
            rtt: navigator.connection.rtt,
            saveData: navigator.connection.saveData
          };
          
          console.log('Connection changed:', PerformanceMonitor.state.connectionInfo);
        }
      },

      getDeviceType() {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
      },

      isSlowDevice() {
        const deviceMemory = navigator.deviceMemory;
        const hardwareConcurrency = navigator.hardwareConcurrency;
        
        return (
          deviceMemory && deviceMemory <= 2 ||
          hardwareConcurrency && hardwareConcurrency <= 2
        );
      },

      isSlowConnection() {
        if (!PerformanceMonitor.state.connectionInfo) return false;
        
        const { effectiveType, saveData } = PerformanceMonitor.state.connectionInfo;
        return saveData || effectiveType === 'slow-2g' || effectiveType === '2g';
      }
    },

    // Core Web Vitals monitoring
    webVitals: {
      init() {
        if (!PerformanceMonitor.config.enableWebVitals) return;
        if (!('PerformanceObserver' in window)) {
          console.warn('PerformanceObserver not supported');
          return;
        }

        this.measureLCP();
        this.measureFID();
        this.measureCLS();
        this.measureFCP();
        this.measureTTFB();
        
        console.log('Web Vitals monitoring initialized');
      },

      measureLCP() {
        try {
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            
            if (lastEntry) {
              const lcp = lastEntry.startTime;
              PerformanceMonitor.state.metrics.set('lcp', {
                value: lcp,
                rating: this.getRating('lcp', lcp),
                timestamp: Date.now(),
                element: lastEntry.element,
                url: lastEntry.url
              });
              
              console.log('LCP measured:', lcp);
              this.reportMetric('lcp', lcp);
            }
          });
          
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
          PerformanceMonitor.state.observers.set('lcp', observer);
          
        } catch (error) {
          console.error('Error measuring LCP:', error);
        }
      },

      measureFID() {
        try {
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            
            entries.forEach((entry) => {
              const fid = entry.processingStart - entry.startTime;
              
              PerformanceMonitor.state.metrics.set('fid', {
                value: fid,
                rating: this.getRating('fid', fid),
                timestamp: Date.now(),
                target: entry.target,
                name: entry.name
              });
              
              console.log('FID measured:', fid);
              this.reportMetric('fid', fid);
            });
          });
          
          observer.observe({ entryTypes: ['first-input'] });
          PerformanceMonitor.state.observers.set('fid', observer);
          
        } catch (error) {
          console.error('Error measuring FID:', error);
        }
      },

      measureCLS() {
        try {
          let clsScore = 0;
          let sessionValue = 0;
          let sessionEntries = [];
          
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            
            entries.forEach((entry) => {
              // Only count layout shifts without recent input
              if (!entry.hadRecentInput) {
                const firstSessionEntry = sessionEntries[0];
                const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                
                // If the entry occurred less than 1 second after the previous entry and
                // less than 5 seconds after the first entry in the session, include it
                if (sessionValue &&
                    entry.startTime - lastSessionEntry.startTime < 1000 &&
                    entry.startTime - firstSessionEntry.startTime < 5000) {
                  sessionValue += entry.value;
                  sessionEntries.push(entry);
                } else {
                  sessionValue = entry.value;
                  sessionEntries = [entry];
                }
                
                // Update the maximum session value
                if (sessionValue > clsScore) {
                  clsScore = sessionValue;
                }
              }
            });
            
            PerformanceMonitor.state.metrics.set('cls', {
              value: clsScore,
              rating: this.getRating('cls', clsScore),
              timestamp: Date.now(),
              entries: sessionEntries.slice()
            });
            
            console.log('CLS measured:', clsScore);
            this.reportMetric('cls', clsScore);
          });
          
          observer.observe({ entryTypes: ['layout-shift'] });
          PerformanceMonitor.state.observers.set('cls', observer);
          
        } catch (error) {
          console.error('Error measuring CLS:', error);
        }
      },

      measureFCP() {
        try {
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
            
            if (fcpEntry) {
              const fcp = fcpEntry.startTime;
              
              PerformanceMonitor.state.metrics.set('fcp', {
                value: fcp,
                rating: this.getRating('fcp', fcp),
                timestamp: Date.now()
              });
              
              console.log('FCP measured:', fcp);
              this.reportMetric('fcp', fcp);
            }
          });
          
          observer.observe({ entryTypes: ['paint'] });
          PerformanceMonitor.state.observers.set('fcp', observer);
          
        } catch (error) {
          console.error('Error measuring FCP:', error);
        }
      },

      measureTTFB() {
        try {
          const navigationEntry = performance.getEntriesByType('navigation')[0];
          
          if (navigationEntry) {
            const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
            
            PerformanceMonitor.state.metrics.set('ttfb', {
              value: ttfb,
              rating: this.getRating('ttfb', ttfb),
              timestamp: Date.now()
            });
            
            console.log('TTFB measured:', ttfb);
            this.reportMetric('ttfb', ttfb);
          }
        } catch (error) {
          console.error('Error measuring TTFB:', error);
        }
      },

      getRating(metric, value) {
        const thresholds = PerformanceMonitor.config.vitalsThresholds[metric];
        if (!thresholds) return 'unknown';
        
        if (value <= thresholds.good) return 'good';
        if (value <= thresholds.needsImprovement) return 'needs-improvement';
        return 'poor';
      },

      reportMetric(name, value) {
        // Report to Google Analytics if available
        if (typeof gtag === 'function') {
          gtag('event', name.toUpperCase(), {
            event_category: 'Web Vitals',
            value: Math.round(value),
            non_interaction: true,
            custom_map: {
              metric_id: name
            }
          });
        }

        // Add to buffer for batch reporting
        PerformanceMonitor.buffer.add({
          type: 'web-vital',
          name,
          value,
          timestamp: Date.now(),
          page: window.location.pathname,
          device: PerformanceMonitor.device.getDeviceType(),
          connection: PerformanceMonitor.state.connectionInfo
        });
      }
    },

    // Resource timing monitoring
    resourceTiming: {
      init() {
        if (!PerformanceMonitor.config.enableResourceTiming) return;
        
        this.monitorResources();
        this.setupResourceObserver();
        
        console.log('Resource timing monitoring initialized');
      },

      monitorResources() {
        const resources = performance.getEntriesByType('resource');
        const slowResources = [];
        const largeResources = [];
        
        resources.forEach(resource => {
          const duration = resource.responseEnd - resource.requestStart;
          const size = resource.transferSize || 0;
          
          // Flag slow resources (>2s)
          if (duration > 2000) {
            slowResources.push({
              name: resource.name,
              duration,
              size
            });
          }
          
          // Flag large resources (>1MB)
          if (size > 1024 * 1024) {
            largeResources.push({
              name: resource.name,
              duration,
              size
            });
          }
        });
        
        if (slowResources.length > 0) {
          console.warn('Slow resources detected:', slowResources);
        }
        
        if (largeResources.length > 0) {
          console.warn('Large resources detected:', largeResources);
        }
        
        // Store resource metrics
        PerformanceMonitor.state.metrics.set('resources', {
          total: resources.length,
          slow: slowResources.length,
          large: largeResources.length,
          timestamp: Date.now()
        });
      },

      setupResourceObserver() {
        try {
          const observer = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            
            entries.forEach(entry => {
              this.analyzeResource(entry);
            });
          });
          
          observer.observe({ entryTypes: ['resource'] });
          PerformanceMonitor.state.observers.set('resource', observer);
          
        } catch (error) {
          console.error('Error setting up resource observer:', error);
        }
      },

      analyzeResource(entry) {
        const duration = entry.responseEnd - entry.requestStart;
        const size = entry.transferSize || 0;
        
        // Log slow resources
        if (duration > 2000) {
          console.warn('Slow resource:', {
            name: entry.name,
            duration,
            size,
            type: this.getResourceType(entry.name)
          });
        }
        
        // Suggest optimizations for images
        if (this.isImage(entry.name) && size > 500 * 1024) {
          console.warn('Large image detected:', {
            name: entry.name,
            size,
            suggestion: 'Consider image optimization or WebP format'
          });
        }
      },

      isImage(url) {
        return /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url);
      },

      getResourceType(url) {
        if (this.isImage(url)) return 'image';
        if (/\.(css)(\?.*)?$/i.test(url)) return 'stylesheet';
        if (/\.(js)(\?.*)?$/i.test(url)) return 'script';
        if (/\.(woff|woff2|ttf|otf)(\?.*)?$/i.test(url)) return 'font';
        return 'other';
      }
    },

    // Memory monitoring
    memory: {
      init() {
        if (!('memory' in performance)) {
          console.warn('Memory API not supported');
          return;
        }

        this.monitorMemory();
        
        // Monitor memory periodically
        setInterval(() => {
          this.monitorMemory();
        }, 30000);
        
        console.log('Memory monitoring initialized');
      },

      monitorMemory() {
        const memory = performance.memory;
        
        const memoryInfo = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        };
        
        PerformanceMonitor.state.metrics.set('memory', memoryInfo);
        
        // Warn if memory usage is high
        const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
        if (usagePercent > 80) {
          console.warn('High memory usage detected:', usagePercent.toFixed(2) + '%');
        }
        
        console.log('Memory usage:', {
          used: (memoryInfo.used / 1024 / 1024).toFixed(2) + ' MB',
          total: (memoryInfo.total / 1024 / 1024).toFixed(2) + ' MB',
          limit: (memoryInfo.limit / 1024 / 1024).toFixed(2) + ' MB'
        });
      }
    },

    // Network timing
    networkTiming: {
      init() {
        if (!PerformanceMonitor.config.enableNetworkTiming) return;
        
        this.analyzeNavigationTiming();
        this.monitorNetworkChanges();
        
        console.log('Network timing monitoring initialized');
      },

      analyzeNavigationTiming() {
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        
        if (!navigationEntry) return;
        
        const timing = {
          dns: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
          tcp: navigationEntry.connectEnd - navigationEntry.connectStart,
          ssl: navigationEntry.secureConnectionStart ? navigationEntry.connectEnd - navigationEntry.secureConnectionStart : 0,
          ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
          download: navigationEntry.responseEnd - navigationEntry.responseStart,
          domReady: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
          windowLoad: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
          total: navigationEntry.loadEventEnd - navigationEntry.navigationStart
        };
        
        PerformanceMonitor.state.metrics.set('navigation', timing);
        
        console.log('Navigation timing:', timing);
        
        // Warn about slow phases
        if (timing.dns > 200) console.warn('Slow DNS lookup:', timing.dns + 'ms');
        if (timing.tcp > 200) console.warn('Slow TCP connection:', timing.tcp + 'ms');
        if (timing.ttfb > 800) console.warn('Slow TTFB:', timing.ttfb + 'ms');
        if (timing.download > 1000) console.warn('Slow download:', timing.download + 'ms');
      },

      monitorNetworkChanges() {
        if ('connection' in navigator) {
          navigator.connection.addEventListener('change', () => {
            console.log('Network connection changed:', {
              effectiveType: navigator.connection.effectiveType,
              downlink: navigator.connection.downlink,
              rtt: navigator.connection.rtt
            });
          });
        }
        
        // Monitor online/offline status
        window.addEventListener('online', () => {
          console.log('Network: back online');
          PerformanceMonitor.buffer.add({
            type: 'network-status',
            status: 'online',
            timestamp: Date.now()
          });
        });
        
        window.addEventListener('offline', () => {
          console.log('Network: gone offline');
          PerformanceMonitor.buffer.add({
            type: 'network-status',
            status: 'offline',
            timestamp: Date.now()
          });
        });
      }
    },

    // Buffer management for batch reporting
    buffer: {
      add(metric) {
        PerformanceMonitor.state.buffer.push(metric);
        
        // Flush buffer if it's getting full
        if (PerformanceMonitor.state.buffer.length >= PerformanceMonitor.config.bufferSize) {
          this.flush();
        }
      },

      flush() {
        if (PerformanceMonitor.state.buffer.length === 0) return;
        
        const data = {
          metrics: PerformanceMonitor.state.buffer.slice(),
          device: PerformanceMonitor.state.deviceInfo,
          connection: PerformanceMonitor.state.connectionInfo,
          page: {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer
          },
          timestamp: Date.now()
        };
        
        // Send to analytics endpoint if configured
        if (PerformanceMonitor.config.reportingEndpoint) {
          this.sendToEndpoint(data);
        }
        
        // Clear buffer
        PerformanceMonitor.state.buffer = [];
        
        console.log('Performance buffer flushed:', data);
      },

      async sendToEndpoint(data) {
        try {
          await fetch(PerformanceMonitor.config.reportingEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          console.log('Performance data sent to endpoint');
        } catch (error) {
          console.error('Failed to send performance data:', error);
        }
      }
    },

    // Optimization suggestions
    optimizer: {
      init() {
        this.analyzePageStructure();
        this.suggestOptimizations();
        
        console.log('Performance optimizer initialized');
      },

      analyzePageStructure() {
        const analysis = {
          images: document.querySelectorAll('img').length,
          scripts: document.querySelectorAll('script').length,
          stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
          externalResources: 0,
          inlineStyles: document.querySelectorAll('style').length,
          inlineScripts: document.querySelectorAll('script:not([src])').length
        };
        
        // Count external resources
        document.querySelectorAll('script[src], link[href], img[src]').forEach(element => {
          const url = element.src || element.href;
          if (url && !url.startsWith(window.location.origin)) {
            analysis.externalResources++;
          }
        });
        
        PerformanceMonitor.state.metrics.set('pageStructure', analysis);
        
        console.log('Page structure analysis:', analysis);
      },

      suggestOptimizations() {
        const suggestions = [];
        const structure = PerformanceMonitor.state.metrics.get('pageStructure');
        
        if (!structure) return;
        
        // Image optimization suggestions
        if (structure.images > 20) {
          suggestions.push('Consider lazy loading for images');
        }
        
        // Script optimization suggestions
        if (structure.scripts > 10) {
          suggestions.push('Consider bundling and minifying JavaScript files');
        }
        
        // CSS optimization suggestions
        if (structure.stylesheets > 5) {
          suggestions.push('Consider combining CSS files');
        }
        
        if (structure.inlineStyles > 3) {
          suggestions.push('Consider moving inline styles to external CSS files');
        }
        
        // External resource suggestions
        if (structure.externalResources > 15) {
          suggestions.push('Consider reducing external resource dependencies');
        }
        
        // Device-specific suggestions
        if (PerformanceMonitor.device.isSlowDevice()) {
          suggestions.push('Optimize for low-end devices: reduce JavaScript complexity');
        }
        
        if (PerformanceMonitor.device.isSlowConnection()) {
          suggestions.push('Optimize for slow connections: compress resources and prioritize critical content');
        }
        
        if (suggestions.length > 0) {
          console.log('Performance optimization suggestions:', suggestions);
        }
        
        return suggestions;
      }
    },

    // Service Worker registration for PWA features
    serviceWorker: {
      init() {
        if ('serviceWorker' in navigator) {
          this.registerServiceWorker();
        } else {
          console.warn('Service Workers not supported');
        }
      },

      async registerServiceWorker() {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered:', registration);
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('Service Worker update found');
          });
          
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
    },

    // Public API
    api: {
      getMetrics() {
        return Object.fromEntries(PerformanceMonitor.state.metrics);
      },

      getWebVitals() {
        return {
          lcp: PerformanceMonitor.state.metrics.get('lcp'),
          fid: PerformanceMonitor.state.metrics.get('fid'),
          cls: PerformanceMonitor.state.metrics.get('cls'),
          fcp: PerformanceMonitor.state.metrics.get('fcp'),
          ttfb: PerformanceMonitor.state.metrics.get('ttfb')
        };
      },

      forceReport() {
        PerformanceMonitor.buffer.flush();
      },

      getSuggestions() {
        return PerformanceMonitor.optimizer.suggestOptimizations();
      }
    },

    // Main initialization
    init() {
      if (PerformanceMonitor.state.isInitialized) {
        console.warn('PerformanceMonitor already initialized');
        return;
      }

      console.log('Initializing PerformanceMonitor...');
      
      try {
        PerformanceMonitor.device.init();
        PerformanceMonitor.webVitals.init();
        PerformanceMonitor.resourceTiming.init();
        PerformanceMonitor.memory.init();
        PerformanceMonitor.networkTiming.init();
        PerformanceMonitor.optimizer.init();
        PerformanceMonitor.serviceWorker.init();
        
        // Set up periodic buffer flushing
        setInterval(() => {
          PerformanceMonitor.buffer.flush();
        }, PerformanceMonitor.config.reportingInterval);
        
        // Flush buffer on page unload
        window.addEventListener('beforeunload', () => {
          PerformanceMonitor.buffer.flush();
        });
        
        PerformanceMonitor.state.isInitialized = true;
        
        console.log('PerformanceMonitor initialized successfully');
        
      } catch (error) {
        console.error('Error initializing PerformanceMonitor:', error);
      }
    }
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceMonitor.init());
  } else {
    PerformanceMonitor.init();
  }

  // Expose PerformanceMonitor API globally
  window.PerformanceMonitor = PerformanceMonitor.api;

  // Add to CandgigTheme if available
  if (window.CandgigTheme) {
    window.CandgigTheme.PerformanceMonitor = PerformanceMonitor;
  }

})(window, document);