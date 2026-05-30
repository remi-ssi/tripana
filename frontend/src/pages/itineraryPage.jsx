import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ItineraryCard from "../components/itineraryCard";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND = {
    navy: "#1E3A5F",
    blue: "#2563EB",
    orange: "#F6821F",
};

const CARDS_PER_PAGE = 15; // 3 columns × 5 rows

// ─── Mock data — replace with your real API fetch ─────────────────────────────
const ALL_ITINERARIES = Array.from({ length: 32 }, (_, i) => ({
    id: i + 1,
    tripName: [
        "Boracay Escapade", "Palawan Adventure", "Siargao Surfing Trip", "BGC City Walk",
        "Batanes Highlands", "Cebu Heritage Tour", "Davao Explorer", "Bohol Wonders",
        "Vigan Heritage Walk", "Sagada Mountain Escape", "Iloilo Food Trip", "Baguio Retreat",
        "Coron Island Hopping", "El Nido Getaway", "Camiguin Discovery",
        "Dumaguete Chill Trip", "Tagaytay Weekend", "Zamboanga Cultural Tour",
        "Batangas Dive Trip", "La Union Surf Break",
    ][i % 20] + (i >= 20 ? ` ${Math.floor(i / 20) + 1}` : ""),
    destination: [
        "Boracay, Aklan", "Puerto Princesa, Palawan", "Siargao, Surigao del Norte",
        "Bonifacio Global City, Taguig", "Batan Island, Batanes", "Cebu City, Cebu",
        "Davao City, Davao del Sur", "Tagbilaran, Bohol", "Vigan City, Ilocos Sur",
        "Sagada, Mountain Province", "Iloilo City, Iloilo", "Baguio City, Benguet",
        "Coron, Palawan", "El Nido, Palawan", "Mambajao, Camiguin",
        "Dumaguete City, Negros Oriental", "Tagaytay City, Cavite",
        "Zamboanga City", "Anilao, Batangas", "San Juan, La Union",
    ][i % 20],
    tripType: ["Overnight", "Day Tour"][i % 2],
    dateStart: `2025-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, "0")}`,
    dateEnd: `2025-0${(i % 9) + 2}-${String(((i + 3) % 27) + 1).padStart(2, "0")}`,
    budget: [
        5000, 12000, 8500, 3200, 20000, 15000, 9800, 6700, 11000, 4500,
        25000, 7300, 18000, 22000, 10500, 8000, 5500, 13000, 16000, 9000,
    ][i % 20],
    pacing: ["Relaxed", "Moderate", "Fast-paced"][i % 3],
}));

// ─── Pagination (inline) ──────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                   disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50"
                style={{ borderColor: BRAND.blue, color: BRAND.blue, backgroundColor: "white" }}
            >
                ← Prev
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className="w-9 h-9 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                    style={{
                        backgroundColor: p === currentPage ? BRAND.blue : "white",
                        color: p === currentPage ? "white" : BRAND.navy,
                        border: `1px solid ${p === currentPage ? BRAND.blue : "#BFDBFE"}`,
                    }}
                >
                    {p}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                   disabled:opacity-30 disabled:cursor-not-allowed hover:bg-blue-50"
                style={{ borderColor: BRAND.blue, color: BRAND.blue, backgroundColor: "white" }}
            >
                Next →
            </button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ItineraryPage() {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);

    const totalPages = Math.ceil(ALL_ITINERARIES.length / CARDS_PER_PAGE);
    const startIdx = (page - 1) * CARDS_PER_PAGE;
    const visible = ALL_ITINERARIES.slice(startIdx, startIdx + CARDS_PER_PAGE);

    const handlePageChange = (p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCardClick = (id) => navigate(`/itinerary/${id}`);

    return (
        <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#EEF3FA" }}>

            {/* ── Sticky header ── */}
            <div
                className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-sm"
                style={{ backgroundColor: BRAND.navy }}
            >
                {/* Logo — click goes to /dashboard */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="focus:outline-none"
                    aria-label="Go to dashboard"
                >
                    {/*
            INSERT YOUR LOGO HERE:
            <img src={tripanaLogo} alt="Tripana" className="h-8 w-auto" />
          */}
                    <div className="h-8 w-24 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white/40 text-xs">
                        {/* logo */}
                    </div>
                </button>

                <h1 className="text-white font-bold text-lg tracking-tight">My Itineraries</h1>

                <button
                    onClick={() => navigate("/itinerary/new")}
                    className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
                    style={{ backgroundColor: BRAND.orange, color: "white" }}
                >
                    + New
                </button>
            </div>

            {/* ── Main content ── */}
            <div className="flex-1 px-6 py-6 max-w-screen-xl mx-auto w-full">

                {/* Summary row */}
                <div className="flex items-center justify-between mb-5">
                    <p className="text-sm text-slate-500">
                        Showing{" "}
                        <span className="font-semibold" style={{ color: BRAND.navy }}>
                            {startIdx + 1}–{Math.min(startIdx + CARDS_PER_PAGE, ALL_ITINERARIES.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold" style={{ color: BRAND.navy }}>
                            {ALL_ITINERARIES.length}
                        </span>{" "}
                        itineraries
                    </p>
                    <p className="text-xs text-slate-400">
                        Page {page} of {totalPages}
                    </p>
                </div>

                {/* ── 3 × 5 card grid ── */}
                <div className="grid grid-cols-3 gap-4">
                    {visible.map((itin) => (
                        <ItineraryCard
                            key={itin.id}
                            itinerary={itin}
                            onClick={() => handleCardClick(itin.id)}
                        />
                    ))}

                    {/* Ghost cards keep the grid stable on the last page */}
                    {visible.length < CARDS_PER_PAGE &&
                        Array.from({ length: CARDS_PER_PAGE - visible.length }).map((_, i) => (
                            <div key={`ghost-${i}`} className="rounded-2xl opacity-0 pointer-events-none" />
                        ))}
                </div>

                {/* ── Pagination ── */}
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}