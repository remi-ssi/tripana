import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Compass,
  Loader2,
  Map,
  Plus,
  Search,
  Sun,
  X,
} from 'lucide-react'
import ItineraryCard from '../components/itineraryCard'
import Sidebar from '../components/dashboardNav'
import TripTypeModal from '../components/tripType'
import { useAuth } from '../hooks/AuthProfile'
import { authService } from '../services/authService'
import { itineraryService } from '../services/iteneraryService'

const CARDS_PER_PAGE = 9
const FILTERS = ['All trips', 'Overnight', 'Day tour']

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <nav
      aria-label="Itineraries pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={14} strokeWidth={2} />
        <span>Prev</span>
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => {
        const isCurrent = page === currentPage
        return (
          <button
            key={page}
            type="button"
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => onPageChange(page)}
            className={`grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
              isCurrent
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {page}
          </button>
        )
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="inline-flex min-h-[38px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>Next</span>
        <ChevronRight size={14} strokeWidth={2} />
      </button>
    </nav>
  )
}

export default function ItineraryPage() {
  const navigate = useNavigate()
  const { user, clearUser } = useAuth()
  const [itineraries, setItineraries] = useState([])
  const [page, setPage] = useState(1)
  const [showTripModal, setShowTripModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('All trips')
  const [search, setSearch] = useState('')

  useEffect(() => {
    let active = true

    itineraryService
      .list()
      .then((items) => {
        if (active) setItineraries(items)
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.message || 'Failed to load itineraries')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const summaryStats = useMemo(() => {
    const overnightCount = itineraries.filter((i) => i.tripType === 'Overnight').length
    const dayTourCount = itineraries.filter((i) => i.tripType === 'Day Tour').length
    return [
      {
        label: 'Total Trips',
        value: itineraries.length,
        sub: 'Saved plans in your workspace',
        icon: Map,
      },
      {
        label: 'Multi-Day Trips',
        value: overnightCount,
        sub: 'Overnight schedules with lodging',
        icon: CalendarDays,
      },
      {
        label: 'Day Tours',
        value: dayTourCount,
        sub: 'Single-day attraction routes',
        icon: Sun,
      },
    ]
  }, [itineraries])

  const filtered = useMemo(() => {
    return itineraries.filter((it) => {
      const matchFilter =
        activeFilter === 'All trips' ||
        (activeFilter === 'Overnight' && it.tripType === 'Overnight') ||
        (activeFilter === 'Day tour' && it.tripType === 'Day Tour')
      const query = search.trim().toLowerCase()
      const matchSearch =
        !query ||
        (it.tripName || '').toLowerCase().includes(query) ||
        (it.destination || '').toLowerCase().includes(query)
      return matchFilter && matchSearch
    })
  }, [itineraries, activeFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / CARDS_PER_PAGE))
  const startIdx = (page - 1) * CARDS_PER_PAGE
  const visible = filtered.slice(startIdx, startIdx + CARDS_PER_PAGE)

  const handlePageChange = (nextPage) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
        {/* Top Workspace Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-['Nunito'] text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                My Itineraries
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Browse, filter, and manage your saved day tours and multi-day travel schedules.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowTripModal(true)}
              className="inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-2xs transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Plus size={17} strokeWidth={2} />
              <span>Plan a Trip</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-8 lg:px-8">
          {/* Summary Stats Row */}
          <section
            aria-label="Itinerary statistics"
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {summaryStats.map(({ label, value, sub, icon: StatIcon }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div>
                  <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                    {label}
                  </p>
                  <p className="mt-1.5 font-['Nunito'] text-2xl font-semibold text-slate-900 tabular-nums sm:text-3xl">
                    {value}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
                </div>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                  <StatIcon size={20} strokeWidth={1.85} />
                </div>
              </div>
            ))}
          </section>

          {/* Search & Filter Toolbar */}
          <section className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={16}
                strokeWidth={1.85}
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                aria-label="Search itineraries by trip name or destination"
                placeholder="Search by trip name or destination..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pr-9 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch('')
                    setPage(1)
                  }}
                  className="absolute top-1/2 right-2.5 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label="Filter itineraries by trip type"
              className="flex flex-wrap items-center gap-1.5"
            >
              {FILTERS.map((filterName) => {
                const isActive = activeFilter === filterName
                return (
                  <button
                    key={filterName}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filterName)
                      setPage(1)
                    }}
                    className={`min-h-[38px] rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {filterName}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Content States */}
          {loading && (
            <div className="flex items-center justify-center py-24 text-slate-500">
              <div className="flex items-center gap-2.5 text-sm font-medium">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span>Loading itineraries...</span>
              </div>
            </div>
          )}

          {!loading && error && (
            <div
              role="alert"
              className="mx-auto flex max-w-lg items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <AlertCircle size={18} strokeWidth={1.85} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && itineraries.length === 0 && (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <Compass size={22} strokeWidth={1.85} />
              </div>
              <h2 className="mt-4 font-['Nunito'] text-xl font-semibold text-slate-900">
                No itineraries yet
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Create a trip plan and Tripana will organize and save your day-by-day route here.
              </p>
              <button
                type="button"
                onClick={() => setShowTripModal(true)}
                className="mt-6 inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              >
                <Plus size={16} strokeWidth={2} />
                <span>Create your first itinerary</span>
              </button>
            </div>
          )}

          {!loading && !error && itineraries.length > 0 && filtered.length === 0 && (
            <div className="mx-auto mt-8 max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-xs">
              <h2 className="font-['Nunito'] text-lg font-semibold text-slate-900">
                No matching itineraries
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Try adjusting your search keywords or trip type filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setActiveFilter('All trips')
                }}
                className="mt-5 inline-flex min-h-[38px] items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              >
                Reset filters
              </button>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <section aria-label="Saved itineraries">
              <div className="mb-4 flex items-center justify-between text-xs text-slate-500 tabular-nums">
                <p>
                  Showing{' '}
                  <span className="font-semibold text-slate-900">
                    {startIdx + 1}-{Math.min(startIdx + CARDS_PER_PAGE, filtered.length)}
                  </span>{' '}
                  of{' '}
                  <span className="font-semibold text-slate-900">{filtered.length}</span>{' '}
                  {filtered.length !== itineraries.length ? 'matching ' : ''}
                  {filtered.length === 1 ? 'itinerary' : 'itineraries'}
                </p>
                <p>
                  Page {page} of {totalPages}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((itinerary) => (
                  <ItineraryCard
                    key={itinerary.id}
                    itinerary={itinerary}
                    onClick={() => navigate(`/itinerary/${itinerary.id}`)}
                  />
                ))}
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </section>
          )}
        </main>
      </div>

      {showTripModal && (
        <TripTypeModal onClose={() => setShowTripModal(false)} />
      )}
    </div>
  )
}
