import ProgressBar from "../components/ProgressBar";

export default function Summary({ tripData, onGenerate }) {
  // tripData will be passed in from your wizard/controller
  // Example shape:
  // {
  //   city: "Zambales",
  //   hotel: "Hotel ABC",
  //   startDate: "2026-04-01T08:00",
  //   endDate: "2026-04-05T20:00",
  //   maxAttractions: 5,
  //   budget: "Balanced",
  //   attractions: ["Grand Palace", "Temple of Dawn"],
  //   preference: "Moderate",
  //   breaks: { include: true, meals: { breakfast: "08:00", lunch: null, dinner: "19:00" } }
  // }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Progress Bar */}
      <ProgressBar currentStep={4} />

      {/* Header */}
      <header className="p-4 border-b border-gray-300 bg-white">
        <a href="/dashboard" className="text-blue-700 font-medium">
          ← Back to Dashboard
        </a>
      </header>

      {/* Content */}
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Trip Summary</h2>
          <p className="text-gray-500">Review your selections before generating your itinerary.</p>

          {/* Trip Plan */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-2">Trip Plan</h3>
            <ul className="text-gray-600 space-y-1">
              <li><strong>City:</strong> {tripData.city}</li>
              <li><strong>Hotel:</strong> {tripData.hotel}</li>
              <li><strong>Start Date:</strong> {tripData.startDate?.toString()}</li>
              <li><strong>End Date:</strong> {tripData.endDate?.toString()}</li>
              <li><strong>Max Attractions per Day:</strong> {tripData.maxAttractions}</li>
              <li><strong>Budget:</strong> {tripData.budget}</li>
            </ul>
          </section>

          {/* Attractions */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-2">Selected Attractions</h3>
            {tripData.attractions?.length ? (
              <ul className="list-disc list-inside text-gray-600">
                {tripData.attractions.map((a, idx) => (
                  <li key={idx}>{a}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No attractions selected.</p>
            )}
          </section>

          {/* Preference */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-2">Travel Preference</h3>
            <p className="text-gray-600">{tripData.preference || "Not set"}</p>
          </section>

          {/* Breaks */}
          <section>
            <h3 className="font-semibold text-gray-700 mb-2">Break Preference</h3>
            {tripData.breaks?.include ? (
              <div className="space-y-1 text-gray-600">
                <p>Meal breaks included:</p>
                {Object.entries(tripData.breaks.meals).map(([meal, time]) =>
                  time ? (
                    <p key={meal}>
                      <strong>{meal.charAt(0).toUpperCase() + meal.slice(1)}:</strong> {time}
                    </p>
                  ) : null
                )}
              </div>
            ) : (
              <p className="text-gray-500">No breaks scheduled.</p>
            )}
          </section>

          {/* Generate Button */}
          <button
            onClick={onGenerate}
            className="w-full bg-blue-700 text-white py-2 rounded font-medium hover:bg-blue-800"
          >
            Generate Itinerary
          </button>
        </div>
      </main>
    </div>
  );
}