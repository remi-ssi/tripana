import { useState } from 'react'

/**
 * Custom hook to manage hotel map modal state and handlers
 */
export function useMapModal() {
  const [showMapModal, setShowMapModal] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)

  // Open map for manual pinning (no place selected)
  const openMapForPinning = () => {
    setSelectedPlace(null)
    setShowMapModal(true)
  }

  // Close map modal
  const closeMapModal = () => {
    setShowMapModal(false)
    setSelectedPlace(null)
  }

  // Set place and open map
  const openMapWithPlace = (place) => {
    setSelectedPlace(place)
    setShowMapModal(true)
  }

  return {
    showMapModal,
    selectedPlace,
    openMapForPinning,
    closeMapModal,
    openMapWithPlace,
    setSelectedPlace,
  }
}
