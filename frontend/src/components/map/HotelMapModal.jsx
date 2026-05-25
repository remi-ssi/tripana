import { useRef, useState, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import useMap from '../../hooks/useMap'
import { reverseGeocodePlace } from '../../api/places_api'
import CurrentLocationPermissionModal from '../currentLocation'

/**
 * HotelMapModal — self-contained map modal for selecting a hotel/place.
 *
 * Props:
 *   isOpen        {boolean}      — whether the modal is visible
 *   selectedPlace {object|null}  — place already selected from search (has .coordinates)
 *   onClose       {function}     — called when user clicks X or backdrop
 *   onConfirm     {function}     — called with { name, fullAddress, coordinates } when confirmed
 */
export default function HotelMapModal({ isOpen, selectedPlace, onClose, onConfirm }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)

  // Coords set by clicking the map (manual pin)
  const [pinnedCoords, setPinnedCoords] = useState(null)
  const [isPinning, setIsPinning]       = useState(false)
  const [isUsingLocation, setIsUsingLocation] = useState(false)
  const [showLocationPermission, setShowLocationPermission] = useState(false)

  // Reset pinnedCoords when modal opens/closes
  // (handled via key prop in parent or reset inside onClose)

  const mapHook = useMap(
    mapContainerRef,
    selectedPlace?.coordinates ?? null,
    isOpen,
    (coords) => setPinnedCoords(coords),
  )

  // Capture the map instance from the hook
  useEffect(() => {
    mapRef.current = mapHook.map?.current || null
  }, [mapHook])

  // Reset pinned coords when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPinnedCoords(null)
      setIsUsingLocation(false)
      setShowLocationPermission(false)
    }
  }, [isOpen])

  // ── Zoom to pinned coords when current location is selected ──
  useEffect(() => {
    if (!pinnedCoords || !mapRef.current) return

    // Remove any existing marker
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker')
    existingMarkers.forEach(m => m.remove())

    // Create and place a marker at the pinned location
    const marker = new mapboxgl.Marker({ color: '#1d4ed8', draggable: true })
      .setLngLat([pinnedCoords.lng, pinnedCoords.lat])
      .addTo(mapRef.current)

    // Allow dragging to update coordinates
    marker.on('dragend', () => {
      const pos = marker.getLngLat()
      setPinnedCoords({ lng: pos.lng, lat: pos.lat })
    })

    // Zoom to the pinned location with animation
    mapRef.current.flyTo({
      center: [pinnedCoords.lng, pinnedCoords.lat],
      zoom: 15,
      duration: 1000,
    })
  }, [pinnedCoords])

  // ── Use current device location ────────────────────────
  const handleRequestLocation = () => {
    setShowLocationPermission(true)
  }

  const handlePermissionApproved = async () => {
    setIsUsingLocation(true)
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10000,
          enableHighAccuracy: true,
        })
      })

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      // Set the pin on the map (don't confirm yet)
      setPinnedCoords(coords)
      setShowLocationPermission(false)
    } catch (err) {
      console.error('Geolocation error:', err)
      alert('Could not get your location. Please check your device settings and try again.')
      setShowLocationPermission(false)
    } finally {
      setIsUsingLocation(false)
    }
  }

  const handlePermissionDenied = () => {
    setShowLocationPermission(false)
  }

  // ── Confirm a manually-pinned location ──────────────────
  const handleConfirmPin = async () => {
    if (!pinnedCoords) return
    setIsPinning(true)
    try {
      const result = await reverseGeocodePlace(pinnedCoords.lng, pinnedCoords.lat)
      
      // Ensure we have a valid name
      const name = result?.name?.trim() || `Location (${pinnedCoords.lat.toFixed(4)}, ${pinnedCoords.lng.toFixed(4)})`
      const fullAddress = result?.fullAddress?.trim() || name
      
      onConfirm({
        name,
        fullAddress,
        coordinates: pinnedCoords,
      })
    } catch (err) {
      console.error('[HotelMapModal] Reverse geocoding failed:', err)
      // Fallback: use coordinates as name
      const fallbackName = `Location (${pinnedCoords.lat.toFixed(4)}, ${pinnedCoords.lng.toFixed(4)})`
      onConfirm({
        name: fallbackName,
        fullAddress: fallbackName,
        coordinates: pinnedCoords,
      })
    } finally {
      setIsPinning(false)
      setPinnedCoords(null)
    }
  }

  // ── Confirm a place selected from search ────────────────
  const handleConfirmSearched = () => {
    if (!selectedPlace) return
    onConfirm({
      name:        selectedPlace.name,
      fullAddress: selectedPlace.fullAddress,
      coordinates: selectedPlace.coordinates,
    })
    setPinnedCoords(null)
  }

  const handleClose = () => {
    setPinnedCoords(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
      style={{ animation: 'fadeIn .2s ease' }}
    >
      <div
        className="relative w-[92%] max-w-2xl rounded-2xl shadow-2xl overflow-hidden bg-white"
        style={{ height: '80vh', animation: 'scaleIn .25s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── X button ── */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-lg text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
          title="Close map"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* ── Map container ── */}
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* ── Bottom bar ── */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-4 py-4 border-t border-gray-100 space-y-3">
          {/* Use Current Location button */}
          <button
            type="button"
            onClick={handleRequestLocation}
            disabled={isUsingLocation || isPinning}
            className="w-full px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.083 3.701-5.125 3.701-9.077 0-4.715-3.73-8.293-8-8.293s-8 3.578-8 8.293c0 3.952 1.757 6.994 3.701 9.077a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Use Current Location
          </button>

        {pinnedCoords ? (
            /* User clicked the map manually */
            <div className="space-y-2">
              <p className="text-xs text-center text-gray-600 font-medium">📍 Location selected</p>
              <div className="flex items-center justify-between gap-3 bg-blue-50 p-3 rounded-xl border border-blue-200">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-blue-700">Coordinates</p>
                  <p className="text-xs text-gray-600 truncate">
                    {pinnedCoords.lat.toFixed(5)}, {pinnedCoords.lng.toFixed(5)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmPin}
                  disabled={isPinning}
                  className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {isPinning ? 'Saving…' : '✓ Confirm'}
                </button>
              </div>
            </div>
          ) : selectedPlace ? (
            /* Place came from search */
            <div className="space-y-2">
              <p className="text-xs text-center text-gray-600 font-medium">Review location</p>
              <div className="flex items-center justify-between gap-3 bg-green-50 p-3 rounded-xl border border-green-200">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm">{selectedPlace.name}</h3>
                  <p className="text-xs text-gray-600 mt-0.5 truncate">{selectedPlace.fullAddress}</p>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmSearched}
                  className="flex-shrink-0 px-5 py-2.5 rounded-lg bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition"
                >
                  ✓ Confirm
                </button>
              </div>
            </div>
          ) : (
            /* No pin yet */
            <p className="text-xs text-gray-500 text-center py-2 bg-gray-50 rounded-lg">
              🗺️ Tap on the map to place a pin, or use current location below
            </p>
          )}
        </div>
      </div>

      {/* ── Location Permission Modal ── */}
      <CurrentLocationPermissionModal
        isOpen={showLocationPermission}
        onConfirm={handlePermissionApproved}
        onCancel={handlePermissionDenied}
        isLoading={isUsingLocation}
      />
    </div>
  )
}

