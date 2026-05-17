import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { validateTripPlan } from '../validators/tripPlanValidator'
import useCitySuggestions from '../hooks/useCitySuggestions'
import useDebounce from '../hooks/useDebounce'
import useMap from '../hooks/useMap'
import { getPlaceSuggestions, getPlaceDetails } from '../api/places_api'

const BUDGET_OPTIONS = [
  { value: 'budget-friendly', label: 'Budget-friendly', emoji: '💚' },
  { value: 'balanced', label: 'Balanced', emoji: '💼' },
  { value: 'luxury', label: 'Luxury', emoji: '✨' },
]

export default function TripPlanPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    city: '',
    hotel: '',
    startDate: '',
    endDate: '',
    maxAttractions: '',
    budget: '',
  })

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  // State for city autocomplete suggestions
  const [citySearchInput, setCitySearchInput] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const { suggestions: citySuggestions, isLoading: cityLoading } = useCitySuggestions(citySearchInput)

  // State for hotel/place search
  const [hotelSearchInput, setHotelSearchInput] = useState('')
  const [showHotelSuggestions, setShowHotelSuggestions] = useState(false)
  const [hotelSuggestions, setHotelSuggestions] = useState([])
  const [hotelLoading, setHotelLoading] = useState(false)
  const debouncedHotelQuery = useDebounce(hotelSearchInput, 500)

  // Map modal state
  const [showMapModal, setShowMapModal] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)
  const mapContainerRef = useRef(null)

  // Initialize map when modal is visible
  useMap(mapContainerRef, selectedPlace?.coordinates, showMapModal)

  // Fetch hotel/place suggestions from Mapbox
  useEffect(() => {
    if (!debouncedHotelQuery || debouncedHotelQuery.trim().length < 2) {
      setHotelSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      setHotelLoading(true)
      try {
        const results = await getPlaceSuggestions(debouncedHotelQuery)
        setHotelSuggestions(results)
      } catch (error) {
        console.error('Failed to fetch place suggestions:', error)
        setHotelSuggestions([])
      } finally {
        setHotelLoading(false)
      }
    }

    fetchSuggestions()
  }, [debouncedHotelQuery])

  const validateForm = () => {
    const newErrors = validateTripPlan(form)
    setTouched({
      city: true,
      hotel: true,
      startDate: true,
      endDate: true,
      maxAttractions: true,
      budget: true,
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field, value) => {
    const updatedForm = { ...form, [field]: value }
    const newErrors = validateTripPlan(updatedForm)

    setForm(updatedForm)
    setTouched((prev) => ({ ...prev, [field]: true }))

    setErrors((prev) => {
      const nextErrors = { ...prev }
      const fieldsToUpdate = [field]

      // Date range validation can affect both date fields.
      if (field === 'startDate' || field === 'endDate') {
        fieldsToUpdate.push('startDate', 'endDate')
      }

      fieldsToUpdate.forEach((name) => {
        if (newErrors[name]) {
          nextErrors[name] = newErrors[name]
        } else {
          delete nextErrors[name]
        }
      })

      return nextErrors
    })
  }

  const handleBudget = (value) => {
    const updatedForm = { ...form, budget: value }
    const newErrors = validateTripPlan(updatedForm)

    setForm(updatedForm)
    setTouched((prev) => ({ ...prev, budget: true }))

    setErrors((prev) => {
      const nextErrors = { ...prev }
      if (newErrors.budget) {
        nextErrors.budget = newErrors.budget
      } else {
        delete nextErrors.budget
      }
      return nextErrors
    })
  }

  // Handle city selection from suggestions dropdown
  const handleSelectCity = (cityName) => {
    const updatedForm = { ...form, city: cityName }
    const newErrors = validateTripPlan(updatedForm)

    setForm(updatedForm)
    setCitySearchInput(cityName)
    setShowCitySuggestions(false)
    setTouched((prev) => ({ ...prev, city: true }))

    setErrors((prev) => {
      const nextErrors = { ...prev }
      if (newErrors.city) {
        nextErrors.city = newErrors.city
      } else {
        delete nextErrors.city
      }
      return nextErrors
    })
  }

  // Handle hotel/place selection — retrieve coordinates then open map
  const handleSelectHotel = async (place) => {
    setHotelSearchInput(place.name)
    handleChange('hotel', place.name)
    setShowHotelSuggestions(false)

    // If coordinates are already available (geocoding fallback), use them directly
    if (place.coordinates) {
      setSelectedPlace(place)
      setShowMapModal(true)
      return
    }

    // Otherwise, retrieve full details from Search Box API
    try {
      const details = await getPlaceDetails(place.id)
      setSelectedPlace(details)
      setShowMapModal(true)
    } catch (error) {
      console.error('Failed to retrieve place details:', error)
      // Still set the place without coordinates — map won't open but name is saved
      setSelectedPlace(place)
    }
  }

  const handleCloseMapModal = () => {
    setShowMapModal(false)
  }

  const handleContinue = () => {
    if (validateForm()) {
      navigate('/attractions')
    }
  }

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split('T')[0];

  return (
    <PageLayout
      currentStep="trip-plan"
      title="Plan Your Trip"
      subtitle="Tell us about your travel plans and we'll create the perfect itinerary for you"
    >
      <div className="space-y-5">

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Where To: <span className="text-red-500">*</span>
          </label>
          {/* City input with autocomplete suggestions */}
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., Zambales"
              value={citySearchInput}
              onChange={(e) => {
                setCitySearchInput(e.target.value)
                setShowCitySuggestions(true)
              }}
              onFocus={() => citySearchInput && setShowCitySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)} // Delay to allow selection
              className={`w-full px-4 py-3 rounded-xl border ${errors.city && touched.city ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.city && touched.city ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-sm`}
            />

            {/* City suggestions dropdown */}
            {showCitySuggestions && citySearchInput && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {cityLoading && (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    Searching cities...
                  </div>
                )}
                {!cityLoading && citySuggestions.length === 0 && (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    No PH cities found
                  </div>
                )}
                {!cityLoading && citySuggestions.length > 0 && (
                  citySuggestions.map((city, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCity(city.name)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 transition text-sm text-gray-800 border-b border-gray-100 last:border-b-0"
                    >
                      {city.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {errors.city && touched.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        {/* Hotel / Where to Stay */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Where to Stay <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., Transient House"
              value={hotelSearchInput}
              onChange={(e) => {
                setHotelSearchInput(e.target.value)
                handleChange('hotel', e.target.value)
                setShowHotelSuggestions(true)
              }}
              onFocus={() => hotelSearchInput && setShowHotelSuggestions(true)}
              onBlur={() => setTimeout(() => setShowHotelSuggestions(false), 200)}
              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 ${errors.hotel && touched.hotel ? 'border-red-500' : 'border-blue-700'} bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.hotel && touched.hotel ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-sm`}
            />
            <button
              type="button"
              onClick={() => selectedPlace && setShowMapModal(true)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${selectedPlace ? 'text-blue-700 hover:text-blue-800 cursor-pointer' : 'text-gray-300 cursor-default'}`}
              title={selectedPlace ? 'View on map' : 'Search a place first'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.083 3.701-5.125 3.701-9.077 0-4.715-3.73-8.293-8-8.293s-8 3.578-8 8.293c0 3.952 1.757 6.994 3.701 9.077a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Hotel/place suggestions dropdown */}
            {showHotelSuggestions && hotelSearchInput && hotelSearchInput.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                {hotelLoading && (
                  <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Searching places...
                  </div>
                )}
                {!hotelLoading && hotelSuggestions.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">No places found</div>
                )}
                {!hotelLoading && hotelSuggestions.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => handleSelectHotel(place)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition text-sm border-b border-gray-100 last:border-b-0"
                  >
                    <span className="font-medium text-gray-800">{place.name}</span>
                    <span className="text-gray-400 text-xs block mt-0.5 truncate">{place.fullAddress}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.hotel && touched.hotel && <p className="text-red-500 text-xs mt-1">{errors.hotel}</p>}
        </div>

        {/* Start Time & End Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={today}
              value={form.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${errors.startDate && touched.startDate ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 ${errors.startDate && touched.startDate ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-sm cursor-pointer`}
            />
            {errors.startDate && touched.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={form.startDate || today}
              value={form.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border ${errors.endDate && touched.endDate ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 ${errors.endDate && touched.endDate ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-sm cursor-pointer`}
            />
            {errors.endDate && touched.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Max Attractions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
            Max Attractions per Day <span className="text-red-500">*</span>
            {/* Info tooltip */}
            <div className="relative group ml-1 inline-block">
              <button
                type="button"
                className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-gray-400 hover:border-blue-700 hover:text-blue-700 transition text-xs font-bold leading-none"
              >
                i
              </button>
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
                Set the maximum number of attractions you'd like to visit per day. This helps us create a balanced and enjoyable itinerary without overloading your schedule.
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800" />
              </div>
            </div>
          </label>
          <input
            type="number"
            min="1"
            max="20"
            placeholder="e.g., 5"
            value={form.maxAttractions}
            onChange={(e) => handleChange('maxAttractions', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.maxAttractions && touched.maxAttractions ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.maxAttractions && touched.maxAttractions ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-sm`}
          />
          {errors.maxAttractions && touched.maxAttractions && <p className="text-red-500 text-xs mt-1">{errors.maxAttractions}</p>}
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Budget <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleBudget(option.value)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-200
                  ${form.budget === option.value
                    ? 'border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-200'
                    : `border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700 ${errors.budget && touched.budget ? 'ring-2 ring-red-500' : ''}`
                  }
                `}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          {errors.budget && touched.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={Object.keys(errors).length > 0 || !form.city || !form.hotel || !form.startDate || !form.endDate || !form.maxAttractions || !form.budget}
          className="w-full py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors duration-200 shadow-md shadow-blue-200 mt-2"
        >
          Continue to Select Attraction
        </button>

      </div>

      {/* ── Map Modal ── */}
      {showMapModal && selectedPlace && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleCloseMapModal}
          style={{ animation: 'fadeIn .2s ease' }}
        >
          <div
            className="relative w-[92%] max-w-lg rounded-2xl shadow-2xl overflow-hidden bg-white"
            style={{ height: '65vh', animation: 'scaleIn .25s ease' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close (X) button on the map */}
            <button
              type="button"
              onClick={handleCloseMapModal}
              className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 shadow-lg text-gray-600 hover:bg-red-500 hover:text-white transition-all duration-200 cursor-pointer"
              title="Close map"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Map container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Place info bar at the bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-5 py-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">{selectedPlace.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{selectedPlace.fullAddress}</p>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}
