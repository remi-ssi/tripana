import { ArrowUpRight, CalendarDays, CheckCircle2, Gauge, MapPin } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateRange(start, end) {
  if (!start) return 'Dates not set'
  const startLabel = formatDate(start)
  const endLabel = formatDate(end || start)
  return start === end ? startLabel : `${startLabel} - ${endLabel}`
}

export default function ItineraryCard({ itinerary, onClick }) {
  const isOvernight = itinerary.tripType === 'Overnight'
  const attractionCount = Number(itinerary.attractionCount || 0)
  const visitedCount = Number(itinerary.visitedCount || 0)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex h-full w-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none cursor-pointer motion-reduce:transition-none"
    >
      <div>
        {/* Top Row: Badge + Action Arrow */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              isOvernight
                ? 'bg-blue-50 text-blue-600'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {itinerary.tripType || 'Itinerary'}
          </span>

          <span className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-all duration-200 group-hover:bg-blue-50 group-hover:text-blue-600">
            <ArrowUpRight
              size={16}
              strokeWidth={1.85}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-3 line-clamp-2 font-['Nunito'] text-lg font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600">
          {itinerary.tripName || itinerary.destination}
        </h3>

        {/* Destination */}
        <p className="mt-1.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-500">
          <MapPin size={14} strokeWidth={1.85} className="shrink-0 text-blue-600" />
          <span className="truncate">{itinerary.destination}</span>
        </p>
      </div>

      {/* Footer Meta */}
      <div className="mt-5 border-t border-slate-100 pt-3.5">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 tabular-nums">
          <span className="inline-flex items-center gap-1.5 truncate">
            <CalendarDays size={14} strokeWidth={1.85} className="shrink-0 text-slate-400" />
            <span className="truncate">
              {formatDateRange(itinerary.dateStart, itinerary.dateEnd)}
            </span>
          </span>

          {itinerary.pacing && (
            <span className="inline-flex shrink-0 items-center gap-1 text-slate-500">
              <Gauge size={13} strokeWidth={1.85} className="text-slate-400" />
              <span>{itinerary.pacing}</span>
            </span>
          )}
        </div>

        {(attractionCount > 0 || visitedCount > 0) && (
          <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] font-medium text-slate-500 tabular-nums">
            <span>
              {attractionCount} {attractionCount === 1 ? 'stop' : 'stops'} planned
            </span>
            {visitedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-green-700">
                <CheckCircle2 size={12} strokeWidth={2} />
                <span>{visitedCount} visited</span>
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}
