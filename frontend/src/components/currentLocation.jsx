/**
 * CurrentLocationPermissionModal — asks user permission to access device location
 *
 * Props:
 *   isOpen       {boolean}  — whether the modal is visible
 *   onConfirm    {function} — called when user clicks "Allow"
 *   onCancel     {function} — called when user clicks "Decline"
 *   isLoading    {boolean}  — whether request is in progress
 */
export default function CurrentLocationPermissionModal({ isOpen, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
      style={{ animation: 'fadeIn .2s ease' }}
    >
      <div
        className="relative w-[88%] max-w-md rounded-2xl shadow-2xl overflow-hidden bg-white"
        style={{ animation: 'scaleIn .25s ease' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Content ── */}
        <div className="px-6 py-8 text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-600">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-2.083 3.701-5.125 3.701-9.077 0-4.715-3.73-8.293-8-8.293s-8 3.578-8 8.293c0 3.952 1.757 6.994 3.701 9.077a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-800">
            Access Your Location?
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">
            We'd like to use your device's current location to make it easier to select your hotel or accommodation on the map.
          </p>

          {/* Permissions info */}
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-left">
            <p className="text-xs font-semibold text-blue-900 mb-2">🔒 Your privacy matters</p>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Location is only used for this selection</li>
              <li>• You can change permissions anytime</li>
              <li>• We never store your location data</li>
            </ul>
          </div>
        </div>

        {/* ── Buttons ── */}
        <div className="flex gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Getting location…
              </>
            ) : (
              'Allow'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
