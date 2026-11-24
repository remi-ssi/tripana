import { LogOut } from 'lucide-react'

export default function LogoutConfirmation({
  onConfirm,
  onCancel,
  isLoading = false,
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
            <LogOut size={20} strokeWidth={1.9} />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="logout-modal-title"
              className="font-['Nunito'] text-lg font-semibold text-slate-900"
            >
              Log out of Tripana?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              You can sign back in anytime to access your saved itineraries and
              route maps.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="inline-flex min-h-[40px] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-xs transition-colors duration-200 hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50"
          >
            {isLoading ? 'Logging out...' : 'Log Out'}
          </button>
        </div>
      </div>
    </div>
  )
}
