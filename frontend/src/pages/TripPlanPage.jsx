import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from './PageLayout'
import HotelMapModal from '../components/map/HotelMapModal'
import { ClearButtonIcon } from '../components/ClearButtonIcon'
import useCitySuggestions from '../hooks/useCitySuggestions'
import useDebounce from '../hooks/useDebounce'
import { useTripPlan } from '../contexts/TripPlanContext'
import { useFormHandler } from '../hooks/useFormHandler'
import { useHotelSearch } from '../hooks/useHotelSearch'
import { useMapModal } from '../hooks/useMapModal'

export default function TripPlanPage() {
  const navigate = useNavigate()
  const { formData, updateFormData, isLoaded } = useTripPlan()
  const tripType = formData.tripType

  // Custom hooks
  const { form, errors, touched, handleChange, validateForm, loadFormData } = useFormHandler(tripType, updateFormData)
  const {
    hotelSearchInput,
    setHotelSearchInput,
    showHotelSuggestions,
    setShowHotelSuggestions,
    hotelSuggestions,
    hotelLoading,
    fetchHotelCoordinates,
  } = useHotelSearch()
  const { showMapModal, selectedPlace, openMapForPinning, closeMapModal, openMapWithPlace, setSelectedPlace } = useMapModal()

  // City search
  const [citySearchInput, setCitySearchInput] = useState('')
  const [showCitySuggestions, setShowCitySuggestions] = useState(false)
  const debouncedCityQuery = useDebounce(citySearchInput, 500)
  const { suggestions: citySuggestions, isLoading: cityLoading } = useCitySuggestions(debouncedCityQuery)

  // Redirect if no trip type selected
  useEffect(() => {
    if (isLoaded && !tripType) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoaded, tripType, navigate])

  const hasLoadedRef = useRef(false)

  // Load saved data from context on mount
  useEffect(() => {
    if (isLoaded && !hasLoadedRef.current) {
      loadFormData(formData)
      setCitySearchInput(formData.city || '')
      setHotelSearchInput(formData.hotel || '')
      hasLoadedRef.current = true
    }
  }, [isLoaded, formData])

  // ── City selection ─────────────────────────────────────
  const handleSelectCity = (cityName) => {
    handleChange('city', cityName)
    setCitySearchInput(cityName)
    setShowCitySuggestions(false)
  }

  // ── Hotel: click suggestion → retrieve coords → open map ──
  const handleSelectHotel = async (place) => {
    setHotelSearchInput(place.name)
    handleChange('hotel', place.name)
    setShowHotelSuggestions(false)

    const placeWithCoords = await fetchHotelCoordinates(place)
    // Save coordinates to context for route optimization
    if (placeWithCoords?.coordinates) {
      updateFormData('hotelCoords', {
        lat: placeWithCoords.coordinates.lat,
        lng: placeWithCoords.coordinates.lng,
      })
    }
    openMapWithPlace(placeWithCoords)
  }

  // ── Map modal handlers ──
  const handleMapConfirm = (place) => {
    setHotelSearchInput(place.name)
    handleChange('hotel', place.name)
    // Save coordinates to context for route optimization
    if (place?.coordinates) {
      updateFormData('hotelCoords', {
        lat: place.coordinates.lat,
        lng: place.coordinates.lng,
      })
    }
    setSelectedPlace(place)
    closeMapModal()
  }

  const handleContinue = () => {
    const isValid = validateForm()
    if (isValid) {
      navigate('/preference')
    }
  }

  const today = new Date().toISOString().split('T')[0]

  // Returns the next calendar day (YYYY-MM-DD) for the end date min constraint
  const addOneDay = (dateStr) => {
    if (!dateStr) {
      const next = new Date(today)
      next.setDate(next.getDate() + 1)
      return next.toISOString().split('T')[0]
    }
    const [year, month, day] = dateStr.split('-').map(Number)
    const next = new Date(year, month - 1, day + 1)
    return next.toISOString().split('T')[0]
  }

  if (!isLoaded || !tripType) {
    return null
  }

  const pageTitle = tripType === 'day' ? 'Plan Your Day Tour' : 'Plan Your Trip'
  const pageSubtitle = tripType === 'day' 
    ? 'Tell us about your day tour and we\'ll create the perfect itinerary for you'
    : 'Tell us about your travel plans and we\'ll create the perfect itinerary for you'

  return (
    <PageLayout
      currentStep="trip-plan"
      title={pageTitle}
      subtitle={pageSubtitle}
    >
      <div className="space-y-5">

        {/* ── City ── */}
        <div>
          <label className="block text-md font-semibold text-gray-700 mb-1">
            Where To <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., Zambales, Baguio, Ilocos Region…"
              value={citySearchInput}
              onChange={(e) => { setCitySearchInput(e.target.value); setShowCitySuggestions(true) }}
              onFocus={() => citySearchInput && setShowCitySuggestions(true)}
              onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
              className={`w-full px-4 py-3 pr-10 rounded-xl border ${errors.city && touched.city ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.city && touched.city ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-base`}
            />
            {citySearchInput && (
              <button
                type="button"
                onClick={() => { setCitySearchInput(''); handleSelectCity(''); setShowCitySuggestions(false) }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                title="Clear"
              >
                <ClearButtonIcon />
              </button>
            )}
            {showCitySuggestions && citySearchInput && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                {cityLoading && (
                  <div className="px-4 py-3 text-base text-gray-500 flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Searching…
                  </div>
                )}
                {!cityLoading && citySuggestions.length === 0 && (
                  <div className="px-4 py-2 text-base text-gray-500">No results found in the Philippines</div>
                )}
                {!cityLoading && citySuggestions.map((city, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectCity(city.name)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-gray-800">{city.shortName || city.name}</span>
                      {city.typeLabel && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wide">
                          {city.typeLabel}
                        </span>
                      )}
                    </div>
                    {city.shortName && city.name !== city.shortName && (
                      <span className="block text-sm text-gray-400 truncate mt-0.5">{city.name}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          {errors.city && touched.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
        </div>

        {/* ── DAY TOUR FIELDS ── */}
        {tripType === 'day' && (
          <>
            {/* Date */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={today}
                  value={form.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border ${errors.date && touched.date ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 ${errors.date && touched.date ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-base cursor-pointer`}
                />
                {form.date && (
                  <button
                    type="button"
                    onClick={() => handleChange('date', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    title="Clear"
                  >
                    <ClearButtonIcon />
                  </button>
                )}
              </div>
              {errors.date && touched.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
            </div>

            {/* Start Time */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border ${errors.startTime && touched.startTime ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 ${errors.startTime && touched.startTime ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-base cursor-pointer`}
                />
                {form.startTime && (
                  <button
                    type="button"
                    onClick={() => handleChange('startTime', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    title="Clear"
                  >
                    <ClearButtonIcon />
                  </button>
                )}
              </div>
              {errors.startTime && touched.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
            </div>
          </>
        )}

        {/* ── OVERNIGHT TRIP FIELDS ── */}
        {tripType === 'overnight' && (
          <>
            {/* Hotel / Where to Stay */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">
                Where to Stay <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search for a hotel or transient house…"
                    value={hotelSearchInput}
                    onChange={(e) => {
                      setHotelSearchInput(e.target.value)
                      handleChange('hotel', e.target.value)
                      setShowHotelSuggestions(true)
                    }}
                    onFocus={() => hotelSearchInput && setShowHotelSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowHotelSuggestions(false), 200)}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border-1 ${errors.hotel && touched.hotel ? 'border-red-500' : 'border-gray-300'} bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.hotel && touched.hotel ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-blue-700 transition text-base`}                  />
                  {hotelSearchInput && (
                    <button
                      type="button"
                      onClick={() => { setHotelSearchInput(''); handleChange('hotel', ''); setShowHotelSuggestions(false) }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      title="Clear"
                    >
                      <ClearButtonIcon />
                    </button>
                  )}

                  {/* Suggestions dropdown */}
                  {showHotelSuggestions && hotelSearchInput.length >= 2 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                      {hotelLoading && (
                        <div className="px-4 py-3 text-base text-gray-500 flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Searching places…
                        </div>
                      )}
                      {!hotelLoading && hotelSuggestions.length === 0 && (
                        <div className="px-4 py-3 text-base text-gray-500">No places found — try the map pin instead</div>
                      )}
                      {!hotelLoading && hotelSuggestions.map((place) => (
                        <button
                          key={place.id}
                          type="button"
                          onClick={() => handleSelectHotel(place)}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition text-base border-b border-gray-100 last:border-b-0"
                        >
                          <span className="font-medium text-gray-800">{place.name}</span>
                          <span className="text-gray-400 text-sm block mt-0.5 truncate">{place.fullAddress}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pin icon — outside input, right next to it */}
                <button
                  type="button"
                  onClick={openMapForPinning}
                  className="flex-shrink-0 text-blue-700 hover:text-blue-800 transition cursor-pointer p-3 rounded-xl hover:bg-blue-50"
                  title="Pin a location on the map"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.083 3.701-5.125 3.701-9.077 0-4.715-3.73-8.293-8-8.293s-8 3.578-8 8.293c0 3.952 1.757 6.994 3.701 9.077a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {errors.hotel && touched.hotel && <p className="text-red-500 text-sm mt-1">{errors.hotel}</p>}
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={today}
                    value={form.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border ${errors.startDate && touched.startDate ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 ${errors.startDate && touched.startDate ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-base cursor-pointer`}
                  />
                  {form.startDate && (
                    <button
                      type="button"
                      onClick={() => handleChange('startDate', '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      title="Clear"
                    >
                      <ClearButtonIcon />
                    </button>
                  )}
                </div>
                {errors.startDate && touched.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={addOneDay(form.startDate)}
                    value={form.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className={`w-full px-4 py-3 pr-10 rounded-xl border ${errors.endDate && touched.endDate ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 ${errors.endDate && touched.endDate ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-base cursor-pointer`}
                  />
                  {form.endDate && (
                    <button
                      type="button"
                      onClick={() => handleChange('endDate', '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      title="Clear"
                    >
                      <ClearButtonIcon />
                    </button>
                  )}
                </div>
                {errors.endDate && touched.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
              </div>
            </div>

            {/* Max Attractions */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1 flex items-center gap-1">
                Max Attractions per Day <span className="text-red-500">*</span>
                <div className="relative group ml-1 inline-block">
                  <button type="button" className="flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-gray-400 hover:border-blue-700 hover:text-blue-700 transition text-sm font-bold leading-none">i</button>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10">
                    Set the maximum number of attractions you'd like to visit per day. This helps us create a balanced and enjoyable itinerary without overloading your schedule.
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800" />
                  </div>
                </div>
              </label>
              <div className="relative">
                <input
                  type="number" min="1" max="20" placeholder="e.g., 5"
                  value={form.maxAttractions}
                  onChange={(e) => handleChange('maxAttractions', e.target.value)}
                  className={`w-full px-4 py-3 pr-10 rounded-xl border ${errors.maxAttractions && touched.maxAttractions ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.maxAttractions && touched.maxAttractions ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-base`}
                />
                {form.maxAttractions && (
                  <button
                    type="button"
                    onClick={() => handleChange('maxAttractions', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    title="Clear"
                  >
                    <ClearButtonIcon />
                  </button>
                )}
              </div>
              {errors.maxAttractions && touched.maxAttractions && <p className="text-red-500 text-sm mt-1">{errors.maxAttractions}</p>}
            </div>
          </>
        )}

        {/* ── Continue ── */}
        <button
          type="button"
          onClick={handleContinue}
          disabled={
            !form.city ||
            (tripType === 'day' && (!form.date || !form.startTime)) ||
            (tripType === 'overnight' && (!form.hotel || !form.startDate || !form.endDate || !form.maxAttractions))
          }
          className="w-full py-4 rounded-2xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-lg transition-colors duration-200 shadow-md shadow-blue-200 mt-2"
        >
          Continue to Preferences
        </button>

      </div>

      {/* ── Map Modal (lives in components/map/HotelMapModal) ── */}
      <HotelMapModal
        isOpen={showMapModal}
        selectedPlace={selectedPlace}
        onClose={closeMapModal}
        onConfirm={handleMapConfirm}
      />

    </PageLayout>
  )
}
