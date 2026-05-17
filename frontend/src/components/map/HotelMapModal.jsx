import { useRef, useState } from 'react'
import useMap from '../../hooks/useMap'
import { reverseGeocodePlace } from '../../api/places_api'

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

  // Coords set by clicking the map (manual pin)
  const [pinnedCoords, setPinnedCoords] = useState(null)
  const [isPinning, setIsPinning]       = useState(false)

  // Reset pinnedCoords when modal opens/closes
  // (handled via key prop in parent or reset inside onClose)

  useMap(
    mapContainerRef,
    selectedPlace?.coordinates ?? null,
    isOpen,
    (coords) => setPinnedCoords(coords),
  )

  // ── Confirm a manually-pinned location ──────────────────
  const handleConfirmPin = async () => {
    if (!pinnedCoords) return
    setIsPinning(true)
    try {
      const result = await reverseGeocodePlace(pinnedCoords.lng, pinnedCoords.lat)
      onConfirm({
        name:        result.name,
        fullAddress: result.fullAddress,
        coordinates: pinnedCoords,
      })
    } catch (err) {
      console.error('[HotelMapModal] Reverse geocoding failed:', err)
      // Fallback: use raw coordinates as name
      onConfirm({
        name:        `${pinnedCoords.lat.toFixed(5)}, ${pinnedCoords.lng.toFixed(5)}`,
        fullAddress: `${pinnedCoords.lat.toFixed(5)}, ${pinnedCoords.lng.toFixed(5)}`,
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
        className="relative w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden bg-white"
        style={{ height: '68vh', animation: 'scaleIn .25s ease' }}
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
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-4 py-3 border-t border-gray-100">
          {pinnedCoords ? (
            /* User clicked the map manually */
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-700">📍 Pin placed!</p>
                <p className="text-xs text-gray-500 truncate">
                  {pinnedCoords.lat.toFixed(5)}, {pinnedCoords.lng.toFixed(5)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleConfirmPin}
                disabled={isPinning}
                className="flex-shrink-0 px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 disabled:opacity-60 transition"
              >
                {isPinning ? 'Saving…' : 'Confirm Location'}
              </button>
            </div>
          ) : selectedPlace ? (
            /* Place came from search */
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm">{selectedPlace.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedPlace.fullAddress}</p>
              </div>
              <button
                type="button"
                onClick={handleConfirmSearched}
                className="flex-shrink-0 px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition"
              >
                Confirm Location
              </button>
            </div>
          ) : (
            /* No pin yet */
            <p className="text-xs text-gray-500 text-center py-1">
              🗺️ Tap anywhere on the map to drop a pin
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
