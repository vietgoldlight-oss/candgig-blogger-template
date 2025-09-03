/* 
-----------------------------------------------
CandGig Blogger Template - Main JavaScript
Name:        CandGig Main JS
Version:     1.0
Author:      CandGig Team
Repository:  https://github.com/vietgoldlight-oss/candgig-blogger-template
----------------------------------------------- */

// Configuration Variables
window.CandGigTheme = {
    postPerPage: 8,
    monthFormat: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    noThumbnail: 'https://via.placeholder.com/680x400/f0f0f0/666666?text=No+Image',
    commentsSystem: 'blogger', // blogger, disqus, facebook, hide
    disqusShortname: 'candgig',
    fixedSidebar: true
};

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
});

// Main theme initialization
function initTheme() {
    initMobileMenu();
    initSearch();
    initNavigation();
    initAvatars();
    initBackToTop();
    initSidebar();
    initAjaxPosts();
    initComments();
    initLazyLoading();
    initPerformanceOptimizations();
}

// Mobile Menu Functionality
function initMobileMenu() {
    // Clone main menu to mobile menu
    const mainMenuNav = document.querySelector('#main-menu-nav');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mainMenuNav && mobileMenu) {
        const clonedMenu = mainMenuNav.cloneNode(true);
        mobileMenu.appendChild(clonedMenu);
        
        // Add submenu toggles
        const hasSubItems = mobileMenu.querySelectorAll('.has-sub');
        hasSubItems.forEach(item => {
            const toggle = document.createElement('div');
            toggle.className = 'submenu-toggle';
            toggle.innerHTML = '<i class="fa fa-angle-down"></i>';
            item.appendChild(toggle);
        });
    }
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.slide-menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.body.classList.toggle('nav-active');
        });
    }
    
    // Submenu toggles
    const submenuToggles = document.querySelectorAll('.mobile-menu .submenu-toggle');
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.closest('.has-sub');
            const submenu = parent.querySelector('.m-sub');
            
            if (parent.classList.contains('show')) {
                parent.classList.remove('show');
                submenu.style.display = 'none';
            } else {
                parent.classList.add('show');
                submenu.style.display = 'block';
            }
        });
    });
}

// Search Functionality
function initSearch() {
    // Desktop search
    const showSearch = document.querySelector('.show-search');
    const hideSearch = document.querySelector('.hide-search');
    const navSearch = document.querySelector('#nav-search');
    const searchInput = document.querySelector('#nav-search .search-input');
    
    if (showSearch && navSearch) {
        showSearch.addEventListener('click', function() {
            navSearch.style.display = 'block';
            if (searchInput) searchInput.focus();
        });
    }
    
    if (hideSearch && navSearch) {
        hideSearch.addEventListener('click', function() {
            navSearch.style.display = 'none';
            if (searchInput) searchInput.blur();
        });
    }
    
    // Mobile search
    const showMobileSearch = document.querySelector('.show-mobile-search');
    const hideMobileSearch = document.querySelector('.hide-mobile-search');
    const mobileSearchForm = document.querySelector('.mobile-search-form');
    const mobileSearchInput = document.querySelector('.mobile-search-input');
    
    if (showMobileSearch && mobileSearchForm) {
        showMobileSearch.addEventListener('click', function() {
            mobileSearchForm.style.display = 'block';
            if (mobileSearchInput) mobileSearchInput.focus();
        });
    }
    
    if (hideMobileSearch && mobileSearchForm) {
        hideMobileSearch.addEventListener('click', function() {
            mobileSearchForm.style.display = 'none';
            if (mobileSearchInput) mobileSearchInput.blur();
        });
    }
}

// Back to Top Button
function initBackToTop() {
    const backTop = document.querySelector('.back-top');
    if (!backTop) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY >= 100) {
            backTop.classList.add('show');
        } else {
            backTop.classList.remove('show');
        }
    });
    
    backTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Navigation Enhancement
function initNavigation() {
    // Process main menu for mega menus and dropdowns
    const mainMenu = document.querySelector('#main-menu');
    if (mainMenu) {
        const menuItems = mainMenu.querySelectorAll('.LinkList ul > li > a');
        
        menuItems.forEach((item, index) => {
            const text = item.textContent.trim();
            
            // Process underscore prefix for submenus
            if (text.startsWith('_')) {
                item.textContent = text.substring(1);
            }
            
            // Process mega menu links
            const href = item.getAttribute('href');
            if (href && href.includes('mega-menu')) {
                const label = href.split('/')[0];
                item.setAttribute('href', `/search/label/${label}?&max-results=${CandGigTheme.postPerPage}`);
            }
        });
        
        // Add has-sub class to items with submenus
        const menuItemsWithSub = mainMenu.querySelectorAll('ul li ul');
        menuItemsWithSub.forEach(submenu => {
            submenu.parentElement.classList.add('has-sub');
        });
        
        // Show menu
        const menuWidget = mainMenu.querySelector('.widget');
        if (menuWidget) {
            menuWidget.classList.add('show-menu');
        }
    }
}

// Avatar Enhancement
function initAvatars() {
    const avatars = document.querySelectorAll('.avatar-image-container img');
    avatars.forEach(img => {
        let src = img.src;
        // Improve avatar quality
        src = src.replace('/s35-c/', '/s45-c/');
        // Replace default avatar
        if (src.includes('blank.gif')) {
            src = 'https://4.bp.blogspot.com/-uCjYgVFIh70/VuOLn-mL7PI/AAAAAAAADUs/Kcu9wJbv790hIo83rI_s7lLW3zkLY01EA/s55-r/avatar.png';
        }
        img.src = src;
    });
    
    // Open author links in new tab
    const authorLinks = document.querySelectorAll('.author-description a');
    authorLinks.forEach(link => {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
    });
}

// Sticky Sidebar (simplified)
function initSidebar() {
    if (!CandGigTheme.fixedSidebar) return;
    
    const sidebar = document.querySelector('#sidebar-wrapper');
    if (sidebar && window.innerWidth > 991) {
        let isSticky = false;
        const sidebarTop = sidebar.offsetTop;
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.scrollY;
            
            if (scrollTop >= sidebarTop - 30 && !isSticky) {
                sidebar.style.position = 'sticky';
                sidebar.style.top = '30px';
                isSticky = true;
            } else if (scrollTop < sidebarTop - 30 && isSticky) {
                sidebar.style.position = '';
                sidebar.style.top = '';
                isSticky = false;
            }
        });
    }
}

// AJAX Posts Loading (simplified)
function initAjaxPosts() {
    const hotSections = document.querySelectorAll('#hot-section .widget-content');
    hotSections.forEach(section => {
        const text = section.textContent.trim();
        const params = text.toLowerCase().split('/');
        loadSimplePosts(section, 2, params[0] || 'recent');
    });
}

// Simplified post loading
function loadSimplePosts(element, num, label) {
    element.innerHTML = '<div class="loading">Loading posts...</div>';
    
    // Simulate loading with placeholder content
    setTimeout(() => {
        let html = '<ul class="post-list">';
        for (let i = 0; i < num; i++) {
            html += `
                <li class="post-item">
                    <div class="post-info">
                        <h3>Sample Post ${i + 1}</h3>
                        <div class="post-meta">
                            <span class="post-date">Dec 25, 2023</span>
                        </div>
                    </div>
                </li>
            `;
        }
        html += '</ul>';
        element.innerHTML = html;
    }, 1000);
}

// Comments System
function initComments() {
    const commentsContainer = document.querySelector('.blog-post-comments');
    if (!commentsContainer) return;
    
    const system = CandGigTheme.commentsSystem;
    
    switch (system) {
        case 'hide':
            commentsContainer.style.display = 'none';
            break;
        default:
            commentsContainer.classList.add('comments-system-blogger');
            commentsContainer.style.display = 'block';
    }
}

// Lazy Loading Implementation
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    }
}

// Performance Optimizations
function initPerformanceOptimizations() {
    // Remove ?m=1 parameter from URL (mobile redirect)
    const url = window.location.toString();
    if (url.indexOf('?m=1') > 0) {
        const cleanUrl = url.substring(0, url.indexOf('?m=1'));
        window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // Add font-display: swap for better performance
    const style = document.createElement('style');
    style.textContent = `
        @font-face {
            font-family: 'Noto Sans';
            font-display: swap;
        }
    `;
    document.head.appendChild(style);
}

// Export for global access
window.CandGigTheme.init = initTheme;