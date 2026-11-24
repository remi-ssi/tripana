import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Wallet,
  Scale,
  Gem,
  Check,
} from 'lucide-react'
import PageLayout from './PageLayout'
import { validatePreferences } from '../validators/preferenceValidator'
import { useTripPlan } from '../contexts/TripPlanContext'

const INTEREST_TAGS = [
  'Photography',
  'Local Food',
  'Hiking',
  'Shopping',
  'Nightlife',
  'Art',
  'Wildlife',
  'Camping',
  'Beaches',
  'Food Trip',
  'Historical Sites',
  'Relaxation',
  'Water Activities',
  'Island Hopping',
]

const BUDGET_OPTIONS = [
  {
    value: 'budget-friendly',
    label: 'Budget-friendly',
    description: 'Affordable local spots and low-cost activities',
    Icon: Wallet,
  },
  {
    value: 'balanced',
    label: 'Balanced',
    description: 'Mix of popular attractions and comfortable dining',
    Icon: Scale,
  },
  {
    value: 'luxury',
    label: 'Luxury',
    description: 'Premium experiences and upscale destinations',
    Icon: Gem,
  },
]

const PACE_LABELS = ['Very Relaxed', 'Relaxed', 'Moderate', 'Active', 'Intense']

const PACE_DESCRIPTIONS = [
  'Plenty of downtime with 1 to 2 unhurried stops.',
  'Easygoing schedule with generous time at each stop.',
  'Balanced pace with time to explore and unwind.',
  'Full days covering more highlights across the area.',
  'Fast-paced itinerary maximizing as many sights as possible.',
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
      updateMultipleFields({ paceLevel, interests, budget })
      navigate('/attractions')
    }
  }

  const handleBudget = (value) => {
    setBudget(value)
    setTouched((prev) => ({ ...prev, budget: true }))
    const newErrors = validatePreferences(paceLevel, interests, value)
    setErrors((prev) => ({ ...prev, budget: newErrors.budget || '' }))
    updateMultipleFields({ budget: value })
  }

  const handlePaceChange = (value) => {
    setPaceLevel(value)
    setTouched((prev) => ({ ...prev, paceLevel: true }))
    const newErrors = validatePreferences(value, interests, budget)
    setErrors((prev) => ({ ...prev, paceLevel: newErrors.paceLevel || '' }))
    updateMultipleFields({ paceLevel: value })
  }

  const handleToggleInterest = (tag) => {
    const active = interests.includes(tag)
    const updatedInterests = active
      ? interests.filter((t) => t !== tag)
      : [...interests, tag]
    setInterests(updatedInterests)
    setTouched((prev) => ({ ...prev, interests: true }))
    const newErrors = validatePreferences(paceLevel, updatedInterests, budget)
    setErrors((prev) => ({ ...prev, interests: newErrors.interests || '' }))
    updateMultipleFields({ interests: updatedInterests })
  }

  const isContinueDisabled = !paceLevel || interests.length === 0 || !budget

  return (
    <PageLayout
      currentStep="preference"
      title="Set Preferences"
      subtitle="Customize your trip pace, interests, and budget so we can tailor your recommendations"
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
              Travel Style &amp; Budget
            </h2>
          </div>
          {formData.city && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium truncate max-w-[200px]">
              {formData.city}
            </span>
          )}
        </div>

        <div className="space-y-8">
          {/* Pace Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">
                Trip Pace <span className="text-red-600">*</span>
              </label>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                {PACE_LABELS[paceLevel - 1]}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {PACE_DESCRIPTIONS[paceLevel - 1]}
            </p>

            <div className="px-1">
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={paceLevel}
                onChange={(e) => handlePaceChange(Number(e.target.value))}
                aria-label="Trip pace level"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>Very Relaxed</span>
                <span>Moderate</span>
                <span>Intense</span>
              </div>
            </div>
            {errors.paceLevel && touched.paceLevel && (
              <p className="text-red-600 text-xs font-medium mt-2">{errors.paceLevel}</p>
            )}
          </div>

          {/* Interests */}
          <div className="pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Your Interests <span className="text-red-600">*</span>
              </label>
              <span className="text-xs text-slate-500 tabular-nums">
                {interests.length} selected
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3.5">
              Choose at least one activity or category you want to prioritize.
            </p>

            <div className="flex flex-wrap gap-2">
              {INTEREST_TAGS.map((tag) => {
                const active = interests.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleInterest(tag)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5 stroke-[2.25]" />}
                    <span>{tag}</span>
                  </button>
                )
              })}
            </div>
            {errors.interests && touched.interests && (
              <p className="text-red-600 text-xs font-medium mt-2">{errors.interests}</p>
            )}
          </div>

          {/* Budget */}
          <div className="pt-6 border-t border-slate-100">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Budget <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3.5">
              Select the spending level that best fits your trip.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {BUDGET_OPTIONS.map((option) => {
                const isSelected = budget === option.value
                const Icon = option.Icon
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleBudget(option.value)}
                    aria-pressed={isSelected}
                    className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2.5">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[1.75]" />
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[2.5]" />}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {option.label}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {option.description}
                    </span>
                  </button>
                )
              })}
            </div>
            {errors.budget && touched.budget && (
              <p className="text-red-600 text-xs font-medium mt-2">{errors.budget}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/trip-plan')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
              <span>Back to Trip Plan</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={isContinueDisabled}
              className="sm:min-w-[220px] py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Continue to Attractions
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
