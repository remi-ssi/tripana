import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'nature', label: '🌿 Nature' },
  { value: 'culture', label: '🏛️ Culture' },
  { value: 'adventure', label: '🧗 Adventure' },
  { value: 'food', label: '🍜 Food' },
  { value: 'beach', label: '🏖️ Beach' },
  { value: 'historical', label: '🏰 Historical' },
]

const ATTRACTIONS = [
  { id: 1, name: 'Anawangin Cove', category: 'nature', rating: 4.8, duration: '3–4 hrs', description: 'Stunning cove with white volcanic ash sand and pine trees.', emoji: '🌊' },
  { id: 2, name: 'Capones Island', category: 'beach', rating: 4.7, duration: '2–3 hrs', description: 'Pristine island with a historic lighthouse and crystal-clear waters.', emoji: '🏝️' },
  { id: 3, name: 'Tara Falls', category: 'nature', rating: 4.5, duration: '2 hrs', description: 'Hidden waterfall surrounded by lush forest trails.', emoji: '💧' },
  { id: 4, name: 'Iba Fish Market', category: 'food', rating: 4.3, duration: '1 hr', description: 'Fresh local seafood and traditional Zambales delicacies.', emoji: '🐟' },
  { id: 5, name: 'San Antonio Church', category: 'historical', rating: 4.6, duration: '1 hr', description: 'Spanish-era church with stunning colonial architecture.', emoji: '⛪' },
  { id: 6, name: 'Nagsasa Cove', category: 'adventure', rating: 4.9, duration: '4–5 hrs', description: 'Remote cove accessible only by boat — perfect for camping.', emoji: '⛺' },
  { id: 7, name: 'Pundaquit Beach', category: 'beach', rating: 4.4, duration: '2–3 hrs', description: 'The jump-off point for island-hopping adventures.', emoji: '🚤' },
  { id: 8, name: 'Subic Bay Museum', category: 'culture', rating: 4.2, duration: '1.5 hrs', description: 'Rich history of the Subic Bay Freeport Zone and US naval base.', emoji: '🏛️' },
]

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-yellow-400">
        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
      </svg>
      <span className="text-xs font-semibold text-gray-700">{rating}</span>
    </div>
  )
}

export default function AttractionsPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [selected, setSelected] = useState([])

  const filtered = activeCategory === 'all' ? ATTRACTIONS : ATTRACTIONS.filter((a) => a.category === activeCategory)

  const toggleAttraction = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  return (
    <PageLayout currentStep="attractions" title="Select Attractions" subtitle="Choose the attractions you'd like to visit on your trip">
      {selected.length > 0 && (
        <div className="flex items-center justify-between mb-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5">
          <span className="text-sm text-blue-700 font-medium">{selected.length} attraction{selected.length > 1 ? 's' : ''} selected</span>
          <button onClick={() => setSelected([])} className="text-xs text-blue-500 hover:text-blue-700 underline transition-colors">Clear all</button>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${activeCategory === cat.value ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Attraction Cards */}
      <div className="space-y-3 mb-6">
        {filtered.map((attraction) => {
          const isSelected = selected.includes(attraction.id)
          return (
            <button
              key={attraction.id}
              type="button"
              onClick={() => toggleAttraction(attraction.id)}
              className={`w-full text-left rounded-2xl border-2 p-4 transition-all duration-200 ${isSelected ? 'border-blue-700 bg-blue-50 shadow-md shadow-blue-100' : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {attraction.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>{attraction.name}</h3>
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-700 border-blue-700' : 'border-gray-300 bg-white'}`}>
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{attraction.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <StarRating rating={attraction.rating} />
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                      </svg>
                      {attraction.duration}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>{attraction.category}</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate('/trip-plan')} className="flex-1 py-3.5 rounded-2xl border-2 border-blue-700 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors">Back</button>
        <button onClick={() => navigate('/preference')} className="flex-1 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-md shadow-blue-200">Continue</button>
      </div>
    </PageLayout>
  )
}
