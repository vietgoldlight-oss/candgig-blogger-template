# CandGig Blogger Template Usage Guide

## Template Installation

1. **Download the optimized template**: Use `template/optimized-theme.xml`
2. **Upload to Blogger**: Go to Theme → Edit HTML → Replace all content with the template
3. **Save the template**

## Key Features Restored

### Complete Layout Structure
- ✅ Top navigation bar with social links
- ✅ Header with logo and advertisement space
- ✅ Main navigation menu with dropdown support
- ✅ Content area with blog posts
- ✅ Sidebar with widgets
- ✅ Footer with widget areas
- ✅ Mobile responsive navigation

### Performance Optimizations Maintained
- ✅ External CSS/JS loading via CDN
- ✅ Critical CSS inlining
- ✅ Font preloading with fallbacks
- ✅ SEO enhancements (Open Graph, Twitter Cards)
- ✅ Accessibility improvements

## Menu Configuration

### Main Menu Setup
1. Go to Layout → Main Menu section
2. Add menu items using the standard Blogger interface
3. For dropdown menus, prefix submenu items with `_` (underscore)
4. For mega menus, use format: `label/mega-menu` as the URL

Example menu structure:
```
Home → /
About → /p/about.html
Categories → #
_Technology → /search/label/Technology
_Lifestyle → /search/label/Lifestyle
Contact → /p/contact.html
```

### Top Navigation
1. Go to Layout → Top Navigation section
2. Add secondary links (About, Contact, Privacy Policy, etc.)

### Social Links
1. Go to Layout → Social Top section
2. Add social media links (use platform names as text labels)

## Widget Areas

### Sidebar Widgets
- **Sidebar Right (A)**: General widgets
- **Social Widget**: Social media links
- **Sidebar Right (B)**: Additional widgets like Popular Posts, Labels

### Footer Widgets
- **Section (Left)**: Recent posts or custom content
- **Section (Center)**: Tag cloud or categories
- **Section (Right)**: Custom content or featured posts

### Header
- **Header Logo**: Site logo or title
- **Header Advertisement**: 728x90 banner ads

## Customization

### Colors
The template uses CSS variables for easy customization. Colors are defined in the external CSS file.

### Typography
The template uses Noto Sans font family loaded from Google Fonts.

### Responsive Design
The template is fully responsive with:
- Mobile navigation menu
- Flexible grid layout
- Touch-friendly interface elements

## Troubleshooting

### Menu Not Showing
- Ensure the main menu widget is enabled in Layout
- Check that menu links are properly formatted
- Verify JavaScript is loading correctly

### CSS Not Loading
- Check CDN URLs are accessible
- Verify external CSS/JS files exist
- Ensure preconnect links are working

### Mobile Menu Issues
- Check that mobile header elements are present
- Verify JavaScript initialization
- Test on actual mobile devices

## Template Structure

```
- Top Bar (navigation + social)
- Header (logo + ads)
- Main Menu (navigation with search)
- Mobile Header (responsive)
- Content Wrapper
  ├── Main Content (blog posts)
  └── Sidebar (widgets)
- Footer (widgets + copyright)
```

## Support

For issues or customization help, refer to the repository documentation or community support.