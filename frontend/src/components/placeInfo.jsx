import { useState, useEffect } from 'react'
import {
  X,
  Star,
  MapPin,
  Compass,
  Clock,
  Phone,
  Globe,
  Check,
} from 'lucide-react'
import { getAttractionImageUrl, handleImageError } from '../utils/imageUrl'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(rating || 0)
        return (
          <Star
            key={i}
            className={`w-4 h-4 ${
              filled ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'
            }`}
          />
        )
      })}
    </div>
  )
}

function PriceLevel({ level }) {
  const labels = ['Free', 'Budget-friendly', 'Moderate', 'Upscale', 'Luxury']
  const max = 4
  if (level === null || level === undefined) {
    return <span className="text-xs text-slate-400">Price info unavailable</span>
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: max + 1 }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i <= level ? 'bg-blue-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-600">{labels[level]}</span>
    </div>
  )
}

function InfoRow({ Icon, label, children }) {
  return (
    <div className="flex items-start gap-3 py-3 border-t border-slate-100">
      <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
        <Icon className="w-4 h-4 stroke-[1.75]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 mb-0.5 font-medium">
          {label}
        </p>
        <div className="text-sm text-slate-700 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function AttractionModal({ place, isOpen, onClose, onSelect, isSelected }) {
  const [hoursExpanded, setHoursExpanded] = useState(false)

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !place) return null

  const imageUrl = getAttractionImageUrl(place)
  const hours = Array.isArray(place.openinghours)
    ? place.openinghours
    : place.openinghours
    ? [place.openinghours]
    : []

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl border border-slate-200 overflow-hidden shadow-xl flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Hero Image */}
        <div className="relative w-full h-56 flex-shrink-0 bg-slate-100">
          <img
            src={imageUrl}
            alt={place.destination || place.name || 'Attraction'}
            className="w-full h-full object-cover"
            onError={(e) => handleImageError(e, place)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-900/40 backdrop-blur-xs flex items-center justify-center text-white hover:bg-slate-900/65 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>

          {/* Rating badge */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs rounded-full px-3 py-1 shadow-xs tabular-nums">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-slate-900">
              {place.rating ? Number(place.rating).toFixed(1) : 'New'}
            </span>
            {place.userratinqtotal > 0 && (
              <span className="text-xs text-slate-500">
                ({place.userratinqtotal.toLocaleString()})
              </span>
            )}
          </div>

          {/* Name overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
            <h2
              className="text-xl font-semibold text-white leading-snug"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {place.destination}
            </h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <div className="flex items-center justify-between pt-4 pb-2">
            <StarRating rating={place.rating} />
            <PriceLevel level={place.pricelevel} />
          </div>

          <InfoRow label="Address" Icon={MapPin}>
            {place.address}
          </InfoRow>

          <InfoRow label="Coordinates" Icon={Compass}>
            <span className="tabular-nums">
              {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)}
            </span>
          </InfoRow>

          <InfoRow label="Opening Hours" Icon={Clock}>
            {hours.length === 0 ? (
              <span className="text-slate-400">Not available</span>
            ) : hours.length === 1 ? (
              hours[0]
            ) : (
              <div>
                <p>{hours[0]}</p>
                {hoursExpanded && (
                  <div className="mt-1 space-y-0.5">
                    {hours.slice(1).map((h, i) => (
                      <p key={i}>{h}</p>
                    ))}
                  </div>
                )}
                {hours.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setHoursExpanded(!hoursExpanded)}
                    className="mt-1 text-blue-600 text-xs font-medium hover:underline cursor-pointer"
                  >
                    {hoursExpanded ? 'Show less' : `+${hours.length - 1} more days`}
                  </button>
                )}
              </div>
            )}
          </InfoRow>

          {place.phonenumber && (
            <InfoRow label="Phone" Icon={Phone}>
              <a
                href={`tel:${place.phonenumber}`}
                className="text-blue-600 hover:underline tabular-nums"
              >
                {place.phonenumber}
              </a>
            </InfoRow>
          )}

          {place.website && (
            <InfoRow label="Website" Icon={Globe}>
              <a
                href={place.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {place.website.replace(/^https?:\/\//, '')}
              </a>
            </InfoRow>
          )}
        </div>

        {/* Footer Action */}
        <div className="flex-shrink-0 px-5 pb-5 pt-3 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={onSelect}
            className={`w-full py-3.5 px-6 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              isSelected
                ? 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 text-blue-600 stroke-[2.25]" />
                <span>Added to Trip (Click to Remove)</span>
              </>
            ) : (
              <span>Add to Trip</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AttractionModal
