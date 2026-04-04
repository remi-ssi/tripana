import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const MEALS = [
  {
    id: 'breakfast',
    label: 'Breakfast',
    subtitle: 'Morning meal',
    emoji: '☀️',
    bgColor: 'bg-orange-100',
    defaultTime: '08:00',
  },
  {
    id: 'lunch',
    label: 'Lunch',
    subtitle: 'Midday meal',
    emoji: '🌤️',
    bgColor: 'bg-yellow-100',
    defaultTime: '12:00',
  },
  {
    id: 'dinner',
    label: 'Dinner',
    subtitle: 'Evening meal',
    emoji: '🌙',
    bgColor: 'bg-indigo-100',
    defaultTime: '18:00',
  },
]

function to12Hour(time24) {
  if (!time24) return ''
  const [h, m] = time24.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function BreakPage() {
  const navigate = useNavigate()
  const [includeBreaks, setIncludeBreaks] = useState(true)
  const [mealStates, setMealStates] = useState({
    breakfast: { checked: true, time: '08:00' },
    lunch: { checked: false, time: '12:00' },
    dinner: { checked: false, time: '18:00' },
  })

  const toggleMeal = (id) => {
    setMealStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], checked: !prev[id].checked },
    }))
  }

  const setMealTime = (id, time) => {
    setMealStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], time },
    }))
  }

  return (
    <PageLayout
      currentStep="break"
      title="Break Preference"
      subtitle="Select your travel preference for this trip"
    >
      <div className="space-y-6">

        {/* Break Preference Toggle */}
        <div>
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-1">
            <span>🕐</span> Break Preference
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Would you like to include meal breaks or rest breaks between attractions?
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Yes */}
            <button
              type="button"
              onClick={() => setIncludeBreaks(true)}
              className={`
                relative rounded-2xl border-2 p-4 text-left transition-all duration-200
                ${includeBreaks ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              {/* top row */}
              <div className="flex items-center justify-between mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${includeBreaks ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}>
                  {includeBreaks && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {includeBreaks && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-teal-400">
                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <p className={`text-sm font-bold mb-1 ${includeBreaks ? 'text-teal-700' : 'text-gray-700'}`}>
                Yes, include breaks
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Schedule meal times during your trip for a balanced itinerary
              </p>
            </button>

            {/* No */}
            <button
              type="button"
              onClick={() => setIncludeBreaks(false)}
              className={`
                relative rounded-2xl border-2 p-4 text-left transition-all duration-200
                ${!includeBreaks ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${!includeBreaks ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}>
                  {!includeBreaks && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${!includeBreaks ? 'text-teal-400' : 'text-gray-300'}`}>
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
              </div>
              <p className={`text-sm font-bold mb-1 ${!includeBreaks ? 'text-teal-700' : 'text-gray-700'}`}>
                No, skip breaks
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                Maximize attraction visits without scheduled meal breaks
              </p>
            </button>
          </div>
        </div>

        {/* Meal Times — only shown if includeBreaks */}
        {includeBreaks && (
          <div>
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2 mb-1">
              <span className="text-teal-500">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 inline">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                </svg>
              </span>
              Select Meal Times
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Choose which meals you'd like to schedule and set your preferred times
            </p>

            <div className="space-y-2">
              {MEALS.map((meal) => {
                const state = mealStates[meal.id]
                return (
                  <div
                    key={meal.id}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 transition-all duration-200 ${state.checked ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-white'}`}
                  >
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleMeal(meal.id)}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${state.checked ? 'bg-teal-500 border-teal-500' : 'border-gray-300 bg-white'}`}
                    >
                      {state.checked && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>

                    {/* Emoji icon */}
                    <div className={`w-9 h-9 rounded-full ${meal.bgColor} flex items-center justify-center text-lg flex-shrink-0`}>
                      {meal.emoji}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700">{meal.label}</p>
                      <p className="text-xs text-gray-400">{meal.subtitle}</p>
                    </div>

                    {/* Time input — only when checked */}
                    {state.checked && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-400">
                          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
                        </svg>
                        <div className="relative">
                          <input
                            type="time"
                            value={state.time}
                            onChange={(e) => setMealTime(meal.id, e.target.value)}
                            className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 w-28 cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* View Summary */}
        <button
          onClick={() => navigate('/summary')}
          className="w-full py-4 rounded-full bg-blue-700 hover:bg-blue-800 text-white font-semibold text-base transition-colors shadow-md"
        >
          View Summary
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
