import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  ExternalLink,
  Layers,
  Loader2,
  MapPin,
  Navigation,
  Plus,
  Route,
} from 'lucide-react'
import Sidebar from '../components/dashboardNav'
import { useAuth } from '../hooks/AuthProfile'
import { authService } from '../services/authService'
import { itineraryService } from '../services/iteneraryService'
import MapWidget from '../components/map/MapWidget'

export default function MapPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, clearUser } = useAuth()
  const requestedItineraryRef = useRef(searchParams.get('itinerary'))

  const [itineraries, setItineraries] = useState([])
  const [selectedId, setSelectedId] = useState(
    searchParams.get('itinerary') || '',
  )
  const [selectedDay, setSelectedDay] = useState('all')
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    itineraryService
      .list()
      .then((items) => {
        if (!active) return
        setItineraries(items)
        const requested = requestedItineraryRef.current
        const initialId =
          requested &&
          (requested === 'all' ||
            items.some((item) => String(item.id) === requested))
            ? requested
            : 'all'
        setSelectedId(initialId)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Failed to load map')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setItinerary(null)
      return
    }

    let active = true
    setSelectedDay('all')
    setSearchParams({ itinerary: selectedId }, { replace: true })
    setLoading(true)

    if (selectedId === 'all') {
      if (itineraries.length === 0) {
        setItinerary({
          id: 'all',
          tripName: 'All Saved Places',
          destination: 'Across all trips',
          days: [],
        })
        setLoading(false)
        return
      }

      Promise.all(itineraries.map((item) => itineraryService.get(item.id)))
        .then((details) => {
          if (!active) return
          setItinerary({
            id: 'all',
            tripName: 'All Saved Places',
            destination: `${details.length} ${
              details.length === 1 ? 'itinerary' : 'itineraries'
            } combined`,
            days: details.flatMap((d) => d.days || []),
          })
          setError('')
        })
        .catch((requestError) => {
          if (active)
            setError(requestError.message || 'Failed to load all itineraries')
        })
        .finally(() => {
          if (active) setLoading(false)
        })

      return () => {
        active = false
      }
    }

    itineraryService
      .get(selectedId)
      .then((data) => {
        if (active) {
          setItinerary(data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (active)
          setError(requestError.message || 'Failed to load itinerary map')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedId, setSearchParams, itineraries])

  const availableDays = useMemo(() => {
    if (!itinerary || selectedId === 'all' || !Array.isArray(itinerary.days)) {
      return []
    }
    return itinerary.days.map((d) => d.day)
  }, [itinerary, selectedId])

  const allStopsForTrip = useMemo(() => {
    if (!itinerary || !Array.isArray(itinerary.days)) return []

    const rawStops = itinerary.days.flatMap((day) =>
      (day.items || [])
        .filter((item) => item.type === 'attraction' && item.coordinates)
        .map((item) => ({ ...item, day: day.day })),
    )

    if (selectedId !== 'all') {
      return rawStops
    }

    const uniqueMap = new Map()
    rawStops.forEach((stop) => {
      const key =
        stop.placeId || `${stop.coordinates.lat},${stop.coordinates.lng}`
      const existing = uniqueMap.get(key)
      if (!existing) {
        uniqueMap.set(key, { ...stop })
      } else if (stop.visited) {
        existing.visited = true
      }
    })
    return Array.from(uniqueMap.values())
  }, [itinerary, selectedId])

  const stops = useMemo(() => {
    if (selectedId === 'all' || selectedDay === 'all') {
      return allStopsForTrip
    }
    return allStopsForTrip.filter(
      (stop) => String(stop.day) === String(selectedDay),
    )
  }, [allStopsForTrip, selectedId, selectedDay])

  const stopStats = useMemo(() => {
    const total = stops.length
    const visited = stops.filter((s) => Boolean(s.visited)).length
    const planned = total - visited
    return { total, visited, planned }
  }, [stops])

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      clearUser()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins'] text-slate-900">
      <Sidebar onLogout={handleLogout} user={user} />

      <div className="ml-16 flex min-h-screen flex-col">
        {/* Clean Workspace Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-5 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-['Nunito'] text-2xl font-bold tracking-tight text-slate-900">
                  Itinerary Route Map
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
                  <MapPin size={12} className="text-blue-600" />
                  {stopStats.total} {stopStats.total === 1 ? 'stop' : 'stops'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Inspect attraction sequence, driving routes, and visited stop
                progress across your trips.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {selectedId && selectedId !== 'all' && itinerary ? (
                <button
                  type="button"
                  onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <ExternalLink size={16} strokeWidth={1.9} />
                  Open Itinerary
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/trip-plan')}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                >
                  <Plus size={16} strokeWidth={2} />
                  Plan New Trip
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Split Workspace */}
        <main className="mx-auto grid w-full max-w-7xl flex-1 grid-cols-1 gap-6 p-6 lg:grid-cols-[380px_1fr] lg:p-8">
          {/* Left Control & Stop Sequence Panel */}
          <aside className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            {/* Itinerary Selector */}
            <div>
              <label
                htmlFor="map-itinerary-select"
                className="block text-xs font-semibold tracking-wider text-slate-500 uppercase"
              >
                Selected Itinerary
              </label>
              <div className="relative mt-2">
                <select
                  id="map-itinerary-select"
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                  className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-sm font-medium text-slate-800 transition-colors duration-200 hover:border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                >
                  <option value="all">All Saved Places</option>
                  {itineraries.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.tripName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Trip Metadata + Status Counters */}
            {itinerary && (
              <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-['Nunito'] text-base font-bold text-slate-900">
                      {itinerary.tripName}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin
                        size={13}
                        className="shrink-0 text-blue-600"
                        strokeWidth={2}
                      />
                      <span className="truncate">{itinerary.destination}</span>
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    {selectedId === 'all' ? (
                      <>
                        <Layers size={12} className="text-blue-600" />
                        Pin view
                      </>
                    ) : (
                      <>
                        <Route size={12} className="text-blue-600" />
                        Route line
                      </>
                    )}
                  </span>
                </div>

                {/* Status Summary Bar */}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-200/80 pt-3 text-center">
                  <div className="rounded-lg bg-white px-2 py-1.5 shadow-2xs">
                    <p className="font-['Nunito'] text-base font-bold text-slate-900 tabular-nums">
                      {stopStats.total}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      Mapped
                    </p>
                  </div>
                  <div className="rounded-lg bg-white px-2 py-1.5 shadow-2xs">
                    <p className="font-['Nunito'] text-base font-bold text-blue-600 tabular-nums">
                      {stopStats.planned}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      Planned
                    </p>
                  </div>
                  <div className="rounded-lg bg-white px-2 py-1.5 shadow-2xs">
                    <p className="font-['Nunito'] text-base font-bold text-green-600 tabular-nums">
                      {stopStats.visited}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      Visited
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Day Filter Pills (when viewing a single itinerary) */}
            {selectedId !== 'all' && availableDays.length > 1 && (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Filter by Day
                  </span>
                  {selectedDay !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setSelectedDay('all')}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Show all days
                    </button>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedDay('all')}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 tabular-nums ${
                      selectedDay === 'all'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    All Days
                  </button>
                  {availableDays.map((dayNum) => (
                    <button
                      key={dayNum}
                      type="button"
                      onClick={() => setSelectedDay(String(dayNum))}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-150 tabular-nums ${
                        String(selectedDay) === String(dayNum)
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      Day {dayNum}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading & Error Alerts */}
            {loading && (
              <div className="mt-6 flex items-center justify-center gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50 py-8 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin text-blue-600" />
                <span>Loading mapped stops...</span>
              </div>
            )}

            {error && (
              <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {!loading && itineraries.length === 0 && (
              <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <Compass size={20} strokeWidth={1.9} />
                </div>
                <p className="mt-3 font-['Nunito'] text-sm font-semibold text-slate-900">
                  No saved itineraries yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Create your first trip itinerary to see its attractions and
                  driving route plotted on the map.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/trip-plan')}
                  className="mt-4 inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                >
                  <Plus size={14} />
                  Plan a Trip
                </button>
              </div>
            )}

            {/* Stop Sequence List */}
            {!loading && itinerary && itineraries.length > 0 && (
              <div className="mt-5 flex min-h-0 flex-1 flex-col">
                <div className="flex items-center justify-between pb-2.5">
                  <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    {selectedId === 'all' ? 'Saved Attractions' : 'Stop Sequence'}
                  </span>
                  <span className="text-xs text-slate-400 tabular-nums">
                    {stops.length} {stops.length === 1 ? 'place' : 'places'}
                  </span>
                </div>

                {stops.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center">
                    <p className="text-xs font-medium text-slate-600">
                      No mapped attractions for this selection.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {stops.map((stop, index) => {
                      const isVisited = Boolean(stop.visited)
                      return (
                        <div
                          key={`${stop.id || stop.title}-${index}`}
                          className="group flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50/60"
                        >
                          <span
                            className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold text-white tabular-nums ${
                              isVisited ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                          >
                            {index + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {stop.title}
                              </p>
                              <span
                                className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                  isVisited
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {isVisited ? (
                                  <>
                                    <CheckCircle2 size={10} />
                                    Visited
                                  </>
                                ) : (
                                  'Planned'
                                )}
                              </span>
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 tabular-nums">
                              {selectedId !== 'all' && stop.day && (
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays
                                    size={12}
                                    className="text-slate-400"
                                  />
                                  Day {stop.day}
                                </span>
                              )}
                              {selectedId !== 'all' && stop.time && (
                                <span className="inline-flex items-center gap-1">
                                  <Clock size={12} className="text-slate-400" />
                                  {stop.time}
                                </span>
                              )}
                              {selectedId === 'all' && (
                                <span className="text-slate-400">
                                  Saved attraction pin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {selectedId !== 'all' && (
                  <button
                    type="button"
                    onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                    className="mt-5 inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <Route size={16} strokeWidth={1.9} />
                    Open Full Itinerary
                  </button>
                )}
              </div>
            )}
          </aside>

          {/* Right Map Canvas Panel */}
          <section className="relative flex min-h-[540px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs lg:min-h-[640px]">
            {/* Map Top Info Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <Navigation size={14} className="text-blue-600" />
                <span>
                  {selectedId === 'all'
                    ? 'Showing all unique saved attractions across your trips'
                    : selectedDay === 'all'
                      ? `Showing full driving route for ${itinerary?.tripName || 'selected itinerary'}`
                      : `Showing Day ${selectedDay} driving route for ${itinerary?.tripName || 'selected itinerary'}`}
                </span>
              </div>

              {/* Pin Legend */}
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Planned
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-600" />
                  Visited
                </span>
              </div>
            </div>

            {/* Mapbox Canvas */}
            <div className="relative flex-1">
              <MapWidget
                stops={stops}
                interactive={true}
                showRoute={selectedId !== 'all'}
              />

              {!loading && stops.length === 0 && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center bg-slate-50/80 backdrop-blur-[1px]">
                  <div className="max-w-xs rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                    <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <MapPin size={22} strokeWidth={1.9} />
                    </div>
                    <p className="mt-3 font-['Nunito'] text-base font-semibold text-slate-900">
                      No mapped attractions
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Select an itinerary with scheduled attractions to display
                      pins and route lines on the map.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
