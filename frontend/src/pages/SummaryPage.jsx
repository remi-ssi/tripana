import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTripPlan } from '../contexts/TripPlanContext'
import { getSummaryData } from '../services/summaryService'
import { generateItinerary } from '../services/aiService'
import PageLayout from './PageLayout'

function SectionCard({ icon, title, onEdit, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-4">
      <div className="flex items-center justify-between p-2.5 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <p className="text-xs font-semibold text-gray-900">{title}</p>
        </div>
        <button
          onClick={onEdit}
          className="px-2.5 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
        >
          Edit
        </button>
      </div>
      <div className="px-4.5 py-3.5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, last = false }) {
  return (
    <div className={`flex justify-between items-center py-1.75 ${!last ? 'border-b border-gray-100' : ''}`}>
      <span className="text-xs text-gray-700">{label}</span>
      <span className="text-xs font-semibold text-gray-900">{value}</span>
    </div>
  )
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const { formData } = useTripPlan()
  const { tripDetails, preferences, attractions, breaks, snapshot } = getSummaryData(formData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState('')

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationError('')
    try {
      const itinerary = await generateItinerary(formData)
      navigate(`/itinerary/${itinerary.id}`, { replace: true })
    } catch (error) {
      setGenerationError(error.message || 'Failed to generate itinerary')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <PageLayout
          currentStep="summary"
          title="Review your trip"
          subtitle="Everything look good? You can edit any section before we generate your itinerary."
        >
      <div className="px-10 py-7 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-5">

          {/* Left column */}
          <div className="lg:col-span-2">
            {/* Trip Details */}
            <SectionCard icon="📍" title="Trip details" onEdit={() => navigate('/trip-plan')}>
              <div className="grid grid-cols-2 gap-7">
                {formData.tripType === 'overnight' ? (
                  <>
                    <div>
                      <InfoRow label="Destination" value={tripDetails.destination} />
                      <InfoRow label="Hotel / Base" value={tripDetails.hotel} />
                      <InfoRow label="Start date" value={tripDetails.startDate} last />
                    </div>
                    <div>
                      <InfoRow label="End date" value={tripDetails.endDate} />
                      <InfoRow label="Max attractions" value={`${tripDetails.maxAttractions} per day`} last />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <InfoRow label="Destination" value={tripDetails.destination} />
                      <InfoRow label="Date" value={tripDetails.startDate} last />
                    </div>
                    <div>
                      <InfoRow label="Start time" value={tripDetails.startTime} last />
                    </div>
                  </>
                )}
              </div>
            </SectionCard>

            {/* Preferences */}
            <SectionCard icon="⚙️" title="Preferences" onEdit={() => navigate('/preference')}>
              <div className="grid grid-cols-2 gap-7">
                <div>
                  <InfoRow label="Budget" value={preferences.budget} />
                  <InfoRow label="Trip pace" value={preferences.pace} last />
                </div>
                <div>
                  <div className="flex justify-between items-start py-1.75 pt-2">
                    <span className="text-xs text-gray-700">Interests</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {preferences.interests.map((interest) => (
                        <span
                          key={interest}
                          className="px-2.25 py-0.5 text-xs font-semibold text-blue-900 bg-blue-50 rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Attractions */}
            <SectionCard icon="🗺️" title="Attractions" onEdit={() => navigate('/attractions')}>
              <div className="grid grid-cols-3 gap-2.5">
                {attractions.map((att) => (
                  <div
                    key={att.id}
                    className="bg-gray-50 rounded-lg p-3 flex items-start gap-2.5 border border-gray-200"
                  >
                    <div className="w-5.5 h-5.5 rounded-full bg-blue-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.25">
                      {att.id}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 mb-0.5">{att.name}</p>
                      <p className="text-xs text-gray-700">{att.duration} · {att.slot}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            {/* Breaks */}
            <SectionCard icon="☕" title="Breaks" onEdit={() => navigate('/break')}>
              {breaks.map((b, idx) => (
                <div
                  key={b.id}
                  className={`flex items-center gap-3 py-1.75 ${idx === breaks.length - 1 ? '' : 'border-b border-gray-100'}`}
                >
                  <div className="w-8 h-8 bg-blue-50 rounded flex items-center justify-center flex-shrink-0 text-base">
                    {b.icon === 'kitchen' ? '🍽️' : '☕'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900 mb-0.5">{b.name}</p>
                    <p className="text-xs text-gray-700">{b.time}</p>
                  </div>
                </div>
              ))}
            </SectionCard>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-3.5">
            {/* Trip Snapshot */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4.5 py-3.25 border-b border-gray-200 bg-blue-700">
                <p className="text-sm font-bold text-white mb-0.25">Trip snapshot</p>
                <span className="text-xs text-blue-100">
                  {tripDetails.destination} · {formData.tripType === 'overnight' 
                    ? `${tripDetails.startDate.split(',')[0].split(' ').slice(0, 2).join(' ')}–${tripDetails.endDate.split(',')[0].split(' ')[1]}, ${tripDetails.startDate.split(', ')[1]}`
                    : tripDetails.startDate}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3.5 pb-1.5">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-700 mb-0.75 font-medium">Days</p>
                  <p className="text-xl font-bold text-blue-700">{snapshot.days}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-700 mb-0.75 font-medium">Attractions</p>
                  <p className="text-xl font-bold text-blue-700">{snapshot.attractions}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-700 mb-0.75 font-medium">Breaks</p>
                  <p className="text-xl font-bold text-blue-700">{snapshot.breaks}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-700 mb-0.75 font-medium">Pace</p>
                  <p className="text-sm font-semibold text-blue-700">{snapshot.pace}</p>
                </div>
              </div>
              <div className="flex flex-col px-4.5 pt-2.5 pb-3.5">
                {formData.tripType === 'overnight' ? (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-xs text-gray-700">Start date</span>
                      <span className="text-xs font-semibold text-gray-900">{tripDetails.startDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-xs text-gray-700">End date</span>
                      <span className="text-xs font-semibold text-gray-900">{tripDetails.endDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-xs text-gray-700">Base</span>
                      <span className="text-xs font-semibold text-gray-900">{tripDetails.hotel}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-xs text-gray-700">Date</span>
                      <span className="text-xs font-semibold text-gray-900">{tripDetails.startDate}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-gray-100">
                      <span className="text-xs text-gray-700">Start time</span>
                      <span className="text-xs font-semibold text-gray-900">{tripDetails.startTime}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-xs text-gray-700">Budget</span>
                  <span className="text-xs font-semibold text-gray-900">{preferences.budget}</span>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex gap-2.5">
              <span className="text-base flex-shrink-0 mt-0.25">✨</span>
              <p className="text-xs text-blue-900 leading-relaxed font-medium">
                AI will use these details to build a timed itinerary with travel estimates, tips, and suggested routes.
              </p>
            </div>

            {/* Buttons */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full px-3.5 py-3.5 bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
            >
              <span>🪄</span>
              {isGenerating ? 'Generating itinerary...' : 'Generate itinerary'}
            </button>
            {generationError && (
              <p className="text-xs text-red-600 text-center">{generationError}</p>
            )}
            <button
              onClick={() => navigate('/break')}
              className="w-full px-3.5 py-2.75 text-sm bg-transparent border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
          </div>

        </div>
      </div>
    </PageLayout> 
  )
}
