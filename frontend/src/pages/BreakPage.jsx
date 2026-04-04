import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

const BREAK_TYPES = [
  { value: 'meal', label: 'Meal Break', emoji: '🍽️', description: 'Stop for lunch or dinner' },
  { value: 'coffee', label: 'Coffee Break', emoji: '☕', description: 'Quick cafe stop to recharge' },
  { value: 'rest', label: 'Rest Break', emoji: '😴', description: 'Downtime at hotel or park' },
  { value: 'snack', label: 'Snack Break', emoji: '🍌', description: 'Light refreshments on the go' },
]

function BreakCard({ breakItem, onRemove }) {
  return (
    <div className="flex items-center gap-3 bg-white border-2 border-blue-100 rounded-2xl px-4 py-3">
      <span className="text-xl">{BREAK_TYPES.find(b => b.value === breakItem.type)?.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-700">{BREAK_TYPES.find(b => b.value === breakItem.type)?.label}</p>
        <p className="text-xs text-gray-400">{breakItem.startTime} – {breakItem.endTime} · {breakItem.duration} min</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 transition-colors p-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  )
}

export default function BreakPage() {
  const navigate = useNavigate()
  const [breaks, setBreaks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: 'meal', startTime: '', endTime: '', duration: '30' })

  const addBreak = () => {
    if (!form.startTime || !form.endTime) return
    setBreaks((prev) => [...prev, { ...form, id: Date.now() }])
    setForm({ type: 'meal', startTime: '', endTime: '', duration: '30' })
    setShowForm(false)
  }

  const removeBreak = (id) => {
    setBreaks((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <PageLayout currentStep="break" title="Schedule Breaks" subtitle="Plan rest periods to keep your trip comfortable and enjoyable">
      <div className="space-y-5">

        {/* Break Type Selector Cards */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Break Types Available</label>
          <div className="grid grid-cols-2 gap-2">
            {BREAK_TYPES.map((bt) => (
              <div key={bt.value} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2">
                <span className="text-lg">{bt.emoji}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-700">{bt.label}</p>
                  <p className="text-xs text-gray-400">{bt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Breaks */}
        {breaks.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Breaks ({breaks.length})</label>
            <div className="space-y-2">
              {breaks.map((b) => (
                <BreakCard key={b.id} breakItem={b} onRemove={() => removeBreak(b.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Add Break Form */}
        {showForm ? (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 space-y-4">
            <h3 className="text-sm font-semibold text-blue-700">Add a Break</h3>

            {/* Break Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type</label>
              <div className="flex flex-wrap gap-2">
                {BREAK_TYPES.map((bt) => (
                  <button
                    key={bt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: bt.value }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${form.type === bt.value ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300'}`}
                  >
                    <span>{bt.emoji}</span> {bt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-700 text-sm cursor-pointer"
                />
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-600">Duration</label>
                <span className="text-xs font-semibold text-blue-700">{form.duration} min</span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="15"
                value={form.duration}
                onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-400">15 min</span>
                <span className="text-xs text-gray-400">2 hrs</span>
              </div>
            </div>

            {/* Form Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addBreak}
                className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Add Break
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-blue-300 text-blue-700 text-sm font-semibold hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            Add a Break
          </button>
        )}

        {/* Skip hint */}
        {breaks.length === 0 && !showForm && (
          <p className="text-xs text-center text-gray-400">You can skip this step if you don't need planned breaks.</p>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-1">
          <button onClick={() => navigate('/preference')} className="flex-1 py-3.5 rounded-2xl border-2 border-blue-700 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors">Back</button>
          <button onClick={() => navigate('/summary')} className="flex-1 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-md shadow-blue-200">Continue</button>
        </div>

      </div>
    </PageLayout>
  )
}
