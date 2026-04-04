import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'

// Mock summary data — in a real app this would come from shared state/context
const SUMMARY = {
  tripDetails: {
    city: 'Zambales',
    hotel: 'Blue Rock Beach Resort',
    startTime: '08:00',
    endTime: '18:00',
    maxAttractions: 4,
    budget: 'Balanced',
  },
  attractions: [
    { id: 1, name: 'Anawangin Cove', emoji: '🌊', duration: '3–4 hrs', time: '08:30 AM' },
    { id: 2, name: 'Capones Island', emoji: '🏝️', duration: '2–3 hrs', time: '12:00 PM' },
    { id: 3, name: 'Iba Fish Market', emoji: '🐟', duration: '1 hr', time: '15:30 PM' },
  ],
  breaks: [
    { id: 1, type: 'Meal Break', emoji: '🍽️', time: '12:00 PM – 01:00 PM' },
    { id: 2, type: 'Coffee Break', emoji: '☕', time: '10:30 AM – 10:45 AM' },
  ],
  preferences: {
    transport: 'Boat & Tricycle',
    pace: 'Moderate',
    interests: ['Photography', 'Local Food', 'Swimming'],
  },
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-base">{icon}</span>
        <h3 className="text-sm font-bold text-gray-700">{title}</h3>
      </div>
      <div className="px-4 py-3 space-y-2">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-semibold text-gray-700">{value}</span>
    </div>
  )
}

export default function SummaryPage() {
  const navigate = useNavigate()

  return (
    <PageLayout currentStep="summary" title="Your Itinerary" subtitle="Here's your personalized trip plan — ready to go!">
      <div className="space-y-4">

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl px-5 py-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">📍</span>
            <h2 className="text-lg font-bold">{SUMMARY.tripDetails.city}</h2>
          </div>
          <p className="text-blue-100 text-sm">{SUMMARY.tripDetails.hotel}</p>
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <p className="text-xs text-blue-200">Start</p>
              <p className="text-sm font-bold">{SUMMARY.tripDetails.startTime}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">End</p>
              <p className="text-sm font-bold">{SUMMARY.tripDetails.endTime}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">Attractions</p>
              <p className="text-sm font-bold">{SUMMARY.attractions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-blue-200">Budget</p>
              <p className="text-sm font-bold">{SUMMARY.tripDetails.budget}</p>
            </div>
          </div>
        </div>

        {/* Attractions Timeline */}
        <SectionCard title="Attractions" icon="🗺️">
          {SUMMARY.attractions.map((a, idx) => (
            <div key={a.id} className="flex items-center gap-3">
              {/* Timeline dot */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">{a.emoji}</div>
                {idx < SUMMARY.attractions.length - 1 && <div className="w-0.5 h-4 bg-blue-100 mt-1" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700">{a.name}</p>
                <p className="text-xs text-gray-400">{a.time} · {a.duration}</p>
              </div>
            </div>
          ))}
        </SectionCard>

        {/* Breaks */}
        {SUMMARY.breaks.length > 0 && (
          <SectionCard title="Planned Breaks" icon="☕">
            {SUMMARY.breaks.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <span className="text-lg">{b.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{b.type}</p>
                  <p className="text-xs text-gray-400">{b.time}</p>
                </div>
              </div>
            ))}
          </SectionCard>
        )}

        {/* Preferences */}
        <SectionCard title="Preferences" icon="⚙️">
          <InfoRow label="Transport" value={SUMMARY.preferences.transport} />
          <InfoRow label="Trip Pace" value={SUMMARY.preferences.pace} />
          <div className="flex items-start justify-between">
            <span className="text-xs text-gray-500">Interests</span>
            <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
              {SUMMARY.preferences.interests.map((i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{i}</span>
              ))}
            </div>
          </div>
        </SectionCard>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/break')}
            className="flex-1 py-3.5 rounded-2xl border-2 border-blue-700 text-blue-700 font-semibold text-sm hover:bg-blue-50 transition-colors"
          >
            Back
          </button>
          <button
            className="flex-1 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            Save & Export
          </button>
        </div>

        {/* Start over link */}
        <button
          onClick={() => navigate('/trip-plan')}
          className="w-full text-center text-sm text-gray-400 hover:text-blue-700 transition-colors py-1"
        >
          Start a new trip plan →
        </button>

      </div>
    </PageLayout>
  )
}
