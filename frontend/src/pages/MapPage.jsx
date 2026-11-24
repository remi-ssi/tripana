import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, MapPin, Route } from 'lucide-react'
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
  const [selectedId, setSelectedId] = useState(searchParams.get('itinerary') || '')
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    itineraryService.list()
      .then((items) => {
        if (!active) return
        setItineraries(items)
        const requested = requestedItineraryRef.current
        const initialId =
          (requested && (requested === 'all' || items.some((item) => String(item.id) === requested)))
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
    setSearchParams({ itinerary: selectedId }, { replace: true })
    setLoading(true)

    if (selectedId === 'all') {
      if (itineraries.length === 0) {
        setItinerary({
          id: 'all',
          tripName: 'All Places',
          destination: 'Various Locations',
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
            tripName: 'All Places',
            destination: 'Various Locations',
            days: details.flatMap((d) => d.days),
          })
          setError('')
        })
        .catch((requestError) => {
          if (active) setError(requestError.message || 'Failed to load all itineraries')
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
        if (active) setError(requestError.message || 'Failed to load itinerary map')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedId, setSearchParams, itineraries])

  const stops = useMemo(() => {
    if (!itinerary) return []
    
    const rawStops = itinerary.days.flatMap((day) =>
      day.items
        .filter((item) => item.type === 'attraction' && item.coordinates)
        .map((item) => ({ ...item, day: day.day })),
    )

    if (selectedId !== 'all') {
      return rawStops
    }

    // Deduplicate for "All Places"
    const uniqueMap = new Map()
    rawStops.forEach((stop) => {
      const key = stop.placeId || `${stop.coordinates.lat},${stop.coordinates.lng}`
      const existing = uniqueMap.get(key)
      if (!existing) {
        uniqueMap.set(key, { ...stop })
      } else {
        if (stop.visited) {
          existing.visited = true
        }
      }
    })
    return Array.from(uniqueMap.values())
  }, [itinerary, selectedId])

  // Map rendering logic is now handled by MapWidget

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      clearUser()
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar onLogout={handleLogout} user={user} />
      <div className="ml-16 flex min-h-screen flex-col">
        <header className="flex items-center justify-between bg-blue-700 px-6 py-4 text-white">
          <div>
            <h1 className="text-xl font-bold">Itinerary Map</h1>
            <p className="text-sm text-blue-200">
              View saved attractions and their planned order.
            </p>
          </div>
        </header>

        <main className="grid flex-1 grid-cols-1 gap-5 p-5 lg:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Saved itinerary
            </label>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700"
            >
              <option value="all">All Places</option>
              {itineraries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.tripName}
                </option>
              ))}
            </select>

            {loading && <p className="mt-6 text-sm text-slate-500">Loading map...</p>}
            {error && <p className="mt-6 text-sm text-red-600">{error}</p>}

            {!loading && itineraries.length === 0 && (
              <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                Create an itinerary first to display its attractions on the map.
              </div>
            )}

            {itinerary && (
              <>
                <div className="mt-6">
                  <h2 className="font-bold text-slate-800">{itinerary.tripName}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                    <MapPin size={14} />
                    {itinerary.destination}
                  </p>
                </div>

                <div className="mt-5 space-y-2 max-h-[400px] overflow-y-auto pr-1">
                  {stops.map((stop, index) => (
                    <div
                      key={stop.id}
                      className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <span className={`grid h-6 w-6 flex-shrink-0 place-items-center rounded-full text-xs font-bold text-white ${
                        selectedId === 'all'
                          ? (stop.visited ? 'bg-green-600' : 'bg-blue-600')
                          : 'bg-blue-600'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {stop.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {selectedId === 'all'
                            ? (stop.visited ? 'Visited' : 'Planned')
                            : `Day ${stop.day} | ${stop.time}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedId !== 'all' && (
                  <button
                    onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Route size={16} />
                    Open itinerary
                  </button>
                )}
              </>
            )}
          </aside>

          <section className="relative min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <MapWidget stops={stops} interactive={true} showRoute={selectedId !== 'all'} />
            {!loading && stops.length === 0 && (
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-white/75">
                <div className="text-center text-slate-500">
                  <MapPin className="mx-auto mb-2 text-blue-500" size={32} />
                  <p className="font-semibold">No mapped attractions</p>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
