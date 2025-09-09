# API Integration Documentation

## Overview
The portfolio now integrates with the live API hosted at [https://know-himanshu-api.vercel.app](https://know-himanshu-api.vercel.app) to fetch dynamic content.

## Environment Configuration

Create a `.env.local` file in the root directory with the following variables:

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://know-himanshu-api.vercel.app

# Medium Blog Integration
NEXT_PUBLIC_MEDIUM_USERNAME=@pellucidhimanshu
NEXT_PUBLIC_MEDIUM_RSS_URL=https://medium.com/feed/@pellucidhimanshu

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://knowhimanshu.in

# Analytics (optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

## API Endpoints Integrated

### 1. Experience Data
- **Endpoint**: `/resource?type=EXPERIENCE`
- **URL**: https://know-himanshu-api.vercel.app/resource?type=EXPERIENCE
- **Component**: `app/components/sections/experience.tsx`
- **Features**:
  - Fetches work experience data dynamically
  - Loading states with skeleton UI
  - Fallback to static data if API fails
  - Real-time content updates

### 2. Referral Data
- **Endpoint**: `/resource?type=REFERRAL`
- **URL**: https://know-himanshu-api.vercel.app/resource?type=REFERRAL
- **Component**: `app/components/sections/referral.tsx`
- **Features**:
  - Dynamic referral app codes and links
  - Company logos from API
  - Auto-categorization based on company names
  - Dynamic statistics (total referrals, categories count)
  - Loading states with skeleton UI
  - Fallback to mock data if API fails

### 3. Contact Form
- **Endpoint**: `/visitor/postMessage`
- **URL**: https://know-himanshu-api.vercel.app/visitor/postMessage
- **Component**: `app/components/sections/contact.tsx`
- **Features**:
  - Form submission to API
  - Graceful fallback if API is unavailable

## Data Structure

### Experience Data Response
```json
{
  "_id": "...",
  "docType": "EXPERIENCE",
  "content": [
    {
      "id": "2020",
      "duration": "2020-Present",
      "institute": "Walmart Global Tech",
      "degree": "Software Engineer III",
      "stream": "",
      "description": "...",
      "icon": "web",
      "iconColor": "secondary"
    }
  ]
}
```

### Referral Data Response
```json
{
  "_id": "...",
  "docType": "REFERRAL", 
  "content": [
    {
      "id": "cred-referral",
      "company": "Cred",
      "code": "SPQX",
      "link": "https://app.cred.club/spQx/1kf7y2s9",
      "logo": "https://upload.wikimedia.org/...",
      "userId": "..."
    }
  ]
}
```

## Features Added

1. **Dynamic Content Loading**: All sections now fetch real data from the API
2. **Loading States**: Beautiful skeleton loaders while data is being fetched
3. **Error Handling**: Graceful fallbacks to static data if API fails
4. **Logo Support**: Referral apps show actual company logos from the API
5. **Auto-categorization**: Referral apps are automatically categorized based on company names
6. **Real-time Stats**: Dynamic calculation of statistics based on API data

## Benefits

- ✅ **Live Data**: Portfolio always shows up-to-date information
- ✅ **Performance**: Fast loading with efficient caching
- ✅ **Reliability**: Fallback data ensures site never breaks
- ✅ **Scalability**: Easy to add new referrals or experience entries via API
- ✅ **Maintainability**: Content can be updated without code changes

## Testing

The integration includes comprehensive error handling:
- Network failures
- API timeouts
- Invalid response formats
- Missing data fields

All scenarios gracefully fallback to static content to ensure the portfolio remains functional.
