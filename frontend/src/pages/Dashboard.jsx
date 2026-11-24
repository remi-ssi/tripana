import { createElement, useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Coffee,
  ExternalLink,
  Loader2,
  Map,
  MapPin,
  Plus,
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

const heroImages = [pic1, pic2, pic3, pic4, pic5, pic6, pic7]

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

const formatShortDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  })
}

const getInitialDayIndex = (trip) => {
  if (!trip?.days?.length) return 0
  if (!trip.dateStart) return 0
  const today = todayIso()
  const start = new Date(`${trip.dateStart}T00:00:00`)
  const target = new Date(`${today}T00:00:00`)
  const dayIndex = Math.floor((target - start) / 86_400_000)
  return dayIndex >= 0 && dayIndex < trip.days.length ? dayIndex : 0
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md motion-reduce:transition-none">
      <div className="min-w-0">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
          {label}
        </p>
        <p className="mt-2 font-['Nunito'] text-3xl font-semibold text-slate-900 tabular-nums">
          {value}
        </p>
        <p className="mt-1 text-xs text-slate-500">{sub}</p>
      </div>
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600 transition-colors duration-300 group-hover:bg-blue-600 group-hover:text-white">
        {createElement(Icon, { size: 20, strokeWidth: 1.85 })}
      </div>
    </div>
  )
}

function EmptyState({ title, sub, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
        <ClipboardList size={22} strokeWidth={1.85} />
      </div>
      <p className="mt-4 font-['Nunito'] text-base font-semibold text-slate-900">
        {title}
      </p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">{sub}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-all duration-200 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Plus size={16} strokeWidth={2} />
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
  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [mapScope, setMapScope] = useState('trip')
  const [switchingTrip, setSwitchingTrip] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [showTripModal, setShowTripModal] = useState(false)
  const [currentBg, setCurrentBg] = useState(0)

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return undefined

    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % heroImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

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
          if (active && detail) {
            setFeatured(detail)
            setSelectedDayIdx(getInitialDayIndex(detail))
          }
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

  const handleSelectTrip = useCallback(
    async (tripId) => {
      if (!tripId || Number(tripId) === Number(featured?.id)) return
      setSwitchingTrip(true)
      setDataError('')
      try {
        const detail = await itineraryService.get(tripId)
        setFeatured(detail)
        setSelectedDayIdx(getInitialDayIndex(detail))
      } catch (error) {
        setDataError(error.message || 'Failed to load selected itinerary')
      } finally {
        setSwitchingTrip(false)
      }
    },
    [featured?.id],
  )

  const stats = useMemo(() => {
    const today = todayIso()
    return [
      {
        label: 'Total Trips',
        value: itineraries.length,
        sub: 'Saved itineraries in your workspace',
        icon: Map,
      },
      {
        label: 'Upcoming',
        value: itineraries.filter((item) => item.dateEnd && item.dateEnd >= today).length,
        sub: 'Active and scheduled future trips',
        icon: CalendarDays,
      },
      {
        label: 'Places Visited',
        value: itineraries.reduce((total, item) => total + (item.visitedCount || 0), 0),
        sub: 'Completed stops across itineraries',
        icon: CheckCircle2,
      },
    ]
  }, [itineraries])

  const activeDay = useMemo(() => {
    if (!featured?.days?.length) return null
    return featured.days[selectedDayIdx] || featured.days[0]
  }, [featured, selectedDayIdx])

  const featuredStops = useMemo(
    () => activeDay?.items?.filter((item) => item.type !== 'depart') || [],
    [activeDay],
  )

  const allTripStops = useMemo(
    () =>
      featured?.days?.flatMap((day) =>
        (day.items || [])
          .filter((item) => item.type === 'attraction' && item.coordinates)
          .map((item) => ({ ...item, day: day.day })),
      ) || [],
    [featured],
  )

  const activeDayStops = useMemo(
    () =>
      (activeDay?.items || [])
        .filter((item) => item.type === 'attraction' && item.coordinates)
        .map((item) => ({ ...item, day: activeDay.day })),
    [activeDay],
  )

  const mapStops = mapScope === 'day' ? activeDayStops : allTripStops

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
    <div className="min-h-screen bg-slate-50 font-['Poppins'] text-slate-900">
      <Sidebar onLogout={handleLogout} user={user} />

      <div className="ml-16 flex min-h-screen flex-col">
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 p-6 lg:p-8">
          {/* Rotating Hero Banner */}
          <section className="relative flex min-h-[240px] flex-col justify-end overflow-hidden rounded-2xl border border-slate-900/10 px-6 py-6 text-white shadow-sm sm:min-h-[260px] sm:px-8 sm:py-8">
            {heroImages.map((img, i) => (
              <div
                key={i}
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 motion-reduce:transition-none"
                style={{
                  backgroundImage: `url(${img})`,
                  opacity: currentBg === i ? 1 : 0,
                }}
              />
            ))}

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/55 to-slate-900/30"
            />

            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="inline-flex items-center gap-2 text-xs font-medium text-slate-200 tabular-nums">
                  <CalendarDays size={15} strokeWidth={1.85} className="text-blue-400" />
                  {todayLabel}
                </p>

                <h1 className="mt-2 font-['Nunito'] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Hi, {user?.first_name || 'Traveler'}
                </h1>

                <p className="mt-2 text-sm text-slate-200 sm:text-base">
                  Review your upcoming schedule, inspect daily routes, or plan your next destination.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowTripModal(true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
                >
                  <Plus size={18} strokeWidth={2} />
                  Plan a Trip
                </button>
              </div>
            </div>
          </section>

          {dataError && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {dataError}
            </div>
          )}

          {/* Summary Metrics */}
          <section
            aria-label="Trip statistics"
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          {/* Main Workspace Grid */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            {/* Left Column: Featured Schedule with Trip Switcher & Day Tabs */}
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-xs xl:col-span-7">
              <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-['Nunito'] text-xl font-semibold text-slate-900">
                      {featured ? 'Featured Schedule' : 'Your Plans'}
                    </h2>
                    {switchingTrip && (
                      <Loader2
                        size={16}
                        className="animate-spin text-blue-600"
                        aria-label="Loading trip"
                      />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 tabular-nums">
                    {featured
                      ? `${featured.destination} · ${formatDateRange(featured.dateStart, featured.dateEnd)}`
                      : 'No saved itinerary selected'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {itineraries.length > 1 && (
                    <label className="sr-only" htmlFor="dashboard-trip-select">
                      Select active trip
                    </label>
                  )}
                  {itineraries.length > 1 && (
                    <select
                      id="dashboard-trip-select"
                      value={featured?.id || ''}
                      disabled={switchingTrip}
                      onChange={(e) => handleSelectTrip(Number(e.target.value))}
                      className="min-h-[40px] max-w-[220px] truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20 focus-visible:outline-none disabled:opacity-60"
                    >
                      {itineraries.map((trip) => (
                        <option key={trip.id} value={trip.id}>
                          {trip.tripName || trip.destination}
                        </option>
                      ))}
                    </select>
                  )}

                  {featured && (
                    <button
                      type="button"
                      onClick={() => navigate(`/itinerary/${featured.id}`)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                    >
                      Open itinerary
                      <ArrowRight size={14} strokeWidth={1.85} />
                    </button>
                  )}
                </div>
              </div>

              {!featured ? (
                <div className="mt-6 flex-1">
                  <EmptyState
                    title="No plans yet"
                    sub="Create your first itinerary and your day-by-day schedule will appear here."
                    onAction={() => setShowTripModal(true)}
                  />
                </div>
              ) : (
                <div className="mt-4 flex flex-1 flex-col">
                  {/* Day Switcher Tabs */}
                  {featured.days?.length > 0 && (
                    <div
                      role="tablist"
                      aria-label="Itinerary days"
                      className="flex items-center gap-2 overflow-x-auto pb-2"
                    >
                      {featured.days.map((day, idx) => {
                        const isSelected = idx === selectedDayIdx
                        const shortDate = formatShortDate(day.date)
                        return (
                          <button
                            key={day.day ?? idx}
                            role="tab"
                            type="button"
                            aria-selected={isSelected}
                            onClick={() => setSelectedDayIdx(idx)}
                            className={`inline-flex min-h-[38px] shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors tabular-nums focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-900'
                            }`}
                          >
                            <span>Day {day.day}</span>
                            {shortDate && (
                              <span
                                className={
                                  isSelected ? 'text-blue-100' : 'text-slate-400'
                                }
                              >
                                · {shortDate}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Chronological Timeline List */}
                  {featuredStops.length === 0 ? (
                    <div className="mt-4 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-10 text-center">
                      <Clock size={22} className="text-slate-400" strokeWidth={1.75} />
                      <p className="mt-2 text-sm font-medium text-slate-700">
                        No scheduled stops for Day {activeDay?.day || selectedDayIdx + 1}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Open the itinerary editor to add attractions or breaks.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 divide-y divide-slate-100">
                      {featuredStops.slice(0, 7).map((item, idx) => {
                        const isBreak = item.type === 'break'
                        const isVisited = Boolean(item.visited)

                        return (
                          <div
                            key={item.id ?? `${item.time}-${idx}`}
                            className="flex items-start gap-4 py-3.5 first:pt-2 last:pb-1"
                          >
                            <div className="w-20 shrink-0 pt-0.5 text-xs font-medium text-slate-500 tabular-nums">
                              {item.time || 'Flexible'}
                            </div>

                            <div className="mt-1 flex shrink-0 items-center justify-center">
                              {isBreak ? (
                                <span
                                  title="Break"
                                  className="grid h-7 w-7 place-items-center rounded-lg bg-amber-50 text-amber-600"
                                >
                                  <Coffee size={15} strokeWidth={1.85} />
                                </span>
                              ) : isVisited ? (
                                <span
                                  title="Visited"
                                  className="grid h-7 w-7 place-items-center rounded-lg bg-green-50 text-green-600"
                                >
                                  <CheckCircle2 size={15} strokeWidth={1.85} />
                                </span>
                              ) : (
                                <span
                                  title="Planned attraction"
                                  className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600"
                                >
                                  <MapPin size={15} strokeWidth={1.85} />
                                </span>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="truncate text-sm font-medium text-slate-900">
                                  {item.title}
                                </p>
                                {isBreak ? (
                                  <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
                                    Break
                                  </span>
                                ) : isVisited ? (
                                  <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-medium text-green-700">
                                    Visited
                                  </span>
                                ) : null}
                              </div>
                              {item.sub && (
                                <p className="mt-0.5 truncate text-xs text-slate-500">
                                  {item.sub}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {featuredStops.length > 7 && (
                        <div className="pt-3 text-center">
                          <button
                            type="button"
                            onClick={() => navigate(`/itinerary/${featured.id}`)}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700"
                          >
                            View all {featuredStops.length} stops for Day{' '}
                            {activeDay?.day || selectedDayIdx + 1}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Live-Synced Route Map & Saved Trips */}
            <div className="space-y-6 xl:col-span-5">
              {/* Route Map Panel */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
                  <div>
                    <h2 className="font-['Nunito'] text-lg font-semibold text-slate-900">
                      Route Map
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                      {featured
                        ? `${mapStops.length} ${mapStops.length === 1 ? 'stop' : 'stops'} shown (${
                            mapScope === 'day'
                              ? `Day ${activeDay?.day || selectedDayIdx + 1}`
                              : 'All days'
                          })`
                        : 'No itinerary selected'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {featured && featured.days?.length > 1 && (
                      <div
                        role="group"
                        aria-label="Map stop scope"
                        className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs"
                      >
                        <button
                          type="button"
                          onClick={() => setMapScope('day')}
                          className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                            mapScope === 'day'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Day {activeDay?.day || selectedDayIdx + 1}
                        </button>
                        <button
                          type="button"
                          onClick={() => setMapScope('trip')}
                          className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                            mapScope === 'trip'
                              ? 'bg-white text-slate-900 shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          All
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          featured ? `/map?itinerary=${featured.id}` : '/map',
                        )
                      }
                      className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                    >
                      Full map
                      <ArrowRight size={14} strokeWidth={1.85} />
                    </button>
                  </div>
                </div>

                {featured ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Open full route map for ${featured.tripName || featured.destination}`}
                    onClick={() => navigate(`/map?itinerary=${featured.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/map?itinerary=${featured.id}`)
                      }
                    }}
                    className="group relative h-60 w-full cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none focus-visible:ring-inset"
                  >
                    <div className="absolute inset-0 z-10 bg-slate-900/0 transition-colors duration-200 group-hover:bg-slate-900/5" />
                    <MapWidget
                      stops={mapStops}
                      interactive={false}
                      className=" pointer-events-none h-full w-full"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/map')}
                    className="flex h-60 w-full flex-col items-center justify-center bg-slate-50 px-6 text-center transition-colors hover:bg-slate-100/80"
                  >
                    <div className="grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white text-blue-600 shadow-2xs">
                      <Route size={22} strokeWidth={1.85} />
                    </div>
                    <p className="mt-3 font-['Nunito'] text-sm font-semibold text-slate-900">
                      Open route map
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Inspect markers and route ordering across the Philippines
                    </p>
                  </button>
                )}
              </div>

              {/* Saved Trips Panel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-['Nunito'] text-lg font-semibold text-slate-900">
                      Saved Trips
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Select a trip to preview its schedule or open full details
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/itineraryPage')}
                    className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  >
                    See all
                    <ArrowRight size={14} strokeWidth={1.85} />
                  </button>
                </div>

                {itineraries.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No saved trips yet.
                  </p>
                ) : (
                  <div className="mt-4 divide-y divide-slate-100">
                    {itineraries.slice(0, 4).map((trip) => {
                      const isActive = Number(featured?.id) === Number(trip.id)
                      return (
                        <div
                          key={trip.id}
                          className={`flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1 ${
                            isActive ? 'rounded-xl bg-blue-50/50 px-2.5 -mx-2.5' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleSelectTrip(trip.id)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                          >
                            <div
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-colors ${
                                isActive
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <MapPin size={17} strokeWidth={1.85} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-900">
                                {trip.tripName || trip.destination}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
                                {formatDateRange(trip.dateStart, trip.dateEnd)}
                              </p>
                            </div>
                          </button>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 tabular-nums">
                              {trip.attractionCount || 0} stops
                            </span>
                            <button
                              type="button"
                              title={`Open ${trip.tripName || 'itinerary'}`}
                              aria-label={`Open ${trip.tripName || 'itinerary'}`}
                              onClick={() => navigate(`/itinerary/${trip.id}`)}
                              className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                            >
                              <ExternalLink size={15} strokeWidth={1.85} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
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
