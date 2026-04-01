import { useState } from "react";
import ProgressBar from "../components/ProgressBar";

export default function Break({ onNext }) {
  const [includeBreaks, setIncludeBreaks] = useState(true);
  const [meals, setMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Progress Bar */}
      <ProgressBar currentStep={3} />

      {/* Header */}
      <header className="p-4 border-b border-gray-300 bg-white">
        <a href="/dashboard" className="text-blue-700 font-medium">
          ← Back to Dashboard
        </a>
      </header>

      {/* Content */}
      <main className="flex-1 p-8">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow space-y-6">
          <h2 className="text-xl font-semibold text-gray-700">Break Preference</h2>
          <p className="text-gray-500">
            Select your travel preference for this trip
          </p>

          {/* Break Options */}
          <div className="space-y-4">
            <label
              className={`flex flex-col border rounded px-4 py-3 cursor-pointer ${
                includeBreaks ? "border-blue-700" : "hover:border-blue-700"
              }`}
            >
              <span className="font-medium text-gray-700">Yes, include breaks</span>
              <span className="text-sm text-gray-500">
                Schedule meal times during your trip for a balanced itinerary.
              </span>
              <input
                type="radio"
                name="breaks"
                checked={includeBreaks}
                onChange={() => setIncludeBreaks(true)}
                className="hidden"
              />
            </label>

            <label
              className={`flex flex-col border rounded px-4 py-3 cursor-pointer ${
                !includeBreaks ? "border-blue-700" : "hover:border-blue-700"
              }`}
            >
              <span className="font-medium text-gray-700">No, skip breaks</span>
              <span className="text-sm text-gray-500">
                Maximize attraction visits without scheduled meal breaks.
              </span>
              <input
                type="radio"
                name="breaks"
                checked={!includeBreaks}
                onChange={() => setIncludeBreaks(false)}
                className="hidden"
              />
            </label>
          </div>

          {/* Meal Times (only if includeBreaks is true) */}
          {includeBreaks && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">
                Select Meal Times
              </h3>
              <p className="text-gray-500">
                Choose which meals you'd like to schedule and set your preferred times.
              </p>

              {/* Breakfast */}
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={meals.breakfast}
                  onChange={() =>
                    setMeals({ ...meals, breakfast: !meals.breakfast })
                  }
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-700">Breakfast</span>
                  <p className="text-sm text-gray-500">Morning meal</p>
                </div>
                {meals.breakfast && (
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="border rounded px-2 py-1"
                  />
                )}
              </div>

              {/* Lunch */}
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={meals.lunch}
                  onChange={() => setMeals({ ...meals, lunch: !meals.lunch })}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-700">Lunch</span>
                  <p className="text-sm text-gray-500">Midday meal</p>
                </div>
                {meals.lunch && (
                  <input
                    type="time"
                    defaultValue="12:00"
                    className="border rounded px-2 py-1"
                  />
                )}
              </div>

              {/* Dinner */}
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={meals.dinner}
                  onChange={() => setMeals({ ...meals, dinner: !meals.dinner })}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-700">Dinner</span>
                  <p className="text-sm text-gray-500">Evening meal</p>
                </div>
                {meals.dinner && (
                  <input
                    type="time"
                    defaultValue="19:00"
                    className="border rounded px-2 py-1"
                  />
                )}
              </div>
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={onNext}
            className="w-full bg-blue-700 text-white py-2 rounded font-medium hover:bg-blue-800"
          >
            View Summary
          </button>
        </div>
      </main>
    </div>
  );
}