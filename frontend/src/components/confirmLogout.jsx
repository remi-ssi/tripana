export default function LogoutConfirmation({ onConfirm, onCancel, isLoading = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15 backdrop-blur-[1px]">
      <div className="bg-gray-100 rounded-2xl shadow-2xl px-8 py-6 w-80 text-center border border-white/60">
        <h2 className="text-xl font-bold text-gray-800 mb-1">Logout Confirmation</h2>
        <p className="text-gray-500 text-sm mb-6">Are you sure you want to log out?</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-800 hover:bg-red-900 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            {isLoading ? "Logging out..." : "Confirm"}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg transition-colors duration-200 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}