import { createElement, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Map,
  MapPin,
  PlusCircle,
  Route,
} from 'lucide-react'
import { authService } from '../services/authService'
import { itineraryService } from '../services/iteneraryService'
import Sidebar from '../components/dashboardNav'
import { useAuth } from '../hooks/AuthProfile'
import EarthLoader from '../components/loadingIndicator'
import TripTypeModal from '../components/tripType'
import { Footer } from '../components/homeFooter'
import MapWidget from '../components/map/MapWidget'
import pic1 from '../assets/1.png'
import pic2 from '../assets/2.png'
import pic3 from '../assets/3.png'
import pic4 from '../assets/4.png'
import pic5 from '../assets/5.png'
import pic6 from '../assets/6.png'
import pic7 from '../assets/7.png'

const heroImages = [pic1, pic2, pic3, pic4, pic5, pic6, pic7];

const todayIso = () => {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

const formatDateRange = (start, end) => {
  if (!start) return 'Dates not set'
  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  const startLabel = new Date(`${start}T00:00:00`).toLocaleDateString('en-PH', options)
  const endLabel = new Date(`${end || start}T00:00:00`).toLocaleDateString(
    'en-PH',
    options,
  )
  return start === end ? startLabel : `${startLabel} - ${endLabel}`
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:bg-blue-600 hover:shadow-xl">
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-blue-30 text-orange-600 group-hover:bg-white/20 group-hover:text-white">
        {createElement(Icon, { size: 30, strokeWidth: 1.8 })}
      </div>
      <div>
        <p className="text-3xl font-bold text-slate-800 group-hover:text-white">{value}</p>
        <p className="text-sm font-semibold text-slate-600 group-hover:text-white">
          {label}
        </p>
        <p className="text-xs text-slate-400 group-hover:text-blue-100">{sub}</p>
      </div>
    </div>
  )
}

function EmptyState({ title, sub, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ClipboardList size={34} className="text-blue-300" />
      <p className="mt-3 font-semibold text-slate-600">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{sub}</p>
      <button
        onClick={onAction}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Plan a trip
      </button>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, loading: authLoading, clearUser } = useAuth()
  const [itineraries, setItineraries] = useState([])
  const [featured, setFeatured] = useState(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [showTripModal, setShowTripModal] = useState(false)

  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    let active = true
    itineraryService
      .list()
      .then(async (items) => {
        if (!active) return
        setItineraries(items)

        const today = todayIso()
        const current =
          items.find(
            (item) =>
              item.dateStart &&
              item.dateEnd &&
              item.dateStart <= today &&
              item.dateEnd >= today,
          ) ||
          items
            .filter((item) => item.dateStart && item.dateStart >= today)
            .sort((a, b) => a.dateStart.localeCompare(b.dateStart))[0] ||
          items[0]

        if (current) {
          const detail = await itineraryService.get(current.id)
          if (active) setFeatured(detail)
        }
      })
      .catch((error) => {
        if (active) setDataError(error.message || 'Failed to load dashboard')
      })
      .finally(() => {
        if (active) setDataLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const today = todayIso()
    return [
      {
        label: 'Total Trips',
        value: itineraries.length,
        sub: 'Saved itineraries',
        icon: Map,
      },
      {
        label: 'Upcoming',
        value: itineraries.filter((item) => item.dateEnd >= today).length,
        sub: 'Current and future trips',
        icon: CalendarDays,
      },
      {
        label: 'Places Visited',
        value: itineraries.reduce((total, item) => total + (item.visitedCount || 0), 0),
        sub: 'Completed itinerary stops',
        icon: CheckCircle2,
      },
    ]
  }, [itineraries])

  const featuredDay = useMemo(() => {
    if (!featured?.days?.length) return null
    const today = todayIso()
    const start = new Date(`${featured.dateStart}T00:00:00`)
    const target = new Date(`${today}T00:00:00`)
    const dayIndex = Math.floor((target - start) / 86_400_000)
    return featured.days[dayIndex] || featured.days[0]
  }, [featured])

  const featuredStops =
    featuredDay?.items.filter((item) => item.type !== 'depart') || []

  const allStops = useMemo(
    () =>
      featured?.days.flatMap((day) =>
        day.items
          .filter((item) => item.type === 'attraction' && item.coordinates)
          .map((item) => ({ ...item, day: day.day })),
      ) || [],
    [featured],
  )

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      clearUser()
      navigate('/login', { replace: true })
    }
  }

  if (authLoading || dataLoading) return <EarthLoader />

  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Manila',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar onLogout={handleLogout} user={user} />

      <div className="ml-16 flex min-h-screen flex-col">
        <main className="flex-1 space-y-5 p-6">
          <section className="relative overflow-hidden flex items-center justify-between rounded-2xl px-8 py-8 text-white shadow-lg min-h-[280px]">
            {/* Background Images */}
            {heroImages.map((img, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  opacity: currentBg === i ? 1 : 0,
                }}
              />
            ))}

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60" />

            {/* Left Content */}
            <div className="relative z-10 pt-25">
              <h1 className="text-4xl font-bold">
                Hi, {user?.first_name || "Traveler"}!
              </h1>

              <p className="mt-2 text-white/90 text-lg">
                Welcome back to your travel planning hub.
              </p>

              <p className="mt-4 flex items-center gap-2 text-sm text-white/80">
                <CalendarDays size={16} />
                {todayLabel}
              </p>
            </div>

            {/* Right Button */}
            <button
              onClick={() => setShowTripModal(true)}
              className="relative z-10 mt-25 flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-blue-700 shadow-lg transition hover:bg-blue-100"
            >
              <PlusCircle size={18} className="text-orange-500" />
              Plan a Trip
            </button>

          </section>

          {dataError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {dataError}
            </div>
          )}

          <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>
          
          
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-700">
                    {featured ? 'Featured Schedule' : 'Your Plans'}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {featured
                      ? `${featured.destination} | ${formatDateRange(featured.dateStart, featured.dateEnd)}`
                      : 'No saved itinerary'}
                  </p>
                </div>
                {featured && (
                  <button
                    onClick={() => navigate(`/itinerary/${featured.id}`)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Open itinerary
                  </button>
                )}
              </div>

              {!featured ? (
                <EmptyState
                  title="No plans yet"
                  sub="Create an itinerary and it will appear here."
                  onAction={() => setShowTripModal(true)}
                />
              ) : (
                <div className="mt-4 space-y-2">
                  {featuredStops.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${item.type === 'break'
                        ? 'border-amber-200 bg-amber-50'
                        : item.visited
                          ? 'border-green-200 bg-green-50'
                          : 'border-slate-100 bg-slate-50'
                        }`}
                    >
                      <span className="w-20 text-xs font-bold text-blue-600">{item.time}</span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-700">
                          {item.title}
                        </p>
                        <p className="truncate text-xs text-slate-400">{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-700">Route Map</h2>
                    <p className="text-sm text-slate-400">
                      {featured
                        ? `${featured.attractionCount} planned attractions`
                        : 'No itinerary selected'}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(featured ? `/map?itinerary=${featured.id}` : '/map')
                    }
                    className="flex items-center gap-1 text-sm font-semibold text-blue-600"
                  >
                    Full map <ArrowRight size={14} />
                  </button>
                </div>
                {featured ? (
                  <div
                    onClick={() => navigate(`/map?itinerary=${featured.id}`)}
                    className="h-48 w-full cursor-pointer relative"
                  >
                    <div className="absolute inset-0 z-10 hover:bg-blue-500/5 transition-colors" />
                    <MapWidget stops={allStops} interactive={false} className="h-full w-full pointer-events-none" />
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/map')}
                    className="flex h-48 w-full flex-col items-center justify-center bg-blue-50 text-blue-500 hover:bg-blue-100"
                  >
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
                      <Route size={28} />
                    </div>
                    <p className="mt-3 font-semibold">Open itinerary map</p>
                    <p className="mt-1 text-xs text-blue-400">
                      Mapbox markers and route ordering
                    </p>
                  </button>
                )}
              </div>
              
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-700">Saved Trips</h2>
                  <button
                    onClick={() => navigate('/itineraryPage')}
                    className="text-sm font-semibold text-blue-600"
                  >
                    See all
                  </button>
                </div>

                {itineraries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No saved trips yet.
                  </p>
                ) : (
                  <div className="mt-3 divide-y divide-slate-100">
                    {itineraries.slice(0, 3).map((trip) => (
                      <button
                        key={trip.id}
                        onClick={() => navigate(`/itinerary/${trip.id}`)}
                        className="flex w-full items-center gap-3 py-3 text-left"
                      >
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-orange-600">
                          <MapPin size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-700">
                            {trip.tripName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDateRange(trip.dateStart, trip.dateEnd)}
                          </p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">
                          {trip.attractionCount || 0} stops
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {showTripModal && (
        <TripTypeModal onClose={() => setShowTripModal(false)} />
      )}
    </div>
  )
}
