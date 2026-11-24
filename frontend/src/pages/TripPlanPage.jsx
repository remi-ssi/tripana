import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  Calendar,
  Info,
  Loader2,
} from 'lucide-react'
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

  // City selection
  const handleSelectCity = (cityName) => {
    handleChange('city', cityName)
    setCitySearchInput(cityName)
    setShowCitySuggestions(false)
  }

  // Hotel: click suggestion -> retrieve coords -> open map
  const handleSelectHotel = async (place) => {
    setHotelSearchInput(place.name)
    handleChange('hotel', place.name)
    setShowHotelSuggestions(false)

    const placeWithCoords = await fetchHotelCoordinates(place)
    if (placeWithCoords?.coordinates) {
      updateFormData('hotelCoords', {
        lat: placeWithCoords.coordinates.lat,
        lng: placeWithCoords.coordinates.lng,
      })
    }
    openMapWithPlace(placeWithCoords)
  }

  // Map modal handlers
  const handleMapConfirm = (place) => {
    setHotelSearchInput(place.name)
    handleChange('hotel', place.name)
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

  const isDayTour = tripType === 'day'
  const pageTitle = isDayTour ? 'Plan Your Day Tour' : 'Plan Your Trip'
  const pageSubtitle = isDayTour
    ? "Tell us about your day tour and we'll build a balanced single-day itinerary"
    : "Enter your destination, and travel dates to build your itinerary"

  const inputBaseClass = (hasError, withIcon = false) =>
    `w-full ${withIcon ? 'pl-11' : 'pl-4'} pr-10 py-3 rounded-xl border bg-white text-slate-900 placeholder-slate-400 text-sm sm:text-base transition-all duration-150 focus:outline-none ${hasError
      ? 'border-red-500 focus:border-red-500 focus:ring-3 focus:ring-red-500/15'
      : 'border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15'
    }`

  const dateInputAppearanceClass = '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer'

  const isContinueDisabled =
    !form.city ||
    (isDayTour && (!form.date || !form.startTime)) ||
    (tripType === 'overnight' && (!form.hotel || !form.startDate || !form.endDate || !form.maxAttractions))

  return (
    <PageLayout
      currentStep="trip-plan"
      title={pageTitle}
      subtitle={pageSubtitle}
      contentClassName="max-w-2xl"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        {/* Card Header Bar */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
          <div>
            <h2
              className="text-lg font-semibold text-slate-900"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Trip Details
            </h2>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            {isDayTour ? 'Day Tour' : 'Multi-Day Trip'}
          </span>
        </div>

        <div className="space-y-6">
          {/* Destination City */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Destination <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Zambales, Baguio, Ilocos Region..."
                value={citySearchInput}
                onChange={(e) => {
                  setCitySearchInput(e.target.value)
                  setShowCitySuggestions(true)
                }}
                onFocus={() => citySearchInput && setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                className={inputBaseClass(errors.city && touched.city)}
              />
              {citySearchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setCitySearchInput('')
                    handleSelectCity('')
                    setShowCitySuggestions(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="Clear destination"
                >
                  <ClearButtonIcon />
                </button>
              )}

              {showCitySuggestions && citySearchInput && (
                <div className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {cityLoading && (
                    <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2.5">
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      Searching destinations...
                    </div>
                  )}
                  {!cityLoading && citySuggestions.length === 0 && (
                    <div className="px-4 py-3 text-sm text-slate-500">
                      No matching destinations found in the Philippines
                    </div>
                  )}
                  {!cityLoading &&
                    citySuggestions.map((city, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectCity(city.name)}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex flex-col gap-0.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium text-slate-900">
                            {city.shortName || city.name}
                          </span>
                          {city.typeLabel && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                              {city.typeLabel}
                            </span>
                          )}
                        </div>
                        {city.shortName && city.name !== city.shortName && (
                          <span className="block text-xs text-slate-500 truncate">
                            {city.name}
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              )}
            </div>
            {errors.city && touched.city && (
              <p className="text-red-600 text-xs font-medium mt-1.5">{errors.city}</p>
            )}
          </div>

          {/* DAY TOUR FIELDS */}
          {isDayTour && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tour Date <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 stroke-[1.75] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                  <input
                    type="date"
                    min={today}
                    value={form.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    className={`${inputBaseClass(errors.date && touched.date, true)} ${dateInputAppearanceClass} tabular-nums cursor-pointer`}
                  />
                  {form.date && (
                    <button
                      type="button"
                      onClick={() => handleChange('date', '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
                      title="Clear date"
                    >
                      <ClearButtonIcon />
                    </button>
                  )}
                </div>
                {errors.date && touched.date && (
                  <p className="text-red-600 text-xs font-medium mt-1.5">{errors.date}</p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Start Time <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    className={`${inputBaseClass(errors.startTime && touched.startTime)} tabular-nums cursor-pointer`}
                  />
                  {form.startTime && (
                    <button
                      type="button"
                      onClick={() => handleChange('startTime', '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Clear start time"
                    >
                      <ClearButtonIcon />
                    </button>
                  )}
                </div>
                {errors.startTime && touched.startTime && (
                  <p className="text-red-600 text-xs font-medium mt-1.5">{errors.startTime}</p>
                )}
              </div>
            </div>
          )}

          {/* OVERNIGHT TRIP FIELDS */}
          {tripType === 'overnight' && (
            <>
              {/* Hotel / Where to Stay */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Where to Stay <span className="text-red-600">*</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Search for a hotel or transient house..."
                      value={hotelSearchInput}
                      onChange={(e) => {
                        setHotelSearchInput(e.target.value)
                        handleChange('hotel', e.target.value)
                        setShowHotelSuggestions(true)
                      }}
                      onFocus={() => hotelSearchInput && setShowHotelSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowHotelSuggestions(false), 200)}
                      className={inputBaseClass(errors.hotel && touched.hotel)}
                    />
                    {hotelSearchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setHotelSearchInput('')
                          handleChange('hotel', '')
                          setShowHotelSuggestions(false)
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                        title="Clear accommodation"
                      >
                        <ClearButtonIcon />
                      </button>
                    )}

                    {/* Suggestions dropdown */}
                    {showHotelSuggestions && hotelSearchInput.length >= 2 && (
                      <div className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-slate-100">
                        {hotelLoading && (
                          <div className="px-4 py-3 text-sm text-slate-500 flex items-center gap-2.5">
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                            Searching places...
                          </div>
                        )}
                        {!hotelLoading && hotelSuggestions.length === 0 && (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            No places found. Use the Pin on Map button to select your location.
                          </div>
                        )}
                        {!hotelLoading &&
                          hotelSuggestions.map((place) => (
                            <button
                              key={place.id}
                              type="button"
                              onClick={() => handleSelectHotel(place)}
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors"
                            >
                              <span className="text-sm font-medium text-slate-900 block">
                                {place.name}
                              </span>
                              <span className="text-slate-500 text-xs block mt-0.5 truncate">
                                {place.fullAddress}
                              </span>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Secondary Pin on Map Button */}
                  <button
                    type="button"
                    onClick={openMapForPinning}
                    className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    title="Pin accommodation location on the map"
                  >
                    <MapPin className="w-4 h-4 text-blue-600 stroke-[2]" />
                    <span>Pin on Map</span>
                  </button>
                </div>
                {errors.hotel && touched.hotel && (
                  <p className="text-red-600 text-xs font-medium mt-1.5">{errors.hotel}</p>
                )}
              </div>

              {/* Start & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 stroke-[1.75] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="date"
                      min={today}
                      value={form.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      className={`${inputBaseClass(errors.startDate && touched.startDate, true)} ${dateInputAppearanceClass} tabular-nums cursor-pointer`}
                    />
                    {form.startDate && (
                      <button
                        type="button"
                        onClick={() => handleChange('startDate', '')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
                        title="Clear start date"
                      >
                        <ClearButtonIcon />
                      </button>
                    )}
                  </div>
                  {errors.startDate && touched.startDate && (
                    <p className="text-red-600 text-xs font-medium mt-1.5">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 stroke-[1.75] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
                    <input
                      type="date"
                      min={addOneDay(form.startDate)}
                      value={form.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      onClick={(e) => e.currentTarget.showPicker?.()}
                      className={`${inputBaseClass(errors.endDate && touched.endDate, true)} ${dateInputAppearanceClass} tabular-nums cursor-pointer`}
                    />
                    {form.endDate && (
                      <button
                        type="button"
                        onClick={() => handleChange('endDate', '')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
                        title="Clear end date"
                      >
                        <ClearButtonIcon />
                      </button>
                    )}
                  </div>
                  {errors.endDate && touched.endDate && (
                    <p className="text-red-600 text-xs font-medium mt-1.5">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Max Attractions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                    <span>
                      Max Attractions per Day <span className="text-red-600">*</span>
                    </span>
                    <div className="relative group inline-flex items-center">
                      <button
                        type="button"
                        aria-label="About max attractions per day"
                        className="text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                      >
                        <Info className="w-4 h-4 stroke-[1.75]" />
                      </button>
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-900 text-white text-xs leading-relaxed rounded-lg px-3 py-2.5 shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-opacity duration-150 z-20">
                        Set the maximum number of attractions to visit each day so your itinerary stays balanced without overloading your schedule.
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                      </div>
                    </div>
                  </label>
                  <span className="text-xs text-slate-400 tabular-nums">1 to 20 per day</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    placeholder="e.g., 5"
                    value={form.maxAttractions}
                    onChange={(e) => handleChange('maxAttractions', e.target.value)}
                    className={`${inputBaseClass(errors.maxAttractions && touched.maxAttractions)} tabular-nums`}
                  />
                  {form.maxAttractions && (
                    <button
                      type="button"
                      onClick={() => handleChange('maxAttractions', '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Clear max attractions"
                    >
                      <ClearButtonIcon />
                    </button>
                  )}
                </div>
                {errors.maxAttractions && touched.maxAttractions && (
                  <p className="text-red-600 text-xs font-medium mt-1.5">{errors.maxAttractions}</p>
                )}
              </div>
            </>
          )}

          {/* Continue Action */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleContinue}
              disabled={isContinueDisabled}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium text-base transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Continue to Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      <HotelMapModal
        isOpen={showMapModal}
        selectedPlace={selectedPlace}
        onClose={closeMapModal}
        onConfirm={handleMapConfirm}
      />
    </PageLayout>
  )
}
