import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ItineraryCard from '../components/itineraryCard'
import Sidebar from '../components/dashboardNav'
import TripTypeModal from '../components/tripType'
import { useAuth } from '../hooks/AuthProfile'
import { authService } from '../services/authService'
import { itineraryService } from '../services/iteneraryService'

const BRAND = {
  navy: '#1E3A5F',
  blue: '#2563EB',
}

const CARDS_PER_PAGE = 9

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50"
        style={{ borderColor: BRAND.blue, color: BRAND.blue, backgroundColor: 'white' }}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className="w-9 h-9 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: page === currentPage ? BRAND.blue : 'white',
            color: page === currentPage ? 'white' : BRAND.navy,
            border: `1px solid ${page === currentPage ? BRAND.blue : '#BFDBFE'}`,
          }}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm font-medium border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50"
        style={{ borderColor: BRAND.blue, color: BRAND.blue, backgroundColor: 'white' }}
      >
        Next
      </button>
    </div>
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
  const [activeFilter, setActiveFilter] = useState("All trips");
  const [search, setSearch] = useState("");

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

  const filtered = itineraries.filter(it => {
    const matchFilter =
      activeFilter === "All trips" ||
      (activeFilter === "Overnight" && it.tripType === "Overnight") ||
      (activeFilter === "Day tour" && it.tripType === "Day Tour")
    const matchSearch = !search ||
      it.tripName.toLowerCase().includes(search.toLowerCase()) ||
      it.destination.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EEF3FA' }}>
      <Sidebar onLogout={handleLogout} user={user} />

      <div className="sticky top-0 z-10 px-6 pt-4 pb-3 shadow-sm"
                style={{ background: "linear-gradient(135deg, #2563EB 0%, #1E3A5F 100%)" }}>

                {/* Top row: title + stats */}
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-white font-bold text-2xl px-20 tracking-tight">My Itineraries</h1>
                    <div className="flex gap-2.5">
                        {[
                           { num: itineraries.length, label: "Total trips" },
                            { num: itineraries.filter(i => i.tripType === "Overnight").length, label: "Overnight" },
                            { num: itineraries.filter(i => i.tripType === "Day Tour").length, label: "Day tours" },
                        ].map(({ num, label }) => (
                            <div key={label}
                                className="text-center px-4 py-2 rounded-xl min-w-[80px]"
                                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)" }}>
                                <div className="text-white text-2xl font-extrabold leading-none">{num}</div>
                                <div className="text-white/60 text-[14px] leading-none font-medium">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Filter + Search bar */}
                <div className="flex items-center justify-between gap-3 bg-#BFDBFE rounded-2xl px-25 py-5">
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 min-w-[950px]
                                    focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400 transition-all">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                        </svg>
                        <input className="bg-transparent outline-none text-md text-slate-900 placeholder-slate-400 w-full"
                            placeholder="Search itineraries..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {["All trips", "Overnight", "Day tour"].map((f) => (
                            <button key={f}
                                    onClick={() => { setActiveFilter(f); setPage(1); }}
                                    className="px-3.5 py-1 rounded-full text-sm font-semibold border-[1.5px] transition-all"
                                    style={{
                                        background: activeFilter === f ? BRAND.blue : "white",
                                        color: activeFilter === f ? "white" : BRAND.navy,
                                        borderColor: activeFilter === f ? BRAND.blue : "#BFDBFE",
                                    }}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

      <main className="flex-1 px-6 py-6 max-w-screen-xl mx-auto w-full">
        {loading && (
          <div className="py-24 text-center text-slate-500">Loading itineraries...</div>
        )}

        {!loading && error && (
          <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && itineraries.length === 0 && (
          <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">No itineraries yet</h2>
            <p className="mt-2 text-sm text-slate-500">
              Create a trip plan and Tripana will build and save the schedule here.
            </p>
            <button
              onClick={() => setShowTripModal(true)}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create your first itinerary
            </button>
          </div>
        )}

        {!loading && !error && itineraries.length > 0 && filtered.length === 0 && (
          <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-slate-800">No matches found</h2>
            <p className="mt-2 text-sm text-slate-500">
              Try a different search term or filter.
            </p>
            <button
              onClick={() => { setSearch(''); setActiveFilter('All trips') }}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Clear filters
            </button>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-semibold" style={{ color: BRAND.navy }}>
                  {startIdx + 1}–{Math.min(startIdx + CARDS_PER_PAGE, filtered.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold" style={{ color: BRAND.navy }}>
                  {filtered.length}
                </span>{' '}
                {filtered.length !== itineraries.length ? 'matching ' : ''}itineraries
              </p>
              <p className="text-xs text-slate-400">
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
          </>
        )}
      </main>

      {showTripModal && (
        <TripTypeModal onClose={() => setShowTripModal(false)} />
      )}
    </div>
  )
}
