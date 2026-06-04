import { useState, useEffect } from "react";
import { getAttractionImageUrl, handleImageError } from "../utils/imageUrl";


// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.floor(rating);
        const half = !filled && i === Math.ceil(rating) && rating % 1 >= 0.5;
        return (
          <svg key={i} className="w-4 h-4" viewBox="0 0 20 20">
            {half ? (
              <>
                <defs>
                  <linearGradient id={`half-${i}`}>
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#d1d5db" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#half-${i})`}
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </>
            ) : (
              <path
                fill={filled ? "#f59e0b" : "#d1d5db"}
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

function PriceLevel({ level }) {
  const labels = ["Free", "Budget-friendly", "Moderate", "Upscale", "Luxury"];
  const max = 4;
  if (level === null || level === undefined)
    return <span className="text-sm text-gray-400">N/A</span>;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: max + 1 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i <= level ? "bg-blue-600" : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">{labels[level]}</span>
    </div>
  );
}

function InfoRow({ icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-t border-gray-100">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 mb-0.5 font-medium uppercase tracking-wide">
          {label}
        </p>
        <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

function AttractionModal({ place, isOpen, onClose, onSelect, isSelected }) {
  const [hoursExpanded, setHoursExpanded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !place) return null;

  const imageUrl = getAttractionImageUrl(place);
  let hours = [];
  if (Array.isArray(place.openinghours)) {
    hours = place.openinghours;
  } else if (typeof place.openinghours === "string" && place.openinghours.trim()) {
    try {
      const parsed = JSON.parse(place.openinghours);
      if (Array.isArray(parsed)) {
        hours = parsed;
      } else {
        hours = [place.openinghours];
      }
    } catch (e) {
      hours = [place.openinghours];
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ maxHeight: "92vh" }}
      >
        {/* ── Hero image ── */}
        <div className="relative w-full flex-shrink-0" style={{ height: 240 }}>
          <img
            src={imageUrl}
            alt={place.destination || place.name || "Attraction"}
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e, place)}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Rating badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
            <svg className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-semibold text-gray-800">{place.rating}</span>
            <span className="text-xs text-gray-500">({place.userratinqtotal?.toLocaleString()})</span>
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <h2 className="text-xl font-bold text-white leading-tight drop-shadow">
              {place.destination}
            </h2>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">

          {/* Star row + price */}
          <div className="flex items-center justify-between pt-4 pb-1">
            <StarRating rating={place.rating} />
            <PriceLevel level={place.pricelevel} />
          </div>

          {/* Info rows */}
          <InfoRow
            label="Address"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            {place.address}
          </InfoRow>

          <InfoRow
            label="Coordinates"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
          >
            {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)}
          </InfoRow>

          <InfoRow
            label="Opening hours"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            {hours.length === 0 ? (
              <span className="text-gray-400">Not available</span>
            ) : hours.length === 1 ? (
              hours[0]
            ) : (
              <div>
                <p>{hours[0]}</p>
                {hoursExpanded && (
                  <div className="mt-1 space-y-0.5">
                    {hours.slice(1).map((h, i) => <p key={i}>{h}</p>)}
                  </div>
                )}
                {hours.length > 1 && (
                  <button
                    onClick={() => setHoursExpanded(!hoursExpanded)}
                    className="mt-1 text-blue-600 text-xs font-medium hover:underline"
                  >
                    {hoursExpanded ? "Show less" : `+${hours.length - 1} more days`}
                  </button>
                )}
              </div>
            )}
          </InfoRow>

          {place.phonenumber && (
            <InfoRow
              label="Phone"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              }
            >
              <a href={`tel:${place.phonenumber}`} className="text-blue-600 hover:underline">
                {place.phonenumber}
              </a>
            </InfoRow>
          )}

          {place.website && (
            <InfoRow
              label="Website"
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              }
            >
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {place.website.replace(/^https?:\/\//, "")}
              </a>
            </InfoRow>
          )}
        </div>

        {/* ── Footer action ── */}
        <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-gray-100 bg-white">
          <button
            onClick={onSelect}
            className={`w-full py-3.5 rounded-full font-semibold text-sm transition-all duration-200 ${
              isSelected
                ? "bg-teal-500 text-white hover:bg-teal-600"
                : "bg-blue-700 text-white hover:bg-blue-800"
            }`}
          >
            {isSelected ? "✓ Added to trip" : "Add to trip"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AttractionModal;