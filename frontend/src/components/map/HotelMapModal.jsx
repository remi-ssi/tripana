import { useRef, useState, useEffect } from 'react'
import mapboxgl from 'mapbox-gl'
import { X, LocateFixed, MapPin, Check, Loader2 } from 'lucide-react'
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
  const [isPinning, setIsPinning] = useState(false)
  const [isUsingLocation, setIsUsingLocation] = useState(false)
  const [showLocationPermission, setShowLocationPermission] = useState(false)

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

  // Zoom to pinned coords when current location is selected
  useEffect(() => {
    if (!pinnedCoords || !mapRef.current) return

    const existingMarkers = document.querySelectorAll('.mapboxgl-marker')
    existingMarkers.forEach((m) => m.remove())

    const marker = new mapboxgl.Marker({ color: '#2563EB', draggable: true })
      .setLngLat([pinnedCoords.lng, pinnedCoords.lat])
      .addTo(mapRef.current)

    marker.on('dragend', () => {
      const pos = marker.getLngLat()
      setPinnedCoords({ lng: pos.lng, lat: pos.lat })
    })

    mapRef.current.flyTo({
      center: [pinnedCoords.lng, pinnedCoords.lat],
      zoom: 15,
      duration: 1000,
    })
  }, [pinnedCoords])

  // Use current device location
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

  // Confirm a manually-pinned location
  const handleConfirmPin = async () => {
    if (!pinnedCoords) return
    setIsPinning(true)
    try {
      const result = await reverseGeocodePlace(pinnedCoords.lng, pinnedCoords.lat)

      const name = result?.name?.trim() || `Location (${pinnedCoords.lat.toFixed(4)}, ${pinnedCoords.lng.toFixed(4)})`
      const fullAddress = result?.fullAddress?.trim() || name

      onConfirm({
        name,
        fullAddress,
        coordinates: pinnedCoords,
      })
    } catch (err) {
      console.error('[HotelMapModal] Reverse geocoding failed:', err)
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

  // Confirm a place selected from search
  const handleConfirmSearched = () => {
    if (!selectedPlace) return
    onConfirm({
      name: selectedPlace.name,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white flex flex-col"
        style={{ height: '80vh', maxHeight: '680px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MapPin className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2
                className="text-base font-semibold text-slate-900 leading-tight"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Select Accommodation Location
              </h2>
              <p className="text-xs text-slate-500">
                Click anywhere on the map to drop a pin or use your current location
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            title="Close map"
            aria-label="Close map"
          >
            <X className="w-5 h-5 stroke-[2]" />
          </button>
        </div>

        {/* Map container */}
        <div className="relative flex-1 w-full">
          <div ref={mapContainerRef} className="w-full h-full" />
        </div>

        {/* Bottom bar */}
        <div className="bg-white px-5 py-4 border-t border-slate-200 space-y-3 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {pinnedCoords ? (
              /* User clicked the map manually */
              <div className="flex items-center justify-between gap-3 flex-1 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 stroke-[2]" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-700">Pinned Coordinates</p>
                    <p className="text-xs text-slate-500 truncate tabular-nums">
                      {pinnedCoords.lat.toFixed(5)}, {pinnedCoords.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmPin}
                  disabled={isPinning}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isPinning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.25]" />
                      Confirm Location
                    </>
                  )}
                </button>
              </div>
            ) : selectedPlace ? (
              /* Place came from search */
              <div className="flex items-center justify-between gap-3 flex-1 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 stroke-[2]" />
                  <div className="min-w-0">
                    <h3 className="font-medium text-slate-900 text-xs truncate">{selectedPlace.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{selectedPlace.fullAddress}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleConfirmSearched}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.25]" />
                  Confirm Location
                </button>
              </div>
            ) : (
              /* No pin yet */
              <div className="flex items-center gap-2 text-xs text-slate-500 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200/80 flex-1">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 stroke-[1.75]" />
                <span>Click on the map to place a pin, or use your current location.</span>
              </div>
            )}

            {/* Use Current Location button */}
            <button
              type="button"
              onClick={handleRequestLocation}
              disabled={isUsingLocation || isPinning}
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <LocateFixed className="w-4 h-4 text-blue-600 stroke-[1.75]" />
              Use Current Location
            </button>
          </div>
        </div>
      </div>

      {/* Location Permission Modal */}
      <CurrentLocationPermissionModal
        isOpen={showLocationPermission}
        onConfirm={handlePermissionApproved}
        onCancel={handlePermissionDenied}
        isLoading={isUsingLocation}
      />
    </div>
  )
}
