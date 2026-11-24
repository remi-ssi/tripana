import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getMapboxToken } from '../services/placeSearchService'

// Default center: Philippines
const PH_CENTER = { lng: 121.774, lat: 12.8797 }
const PH_ZOOM = 5

/**
 * Custom hook to manage a Mapbox GL map instance with click-to-pin support.
 *
 * @param {React.RefObject} containerRef - Ref to the map container DOM element
 * @param {object|null}     center       - { lng, lat } for the initial pin (null = Philippines center)
 * @param {boolean}         isVisible    - Whether the modal/container is visible
 * @param {function}        onPinChange  - Callback({ lng, lat }) when user clicks or drags pin
 */
export default function useMap(containerRef, center, isVisible = false, onPinChange = null) {
  const mapRef    = useRef(null)
  const markerRef = useRef(null)
  const [token, setToken] = useState(null)

  // Fetch Mapbox token once from the backend
  useEffect(() => {
    getMapboxToken()
      .then(setToken)
      .catch((err) => console.error('[useMap] Failed to get Mapbox token:', err))
  }, [])

  useEffect(() => {
    if (!isVisible || !containerRef.current || !token) return

    mapboxgl.accessToken = token

    const initialCenter = center ?? PH_CENTER
    const initialZoom   = center ? 15 : PH_ZOOM

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [initialCenter.lng, initialCenter.lat],
      zoom: initialZoom,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    // Pre-place a draggable marker if a location is already selected
    if (center) {
      const marker = new mapboxgl.Marker({ color: '#1d4ed8', draggable: true })
        .setLngLat([center.lng, center.lat])
        .addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLngLat()
        onPinChange?.({ lng: pos.lng, lat: pos.lat })
      })

      markerRef.current = marker
    }

    // Click anywhere on the map to place / move the pin
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat

      markerRef.current?.remove()

      const marker = new mapboxgl.Marker({ color: '#1d4ed8', draggable: true })
        .setLngLat([lng, lat])
        .addTo(map)

      marker.on('dragend', () => {
        const pos = marker.getLngLat()
        onPinChange?.({ lng: pos.lng, lat: pos.lat })
      })

      markerRef.current = marker
      onPinChange?.({ lng, lat })
    })

    mapRef.current = map
    const timer = setTimeout(() => map.resize(), 150)

    return () => {
      clearTimeout(timer)
      markerRef.current?.remove()
      map.remove()
      mapRef.current  = null
      markerRef.current = null
    }
  }, [isVisible, center?.lng, center?.lat, token])

  return { map: mapRef, marker: markerRef }
}