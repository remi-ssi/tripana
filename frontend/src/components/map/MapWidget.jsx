import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getMapboxToken } from '../../services/placeSearchService'

const PHILIPPINES_CENTER = [121.774, 12.8797]

export default function MapWidget({ stops = [], interactive = true, showRoute = true, className = 'w-full h-full' }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [token, setToken] = useState('')

  useEffect(() => {
    let active = true
    getMapboxToken().then(t => {
      if (active) setToken(t)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!token || !mapContainerRef.current || mapRef.current) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: PHILIPPINES_CENTER,
      zoom: 5,
      interactive,
      attributionControl: interactive
    })
    if (interactive) {
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')
    }
    mapRef.current = map

    return () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [token, interactive])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const renderRoute = async () => {
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []

      if (map.getLayer('itinerary-route')) map.removeLayer('itinerary-route')
      if (map.getSource('itinerary-route')) map.removeSource('itinerary-route')

      if (stops.length === 0) {
        map.flyTo({ center: PHILIPPINES_CENTER, zoom: 5 })
        return
      }

      const bounds = new mapboxgl.LngLatBounds()
      stops.forEach((stop, index) => {
        const position = [stop.coordinates.lng, stop.coordinates.lat]
        bounds.extend(position)
        const marker = new mapboxgl.Marker({
          color: stop.visited ? '#16a34a' : '#2563eb',
        })
          .setLngLat(position)
          
        if (interactive) {
           marker.setPopup(
            new mapboxgl.Popup({ offset: 24 }).setHTML(
              showRoute
                ? `<strong>${index + 1}. ${stop.title}</strong><br/>Day ${stop.day} at ${stop.time}`
                : `<strong>${stop.title}</strong><br/>Status: ${stop.visited ? 'Visited' : 'Planned'}`,
            ),
          )
        }
        marker.addTo(map)
        markersRef.current.push(marker)
      })

      if (showRoute && stops.length > 1) {
        // Fetch directions from Mapbox Directions API
        // Chunk requests if needed, but usually 25 is enough for most itineraries.
        // We will process all stops. If it exceeds 25, we just take the first 25 to avoid API error,
        // or we could split it. Let's just do up to 25.
        const routingStops = stops.slice(0, 25)
        const coordinatesQuery = routingStops.map(stop => `${stop.coordinates.lng},${stop.coordinates.lat}`).join(';')
        
        try {
          const res = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesQuery}?geometries=geojson&access_token=${token}`)
          const data = await res.json()
          
          let routeGeojson = null
          if (data.routes && data.routes.length > 0) {
             routeGeojson = data.routes[0].geometry
          } else {
             // Fallback to straight line
             routeGeojson = {
                type: 'LineString',
                coordinates: stops.map((stop) => [stop.coordinates.lng, stop.coordinates.lat]),
             }
          }

          map.addSource('itinerary-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: routeGeojson
            },
          })
          map.addLayer({
            id: 'itinerary-route',
            type: 'line',
            source: 'itinerary-route',
            paint: {
              'line-color': '#2563eb',
              'line-width': 4,
              'line-opacity': 0.75,
            },
          })
        } catch (e) {
          console.error("Directions routing failed:", e)
        }
      }

      map.fitBounds(bounds, { padding: interactive ? 70 : 30, maxZoom: 14 })
    }

    if (map.isStyleLoaded()) {
      renderRoute()
    } else {
      map.once('load', renderRoute)
    }
  }, [stops, interactive, token, showRoute])

  return <div ref={mapContainerRef} className={className} />
}
