import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  Sun,
  Sunset,
  Moon,
  Check,
  ArrowLeft,
  Utensils,
  FastForward,
  AlertCircle,
} from 'lucide-react'
import PageLayout from './PageLayout'
import { validateBreaks } from '../validators/breakValidator'
import { useTripPlan } from '../contexts/TripPlanContext'

const MEALS = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    subtitle: 'Morning meal window',
    Icon: Sun,
    defaultTime: '08:00',
  },
  {
    id: 'lunch',
    label: 'Lunch',
    subtitle: 'Midday meal window',
    Icon: Sunset,
    defaultTime: '12:00',
  },
  {
    id: 'dinner',
    label: 'Dinner',
    subtitle: 'Evening meal window',
    Icon: Moon,
    defaultTime: '18:00',
  },
]

export default function BreakPage() {
  const navigate = useNavigate()
  const { formData, updateMultipleFields } = useTripPlan()
  const [includeBreaks, setIncludeBreaks] = useState(formData.includeBreaks)
  const [mealStates, setMealStates] = useState(formData.mealStates)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  useEffect(() => {
    if (!formData.attractions || formData.attractions.length === 0) {
      navigate('/attractions')
      return
    }
    if (formData.includeBreaks !== null) {
      setIncludeBreaks(formData.includeBreaks)
    }
    if (formData.mealStates) {
      setMealStates(formData.mealStates)
    }
  }, [formData.attractions, navigate])

  const handleContinue = () => {
    setTouched({ breakChoice: true, meals: true, mealTime: true })
    const newErrors = validateBreaks(includeBreaks, mealStates)
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      updateMultipleFields({
        includeBreaks,
        mealStates,
      })
      navigate('/summary')
    }
  }

  const handleBreakChoice = (value) => {
    setIncludeBreaks(value)
    setTouched((prev) => ({ ...prev, breakChoice: true }))
    const newErrors = validateBreaks(value, mealStates)
    setErrors((prev) => ({
      ...prev,
      breakChoice: newErrors.breakChoice || '',
      meals: newErrors.meals || '',
      mealTime: newErrors.mealTime || '',
    }))
  }

  const toggleMeal = (id) => {
    const updatedMealStates = {
      ...mealStates,
      [id]: { ...mealStates[id], checked: !mealStates[id].checked },
    }

    setMealStates(updatedMealStates)
    setTouched((prev) => ({ ...prev, meals: true, mealTime: true }))

    const newErrors = validateBreaks(includeBreaks, updatedMealStates)
    setErrors((prev) => ({
      ...prev,
      meals: newErrors.meals || '',
      mealTime: newErrors.mealTime || '',
    }))
  }

  const setMealTime = (id, time) => {
    const updatedMealStates = {
      ...mealStates,
      [id]: { ...mealStates[id], time },
    }

    setMealStates(updatedMealStates)
    setTouched((prev) => ({ ...prev, mealTime: true }))

    const newErrors = validateBreaks(includeBreaks, updatedMealStates)
    setErrors((prev) => ({
      ...prev,
      mealTime: newErrors.mealTime || '',
    }))
  }

  const activeError =
    (touched.breakChoice && errors.breakChoice) ||
    (touched.meals && errors.meals) ||
    (touched.mealTime && errors.mealTime)

  return (
    <PageLayout
      currentStep="break"
      title="Meal & Break Schedule"
      subtitle="Decide whether to reserve dedicated meal breaks between your attraction visits"
      contentClassName="max-w-2xl"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        {/* Card Header Bar */}
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h2
                className="text-lg font-semibold text-slate-900"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Break Preferences
              </h2>
            </div>
          </div>
          {formData.attractions?.length > 0 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium tabular-nums">
              {formData.attractions.length} attractions selected
            </span>
          )}
        </div>

        <div className="space-y-8">
          {/* Break Preference Toggle */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Include Scheduled Meal Breaks? <span className="text-red-600">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3.5">
              Choose whether the itinerary planner should reserve blocks of time for meals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Yes */}
              <button
                type="button"
                onClick={() => handleBreakChoice(true)}
                aria-pressed={includeBreaks === true}
                className={`relative rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  includeBreaks === true
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      includeBreaks === true
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Utensils className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      includeBreaks === true
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {includeBreaks === true && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  Yes, include breaks
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Schedule meal windows during your trip for a balanced daily pace.
                </p>
              </button>

              {/* No */}
              <button
                type="button"
                onClick={() => handleBreakChoice(false)}
                aria-pressed={includeBreaks === false}
                className={`relative rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  includeBreaks === false
                    ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                      includeBreaks === false
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <FastForward className="w-4 h-4 stroke-[1.75]" />
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      includeBreaks === false
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {includeBreaks === false && <Check className="w-3 h-3 stroke-[2.5]" />}
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">
                  No, skip breaks
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Focus strictly on attraction visits without scheduled meal blocks.
                </p>
              </button>
            </div>
          </div>

          {/* Meal Times — only shown if includeBreaks */}
          {includeBreaks === true && (
            <div className="pt-6 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Select Meal Windows <span className="text-red-600">*</span>
              </label>
              <p className="text-xs text-slate-500 mb-3.5">
                Check the meals you want to include and set your preferred time for each.
              </p>

              <div className="space-y-3">
                {MEALS.map((meal) => {
                  const state = mealStates[meal.id]
                  const MealIcon = meal.Icon
                  return (
                    <div
                      key={meal.id}
                      onClick={() => toggleMeal(meal.id)}
                      className={`flex items-center gap-3.5 rounded-xl border px-4 py-3.5 transition-all duration-150 cursor-pointer ${
                        state.checked
                          ? 'border-blue-600 bg-blue-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={state.checked}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleMeal(meal.id)
                        }}
                        className={`flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                          state.checked
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {state.checked && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                      </button>

                      {/* Icon */}
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                          state.checked
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <MealIcon className="w-4 h-4 stroke-[1.75]" />
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{meal.label}</p>
                        <p className="text-xs text-slate-500">{meal.subtitle}</p>
                      </div>

                      {/* Time input */}
                      {state.checked && (
                        <div
                          className="flex items-center gap-2 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Clock className="w-4 h-4 text-slate-400 stroke-[1.75] hidden sm:block" />
                          <input
                            type="time"
                            value={state.time}
                            onChange={(e) => setMealTime(meal.id, e.target.value)}
                            aria-label={`${meal.label} time`}
                            className={`border rounded-lg px-2.5 py-1.5 text-sm text-slate-900 bg-white tabular-nums focus:outline-none focus:ring-2 cursor-pointer ${
                              errors.mealTime && touched.mealTime
                                ? 'border-red-500 focus:ring-red-500/20'
                                : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/15'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Error Alert */}
          {activeError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 stroke-[2]" />
              <p className="text-red-600 text-xs sm:text-sm font-medium">{activeError}</p>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/attractions')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
              <span>Back to Attractions</span>
            </button>

            <button
              type="button"
              onClick={handleContinue}
              className="sm:min-w-[220px] py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium text-sm sm:text-base transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Review Summary
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
