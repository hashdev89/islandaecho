# SEO & Analytics Management System

## Overview
This comprehensive SEO and Analytics management system allows you to easily manage keywords, meta tags, Google Analytics, Google Tag Manager, and other SEO settings directly from your admin dashboard.

## Features

### 🔍 Keywords Management
- Add, edit, and delete SEO keywords
- Categorize keywords by type (Primary, Long-tail, Location-based, etc.)
- Set priority levels (High, Medium, Low)
- Track target rankings
- Monitor keyword status

### 🏷️ Meta Tags Management
- Manage meta tags for all pages
- Set page titles, descriptions, and keywords
- Configure Open Graph tags
- Set Twitter Card metadata
- Manage canonical URLs and robots directives

### 📊 Analytics Integration
- Google Analytics 4 integration
- Google Tag Manager setup
- Facebook Pixel tracking
- Google Ads conversion tracking
- Bing Webmaster tools
- Yandex Webmaster tools

### 📈 Analytics Dashboard
- Real-time website performance metrics
- Top pages and keywords analysis
- Traffic source breakdown
- Device and browser analytics
- Export capabilities

## Getting Started

### 1. Access SEO Management
1. Go to your admin dashboard
2. Click on "SEO & Analytics" in the sidebar
3. You'll see four main tabs:
   - **Keywords**: Manage your SEO keywords
   - **Meta Tags**: Configure page metadata
   - **Analytics**: Set up tracking codes
   - **SEO Settings**: Tools and resources

### 2. Setting Up Google Analytics
1. Go to the **Analytics** tab
2. Enter your Google Analytics ID (format: G-XXXXXXXXXX)
3. Enter your Google Tag Manager ID (format: GTM-XXXXXXX)
4. Click "Save Settings"
5. The tracking codes will be automatically added to your website

### 3. Adding Keywords
1. Go to the **Keywords** tab
2. Fill in the keyword form:
   - **Keyword**: The search term you want to target
   - **Category**: Choose from predefined categories
   - **Priority**: Set importance level
   - **Target Rank**: Desired search position
3. Click "Add Keyword"

### 4. Managing Meta Tags
1. Go to the **Meta Tags** tab
2. Select the page you want to configure
3. Fill in the metadata:
   - **Title**: Page title (appears in search results)
   - **Description**: Meta description
   - **Keywords**: Comma-separated keywords
   - **Canonical URL**: Preferred URL for the page
4. Click "Add Meta Tag"

## API Endpoints

### Keywords API
- `GET /api/seo/keywords` - Get all keywords
- `POST /api/seo/keywords` - Add new keyword
- `DELETE /api/seo/keywords?id={id}` - Delete keyword

### Meta Tags API
- `GET /api/seo/meta-tags` - Get all meta tags
- `POST /api/seo/meta-tags` - Add new meta tag
- `DELETE /api/seo/meta-tags?id={id}` - Delete meta tag

### Analytics API
- `GET /api/seo/analytics` - Get analytics settings
- `PUT /api/seo/analytics` - Update analytics settings

## Tracking Events

The system includes built-in tracking for important user actions:

### Tour Tracking
```javascript
import { trackSEOMetrics } from '@/components/GoogleAnalytics'

// Track tour page views
trackSEOMetrics.trackTourView('tour-id', 'Tour Name')

// Track booking starts
trackSEOMetrics.trackBookingStart('tour-id', 'Tour Name')

// Track completed bookings
trackSEOMetrics.trackBookingComplete('tour-id', 'Tour Name', 500)
```

### Search Tracking
```javascript
// Track search queries
trackSEOMetrics.trackSearchQuery('sri lanka tours', 25)
```

### Form Tracking
```javascript
// Track contact form submissions
trackSEOMetrics.trackContactForm('contact')
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Google Analytics & Tag Manager
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Google Search Console
GOOGLE_SEARCH_CONSOLE_ID=your-verification-code

# Facebook Pixel
FACEBOOK_PIXEL_ID=123456789012345

# Google Ads
GOOGLE_ADS_ID=AW-XXXXXXXXX

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://isleandecho.com
NEXT_PUBLIC_SITE_NAME="ISLE & ECHO"
```

## SEO Best Practices

### Keywords
- Focus on long-tail keywords (3+ words)
- Use location-based keywords for local SEO
- Monitor competitor keywords
- Track keyword performance regularly

### Meta Tags
- Keep titles under 60 characters
- Write compelling descriptions (150-160 characters)
- Use relevant keywords naturally
- Ensure each page has unique metadata

### Analytics
- Set up conversion goals
- Monitor Core Web Vitals
- Track user behavior patterns
- Analyze traffic sources

## Troubleshooting

### Analytics Not Working
1. Check if tracking IDs are correctly entered
2. Verify environment variables are set
3. Use browser developer tools to check for errors
4. Ensure Google Analytics is properly configured

### Keywords Not Tracking
1. Verify keywords are marked as "active"
2. Check if target rankings are realistic
3. Ensure keywords are relevant to your content

### Meta Tags Not Updating
1. Clear browser cache
2. Check if meta tags are properly saved
3. Verify page URLs match exactly

## Support

For technical support or questions about the SEO management system, refer to the development team or check the console for error messages.

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Next Review**: March 2025
