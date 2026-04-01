// src/pages/TripPlan.jsx
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Hotel, MapPin, Wallet } from "lucide-react";
import ProgressBar from "../components/ProgressBar";

export default function TripPlan({ onNext }) {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Progress Bar */}
      <ProgressBar currentStep={0} />

      {/* Form Section */}
      <main className="flex-1 p-8">
        <form
          className="max-w-lg mx-auto space-y-6 bg-white p-6 rounded-lg shadow"
          onSubmit={(e) => {
            e.preventDefault();
            onNext();
          }}
        >
          {/* City */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              City*
            </label>
            <div className="flex items-center border rounded px-3 py-2">
              <MapPin className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="e.g., Zambales"
                className="flex-1 outline-none"
              />
            </div>
          </div>

          {/* Hotel */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Hotel*
            </label>
            <div className="flex items-center border rounded px-3 py-2">
              <Hotel className="w-5 h-5 text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="e.g., Zambales"
                className="flex-1 outline-none"
              />
            </div>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Start Date*
            </label>
            <div className="flex items-center border rounded px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                placeholderText="Select start date"
                className="flex-1 outline-none"
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              End Date*
            </label>
            <div className="flex items-center border rounded px-3 py-2">
              <Calendar className="w-5 h-5 text-gray-500 mr-2" />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                placeholderText="Select end date"
                className="flex-1 outline-none"
                showTimeSelect
                dateFormat="MMMM d, yyyy h:mm aa"
              />
            </div>
          </div>

          {/* Max Attractions */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Max Attractions per Day*
            </label>
            <input
              type="number"
              placeholder="e.g., 5"
              className="w-full border rounded px-3 py-2 outline-none"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Budget*
            </label>
            <div className="flex gap-4">
              {[
                { label: "Budget-friendly 💸", value: "budget" },
                { label: "Balanced 👜", value: "balanced" },
                { label: "Luxury ✨", value: "luxury" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 border rounded px-3 py-2 cursor-pointer hover:border-blue-700"
                >
                  <Wallet className="w-5 h-5 text-gray-500" />
                  <input type="radio" name="budget" value={option.value} />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 rounded font-medium hover:bg-blue-800"
          >
            Continue to Select Attraction
          </button>
        </form>
      </main>
    </div>
  );
}