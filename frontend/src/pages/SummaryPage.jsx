import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin,
  SlidersHorizontal,
  Compass,
  Clock,
  Pencil,
  Utensils,
  Coffee,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useTripPlan } from '../contexts/TripPlanContext'
import { getSummaryData } from '../services/summaryService'
import { generateItinerary } from '../services/aiService'
import PageLayout from './PageLayout'

function SectionCard({ Icon, title, onEdit, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Icon className="w-4 h-4 stroke-[1.75]" />
          </div>
          <h2
            className="text-sm font-semibold text-slate-900"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-blue-600 hover:border-slate-300 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Pencil className="w-3 h-3 stroke-[2]" />
          <span>Edit</span>
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function InfoRow({ label, value, last = false }) {
  return (
    <div
      className={`flex justify-between items-center py-2.5 gap-4 ${
        !last ? 'border-b border-slate-100' : ''
      }`}
    >
      <span className="text-xs sm:text-sm text-slate-500">{label}</span>
      <span className="text-xs sm:text-sm font-medium text-slate-900 text-right tabular-nums">
        {value}
      </span>
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
      title="Review Your Trip"
      subtitle="Verify your trip details and preferences before we generate your optimized schedule"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left column: Review Sections */}
        <div className="lg:col-span-2 space-y-5">
          {/* Trip Details */}
          <SectionCard
            Icon={MapPin}
            title="Trip Details"
            onEdit={() => navigate('/trip-plan')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              {formData.tripType === 'overnight' ? (
                <>
                  <div>
                    <InfoRow label="Destination" value={tripDetails.destination} />
                    <InfoRow label="Accommodation" value={tripDetails.hotel} />
                    <InfoRow label="Start Date" value={tripDetails.startDate} last />
                  </div>
                  <div>
                    <InfoRow label="End Date" value={tripDetails.endDate} />
                    <InfoRow
                      label="Max Attractions"
                      value={`${tripDetails.maxAttractions} per day`}
                      last
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <InfoRow label="Destination" value={tripDetails.destination} />
                    <InfoRow label="Date" value={tripDetails.startDate} last />
                  </div>
                  <div>
                    <InfoRow label="Start Time" value={tripDetails.startTime} last />
                  </div>
                </>
              )}
            </div>
          </SectionCard>

          {/* Preferences */}
          <SectionCard
            Icon={SlidersHorizontal}
            title="Preferences"
            onEdit={() => navigate('/preference')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <InfoRow label="Budget" value={preferences.budget} />
                <InfoRow label="Trip Pace" value={preferences.pace} last />
              </div>
              <div>
                <div className="py-2">
                  <span className="block text-xs sm:text-sm text-slate-500 mb-2">
                    Interests
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {preferences.interests.map((interest) => (
                      <span
                        key={interest}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md"
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
          <SectionCard
            Icon={Compass}
            title={`Selected Attractions (${attractions.length})`}
            onEdit={() => navigate('/attractions')}
          >
            {attractions.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500">No attractions selected.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {attractions.map((att) => (
                  <div
                    key={att.id}
                    className="bg-slate-50 rounded-xl p-3.5 flex items-start gap-3 border border-slate-200/80"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 tabular-nums">
                      {att.id}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                        {att.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                        {att.duration} · {att.slot}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Breaks */}
          <SectionCard
            Icon={Clock}
            title="Scheduled Breaks"
            onEdit={() => navigate('/break')}
          >
            {breaks.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500">
                No scheduled meal breaks included.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {breaks.map((b) => {
                  const BreakIcon = b.icon === 'kitchen' ? Utensils : Coffee
                  return (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BreakIcon className="w-4 h-4 stroke-[1.75]" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-900">
                          {b.name}
                        </p>
                      </div>
                      <span className="text-xs sm:text-sm text-slate-500 font-medium tabular-nums">
                        {b.time}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Sidebar: Trip Snapshot & Actions */}
        <div className="lg:sticky lg:top-6 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-900 text-white">
              <div className="flex items-center justify-between gap-2">
                <p
                  className="text-base font-semibold"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Trip Snapshot
                </p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-[11px] font-medium">
                  {formData.tripType === 'overnight' ? 'Multi-Day' : 'Day Tour'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 truncate tabular-nums">
                {tripDetails.destination}
              </p>
            </div>

            {/* Key Stats Grid */}
            <div className="grid grid-cols-2 gap-2.5 p-4 bg-slate-50/50 border-b border-slate-100">
              <div className="bg-white border border-slate-200/80 rounded-xl p-3">
                <p className="text-xs text-slate-500 font-medium">Days</p>
                <p className="text-xl font-semibold text-slate-900 mt-0.5 tabular-nums">
                  {snapshot.days}
                </p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-3">
                <p className="text-xs text-slate-500 font-medium">Attractions</p>
                <p className="text-xl font-semibold text-blue-600 mt-0.5 tabular-nums">
                  {snapshot.attractions}
                </p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-3">
                <p className="text-xs text-slate-500 font-medium">Breaks</p>
                <p className="text-xl font-semibold text-slate-900 mt-0.5 tabular-nums">
                  {snapshot.breaks}
                </p>
              </div>
              <div className="bg-white border border-slate-200/80 rounded-xl p-3">
                <p className="text-xs text-slate-500 font-medium">Pace</p>
                <p className="text-sm font-semibold text-slate-900 mt-1.5 truncate">
                  {snapshot.pace}
                </p>
              </div>
            </div>

            {/* Summary Meta Rows */}
            <div className="px-5 py-3">
              {formData.tripType === 'overnight' ? (
                <>
                  <InfoRow label="Start Date" value={tripDetails.startDate} />
                  <InfoRow label="End Date" value={tripDetails.endDate} />
                  <InfoRow label="Base" value={tripDetails.hotel} />
                </>
              ) : (
                <>
                  <InfoRow label="Date" value={tripDetails.startDate} />
                  <InfoRow label="Start Time" value={tripDetails.startTime} />
                </>
              )}
              <InfoRow label="Budget" value={preferences.budget} last />
            </div>
          </div>

          {/* AI Note */}
          <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 stroke-[2]" />
            <p className="text-xs text-slate-700 leading-relaxed">
              Tripana AI will organize these stops into a timed daily route with travel estimates and pacing balance.
            </p>
          </div>

          {/* Error message */}
          {generationError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5 stroke-[2]" />
              <p className="text-xs text-red-700 font-medium">{generationError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 disabled:cursor-wait text-white rounded-xl text-sm sm:text-base font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[2]" />
                <span>Generating Itinerary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[2]" />
                <span>Generate Itinerary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate('/break')}
            disabled={isGenerating}
            className="w-full py-3 px-4 text-sm bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors font-medium inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
            <span>Back to Schedule</span>
          </button>
        </div>
      </div>
    </PageLayout>
  )
}
