import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Star,
  Check,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  AlertCircle,
} from 'lucide-react'
import PageLayout from './PageLayout'
import AttractionModal from '../components/placeInfo'
import { ClearButtonIcon } from '../components/ClearButtonIcon'
import { validateAttractions, validateTripPlanData, hasErrors } from '../validators/attractionValidator'
import { useTripPlan } from '../contexts/TripPlanContext'
import { useLazyLoad } from '../hooks/lazyLoad'
import { formatTypeTag } from '../utils/helpers'
import { getAttractionImageUrl, handleImageError } from '../utils/imageUrl'

export default function AttractionsPage() {
  const navigate = useNavigate()
  const { formData, updateFormData } = useTripPlan()

  const [attractions, setAttractions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selected, setSelected] = useState(() => {
    return formData.attractions ? formData.attractions.map((a) => a.id) : []
  })
  const [errors, setErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = 9

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (debouncedQuery.trim().length > 2) {
      handleSearch(debouncedQuery)
    } else {
      setIsSearchActive(false)
      setSearchResults([])
      setSearchError('')
    }
  }, [debouncedQuery])

  const handleSearch = async (query) => {
    try {
      setSearchLoading(true)
      setIsSearchActive(true)
      setSearchError('')
      const { freeSearchAttractions } = await import('../services/attraction')
      const results = await freeSearchAttractions({
        query: query,
        city: formData.city,
      })

      const formattedResults = results.map((place, index) => ({
        id: place.placeid || place.id || `place_${index}`,
        name: place.name || 'Unknown Place',
        description: place.address || 'No description available',
        tags: place.types ? place.types.slice(0, 2).map((t) => formatTypeTag(t)) : ['Attraction'],
        rating: place.rating || 0,
        reviews: place.user_ratings_total || place.reviews || 0,
        duration: '2-3 hours',
        photoUrl: place.photoUrl,
        photos: place.photos,
        types: place.types || [],
        coordinates:
          place.coordinates ||
          (place.latitude != null && place.longitude != null
            ? { lat: place.latitude, lng: place.longitude }
            : null),
        price_level: place.price_level,
        opening_hours: place.opening_hours,
        website: place.website,
        phone_number: place.phone_number,
      }))

      setSearchResults(formattedResults)
      setCurrentPage(1)
    } catch (err) {
      console.error('Error executing search:', err)
      setSearchResults([])
      setSearchError(err.message || 'Search failed. Please try another keyword.')
    } finally {
      setSearchLoading(false)
    }
  }

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState(null)

  // Lazy loading hook for images
  const { imageRefs, observeImages } = useLazyLoad({ rootMargin: '50px' })

  // FETCH RECOMMENDATIONS ON MOUNT
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)

        const tripErrors = validateTripPlanData(formData)
        if (hasErrors(tripErrors)) {
          throw new Error(tripErrors.city || tripErrors.interests || 'Invalid trip plan data')
        }

        const { getRecommendedPlaces } = await import('../services/attraction')
        const recommendedAttractions = await getRecommendedPlaces({
          locationCity: formData.city,
          userPreferences: formData.interests,
          budget: formData.budget,
        })

        if (recommendedAttractions.length === 0) {
          throw new Error('No attractions found matching your preferences. Try adjusting your filters.')
        }

        const formattedAttractions = recommendedAttractions.map((place, index) => ({
          id: place.id || `place_${index}`,
          name: place.name || 'Unknown Place',
          description: place.address || 'No description available',
          tags: place.types ? place.types.slice(0, 2).map((t) => formatTypeTag(t)) : ['Attraction'],
          rating: place.rating || 0,
          reviews: place.reviews || 0,
          duration: '2-3 hours',
          photoUrl: place.photoUrl,
          photos: place.photos,
          types: place.types || [],
          coordinates: place.coordinates,
          price_level: place.price_level,
          opening_hours: place.opening_hours,
          website: place.website,
        }))

        setAttractions(formattedAttractions)
        setTimeout(observeImages, 50)
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError(err.message || 'Failed to load attractions. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [formData.city, formData.budget, formData.interests?.join(',')])

  // Observe images when pagination changes
  useEffect(() => {
    observeImages()
  }, [currentPage, observeImages])

  // GENERATE CATEGORIES FROM ATTRACTIONS
  const categories = ['all', ...new Set(attractions.flatMap((a) => a.tags))]

  const handleContinue = () => {
    const newErrors = validateAttractions(selected)
    setErrors(newErrors)
    if (!hasErrors(newErrors)) {
      const allAvailable = [...attractions]
      searchResults.forEach((sr) => {
        if (!allAvailable.some((a) => a.id === sr.id)) {
          allAvailable.push(sr)
        }
      })
      const selectedAttractions = allAvailable.filter((attraction) =>
        selected.includes(attraction.id)
      )
      updateFormData('attractions', selectedAttractions)
      navigate('/break')
    }
  }

  const handleOpenModal = (attraction) => {
    setSelectedPlace(attraction)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedPlace(null)
  }

  const handleSelectFromModal = () => {
    if (selectedPlace) {
      toggleAttraction(selectedPlace.id)
      handleCloseModal()
    }
  }

  // FILTERING AND PAGINATION
  const activeList = isSearchActive ? searchResults : attractions

  const filtered = activeList.filter((a) => {
    const matchesSearch = isSearchActive
      ? true
      : a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = isSearchActive
      ? true
      : selectedCategory === 'all' || a.tags.includes(selectedCategory)
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filtered.length / cardsPerPage)
  const startIndex = (currentPage - 1) * cardsPerPage
  const endIndex = startIndex + cardsPerPage
  const paginatedAttractions = filtered.slice(startIndex, endIndex)

  const toggleAttraction = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    if (errors.attractions) {
      setErrors({})
    }
  }

  // LOADING STATE
  if (loading) {
    return (
      <PageLayout
        currentStep="attractions"
        title="Select Attractions"
        subtitle="Loading personalized recommendations for your destination"
        contentClassName="max-w-6xl"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center py-20 px-6 text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4 stroke-[2]" />
          <p
            className="text-slate-900 font-semibold text-base sm:text-lg"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Finding the best attractions for you...
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-slate-500">
            {formData.city && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {formData.city}
              </span>
            )}
            {formData.interests?.slice(0, 3).map((interest) => (
              <span
                key={interest}
                className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      currentStep="attractions"
      title="Select Attractions"
      subtitle="Choose the places you want to include in your itinerary"
      contentClassName="max-w-6xl"
    >
      {/* ERROR STATE */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5 stroke-[1.75]" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Search + Category Filter + Selection Count Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 stroke-[1.75] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search attractions in ${formData.city || 'your destination'}...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 hover:border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 text-sm transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                title="Clear search"
              >
                <ClearButtonIcon />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              disabled={isSearchActive}
              className="w-full sm:w-52 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/15 text-sm transition-all disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            {/* Selected Count Pill */}
            <div className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-50 text-blue-600 text-xs sm:text-sm font-semibold tabular-nums">
              <Check className="w-4 h-4 stroke-[2.25]" />
              <span>{selected.length} selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {searchLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center py-16 w-full mb-6">
          <Loader2 className="w-7 h-7 text-blue-600 animate-spin mb-3 stroke-[2]" />
          <p className="text-slate-600 text-sm font-medium">
            Searching places in {formData.city}...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
          {paginatedAttractions.map((attraction) => {
            const isSelected = selected.includes(attraction.id)
            const displayImage = getAttractionImageUrl(attraction)

            return (
              <div
                key={attraction.id}
                onClick={() => handleOpenModal(attraction)}
                className={`group relative flex flex-col w-full text-left rounded-2xl border overflow-hidden bg-white transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-600/15 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                  {displayImage ? (
                    <img
                      ref={(el) => {
                        if (el) imageRefs.current[attraction.id] = el
                      }}
                      src={displayImage}
                      alt={attraction.name}
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      onError={(e) => {
                        handleImageError(e, attraction)
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-xs font-medium">
                      No photo available
                    </div>
                  )}

                  {/* Selected checkmark badge */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 text-white stroke-[2.5]" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-4">
                  <h3
                    className="text-base font-semibold text-slate-900 mb-1 line-clamp-1"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    {attraction.name}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
                    {attraction.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
                    {attraction.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Rating + Select Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-semibold text-slate-800">
                        {attraction.rating ? Number(attraction.rating).toFixed(1) : 'New'}
                      </span>
                      {attraction.reviews > 0 && (
                        <span className="text-xs text-slate-400">
                          ({attraction.reviews.toLocaleString()})
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleAttraction(attraction.id)
                      }}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                        isSelected
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.25]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <span>Select</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty State */}
      {filtered.length === 0 && !loading && !searchLoading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs text-center py-12 px-6 mb-8">
          <p className="text-slate-700 font-medium text-sm">
            {isSearchActive
              ? searchError || 'No places found for this search. Try another keyword.'
              : 'No attractions match the selected category.'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
                setCurrentPage(1)
              }}
              className="mt-3 inline-flex items-center px-3.5 py-2 rounded-lg text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              Reset filters
            </button>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2]" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5 flex-wrap justify-center tabular-nums">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg font-medium text-xs sm:text-sm transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        {errors.attractions && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 stroke-[2]" />
            <p className="text-red-600 text-xs sm:text-sm font-medium">{errors.attractions}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/preference')}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back to Preferences</span>
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="sm:min-w-[240px] py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Continue to Schedule ({selected.length})
          </button>
        </div>
      </div>

      {/* Attraction Details Modal */}
      {selectedPlace && (
        <AttractionModal
          place={{
            id: selectedPlace.id,
            name: selectedPlace.name,
            destination: selectedPlace.name,
            address: selectedPlace.description,
            latitude: selectedPlace.coordinates?.lat ?? 0,
            longitude: selectedPlace.coordinates?.lng ?? 0,
            rating: selectedPlace.rating,
            userratinqtotal: selectedPlace.reviews,
            pricelevel: selectedPlace.price_level ?? null,
            phonenumber: selectedPlace.phone_number ?? null,
            website: selectedPlace.website ?? null,
            openinghours: selectedPlace.opening_hours ?? null,
            photoUrl: selectedPlace.photoUrl,
            types: selectedPlace.types || [],
            tags: selectedPlace.tags || [],
            photos: selectedPlace.image ? [selectedPlace.image] : [],
          }}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSelect={handleSelectFromModal}
          isSelected={selected.includes(selectedPlace.id)}
        />
      )}
    </PageLayout>
  )
}
