# CandGig Template Installation Guide

This guide will walk you through installing the CandGig Blogger template step by step.

## Prerequisites

- A Blogger/Blogspot account
- Basic familiarity with Blogger dashboard  
- Internet connection for CDN assets

## Quick Installation

### Step 1: Download the Template

Download the optimized template file:
- [optimized-theme.xml](https://raw.githubusercontent.com/vietgoldlight-oss/candgig-blogger-template/main/template/optimized-theme.xml)

### Step 2: Install in Blogger

1. Go to your Blogger dashboard
2. Navigate to **Theme** → **Customize** → **Edit HTML**
3. **Backup your current theme** (click download icon)
4. Click **Choose File** and select the downloaded template
5. Click **Upload** and then **Save theme**

### Step 3: Configure

1. Set up your navigation menu in **Layout**
2. Configure social links in **Top Bar Social** widget
3. Update logo/header in **Header Logo** widget
4. Customize colors if needed

## Features

- ✅ Mobile-first responsive design
- ✅ Fast loading with CDN assets
- ✅ SEO optimized with structured data
- ✅ Accessibility compliant (WCAG 2.1)
- ✅ Dark mode support
- ✅ Performance optimized

## Troubleshooting

### Template Validation Issues

**Error: "There should be one and only one skin in the theme, and we found: 0"**

This error occurs when the template lacks the required `<b:skin>` tags. Use our corrected templates:

- **Recommended**: `optimized-theme-v2.xml` - Full-featured template with proper Blogger structure
- **Backup**: `minimal-theme.xml` - Ultra-minimal version for compatibility

### Template Versions

| Template | Features | File Size | Use Case |
|----------|----------|-----------|----------|
| `optimized-theme-v2.xml` | Full features, all widgets, CDN assets | ~22KB | Production sites |
| `minimal-theme.xml` | Basic structure, essential widgets only | ~7KB | Simple blogs, testing |
| `original-theme.xml` | Complete CSS inline, all features | ~120KB | Reference only |

### Installation Steps for Corrected Template

1. **Download the corrected template**:
   ```bash
   wget https://raw.githubusercontent.com/vietgoldlight-oss/candgig-blogger-template/main/template/optimized-theme-v2.xml
   ```

2. **Upload to Blogger**:
   - Go to Blogger Dashboard → Theme → Edit HTML
   - **Backup your current theme first**
   - Upload `optimized-theme-v2.xml`
   - Click "Save theme"

3. **Verify installation**:
   - Check that the theme loads without errors
   - Verify CDN assets are loading correctly
   - Test responsiveness on mobile devices

### Common Issues and Solutions

**CDN Assets Not Loading**
- Check internet connection
- Verify CDN URLs are accessible
- Try the minimal template if CDN is blocked

**Missing Widgets**
- Use "Add a Gadget" in Layout mode
- Widgets are pre-configured in the template
- All standard Blogger widgets are supported

**Layout Issues**
- Clear browser cache
- Check for any custom CSS conflicts
- Verify theme is fully uploaded

## Support

Need help? Check our [GitHub Issues](https://github.com/vietgoldlight-oss/candgig-blogger-template/issues) or create a new issue.
