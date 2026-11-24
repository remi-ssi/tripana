import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from './PageLayout'
import { validatePreferences } from '../validators/preferenceValidator'
import { useTripPlan } from '../contexts/TripPlanContext'

const INTEREST_TAGS = [
  'Photography', 'Local Food', 'Hiking', 'Shopping', 'Nightlife', 'Art', 'Wildlife', 'Camping', 'Beaches', 'Food Trip', 'Historical Sites', 'Relaxation', 'Water Activities','Island Hopping',
]

const BUDGET_OPTIONS = [
  { value: 'budget-friendly', label: 'Budget-friendly', emoji: '💚' },
  { value: 'balanced', label: 'Balanced', emoji: '💼' },
  { value: 'luxury', label: 'Luxury', emoji: '✨' },
]

export default function PreferencePage() {
  const navigate = useNavigate()
  const { formData, updateMultipleFields } = useTripPlan()

  const [paceLevel, setPaceLevel] = useState(formData.paceLevel || 2)
  const [interests, setInterests] = useState(formData.interests || [])
  const [budget, setBudget] = useState(formData.budget || '')

  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleContinue = () => {
    setTouched({ paceLevel: true, interests: true, budget: true })
    const newErrors = validatePreferences(paceLevel, interests, budget)
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      // Save to context before navigating
      updateMultipleFields({ paceLevel, interests, budget })
      navigate('/attractions')
    }
  }

  // Separate handler for budget to ensure validation and context update is consistent
  const handleBudget = (value) => {
    setBudget(value)
    setTouched((prev) => ({ ...prev, budget: true }))
    const newErrors = validatePreferences(paceLevel, interests, value)
    setErrors((prev) => ({ ...prev, budget: newErrors.budget || '' }))
    // Save to context
    updateMultipleFields({ budget: value })
  }

  const paceLabels = ['Very Relaxed', 'Relaxed', 'Moderate', 'Active', 'Intense']

  return (
    <PageLayout currentStep="preference" title="Set Preferences" subtitle="Customize your trip experience based on your preferences">
      <div className="space-y-6">

        {/* Pace Level */}
        <div className={`rounded-xl p-2 ${errors.paceLevel && touched.paceLevel ? 'ring-2 ring-red-500' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-lg font-semibold text-gray-700">Trip Pace</label>
            <span className="text-sm font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">{paceLabels[paceLevel - 1]}</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={paceLevel}
            onChange={(e) => {
              const value = Number(e.target.value)
              setPaceLevel(value)
              setTouched((prev) => ({ ...prev, paceLevel: true }))
              const newErrors = validatePreferences(value, interests, budget)
              setErrors((prev) => ({ ...prev, paceLevel: newErrors.paceLevel || '' }))
              // Save to context
              updateMultipleFields({ paceLevel: value })
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
          />
          <div className="flex justify-between mt-1">
            <span className="text-sm text-gray-400">😴 Chill</span>
            <span className="text-sm text-gray-400">🔥 Intense</span>
          </div>
          {errors.paceLevel && touched.paceLevel && <p className="text-red-500 text-xs mt-2">{errors.paceLevel}</p>}
        </div>

        {/* Interests */}
        <div className={`rounded-xl p-2 ${errors.interests && touched.interests ? 'ring-2 ring-red-500' : ''}`}>
          <label className="block text-lg font-semibold text-gray-700 mb-2">Your Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_TAGS.map((tag) => {
              const active = interests.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    const updatedInterests = active
                      ? interests.filter((t) => t !== tag)
                      : [...interests, tag]
                    setInterests(updatedInterests)
                    setTouched((prev) => ({ ...prev, interests: true }))
                    const newErrors = validatePreferences(paceLevel, updatedInterests, budget)
                    setErrors((prev) => ({ ...prev, interests: newErrors.interests || '' }))
                    // Save to context
                    updateMultipleFields({ interests: updatedInterests })
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${active ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'}`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          {errors.interests && touched.interests && <p className="text-red-500 text-xs mt-2">{errors.interests}</p>}
        </div>

        {/* Budget */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Budget <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            {BUDGET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleBudget(option.value)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all duration-200 ${
                  budget === option.value
                    ? 'border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-200'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700'
                }`}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
          {errors.budget && touched.budget && <p className="text-red-500 text-xs mt-2">{errors.budget}</p>}
        </div>

        {/* Navigation */}
        <div>
          <button onClick={handleContinue} disabled={!paceLevel || interests.length === 0 || !budget} className="w-full py-4 rounded-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors shadow-md">Continue</button>
        </div>

        <button
          onClick={() => navigate('/trip-plan')}
          className="w-full text-center text-sm text-gray-400 hover:text-blue-700 transition-colors"
        >
          ← Back to Trip Plan
        </button>

      </div>
    </PageLayout>
  )
}
