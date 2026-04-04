import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const ATTRACTIONS = [
  {
    id: 1,
    name: 'Grand Palace',
    description: 'A stunning complex of buildings at the heart of Bangkok, featuring intricate Thai architecture and the revered...',
    tags: ['Culture', 'Temples'],
    rating: 4.8,
    reviews: 12543,
    duration: '2-3 hours',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=400&h=220&fit=crop',
  },
  {
    id: 2,
    name: 'Wat Pho Temple',
    description: 'Home to the famous Reclining Buddha, this temple is one of the largest and oldest in Bangkok...',
    tags: ['Culture', 'Temples'],
    rating: 4.7,
    reviews: 9821,
    duration: '2-3 hours',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=220&fit=crop',
  },
  {
    id: 3,
    name: 'Chatuchak Market',
    description: 'One of the world\'s largest weekend markets with over 15,000 stalls selling everything imaginable...',
    tags: ['Shopping', 'Food'],
    rating: 4.6,
    reviews: 8234,
    duration: '2-3 hours',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=220&fit=crop',
  },
  {
    id: 4,
    name: 'Khao San Road',
    description: 'The famous backpacker street of Bangkok filled with street food, bars, and vibrant nightlife...',
    tags: ['Nightlife', 'Food'],
    rating: 4.3,
    reviews: 6102,
    duration: '2-3 hours',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=220&fit=crop',
  },
  {
    id: 5,
    name: 'Lumphini Park',
    description: 'A large public park in the heart of Bangkok offering a peaceful escape from the city bustle...',
    tags: ['Nature', 'Relaxation'],
    rating: 4.5,
    reviews: 5430,
    duration: '2-3 hours',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=220&fit=crop',
  },
  {
    id: 6,
    name: 'Jim Thompson House',
    description: 'A museum complex of six traditional Thai houses showcasing Thai silk and Southeast Asian art...',
    tags: ['Culture', 'Art'],
    rating: 4.4,
    reviews: 4211,
    duration: '2-3 hours',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=220&fit=crop',
  },
]

export default function AttractionsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selected, setSelected] = useState([])

  const categories = ['all', ...new Set(ATTRACTIONS.flatMap((a) => a.tags))]

  const filtered = ATTRACTIONS.filter(
    (a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      const matchesCategory = selectedCategory === 'all' || a.tags.includes(selectedCategory)
      return matchesSearch && matchesCategory
    }
  )

  const toggleAttraction = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <PageLayout
      currentStep="attractions"
      title="Search Attractions"
      subtitle="Select the attractions you'd like to visit during your trip"
      contentClassName="max-w-7xl"
    >
      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-200 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent text-sm shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
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
        {filtered.map((attraction) => {
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
                {/* Duration badge */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                  </svg>
                  {attraction.duration}
                </div>
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

      {/* Continue */}
      <button
        onClick={() => navigate('/preference')}
        className="w-full py-4 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-base transition-colors shadow-md"
      >
        Continue to Preference
      </button>
    </PageLayout>
  )
}
