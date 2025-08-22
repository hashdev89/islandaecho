'use client'

import { useEffect, useRef, useState } from 'react'

interface Destination {
  name: string
  lat: number
  lng: number
  region: string
}

interface MapboxMapProps {
  destinations: Destination[]
  tourName: string
}

export default function MapboxMap({ destinations, tourName }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [lng] = useState(80.5) // Sri Lanka center longitude
  const [lat] = useState(7.5)  // Sri Lanka center latitude
  const [zoom] = useState(7)

  useEffect(() => {
    if (map.current || typeof window === 'undefined') return // initialize map only once and ensure we're on client side

    // Dynamically import mapbox-gl
    import('mapbox-gl').then((mapboxgl) => {
      // Load CSS dynamically to avoid module instantiation issues
      if (!document.querySelector('link[href*="mapbox-gl.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css'
        document.head.appendChild(link)
      }
      
      mapboxgl.default.accessToken = 'pk.eyJ1IjoiaGFzaGRldjg5IiwiYSI6ImNtZWt3dTJ3cTBhc2Yya29jY2FpZHluZ20ifQ.ID9_-ktKbovDhmeQZL8_1Q'

      if (mapContainer.current) {
        map.current = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/satellite-streets-v12', // 3D satellite style
          center: [lng, lat],
          zoom: zoom,
          pitch: 45, // 3D tilt
          bearing: 0,
          antialias: true
        })

        // Add navigation controls
        map.current.addControl(new mapboxgl.default.NavigationControl(), 'top-right')
        
        // Add fullscreen control
        map.current.addControl(new mapboxgl.default.FullscreenControl(), 'top-right')

        // Add 3D terrain
        map.current.on('load', () => {
          if (map.current) {
            // Add terrain source
            map.current.addSource('mapbox-terrain', {
              type: 'vector',
              url: 'mapbox://mapbox.mapbox-terrain-v2'
            })

            // Add terrain layer
            map.current.addLayer({
              id: 'terrain',
              source: 'mapbox-terrain',
              'source-layer': 'contour',
              type: 'line',
              paint: {
                'line-color': '#ff69b4',
                'line-width': 1
              }
            })

            // Add 3D building layer
            map.current.addLayer({
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
              }
            })

            // Add markers for each destination
            destinations.forEach((destination, index) => {
              // Create custom marker element
              const markerEl = document.createElement('div')
              markerEl.className = 'marker'
              markerEl.style.width = '30px'
              markerEl.style.height = '30px'
              markerEl.style.backgroundColor = '#3B82F6'
              markerEl.style.borderRadius = '50%'
              markerEl.style.border = '3px solid white'
              markerEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
              markerEl.style.cursor = 'pointer'
              markerEl.style.display = 'flex'
              markerEl.style.alignItems = 'center'
              markerEl.style.justifyContent = 'center'
              markerEl.style.fontWeight = 'bold'
              markerEl.style.color = 'white'
              markerEl.style.fontSize = '12px'
              markerEl.textContent = (index + 1).toString()

              // Add marker to map
              if (map.current) {
                new mapboxgl.default.Marker(markerEl)
                  .setLngLat([destination.lng, destination.lat])
                  .addTo(map.current)

                // Create popup
                const popup = new mapboxgl.default.Popup({ offset: 25 })
                  .setHTML(`
                    <div style="padding: 10px; max-width: 200px;">
                      <h3 style="margin: 0 0 5px 0; color: #333; font-weight: bold;">${destination.name}</h3>
                      <p style="margin: 0; color: #666; font-size: 12px;">${destination.region}</p>
                    </div>
                  `)

                markerEl.addEventListener('click', () => {
                  if (map.current) {
                    popup.setLngLat([destination.lng, destination.lat]).addTo(map.current)
                  }
                })
              }
            })

            // Add route line if multiple destinations
            if (destinations.length > 1 && map.current) {
              const coordinates = destinations.map(dest => [dest.lng, dest.lat])
              
              map.current.addSource('route', {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: coordinates
                  }
                }
              })

              // Add route line
              map.current.addLayer({
                id: 'route-line',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#3B82F6',
                  'line-width': 4,
                  'line-opacity': 0.8
                }
              })

              // Add animated route line
              map.current.addLayer({
                id: 'route-animated',
                type: 'line',
                source: 'route',
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round'
                },
                paint: {
                  'line-color': '#60A5FA',
                  'line-width': 2,
                  'line-dasharray': [0, 4],
                  'line-opacity': 0.6
                }
              })

              // Animate the route line
              let start = 0
              function animateRoute() {
                if (map.current && map.current.getLayer('route-animated')) {
                  try {
                    const phase = (start % 100) / 100
                    map.current.setPaintProperty('route-animated', 'line-dasharray', [
                      phase * 4,
                      (1 - phase) * 4
                    ])
                    start += 1
                    requestAnimationFrame(animateRoute)
                  } catch (error) {
                    console.warn('Route animation error:', error)
                  }
                }
              }
              
              // Start animation after a short delay to ensure layer is ready
              setTimeout(() => {
                animateRoute()
              }, 100)
            }

            // Add tour title overlay
            const titleEl = document.createElement('div')
            titleEl.className = 'map-title'
            titleEl.innerHTML = `
              <div style="
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 0;
                backdrop-filter: blur(10px);
              ">
                ${tourName}
              </div>
            `
            if (mapContainer.current) {
              mapContainer.current.appendChild(titleEl)
            }
          }
        })
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [lng, lat, zoom, destinations, tourName])

  return (
    <div className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
      <style jsx>{`
        .marker {
          transition: all 0.3s ease;
        }
        .marker:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  )
}
