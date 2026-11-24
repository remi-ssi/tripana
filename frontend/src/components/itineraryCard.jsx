import { useState } from "react";
import { CalendarDays } from "lucide-react";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
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
            className="bg-white rounded-2xl overflow-hidden flex flex-col border border-blue-100 h-fit"
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
                    className="font-bold text-lg leading-snug line-clamp-2 mb-1"
                    style={{ color: BRAND.navy }}
                >
                    {itinerary.tripName}
                </h3>

                {/* Destination */}
                <p className="text-sm text-slate-400 flex items-center gap-1 truncate">
                    <span style={{ color: BRAND.orange }}>📍</span>
                    {itinerary.destination}
                </p>
            </div>
            {/* ── Details ── */}
            <div className="px-4 pb-4 flex flex-col gap-1">
                {/* Dates */}
                <div className="flex items-start gap-1.5">
                    <CalendarDays size={24} className="text-blue-600 flex-shrink-0" />
                    <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">
                            Dates
                        </p>
                        <p className="text-[12px] font-medium text-slate-600">
                            {formatDate(itinerary.dateStart)} – {formatDate(itinerary.dateEnd)}
                        </p>
                    </div>
                </div>
            </div>
        </div>  
    );
}
