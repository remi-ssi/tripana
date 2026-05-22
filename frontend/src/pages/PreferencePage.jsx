import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageLayout from './PageLayout'
import { validatePreferences } from '../validators/preferenceValidator'

const TRANSPORT_OPTIONS = [
  { value: 'walking', label: 'Walking', emoji: '🚶' },
  { value: 'jeepney', label: 'Public Transport', emoji: '🚌' },
  { value: 'car', label: 'Car', emoji: '🚗' },
]

const INTEREST_TAGS = [
  'Photography', 'Local Food', 'History', 'Nature Hike',
  'Swimming', 'Shopping', 'Nightlife', 'Art', 'Wildlife', 'Camping',
]

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-blue-700' : 'bg-gray-300'}`}
        role="switch"
        aria-checked={checked}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

export default function PreferencePage() {
  const navigate = useNavigate()

  const [transport, setTransport] = useState('')
  const [paceLevel, setPaceLevel] = useState(2)
  const [interests, setInterests] = useState([])
  const [prefs, setPrefs] = useState({
    accessibility: false,
    familyFriendly: false,
    petFriendly: false,
    indoorOnly: false,
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleContinue = () => {
    setTouched({ transport: true, paceLevel: true, interests: true })
    const newErrors = validatePreferences(transport, paceLevel, interests)
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      navigate('/break')
    }
  }

  const togglePref = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const paceLabels = ['Very Relaxed', 'Relaxed', 'Moderate', 'Active', 'Intense']

  return (
    <PageLayout currentStep="preference" title="Set Preferences" subtitle="Customize your trip experience based on your preferences">
      <div className="space-y-6">

        {/* Transport Mode */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Transport <span className="text-red-500">*</span></label>
          <div className={`flex gap-2 flex-wrap rounded-xl p-1 ${errors.transport && touched.transport ? 'ring-2 ring-red-500' : ''}`}>
            {TRANSPORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setTransport(opt.value)
                  setTouched((prev) => ({ ...prev, transport: true }))
                  const newErrors = validatePreferences(opt.value, paceLevel, interests)
                  setErrors((prev) => ({ ...prev, transport: newErrors.transport || '' }))
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 ${transport === opt.value ? 'border-blue-700 bg-blue-700 text-white shadow-md shadow-blue-200' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700'}`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
          {errors.transport && touched.transport && <p className="text-red-500 text-xs mt-2">{errors.transport}</p>}
        </div>

        {/* Pace Level */}
        <div className={`rounded-xl p-2 ${errors.paceLevel && touched.paceLevel ? 'ring-2 ring-red-500' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-gray-700">Trip Pace</label>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">{paceLabels[paceLevel - 1]}</span>
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
              const newErrors = validatePreferences(transport, value, interests)
              setErrors((prev) => ({ ...prev, paceLevel: newErrors.paceLevel || '' }))
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
          />
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">😴 Chill</span>
            <span className="text-xs text-gray-400">🔥 Intense</span>
          </div>
          {errors.paceLevel && touched.paceLevel && <p className="text-red-500 text-xs mt-2">{errors.paceLevel}</p>}
        </div>

        {/* Interests */}
        <div className={`rounded-xl p-2 ${errors.interests && touched.interests ? 'ring-2 ring-red-500' : ''}`}>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Your Interests</label>
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
                    const newErrors = validatePreferences(transport, paceLevel, updatedInterests)
                    setErrors((prev) => ({ ...prev, interests: newErrors.interests || '' }))
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${active ? 'bg-blue-700 border-blue-700 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700'}`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
          {errors.interests && touched.interests && <p className="text-red-500 text-xs mt-2">{errors.interests}</p>}
        </div>

        {/* Toggle Preferences */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Special Requirements</label>
          <div className="bg-white rounded-2xl border border-gray-200 px-4">
            <Toggle label="Accessibility" description="Wheelchair and mobility-friendly routes" checked={prefs.accessibility} onChange={() => togglePref('accessibility')} />
            <Toggle label="Family Friendly" description="Suitable for children and elderly" checked={prefs.familyFriendly} onChange={() => togglePref('familyFriendly')} />
            <Toggle label="Pet Friendly" description="Only include pet-allowed attractions" checked={prefs.petFriendly} onChange={() => togglePref('petFriendly')} />
            <Toggle label="Indoor Only" description="Avoid outdoor or weather-dependent spots" checked={prefs.indoorOnly} onChange={() => togglePref('indoorOnly')} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-1">
          <button onClick={() => navigate('/attractions')} className="flex-1 py-3.5 rounded-2xl border-2 border-blue-700 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors">Back</button>
          <button onClick={handleContinue} disabled={!transport || !paceLevel || interests.length === 0} className="flex-1 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-md shadow-blue-200">Continue</button>
        </div>

      </div>
    </PageLayout>
  )
}
