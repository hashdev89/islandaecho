/* eslint-disable @typescript-eslint/no-explicit-any */
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title') || 'ISLE & ECHO'
    const subtitle = searchParams.get('subtitle') || 'Feel the Isle, Hear The Echo'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#187BFF',
            backgroundImage: 'linear-gradient(45deg, #187BFF 0%, #4091FE 100%)',
            fontFamily: 'system-ui',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
          
          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '40px',
              maxWidth: '800px',
            }}
          >
            {/* Logo/Title */}
            <div
              style={{
                fontSize: '64px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '20px',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {title}
            </div>
            
            {/* Subtitle */}
            <div
              style={{
                fontSize: '32px',
                color: '#E0F2FE',
                marginBottom: '40px',
                fontWeight: '300',
              }}
            >
              {subtitle}
            </div>
            
            {/* Decorative Element */}
            <div
              style={{
                width: '100px',
                height: '4px',
                backgroundColor: '#A0FF07',
                borderRadius: '2px',
                marginBottom: '20px',
              }}
            />
            
            {/* Tagline */}
            <div
              style={{
                fontSize: '24px',
                color: '#B3E5FC',
                fontWeight: '400',
              }}
            >
              Discover the Beauty of Sri Lanka
            </div>
          </div>
          
          {/* Bottom Right Corner Decoration */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: 'rgba(160, 255, 7, 0.2)',
              border: '3px solid rgba(160, 255, 7, 0.5)',
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}
