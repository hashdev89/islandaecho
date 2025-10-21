/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Script from 'next/script'
import { useEffect } from 'react'

interface GoogleAnalyticsProps {
  googleAnalyticsId?: string
  googleTagManagerId?: string
}

export default function GoogleAnalytics({ googleAnalyticsId, googleTagManagerId }: GoogleAnalyticsProps) {
  useEffect(() => {
    // Load analytics settings from API
    const loadAnalyticsSettings = async () => {
      try {
        const response = await fetch('/api/seo/analytics')
        const data = await response.json()
        if (data.success) {
          // Update the page with the loaded settings
          // This would typically be handled by a context or state management
        }
      } catch (error) {
        console.error('Error loading analytics settings:', error)
      }
    }

    loadAnalyticsSettings()
  }, [])

  return (
    <>
      {/* Google Tag Manager */}
      {googleTagManagerId && (
        <>
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${googleTagManagerId}');
              `,
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}

      {/* Google Analytics */}
      {googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAnalyticsId}', {
                  page_title: document.title,
                  page_location: window.location.href,
                });
              `,
            }}
          />
        </>
      )}

      {/* Facebook Pixel */}
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'YOUR_PIXEL_ID');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  )
}

// Custom hook for tracking events
export const useAnalytics = () => {
  const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && (window as Window & { gtag?: unknown }).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', eventName, parameters)
    }
  }

  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
        page_title: pageTitle,
      })
    }
  }

  const trackConversion = (conversionId: string, value?: number, currency?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', 'conversion', {
        send_to: conversionId,
        value: value,
        currency: currency,
      })
    }
  }

  return {
    trackEvent,
    trackPageView,
    trackConversion,
  }
}

// SEO tracking functions
export const trackSEOMetrics = {
  trackTourView: (tourId: string, tourName: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', 'view_tour', {
        tour_id: tourId,
        tour_name: tourName,
        event_category: 'SEO',
        event_label: 'Tour View',
      })
    }
  },

  trackBookingStart: (tourId: string, tourName: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', 'begin_checkout', {
        tour_id: tourId,
        tour_name: tourName,
        event_category: 'E-commerce',
        event_label: 'Booking Start',
      })
    }
  },

  trackBookingComplete: (tourId: string, tourName: string, value: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', 'purchase', {
        transaction_id: `booking_${Date.now()}`,
        tour_id: tourId,
        tour_name: tourName,
        value: value,
        currency: 'USD',
        event_category: 'E-commerce',
        event_label: 'Booking Complete',
      })
    }
  },

  trackSearchQuery: (query: string, resultsCount: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', 'search', {
        search_term: query,
        results_count: resultsCount,
        event_category: 'SEO',
        event_label: 'Search Query',
      })
    }
  },

  trackContactForm: (formType: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('event', 'form_submit', {
        form_type: formType,
        event_category: 'Lead Generation',
        event_label: 'Contact Form',
      })
    }
  },
}
