import ProgressBar from "../components/ProgressBar";

export default function Attractions({ onNext }) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Progress Bar */}
      <ProgressBar currentStep={1} />

      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Select the attractions you’d like to visit during your trip
          </h2>

          {/* Placeholder cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border rounded-lg shadow-sm p-4 flex flex-col"
              >
                <div className="h-32 bg-gray-200 rounded mb-3 flex items-center justify-center text-gray-500">
                  Image Placeholder {i}
                </div>
                <h3 className="font-medium text-gray-700">Attraction {i}</h3>
                <p className="text-sm text-gray-500">
                  Description placeholder for attraction {i}.
                </p>
                <button className="mt-3 bg-blue-700 text-white py-1 rounded hover:bg-blue-800">
                  Select
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={onNext}
            className="w-full bg-blue-700 text-white py-2 rounded font-medium hover:bg-blue-800"
          >
            Continue to Preference
          </button>
        </div>
      </main>
    </div>
  );
}