import ProgressBar from "../components/ProgressBar";

export default function Preference({ onNext }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Progress Bar */}
      <ProgressBar currentStep={2} />

      {/* Header */}
      <header className="p-4 border-b border-gray-300 bg-white">
        <a href="/dashboard" className="text-blue-700 font-medium">
          ← Back to Dashboard
        </a>
      </header>

      {/* Content */}
      <main className="flex-1 p-8">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Trip Preference</h2>
          <p className="text-gray-500">
            Select your travel preference for this trip
          </p>

          {/* Travel Pace Options */}
          <div className="space-y-4">
            {[
              { label: "Relaxed", desc: "Take it easy and enjoy" },
              { label: "Moderate", desc: "Balanced exploration" },
              { label: "Fast-paced", desc: "See as much as possible" },
            ].map((option, idx) => (
              <label
                key={idx}
                className="flex flex-col border rounded px-4 py-3 cursor-pointer hover:border-blue-700"
              >
                <span className="font-medium text-gray-700">{option.label}</span>
                <span className="text-sm text-gray-500">{option.desc}</span>
                <input
                  type="radio"
                  name="pace"
                  value={option.label.toLowerCase()}
                  className="hidden"
                />
              </label>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={onNext}
            className="w-full bg-blue-700 text-white py-2 rounded font-medium hover:bg-blue-800"
          >
            Continue to Break
          </button>
        </div>
      </main>
    </div>
  );
}