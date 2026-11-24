import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useTripPlan } from "../contexts/TripPlanContext";
import daytour from "../assets/dayTour.png";
import overnight from "../assets/overnight.png";

const tripTypes = [
  {
    id: "day",
    title: "Day Tour",
    desc: "Return home the same day",
    img: daytour,
  },
  {
    id: "overnight",
    title: "Overnight Trip",
    desc: "Stay at least one night",
    img: overnight,
  },
];

export default function TripTypeModal({ onClose = () => {} }) {
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const { updateFormData } = useTripPlan();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred overlay */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/30 z-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white rounded-2xl p-12 w-full max-w-2xl mx-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3 text-3xl">  ✈️</div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-1"> Choose Your Trip Type</h2>
          <p className="text-sm text-slate-500">   Choose what type of vacation you will be having. </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 gap-4 mb-7">
          {tripTypes.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              isSelected={selected === trip.id}
              onSelect={() => setSelected(trip.id)}
            />
          ))}
        </div>

        {/* Footer */}
        <button
          disabled={!selected}
          onClick={() => {
            updateFormData('tripType', selected);
            navigate('/trip-plan');
            onClose();
          }}
          className={`w-full py-3 rounded-lg font-semibold text-sm tracking-wider transition-all ${
            selected
              ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer active:scale-95"
              : "bg-blue-200 text-blue-400 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function TripCard({ trip, isSelected, onSelect }) {
  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" || e.key === " ") && onSelect()}
      className={`flex flex-col items-center text-center p-4 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "bg-blue-200 border-2 border-blue-600"
          : "bg-slate-100 border-2 border-transparent hover:bg-blue-100 hover:-translate-y-1"
      }`}
    >
      {/* Image placeholder */}
      <div className="w-24 h-24 rounded-lg mb-3 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {trip.img ? (
          <img
            src={trip.img}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-blue-400">Image here</span>
        )}
      </div>

      <p className="text-sm font-semibold text-slate-800 mb-1">
        {trip.title}
      </p>
      <p className="text-xs text-slate-600">
        {trip.desc}
      </p>
    </div>
  );
}
