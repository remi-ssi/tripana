export default function LeavePageModal({ onStay, onLeave, isOpen = false }) {
  if (!isOpen) return null;

  const handleStay = () => {
    onStay?.();
  };

  const handleLeave = () => {
    onLeave?.();
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      {/* Modal Card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm px-8 py-8 text-center">

        {/* Red X Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-blue-700 leading-snug mb-2">
          Are you sure you want to <br /> leave the page?
        </h2>

        {/* Subtext */}
        <p className="text-gray-500 text-sm mb-7">
          Unsaved changes will be lost if you leave this page
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleStay}
            className="flex-1 py-3 rounded-full bg-gray-200 hover:bg-gray-300 active:scale-[0.98] text-gray-700 font-semibold text-sm transition-all duration-200"
          >
            Stay
          </button>
          <button
            onClick={handleLeave}
            className="flex-1 py-3 rounded-full bg-red-700 hover:bg-red-800 active:scale-[0.98] text-white font-semibold text-sm transition-all duration-200 shadow-sm"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}