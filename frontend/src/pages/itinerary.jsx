import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Coffee,
  Gauge,
  Hotel,
  Loader2,
  MapPin,
  Navigation,
  Pencil,
  Route,
  Save,
  Trash2,
  Wallet,
  X,
} from 'lucide-react'
import { itineraryService } from '../services/iteneraryService'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal'
import ConfirmSaveModal from '../components/ConfirmSaveModal'
import MapWidget from '../components/map/MapWidget'
import Sidebar from '../components/dashboardNav'
import { useAuth } from '../hooks/AuthProfile'
import { authService } from '../services/authService'

const displayTimeToInput = (value) => {
  if (!value || !value.includes(' ')) return value || '08:00'
  const [clock, period] = value.split(' ')
  let [hours, minutes] = clock.split(':').map(Number)
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const inputTimeToDisplay = (value) => {
  if (!value) return '08:00 AM'
  const [hoursValue, minutes] = value.split(':').map(Number)
  const period = hoursValue >= 12 ? 'PM' : 'AM'
  const hours = hoursValue % 12 || 12
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`
}

const isoDateLabel = (value) => {
  if (!value) return ''
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateRange = (start, end) => {
  if (!start) return 'Dates not set'
  const startLabel = isoDateLabel(start)
  const endLabel = isoDateLabel(end || start)
  return start === end ? startLabel : `${startLabel} - ${endLabel}`
}

const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  const parsed = new Date(`${dateStr}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return dateStr
  return parsed.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  })
}

function TimelineItem({
  item,
  index,
  isLast,
  editing,
  onToggleVisited,
  onTimeChange,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
}) {
  const isBreak = item.type === 'break'
  const isDepart = item.type === 'depart'
  const isVisited = Boolean(item.visited)

  return (
    <div className="group relative flex items-start gap-4">
      {/* Left Time Column */}
      <div className="w-24 shrink-0 pt-3.5 text-right">
        {editing && !isDepart ? (
          <input
            type="time"
            aria-label={`Time for ${item.title}`}
            value={displayTimeToInput(item.time)}
            onChange={(event) => onTimeChange(inputTimeToDisplay(event.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-900 tabular-nums transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
          />
        ) : (
          <span className="inline-block text-xs font-semibold text-slate-600 tabular-nums">
            {item.time || 'Flexible'}
          </span>
        )}
      </div>

      {/* Center Timeline Connector */}
      <div className="relative flex flex-col items-center self-stretch">
        <div
          className={`z-10 mt-3 grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition-colors ${
            isBreak
              ? 'border-amber-200 bg-amber-50 text-amber-600'
              : isDepart
                ? 'border-slate-200 bg-slate-100 text-slate-600'
                : isVisited
                  ? 'border-green-200 bg-green-50 text-green-600'
                  : 'border-blue-200 bg-blue-50 text-blue-600'
          }`}
        >
          {isBreak ? (
            <Coffee size={15} strokeWidth={1.85} />
          ) : isDepart ? (
            <Navigation size={14} strokeWidth={1.85} />
          ) : isVisited ? (
            <CheckCircle2 size={15} strokeWidth={1.85} />
          ) : (
            <span className="text-xs font-semibold tabular-nums">
              {index !== undefined ? index + 1 : <MapPin size={14} strokeWidth={1.85} />}
            </span>
          )}
        </div>
        {!isLast && (
          <div
            aria-hidden="true"
            className="my-1 w-px flex-1 bg-slate-200"
          />
        )}
      </div>

      {/* Right Event Card */}
      <div
        className={`mb-3 min-w-0 flex-1 rounded-xl border p-4 transition-all duration-200 ${
          isBreak
            ? 'border-slate-200 bg-slate-50/70'
            : isDepart
              ? 'border-dashed border-slate-200 bg-slate-50/50'
              : isVisited
                ? 'border-slate-200 bg-white'
                : 'border-slate-200 bg-white shadow-2xs hover:border-slate-300'
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`font-['Nunito'] text-base font-semibold ${
                  isVisited ? 'text-slate-700' : 'text-slate-900'
                }`}
              >
                {item.title}
              </h3>

              {isBreak && (
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                  Scheduled Break
                </span>
              )}

              {isDepart && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                  Transit
                </span>
              )}

              {!isBreak && !isDepart && isVisited && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                  <Check size={11} strokeWidth={2.25} />
                  Visited
                </span>
              )}
            </div>

            {item.sub && (
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {item.sub}
              </p>
            )}
          </div>

          {!isDepart && (
            <div className="flex shrink-0 items-center gap-1.5">
              {!editing && item.type === 'attraction' && (
                <button
                  type="button"
                  onClick={onToggleVisited}
                  className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                    isVisited
                      ? 'border-green-600 bg-green-600 text-white hover:bg-green-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={isVisited ? 'Mark as planned' : 'Mark as visited'}
                >
                  <Check size={14} strokeWidth={2} />
                  <span>{isVisited ? 'Visited' : 'Mark visited'}</span>
                </button>
              )}

              {editing && item.type === 'attraction' && (
                <>
                  <button
                    type="button"
                    onClick={() => onMove(-1)}
                    disabled={!canMoveUp}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35"
                    title="Move stop earlier"
                    aria-label={`Move ${item.title} earlier`}
                  >
                    <ChevronUp size={16} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(1)}
                    disabled={!canMoveDown}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35"
                    title="Move stop later"
                    aria-label={`Move ${item.title} later`}
                  >
                    <ChevronDown size={16} strokeWidth={2} />
                  </button>
                </>
              )}

              {editing && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="grid h-9 w-9 place-items-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
                  title="Remove from schedule"
                  aria-label={`Remove ${item.title}`}
                >
                  <Trash2 size={15} strokeWidth={1.85} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GeneratedItineraryPage() {
  const navigate = useNavigate()
  const { itineraryId } = useParams()
  const { user: authUser, clearUser } = useAuth()
  const [itinerary, setItinerary] = useState(null)
  const [days, setDays] = useState([])
  const [selectedDayFilter, setSelectedDayFilter] = useState('all')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)

  useEffect(() => {
    if (!itineraryId) {
      navigate('/itineraryPage', { replace: true })
      return
    }

    let active = true
    itineraryService
      .get(itineraryId)
      .then((data) => {
        if (!active) return
        setItinerary(data)
        setDays(data.days || [])
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Failed to load itinerary')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [itineraryId, navigate])

  const totals = useMemo(() => {
    const attractions = days.reduce(
      (count, day) =>
        count + day.items.filter((item) => item.type === 'attraction').length,
      0,
    )
    const visited = days.reduce(
      (count, day) =>
        count +
        day.items.filter((item) => item.type === 'attraction' && item.visited).length,
      0,
    )
    return { attractions, visited }
  }, [days])

  const visibleDays = useMemo(() => {
    if (selectedDayFilter === 'all') return days
    return days.filter((d) => String(d.day) === String(selectedDayFilter))
  }, [days, selectedDayFilter])

  const mapStops = useMemo(() => {
    const allStops = []
    visibleDays.forEach((day) => {
      day.items.forEach((item) => {
        if (item.type === 'attraction' && item.coordinates) {
          allStops.push({
            coordinates: item.coordinates,
            title: item.title,
            day: day.day,
            time: item.time,
            visited: item.visited,
          })
        }
      })
    })
    return allStops
  }, [visibleDays])

  const updateItem = (dayId, itemId, updater) => {
    setDays((current) =>
      current.map((day) =>
        day.id === dayId
          ? {
              ...day,
              items: day.items.map((item) =>
                item.id === itemId ? updater(item) : item,
              ),
            }
          : day,
      ),
    )
  }

  const removeItem = (dayId, itemId) => {
    setDays((current) =>
      current.map((day) =>
        day.id === dayId
          ? { ...day, items: day.items.filter((item) => item.id !== itemId) }
          : day,
      ),
    )
  }

  const moveActivity = (dayId, itemId, direction) => {
    setDays((current) =>
      current.map((day) => {
        if (day.id !== dayId) return day

        const items = [...day.items]
        const sourceIndex = items.findIndex((item) => item.id === itemId)
        let targetIndex = sourceIndex + direction
        while (
          targetIndex >= 0 &&
          targetIndex < items.length &&
          items[targetIndex].type !== 'attraction'
        ) {
          targetIndex += direction
        }
        if (targetIndex < 0 || targetIndex >= items.length) return day

        const [moved] = items.splice(sourceIndex, 1)
        items.splice(targetIndex, 0, moved)
        return { ...day, items }
      }),
    )
  }

  const cancelEditing = () => {
    if (itinerary?.days) {
      setDays(itinerary.days)
    }
    setEditing(false)
  }

  const saveSchedule = async (nextDays = days) => {
    setSaving(true)
    setError('')
    try {
      const saved = await itineraryService.updateSchedule(itineraryId, nextDays)
      setItinerary(saved)
      setDays(saved.days || [])
      setEditing(false)
    } catch (requestError) {
      setError(requestError.message || 'Failed to save itinerary')
    } finally {
      setSaving(false)
    }
  }

  const toggleVisited = async (dayId, itemId) => {
    const nextDays = days.map((day) =>
      day.id === dayId
        ? {
            ...day,
            items: day.items.map((item) =>
              item.id === itemId ? { ...item, visited: !item.visited } : item,
            ),
          }
        : day,
    )
    setDays(nextDays)
    await saveSchedule(nextDays)
  }

  const confirmDeleteItinerary = () => {
    setShowDeleteModal(true)
  }

  const performDelete = async () => {
    setSaving(true)
    try {
      await itineraryService.delete(itineraryId)
      navigate('/itineraryPage', { replace: true })
    } catch (requestError) {
      setError(requestError.message || 'Failed to delete itinerary')
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      clearUser()
      navigate('/login', { replace: true })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 font-['Poppins'] text-slate-600">
        <div className="flex items-center gap-2.5 text-sm font-medium">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Loading itinerary...</span>
        </div>
      </div>
    )
  }

  if (error && !itinerary) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6 font-['Poppins']">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-xs">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
            <AlertCircle size={22} strokeWidth={1.85} />
          </div>
          <h1 className="font-['Nunito'] text-lg font-semibold text-slate-900">
            Unable to load itinerary
          </h1>
          <p className="mt-1.5 text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/itineraryPage')}
            className="mt-6 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <ArrowLeft size={16} strokeWidth={2} />
            Back to itineraries
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins'] text-slate-900">
      <Sidebar onLogout={handleLogout} user={authUser} />

      <div className="ml-16 flex min-h-screen flex-col">
        {/* Top Workspace Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => navigate('/itineraryPage')}
              className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              <ArrowLeft size={15} strokeWidth={2} />
              <span>Back to My Itineraries</span>
            </button>

            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                    {itinerary.tripType || 'Itinerary'}
                  </span>
                  {editing && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Editing Schedule
                    </span>
                  )}
                </div>

                <h1 className="mt-2 font-['Nunito'] text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  {itinerary.tripName}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={15} strokeWidth={1.85} className="text-blue-600" />
                    <span>{itinerary.destination}</span>
                  </span>
                  {itinerary.hotel && (
                    <span className="inline-flex items-center gap-1.5 text-slate-500">
                      <Hotel size={15} strokeWidth={1.85} className="text-slate-400" />
                      <span>{itinerary.hotel}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {editing ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saving}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-60"
                    >
                      <X size={16} strokeWidth={1.85} />
                      <span>Cancel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSaveModal(true)}
                      disabled={saving}
                      className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-2xs transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} strokeWidth={1.85} />
                      )}
                      <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    disabled={saving}
                    className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-2xs transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
                  >
                    <Pencil size={15} strokeWidth={1.85} />
                    <span>Edit Schedule</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={confirmDeleteItinerary}
                  disabled={saving}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none disabled:opacity-60"
                >
                  <Trash2 size={15} strokeWidth={1.85} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                {
                  label: 'Travel Dates',
                  value: formatDateRange(itinerary.dateStart, itinerary.dateEnd),
                },
                {
                  label: 'Duration',
                  value: `${days.length} ${days.length === 1 ? 'Day' : 'Days'}`,
                },
                {
                  label: 'Attractions',
                  value: `${totals.attractions} ${totals.attractions === 1 ? 'Stop' : 'Stops'}`,
                },
                {
                  label: 'Completed',
                  value: `${totals.visited} / ${totals.attractions} Visited`,
                },
                {
                  label: 'Trip Pace',
                  value: itinerary.pacing || 'Moderate',
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-4 py-3"
                >
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900 tabular-nums">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* Main Workspace Content */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle size={17} strokeWidth={1.85} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Day Filter Bar when multi-day */}
          {days.length > 1 && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div
                role="tablist"
                aria-label="Filter schedule by day"
                className="flex items-center gap-2 overflow-x-auto pb-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedDayFilter === 'all'}
                  onClick={() => setSelectedDayFilter('all')}
                  className={`inline-flex min-h-[38px] shrink-0 items-center rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors tabular-nums focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                    selectedDayFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  All Days ({days.length})
                </button>
                {days.map((day) => {
                  const isSelected = String(selectedDayFilter) === String(day.day)
                  const shortDate = formatShortDate(day.date)
                  return (
                    <button
                      key={day.id ?? day.day}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedDayFilter(String(day.day))}
                      className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors tabular-nums focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <span>Day {day.day}</span>
                      {shortDate && (
                        <span className={isSelected ? 'text-blue-100' : 'text-slate-400'}>
                          · {shortDate}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Two-Column Workspace Grid */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Left Column: Chronological Timeline */}
            <div className="space-y-6 lg:col-span-7">
              {editing && (
                <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-xs leading-relaxed text-slate-700">
                  <Pencil size={15} strokeWidth={2} className="mt-0.5 shrink-0 text-blue-600" />
                  <p>
                    <span className="font-semibold text-slate-900">Edit Mode:</span> Adjust stop times, reorder attractions within a day, or remove items. Select <span className="font-semibold text-slate-900">Save Changes</span> when finished.
                  </p>
                </div>
              )}

              {visibleDays.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <p className="font-['Nunito'] text-base font-semibold text-slate-900">
                    No schedule items available
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    This itinerary currently has no scheduled days.
                  </p>
                </div>
              ) : (
                visibleDays.map((day) => {
                  const activityItems = day.items.filter(
                    (item) => item.type === 'attraction',
                  )
                  const dayVisitedCount = activityItems.filter((a) => a.visited).length

                  return (
                    <section
                      key={day.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
                    >
                      {/* Day Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 font-['Nunito'] text-sm font-semibold text-white tabular-nums">
                            {day.day}
                          </span>
                          <div>
                            <h2 className="font-['Nunito'] text-lg font-semibold text-slate-900">
                              Day {day.day}
                            </h2>
                            {day.date && (
                              <p className="text-xs text-slate-500 tabular-nums">
                                {day.date}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 tabular-nums">
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700">
                            {activityItems.length}{' '}
                            {activityItems.length === 1 ? 'attraction' : 'attractions'}
                          </span>
                          {activityItems.length > 0 && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                              {dayVisitedCount} visited
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Day Items */}
                      <div className="p-6">
                        {day.items.length === 0 ? (
                          <p className="py-6 text-center text-sm text-slate-500">
                            No stops remaining on Day {day.day}.
                          </p>
                        ) : (
                          day.items.map((item, idx) => {
                            const activityIndex = activityItems.findIndex(
                              (activity) => activity.id === item.id,
                            )
                            return (
                              <TimelineItem
                                key={item.id}
                                item={item}
                                index={activityIndex >= 0 ? activityIndex : undefined}
                                isLast={idx === day.items.length - 1}
                                editing={editing}
                                onToggleVisited={() => toggleVisited(day.id, item.id)}
                                onTimeChange={(time) =>
                                  updateItem(day.id, item.id, (current) => ({
                                    ...current,
                                    time,
                                  }))
                                }
                                onRemove={() => removeItem(day.id, item.id)}
                                onMove={(direction) =>
                                  moveActivity(day.id, item.id, direction)
                                }
                                canMoveUp={activityIndex > 0}
                                canMoveDown={
                                  activityIndex >= 0 &&
                                  activityIndex < activityItems.length - 1
                                }
                              />
                            )
                          })
                        )}
                      </div>
                    </section>
                  )
                })
              )}
            </div>

            {/* Right Column: Sticky Route Map & Trip Summary */}
            <aside className="space-y-6 lg:sticky lg:top-6 lg:col-span-5">
              {/* Interactive Route Map Card */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600">
                      <Route size={16} strokeWidth={1.85} />
                    </div>
                    <div>
                      <h2 className="font-['Nunito'] text-base font-semibold text-slate-900">
                        Route Map
                      </h2>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {mapStops.length} {mapStops.length === 1 ? 'stop' : 'stops'} plotted
                        {selectedDayFilter !== 'all' ? ` (Day ${selectedDayFilter})` : ''}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/map?itinerary=${itinerary.id}`)}
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  >
                    <span>Expand map</span>
                    <ArrowRight size={14} strokeWidth={1.85} />
                  </button>
                </div>

                <div className="h-80 w-full bg-slate-100">
                  <MapWidget stops={mapStops} interactive={true} />
                </div>
              </div>

              {/* Trip Summary Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <h2 className="font-['Nunito'] text-base font-semibold text-slate-900">
                  Trip Overview
                </h2>

                <div className="mt-4 divide-y divide-slate-100">
                  <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={15} strokeWidth={1.85} className="text-blue-600" />
                      <span>Travel dates</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-900 tabular-nums">
                      {formatDateRange(itinerary.dateStart, itinerary.dateEnd)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                      <Clock3 size={15} strokeWidth={1.85} className="text-blue-600" />
                      <span>Daily start time</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-900 tabular-nums">
                      {itinerary.startTime || '08:00 AM'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                      <Wallet size={15} strokeWidth={1.85} className="text-blue-600" />
                      <span>Budget tier</span>
                    </span>
                    <span className="text-xs font-semibold capitalize text-slate-900">
                      {itinerary.budget || 'Standard'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                    <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                      <Gauge size={15} strokeWidth={1.85} className="text-blue-600" />
                      <span>Pacing</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-900">
                      {itinerary.pacing || 'Moderate'}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={performDelete}
          title="Delete Itinerary"
          message="Are you sure you want to permanently delete this itinerary? This action cannot be undone."
        />
        <ConfirmSaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onConfirm={() => saveSchedule()}
        />
      </div>
    </div>
  )
}
