// Handles place search state/logic
import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getMapboxToken } from '../services/placeSearchService'

/**
 * Custom hook to manage a Mapbox GL map instance
 * @param {React.RefObject} containerRef - Ref to the map container DOM element
 * @param {object|null} center - { lng, lat } coordinates for the map center
 * @param {boolean} isVisible - Whether the map container is visible (e.g. modal open)
 */
export default function useMap(containerRef, center, isVisible = false) {
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const [token, setToken] = useState(null)

  // Fetch the Mapbox token once from the backend
  useEffect(() => {
    getMapboxToken()
      .then(setToken)
      .catch((err) => console.error('Failed to get Mapbox token:', err))
  }, [])

  useEffect(() => {
    if (!isVisible || !containerRef.current || !center || !token) return

    mapboxgl.accessToken = token

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [center.lng, center.lat],
      zoom: 15,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    // Add pin marker at the searched location
    const marker = new mapboxgl.Marker({ color: '#1d4ed8' })
      .setLngLat([center.lng, center.lat])
      .addTo(map)

    mapRef.current = map
    markerRef.current = marker

    // Resize after the container finishes its layout
    const timer = setTimeout(() => map.resize(), 150)

    return () => {
      clearTimeout(timer)
      marker.remove()
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [isVisible, center?.lng, center?.lat, token])

  return { map: mapRef, marker: markerRef }
}