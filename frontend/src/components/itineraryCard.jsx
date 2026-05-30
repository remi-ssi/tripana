import { useState } from "react";

// ─── Brand ────────────────────────────────────────────────────────────────────
const BRAND = {
    navy: "#1E3A5F",
    blue: "#2563EB",
    orange: "#F6821F",
};

// ─── Trip type badge colors ───────────────────────────────────────────────────
const TRIP_TYPE_COLORS = {
    "Overnight": { bg: "#EFF6FF", text: "#2563EB" },
    "Day Tour": { bg: "#FFEDD5", text: "#C2410C" },
};

// ─── Pacing icons ─────────────────────────────────────────────────────────────
const PACING_ICONS = {
    "Relaxed": "🐢",
    "Moderate": "🚶",
    "Fast-paced": "🏃",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function formatBudget(amount) {
    return "₱" + amount.toLocaleString("en-PH");
}

// ─── Component ────────────────────────────────────────────────────────────────
/**
 * ItineraryCard
 *
 * Props:
 *   itinerary {object}
 *     - id          {number|string}
 *     - tripName    {string}
 *     - destination {string}
 *     - tripType    {"Overnight" | "Day Tour"}
 *     - dateStart   {string}  ISO date e.g. "2025-03-10"
 *     - dateEnd     {string}  ISO date e.g. "2025-03-12"
 *     - budget      {number}
 *     - pacing      {"Relaxed" | "Moderate" | "Fast-paced"}
 *
 *   onClick {function}  called when card is clicked
 */
export default function ItineraryCard({ itinerary, onClick }) {
    const [hovered, setHovered] = useState(false);

    const typeColor =
        TRIP_TYPE_COLORS[itinerary.tripType] ?? { bg: "#F1F5F9", text: "#334155" };

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                transform: hovered ? "translateY(-6px)" : "translateY(0)",
                boxShadow: hovered
                    ? "0 16px 40px rgba(37, 99, 235, 0.18), 0 4px 12px rgba(0,0,0,0.08)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                transition: "transform 0.22s ease, box-shadow 0.22s ease",
                cursor: "pointer",
                borderTop: `3px solid ${hovered ? BRAND.orange : BRAND.blue}`,
            }}
            className="bg-white rounded-2xl overflow-hidden flex flex-col border border-blue-100"
        >
            {/* ── Header ── */}
            <div className="px-4 pt-4 pb-3">
                {/* Trip type badge */}
                <span
                    className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2"
                    style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                >
                    {itinerary.tripType}
                </span>

                {/* Trip name */}
                <h3
                    className="font-bold text-sm leading-snug line-clamp-2 mb-1"
                    style={{ color: BRAND.navy }}
                >
                    {itinerary.tripName}
                </h3>

                {/* Destination */}
                <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                    <span style={{ color: BRAND.orange }}>📍</span>
                    {itinerary.destination}
                </p>
            </div>

            {/* ── Divider ── */}
            <div className="h-px bg-blue-50 mx-4" />

            {/* ── Details ── */}
            <div className="px-4 py-3 flex flex-col gap-2 flex-1">
                {/* Dates */}
                <div className="flex items-start gap-1.5">
                    <span className="text-[11px] mt-0.5">🗓️</span>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">
                            Dates
                        </p>
                        <p className="text-xs font-medium text-slate-600">
                            {formatDate(itinerary.dateStart)} – {formatDate(itinerary.dateEnd)}
                        </p>
                    </div>
                </div>

                {/* Budget */}
                <div className="flex items-start gap-1.5">
                    <span className="text-[11px] mt-0.5">💰</span>
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">
                            Budget
                        </p>
                        <p className="text-xs font-bold" style={{ color: BRAND.orange }}>
                            {formatBudget(itinerary.budget)}
                        </p>
                    </div>
                </div>

                {/* Pacing */}
                <div className="flex items-center gap-1.5 mt-auto pt-1">
                    <span className="text-[11px]">{PACING_ICONS[itinerary.pacing]}</span>
                    <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#EFF6FF", color: BRAND.blue }}
                    >
                        {itinerary.pacing}
                    </span>
                </div>
            </div>
        </div>
    );
}