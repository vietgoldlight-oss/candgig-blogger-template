# CandGig Blogger Template

An optimized, modern, and responsive Blogger template designed for English-language blogs. Built with performance, accessibility, and SEO in mind.

## 🚀 Features

### Performance Optimized
- **External CSS/JS**: All assets loaded via CDN for faster loading
- **Lazy Loading**: Images load only when needed
- **Critical CSS**: Above-the-fold content loads instantly
- **Font Display Swap**: Prevents text layout shift
- **Preconnect**: DNS prefetching for external resources
- **Minified Assets**: Compressed CSS and JavaScript files

### SEO Enhanced
- **Structured Data**: JSON-LD schema markup for better search visibility
- **Open Graph**: Enhanced social media sharing
- **Twitter Cards**: Optimized Twitter previews
- **Meta Tags**: Comprehensive SEO meta tags
- **Canonical URLs**: Proper URL canonicalization
- **Sitemap Ready**: Compatible with Blogger sitemaps

### Modern Design
- **Mobile-First**: Responsive design that works on all devices
- **CSS Variables**: Easy theming and customization
- **Flexbox Layout**: Modern, flexible layout system
- **Dark Mode Support**: Automatic dark mode detection
- **Typography**: Beautiful typography with Noto Sans font
- **Icons**: Font Awesome 6 icons

### Accessibility
- **WCAG 2.1 Compliant**: Meets accessibility standards
- **Screen Reader Friendly**: Proper ARIA labels and semantic HTML
- **Keyboard Navigation**: Full keyboard accessibility
- **Skip Links**: Quick navigation for screen readers
- **Focus Management**: Clear focus indicators
- **Alt Text**: Proper image descriptions

### Developer Friendly
- **Modern JavaScript**: ES6+ features, no jQuery dependency
- **Utility Functions**: Helper functions for common tasks
- **Configuration**: Easy theme configuration
- **Documentation**: Comprehensive documentation
- **Version Control**: Git-based development

## 📁 File Structure

```
candgig-blogger-template/
├── assets/
│   ├── css/
│   │   ├── style.css          # Main stylesheet (18KB)
│   │   └── responsive.css     # Responsive styles (7KB)
│   └── js/
│       ├── main.js           # Main JavaScript (11KB)
│       └── utils.js          # Utility functions (13KB)
├── template/
│   ├── original-theme.xml    # Original template
│   └── optimized-theme.xml   # Optimized English version
├── docs/
│   ├── installation.md      # Installation guide
│   ├── changelog.md         # Version history
│   ├── features.md          # Feature documentation
│   └── performance-guide.md # Performance optimization guide
└── README.md                # This file
```

## 🔧 Installation

### Method 1: Direct Upload (Recommended)

1. **Download the corrected template**:
   ```bash
   # Recommended: Full-featured template
   wget https://raw.githubusercontent.com/vietgoldlight-oss/candgig-blogger-template/main/template/optimized-theme-v2.xml
   
   # Alternative: Minimal template
   wget https://raw.githubusercontent.com/vietgoldlight-oss/candgig-blogger-template/main/template/minimal-theme.xml
   ```

2. **Go to your Blogger dashboard**:
   - Navigate to `Theme` → `Customize` → `Edit HTML`

3. **Backup your current theme**:
   - Click `Download theme` to save your current template

4. **Upload the corrected template**:
   - Click `Choose File` and select `optimized-theme-v2.xml` (recommended) or `minimal-theme.xml`
   - Click `Upload`

5. **Save the changes**:
   - Click `Save theme`

### Method 2: CDN Integration

The template automatically loads assets from our CDN:
```
https://cdn.jsdelivr.net/gh/vietgoldlight-oss/candgig-blogger-template@main/assets/
```

Assets are cached globally for optimal performance.

## ⚙️ Configuration

### Theme Settings

Edit the configuration in your template's `<head>` section:

```javascript
window.CandGigConfig = {
  postPerPage: 8,                    // Posts per page
  fixedSidebar: true,               // Enable sticky sidebar
  commentsSystem: "blogger",        // blogger, disqus, facebook, hide
  disqusShortname: "your-site",     // Disqus shortname (if using Disqus)
  theme: {
    name: "CandGig",
    version: "1.0",
    author: "Your Name"
  }
};
```

### Color Customization

Customize colors using CSS variables in `style.css`:

```css
:root {
  --main-color: #f12020;           /* Primary color */
  --main-dark-color: #111111;      /* Dark accent */
  --body-bg-color: #f8f8f8;        /* Background */
  --body-text-color: #656565;      /* Text color */
  --posts-bg-color: #ffffff;       /* Post background */
}
```

### Menu Configuration

Configure your menu in Blogger:

1. Go to `Layout` → `Main Menu`
2. Add/edit menu items
3. Use `_submenu` prefix for dropdown items
4. Use `mega-menu/label` for mega menu categories

## 📱 Responsive Breakpoints

The template uses mobile-first responsive design:

- **XS**: < 576px (Mobile phones)
- **SM**: 576px+ (Large phones)
- **MD**: 768px+ (Tablets)
- **LG**: 992px+ (Desktops)
- **XL**: 1200px+ (Large desktops)

## 🎨 Customization

### Adding Custom CSS

Add custom styles in Blogger's `Theme Designer`:

1. Go to `Theme` → `Customize`
2. Click `Advanced` → `Add CSS`
3. Add your custom styles

### Widget Areas

The template includes several widget areas:

- **Top Bar Navigation**: Secondary navigation links
- **Top Bar Social**: Social media links
- **Header Logo**: Site logo/title
- **Header Advertisement**: Header ads (728x90)
- **Main Menu**: Primary navigation
- **Sidebar**: Sidebar widgets
- **Footer**: Footer content

### Post Features

- **Featured Images**: Automatic image optimization
- **Video Posts**: YouTube video support with thumbnails
- **Related Posts**: Automatic related post suggestions
- **Social Sharing**: Built-in social sharing buttons
- **Author Bio**: Author information display
- **Post Labels**: Category/tag system

## 🚀 Performance

### Core Web Vitals

The template is optimized for Google's Core Web Vitals:

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Features

- **Critical CSS**: Above-the-fold styles inlined
- **Lazy Loading**: Images load on scroll
- **Resource Hints**: Preconnect and preload directives
- **Minification**: CSS and JS are minified
- **CDN**: Global content delivery network

### Browser Support

- **Chrome**: 60+
- **Firefox**: 60+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile**: iOS 12+, Android 7+

## 📖 Documentation

- [Installation Guide](docs/installation.md)
- [Feature Documentation](docs/features.md)
- [Performance Guide](docs/performance-guide.md)
- [Changelog](docs/changelog.md)

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Setup

```bash
git clone https://github.com/vietgoldlight-oss/candgig-blogger-template.git
cd candgig-blogger-template
```

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/vietgoldlight-oss/candgig-blogger-template/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vietgoldlight-oss/candgig-blogger-template/discussions)
- **Documentation**: [Wiki](https://github.com/vietgoldlight-oss/candgig-blogger-template/wiki)

## 🏆 Credits

- **Original Template**: Based on Video template by Sora Templates
- **Optimization**: CandGig Team
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Noto Sans)

## 📊 Stats

- **Template Size**: ~8KB (optimized XML)
- **CSS Size**: ~25KB (combined, minified)
- **JS Size**: ~24KB (combined, minified)
- **Total Assets**: ~57KB (cached via CDN)
- **Load Time**: < 2 seconds (on 3G)

## 🔄 Version History

### v2.0.0 (Latest - Blogger Compatible)
- **FIXED**: Added required `<b:skin>` tags for Blogger validation
- **NEW**: `optimized-theme-v2.xml` - Complete template with proper structure
- **NEW**: `minimal-theme.xml` - Ultra-minimal backup version
- Enhanced SEO and accessibility features
- External CSS/JS assets via CDN
- Mobile-first responsive design
- Complete widget compatibility

### v1.0.0 (Legacy)
- Initial optimized release
- External CSS/JS assets
- Enhanced SEO and accessibility
- Performance optimizations
- **ISSUE**: Missing `<b:skin>` tags (use v2.0.0 instead)

---

**Made with ❤️ by the CandGig Team**