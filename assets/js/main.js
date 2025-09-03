/**
 * Main JavaScript for Video Blogger Template
 * Author: SoraTemplates (Original), Optimized by GitHub Copilot
 */
$(document).ready(function() {

  // --- Mega Menu & Sub-menu Handler ---
  function initializeMainMenu() {
    const mainMenu = $('#main-menu .LinkList > ul');
    if (!mainMenu.length) return;

    // Handle sub-menus (items starting with _ or __)
    const items = mainMenu.children('li').get();
    const stack = [];
    let currentParent = mainMenu;

    items.forEach(item => {
      const link = $(item).children('a');
      if (!link.length) return;

      let text = link.text().trim();
      let level = 0;

      if (text.startsWith('__')) {
        level = 2;
      } else if (text.startsWith('_')) {
        level = 1;
      }

      link.text(text.replace(/^_+/, '')); // Remove all leading underscores

      if (level > 0) {
        while (stack.length >= level) {
          stack.pop();
        }

        let parentLi = stack[stack.length - 1];
        if (parentLi) {
          let subMenu = parentLi.children('ul');
          if (!subMenu.length) {
            subMenu = $('<ul class="sub-menu m-sub"></ul>').appendTo(parentLi);
            parentLi.addClass('has-sub');
          }
          subMenu.append(item);
        }
      } else {
        stack.length = 0; // Reset stack for top-level item
        currentParent = mainMenu;
        $(item).appendTo(currentParent);
        stack.push($(item));
      }
      if (level === 1) {
         stack.push($(item));
      }
    });

    // Handle Mega Menu (items with 'mega-menu' in URL)
    $('#main-menu #main-menu-nav li').each(function() {
      const li = $(this);
      const link = li.children('a');
      const href = (link.attr('href') || '').trim().toLowerCase();

      if (href.includes('mega-menu')) {
        const parts = href.split('/');
        const label = parts[0];
        const newHref = `/search/label/${encodeURIComponent(label)}?&max-results=${postPerPage}`;
        link.attr('href', newHref);
        
        // Add mega menu structure and fetch posts
        li.addClass('has-sub mega-menu');
        const megaMenuContainer = $('<ul class="mega-menu-inner"></ul>').appendTo(li);
        ajaxPosts(megaMenuContainer, 'mega-menu', 4, label);
      }
    });

    $('#main-menu .widget').addClass('show-menu');
  }
  
  initializeMainMenu();


  // --- Mobile Menu Handler ---
  function initializeMobileMenu() {
    $('#main-menu-nav').clone().appendTo('.mobile-menu');
    $('.mobile-menu .has-sub').append('<div class="submenu-toggle"/>');

    $('.slide-menu-toggle').on('click', function() {
      $('body').toggleClass('nav-active');
    });

    $('.mobile-menu').on('click', '.submenu-toggle', function(e) {
      e.preventDefault();
      const parentLi = $(this).parent('li');
      if (parentLi.hasClass('has-sub')) {
        parentLi.toggleClass('show').children('.m-sub').slideToggle(170);
      }
    });
  }

  initializeMobileMenu();


  // --- Search Toggle ---
  $('.show-search, .show-mobile-search').on('click', function() {
    const searchForm = $(this).hasClass('show-mobile-search') ? '.mobile-search-form' : '#nav-search';
    $(searchForm).fadeIn(250).find('input').focus();
  });

  $('.hide-search, .hide-mobile-search').on('click', function() {
    const searchForm = $(this).hasClass('hide-mobile-search') ? '.mobile-search-form' : '#nav-search';
    $(searchForm).fadeOut(250).find('input').blur();
  });


  // --- Post-related Scripts ---
  // Append max-results to label links
  $('.Label a, a.b-label').attr('href', function(i, href) {
    return href ? `${href}?&max-results=${postPerPage}` : '#';
  });

  // Fix avatar images
  $('.avatar-image-container img').attr('src', function(i, src) {
    if (!src) return '';
    src = src.replace(/\/s\d+-c\//, '/s45-c/');
    return src.replace('//img1.blogblog.com/img/blank.gif', '//4.bp.blogspot.com/-uCjYgVFIh70/VuOLn-mL7PI/AAAAAAAADUs/Kcu9wJbv790hIo83rI_s7lLW3zkLY01EA/s55-r/avatar.png');
  });
  
  // Make author links open in new tab
  $('.author-description a').attr('target', '_blank');

  // Next/Prev post titles
  $('.post-nav').each(function() {
    const prevUrl = $('a.prev-post-link').attr('href');
    const nextUrl = $('a.next-post-link').attr('href');
    if (prevUrl) {
      $.ajax({ url: prevUrl, type: 'get', success: function(data) {
        const title = $(data).find('.blog-post h1.post-title').text();
        $('.post-prev a .post-nav-inner p').text(title);
      }});
    }
    if (nextUrl) {
      $.ajax({ url: nextUrl, type: 'get', success: function(data) {
        const title = $(data).find('.blog-post h1.post-title').text();
        $('.post-next a .post-nav-inner p').text(title);
      }});
    }
  });

  // Special layout commands in post body
  $('.post-body strike').each(function() {
    const command = $(this).text().trim();
    let style = '';
    if (command === 'left-sidebar') {
      style = '<style>.item #main-wrapper{float:right}.item #sidebar-wrapper{float:left}</style>';
    } else if (command === 'right-sidebar') {
      style = '<style>.item #main-wrapper{float:left}.item #sidebar-wrapper{float:right}</style>';
    } else if (command === 'full-width') {
      style = '<style>.item #main-wrapper{width:100%}.item #sidebar-wrapper{display:none}</style>';
    }
    if (style) {
      $(this).replaceWith(style);
    }
  });


  // --- Sidebar and Back to Top ---
  if (typeof fixedSidebar !== 'undefined' && fixedSidebar === true) {
    $('#main-wrapper, #sidebar-wrapper').theiaStickySidebar({
      additionalMarginTop: 30,
      additionalMarginBottom: 30
    });
  }

  // Back to top button
  const $backTop = $('.back-top');
  if ($backTop.length) {
    $(window).on('scroll', function() {
      $(this).scrollTop() >= 100 ? $backTop.fadeIn(250) : $backTop.fadeOut(250);
    });
    $backTop.on('click', function() {
      $('html, body').animate({ scrollTop: 0 }, 500);
    });
  }


  // --- Dynamic Content Loading (AJAX) ---
  function ajaxPosts(container, type, num, label) {
    const isMega = type.includes('mega-menu');
    const isHot = type.includes('hot-posts');
    const isList = type.includes('post-list');
    const isRelated = type.includes('related');

    if (!isMega && !isHot && !isList && !isRelated) return;

    let url = '';
    if (label === 'recent') {
      url = `/feeds/posts/default?alt=json-in-script&max-results=${num}`;
    } else if (label === 'random') {
      const randomIndex = Math.floor(Math.random() * 100) + 1; // Fetch from a wider range
      url = `/feeds/posts/default?alt=json-in-script&max-results=${num}&start-index=${randomIndex}`;
    } else {
      url = `/feeds/posts/default/-/${label}?alt=json-in-script&max-results=${num}`;
    }

    $.ajax({
      url: url,
      type: 'get',
      dataType: 'jsonp',
      beforeSend: function() {
        if (isHot) {
          container.html('<div class="hot-loader"/>').parent().addClass('show-hot');
        }
      },
      success: function(json) {
        let html = '';
        const entries = json.feed.entry;

        if (entries && entries.length > 0) {
          for (let i = 0; i < entries.length; i++) {
            const entry = entries[i];
            const link = post_link(entry);
            const title = post_title(entry, link);
            const image = post_image(entry);
            const tag = post_label(entry);
            const author = post_author(entry);
            const date = post_date(entry);

            if (isMega) {
              html += `<div class="mega-item item-${i}"><div class="mega-content"><div class="post-image-wrap"><a class="post-image-link" href="${link}">${image}</a>${tag}</div><h2 class="post-title">${title}</h2><div class="post-meta">${date}</div></div></div>`;
            } else if (isHot) {
              html += `<li class="hot-item item-${i}"><div class="hot-item-inner"><a class="post-image-link" href="${link}">${image}</a>${tag}<div class="post-info"><h2 class="post-title">${title}</h2><div class="post-meta">${author}${date}</div></div></div></li>`;
            } else if (isList) {
              html += `<li class="item-${i}"><a class="post-image-link" href="${link}">${image}</a><div class="post-info"><h2 class="post-title">${title}</h2><div class="post-meta">${date}</div></div></li>`;
            } else if (isRelated) {
              html += `<li class="related-item item-${i}"><div class="post-image-wrap"><a class="post-image-link" href="${link}">${image}</a>${tag}</div><h2 class="post-title">${title}</h2><div class="post-meta">${date}</div></li>`;
            }
          }
        } else {
          html = '<div class="no-posts">Error: No Posts Found <i class="fa fa-frown-o"/></div>';
        }
        
        container.html(html);

        if (isHot) {
           container.parent().addClass('show-hot');
           // Re-wrap in ul if needed
           if(!container.is('ul')) {
               container.contents().wrapAll('<ul class="hot-posts"></ul>');
           }
        } else if (isList || isRelated) {
            if(!container.is('ul')) {
               container.contents().wrapAll(`<ul class="${isRelated ? 'related-posts' : 'custom-widget'}"></ul>`);
            }
        }
      },
      error: function() {
        container.html('<div class="no-posts">Failed to load posts.</div>');
      }
    });
  }

  // --- Initialize Dynamic Widgets ---
  // Mega Menu and other dynamic content are handled within their respective initializers now
  $('#hot-section .widget-content').each(function() {
    const $this = $(this);
    const text = $this.text().trim();
    const parts = text.split('/');
    const label = parts[0];
    ajaxPosts($this, 'hot-posts', 2, label);
  });

  $('.common-widget .widget-content').each(function() {
    const $this = $(this);
    const text = $this.text().trim();
    if (text.includes('/')) {
      const parts = text.split('/');
      const num = parts[0];
      const label = parts[1];
      if (!isNaN(parseInt(num, 10)) && ['recent', 'random'].includes(label) || parts.length === 2) {
         ajaxPosts($this, 'post-list', num, label);
      }
    }
  });

  $('.related-ready').each(function() {
    const $this = $(this);
    const label = $this.find('.related-tag').data('label');
    ajaxPosts($this, 'related', 3, label);
  });

  // --- Comment System Handler ---
  $('.blog-post-comments').each(function() {
    const system = typeof commentsSystem !== 'undefined' ? commentsSystem : 'blogger';
    const $this = $(this);
    const sClass = `comments-system-${system}`;

    if (system === 'blogger') {
      $this.addClass(sClass).show();
    } else if (system === 'disqus') {
      if (typeof disqus_blogger_current_url !== 'undefined' && typeof disqusShortname !== 'undefined') {
        (function() {
          var dsq = document.createElement('script');
          dsq.type = 'text/javascript';
          dsq.async = true;
          dsq.src = `//${disqusShortname}.disqus.com/embed.js`;
          (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        })();
        const disqus = '<div id="disqus_thread"/>';
        $('#comments, #gpluscomments').remove();
        $this.append(disqus).addClass(sClass).show();
      }
    } else if (system === 'facebook') {
      const current_url = $(location).attr('href');
      const facebook = `<div class="fb-page" data-href="${current_url}" data-tabs="timeline" data-width="" data-height="" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true"></div>`;
      $('#comments, #gpluscomments').remove();
      $this.append(facebook).addClass(sClass).show();
    } else if (system === 'hide') {
      $this.hide();
    } else {
      $this.addClass('comments-system-default').show();
    }
  });

});
