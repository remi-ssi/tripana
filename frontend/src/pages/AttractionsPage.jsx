import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from './PageLayout'
import { validateAttractions, validateTripPlanData, hasErrors } from '../validators/attractionValidator'
import { useTripPlan } from '../contexts/TripPlanContext'
import { getRecommendedPlaces } from '../services/attraction'
import { apiClient } from '../api/apiClient'
import { formatTypeTag } from '../utils/helpers'

export default function AttractionsPage() {
  const navigate = useNavigate()
  const { formData } = useTripPlan()
  
  const [attractions, setAttractions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selected, setSelected] = useState([])
  const [errors, setErrors] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const cardsPerPage = 9

  // ════════════════════════════════════════════════════════════════════════
  // FETCH RECOMMENDATIONS ON MOUNT
  // Loads attractions based on user preferences and trip location
  // ════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        setError(null)

        // Validate trip plan data
        const tripErrors = validateTripPlanData(formData)
        if (hasErrors(tripErrors)) {
          throw new Error(tripErrors.city || tripErrors.interests || 'Invalid trip plan data')
        }

        console.log('📍 Fetching attractions for:', {
          city: formData.city,
          preferences: formData.interests,
        })

        // Get recommended attractions based on preferences
        const recommendedAttractions = await getRecommendedPlaces({
          locationCity: formData.city,
          userPreferences: formData.interests,
        })

        if (recommendedAttractions.length === 0) {
          throw new Error('No attractions found matching your preferences. Try adjusting your filters.')
        }

        // Convert API format to display format
        const formattedAttractions = recommendedAttractions.map((place, index) => ({
          id: place.id || `place_${index}`,
          name: place.name || 'Unknown Place',
          description: place.address || 'No description available',
          tags: place.types ? place.types.slice(0, 2).map(t => formatTypeTag(t)) : ['Attraction'],
          rating: place.rating || 0,
          reviews: place.reviews || 0,
          duration: '2-3 hours',
          image: place.photos && place.photos.length > 0
            ? place.photos[0]
            : 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=220&fit=crop',
        }))

        setAttractions(formattedAttractions)
      } catch (err) {
        console.error('Error fetching recommendations:', err)
        setError(err.message || 'Failed to load attractions. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [formData])

  // ════════════════════════════════════════════════════════════════════════
  // GENERATE CATEGORIES FROM ATTRACTIONS
  // Extracts unique tags from all attractions for filtering
  // ════════════════════════════════════════════════════════════════════════
  const categories = ['all', ...new Set(attractions.flatMap((a) => a.tags))]

  const handleContinue = () => {
    const newErrors = validateAttractions(selected)
    setErrors(newErrors)
    if (!hasErrors(newErrors)) {
      navigate('/break')
    }
  }

  // FILTERING AND PAGINATION
  const filtered = attractions.filter(
    (a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || a.tags.includes(selectedCategory)
      return matchesSearch && matchesCategory
    }
  )

  const totalPages = Math.ceil(filtered.length / cardsPerPage)
  const startIndex = (currentPage - 1) * cardsPerPage
  const endIndex = startIndex + cardsPerPage
  const paginatedAttractions = filtered.slice(startIndex, endIndex)

  const toggleAttraction = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    // Clear errors when user selects attractions
    if (errors.attractions) {
      setErrors({})
    }
  }

  // LOADING STATE
  if (loading) {
    return (
      <PageLayout
        currentStep="attractions"
        title="Search Attractions"
        subtitle="Loading personalized recommendations..."
        contentClassName="max-w-7xl"
      >
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mb-4"></div>
          <p className="text-gray-600 text-lg">Finding the best attractions for you...</p>
          <p className="text-gray-400 text-sm mt-2">Location: <span className="font-semibold">{formData.city}</span></p>
          <p className="text-gray-400 text-sm">Interests: <span className="font-semibold">{formData.interests?.slice(0, 3).join(', ')}</span></p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      currentStep="attractions"
      title="Search Attractions"
      subtitle="Select the attractions you'd like to visit during your trip"
      contentClassName="max-w-7xl"
    >
      {/* ERROR STATE */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
          <p className="text-red-600 text-sm">
             {error}
          </p>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value)
            setCurrentPage(1)
          }}
          className="w-full sm:w-56 px-4 py-3 rounded-full border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm shadow-sm"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {paginatedAttractions.map((attraction) => {
          const isSelected = selected.includes(attraction.id)
          return (
            <button
              key={attraction.id}
              type="button"
              onClick={() => toggleAttraction(attraction.id)}
              aria-pressed={isSelected}
              className={`w-full text-left rounded-2xl border-2 overflow-hidden bg-white transition-all duration-200 ${isSelected ? 'border-teal-400 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={attraction.image}
                  alt={attraction.name}
                  className="w-full h-36 object-cover"
                  onError={(e) => { e.target.style.background = '#e5e7eb'; e.target.style.display = 'none' }}
                />
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-2 right-2 w-7 h-7 bg-teal-500 rounded-full flex items-center justify-center shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="text-sm font-bold text-gray-800 mb-1">{attraction.name}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-2 line-clamp-2">{attraction.description}</p>
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {attraction.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                {/* Rating + Select */}
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-yellow-400">
                      <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-700">{attraction.rating}</span>
                    <span className="text-xs text-gray-400">({attraction.reviews.toLocaleString()} reviews)</span>
                  </div>
                  <span className={`text-xs font-semibold transition-colors ${isSelected ? 'text-teal-500' : 'text-gray-400'}`}>
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Empty State */}
      {attractions.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No attractions found. Please adjust your preferences.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Continue */}
      <div>
        {errors.attractions && (
          <div className="mb-3 p-3 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-500 text-sm">{errors.attractions}</p>
          </div>
        )}
        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className="w-full py-4 rounded-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors shadow-md"
        >
          Continue to Break
        </button>

        <button
          onClick={() => navigate('/preference')}
          className="w-full text-center text-sm text-gray-400 hover:text-blue-700 transition-colors"
        >
          ← Back to Preference
        </button>
      </div>
    </PageLayout>
  )
}
