import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import { validateTripPlan } from '../validators/tripPlanValidator'

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
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., Zambales"
            value={form.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border ${errors.city && touched.city ? 'border-red-500' : 'border-gray-200'} bg-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.city && touched.city ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-sm`}
          />
          {errors.city && touched.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        {/* Hotel */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Hotel <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., Zambales"
              value={form.hotel}
              onChange={(e) => handleChange('hotel', e.target.value)}
              className={`w-full px-4 py-3 pr-12 rounded-xl border-2 ${errors.hotel && touched.hotel ? 'border-red-500' : 'border-blue-700'} bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 ${errors.hotel && touched.hotel ? 'focus:ring-red-500' : 'focus:ring-blue-700'} focus:border-transparent transition text-sm`}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-700 hover:text-blue-800 transition"
              title="Use current location"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.083 3.701-5.125 3.701-9.077 0-4.715-3.73-8.293-8-8.293s-8 3.578-8 8.293c0 3.952 1.757 6.994 3.701 9.077a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
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
    </PageLayout>
  )
}
