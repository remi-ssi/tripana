import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  MapPin,
  Pencil,
  Save,
  Trash2,
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

function TimelineItem({
  item,
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

  return (
    <div className="grid grid-cols-[82px_1fr] gap-3">
      <div className="pt-4 text-right text-xs font-bold text-blue-600">
        {editing && !isDepart ? (
          <input
            type="time"
            value={displayTimeToInput(item.time)}
            onChange={(event) => onTimeChange(inputTimeToDisplay(event.target.value))}
            className="w-[78px] rounded-md border border-blue-200 bg-white px-1 py-1 text-xs"
          />
        ) : (
          item.time
        )}
      </div>

      <div
        className={`mb-3 rounded-xl border p-4 shadow-sm ${
          isBreak
            ? 'border-amber-200 bg-amber-50'
            : isDepart
              ? 'border-sky-200 bg-sky-50'
              : item.visited
                ? 'border-green-200 bg-green-50'
                : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-bold text-slate-800">{item.title}</p>
            <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
          </div>

          {!isDepart && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {!editing && item.type === 'attraction' && (
                <button
                  onClick={onToggleVisited}
                  className={`rounded-lg border p-2 ${
                    item.visited
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-green-200 bg-green-50 text-green-600'
                  }`}
                  title={item.visited ? 'Mark planned' : 'Mark visited'}
                >
                  <Check size={15} />
                </button>
              )}

              {editing && item.type === 'attraction' && (
                <>
                  <button
                    onClick={() => onMove(-1)}
                    disabled={!canMoveUp}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-30"
                    title="Move up"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    onClick={() => onMove(1)}
                    disabled={!canMoveDown}
                    className="rounded-lg border border-slate-200 p-2 text-slate-500 disabled:opacity-30"
                    title="Move down"
                  >
                    <ChevronDown size={15} />
                  </button>
                </>
              )}

              {editing && (
                <button
                  onClick={onRemove}
                  className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600"
                  title="Remove"
                >
                  <Trash2 size={15} />
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

  const mapStops = useMemo(() => {
    const allStops = []
    days.forEach((day) => {
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
  }, [days])

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
      <div className="min-h-screen bg-slate-50 grid place-items-center text-slate-500">
        Loading itinerary...
      </div>
    )
  }

  if (error && !itinerary) {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center px-6">
        <div className="max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate('/itineraryPage')}
            className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to itineraries
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} user={authUser} />
      <div className="ml-16 flex-1 bg-slate-50">
        <header className="bg-blue-700 px-6 py-6 text-white">
          <div className="mx-auto max-w-6xl">
          <button
            onClick={() => navigate('/itineraryPage')}
            className="mb-5 flex items-center gap-2 text-sm text-blue-100 hover:text-white"
          >
            <ArrowLeft size={17} />
            Back to itineraries
          </button>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
                {itinerary.tripType}
              </p>
              <h1 className="mt-1 text-3xl font-bold">{itinerary.tripName}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-blue-100">
                <MapPin size={16} />
                {itinerary.destination}
                {itinerary.hotel ? ` | ${itinerary.hotel}` : ''}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => (editing ? setShowSaveModal(true) : setEditing(true))}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 disabled:opacity-60"
              >
                {editing ? <Save size={16} /> : <Pencil size={16} />}
                {saving ? 'Saving...' : editing ? 'Save itinerary' : 'Edit itinerary'}
              </button>
              <button
                onClick={confirmDeleteItinerary}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              ['Dates', `${isoDateLabel(itinerary.dateStart)} - ${isoDateLabel(itinerary.dateEnd)}`],
              ['Days', days.length],
              ['Attractions', totals.attractions],
              ['Visited', totals.visited],
              ['Pace', itinerary.pacing],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/10 px-3 py-2">
                <p className="text-[11px] text-blue-200">{label}</p>
                <p className="mt-0.5 text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 h-96 w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
          <MapWidget stops={mapStops} interactive={true} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            {days.map((day) => {
              const activityItems = day.items.filter((item) => item.type === 'attraction')
              return (
                <section key={day.id} className="mb-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-600 font-bold text-white">
                      {day.day}
                    </span>
                    <div>
                      <h2 className="font-bold text-slate-800">Day {day.day}</h2>
                      <p className="text-sm text-slate-500">{day.date}</p>
                    </div>
                  </div>

                  {day.items.map((item) => {
                    const activityIndex = activityItems.findIndex(
                      (activity) => activity.id === item.id,
                    )
                    return (
                      <TimelineItem
                        key={item.id}
                        item={item}
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
                          activityIndex >= 0 && activityIndex < activityItems.length - 1
                        }
                      />
                    )
                  })}
                </section>
              )
            })}
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-800">Trip summary</h2>
            <div className="mt-4 space-y-4">
              <div className="flex gap-3">
                <CalendarDays className="text-blue-600" size={19} />
                <div>
                  <p className="text-xs text-slate-400">Travel dates</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {isoDateLabel(itinerary.dateStart)} - {isoDateLabel(itinerary.dateEnd)}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Clock3 className="text-blue-600" size={19} />
                <div>
                  <p className="text-xs text-slate-400">Daily start</p>
                  <p className="text-sm font-semibold text-slate-700">
                    {itinerary.startTime}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400">Budget</p>
                <p className="text-sm font-semibold capitalize text-slate-700">
                  {itinerary.budget}
                </p>
              </div>
            </div>

            {editing && (
              <p className="mt-5 rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
                Adjust times, reorder attractions, or remove stops. Changes are stored when
                you select Save itinerary.
              </p>
            )}
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
