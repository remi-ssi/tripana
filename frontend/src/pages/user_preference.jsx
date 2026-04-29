import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import foodImg from "../assets/food.png";
import cityImg from "../assets/city.png";
import entertainmentImg from "../assets/entertainment.png";   
import wellnessImg from "../assets/wellness.png";
import adventureImg from "../assets/adventure.png";
import culturalImg from "../assets/cultural.png";
import natureImg from "../assets/nature.png";
import eventsImg from "../assets/events.png";
import { authService } from "../api/authService";
import { useAuth } from "../hooks/AuthProfile";

export default function TravelStylePage() {
  const navigate = useNavigate();
  const { user, setAuthSession } = useAuth();
  const [selected, setSelected] = useState([]);
  const [visible, setVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Staggered fade-in effect for header, grid, and button
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(timer);
  }, []);

  // Toggle category selection
  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Handle saving preferences and navigating to dashboard
  const handleSavePreferences = async () => {
    if (selected.length === 0 || isSaving) {
      return;
    }

    setIsSaving(true);
    setSubmitError("");

    try {
      console.log('[UserPreference] Saving preferences:', selected);
      await authService.savePreferences(selected);
      console.log('[UserPreference] Preferences saved, updating auth state...');
      // Update auth state directly - preferences are now set
      // Don't make another /auth/session request, just update local state
      setAuthSession(user, true);
      console.log('[UserPreference] Auth state updated, navigating to dashboard');
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error('[UserPreference] Error saving preferences:', error);
      setSubmitError(error.message || "Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Category definitions with colors and images
const categories = [
  {
    id: "nature",
    label: "Nature",
    img: natureImg,
    bg: "bg-emerald-100",
    selectedBg: "bg-emerald-400",
    border: "border-emerald-300",
    selectedBorder: "border-emerald-600",
    textColor: "text-emerald-800",
    selectedText: "text-white",
    shadow: "shadow-emerald-200",
  },
  {
    id: "cultural",
    label: "Cultural & Historical",
    img: culturalImg,
    bg: "bg-amber-100",
    selectedBg: "bg-amber-400",
    border: "border-amber-300",
    selectedBorder: "border-amber-600",
    textColor: "text-amber-900",
    selectedText: "text-white",
    shadow: "shadow-amber-200",
  },
  {
    id: "adventure",
    label: "Adventure",
    img: adventureImg,
    bg: "bg-rose-100",
    selectedBg: "bg-rose-500",
    border: "border-rose-300",
    selectedBorder: "border-rose-600",
    textColor: "text-rose-800",
    selectedText: "text-white",
    shadow: "shadow-rose-200",
  },
  {
    id: "events",
    label: "Events",
    img: eventsImg,
    bg: "bg-pink-100",
    selectedBg: "bg-pink-500",
    border: "border-pink-300",
    selectedBorder: "border-pink-600",
    textColor: "text-pink-800",
    selectedText: "text-white",
    shadow: "shadow-pink-200",
  },
  {
    id: "food",
    label: "Food",
    img: foodImg,
    bg: "bg-orange-100",
    selectedBg: "bg-orange-400",
    border: "border-orange-300",
    selectedBorder: "border-orange-600",
    textColor: "text-orange-800",
    selectedText: "text-white",
    shadow: "shadow-orange-200",
  },
  {
    id: "city",
    label: "City Exploration",
    img: cityImg,
    bg: "bg-slate-100",
    selectedBg: "bg-slate-600",
    border: "border-slate-300",
    selectedBorder: "border-slate-700",
    textColor: "text-slate-700",
    selectedText: "text-white",
    shadow: "shadow-slate-200",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    img: entertainmentImg,
    bg: "bg-violet-100",
    selectedBg: "bg-violet-500",
    border: "border-violet-300",
    selectedBorder: "border-violet-600",
    textColor: "text-violet-800",
    selectedText: "text-white",
    shadow: "shadow-violet-200",
  },
  {
    id: "wellness",
    label: "Wellness & Relaxation",
    img: wellnessImg,
    bg: "bg-teal-100",
    selectedBg: "bg-teal-500",
    border: "border-teal-300",
    selectedBorder: "border-teal-600",
    textColor: "text-teal-800",
    selectedText: "text-white",
    shadow: "shadow-teal-200",
  },
];
  //page design
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
 
      {/* Header */}
      <div
        className="text-center mb-8 sm:mb-12 w-full max-w-3xl"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-28px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight mb-2 sm:mb-3 text-blue-600"
          style={{ letterSpacing: "0.04em" }}
        >
          TELL US YOUR TRAVEL STYLE
        </h1>
        <p className="text-gray-500 text-sm sm:text-base md:text-lg font-light tracking-wide px-2">
          Choose your interests so we can personalize your trips.
        </p>
      </div>
 
      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 w-full max-w-xs sm:max-w-xl md:max-w-3xl lg:max-w-4xl">
        {categories.map((cat, i) => {
          const isSelected = selected.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggle(cat.id)}
              className={`
                relative flex flex-col items-center justify-end
                rounded-2xl sm:rounded-3xl border-2 cursor-pointer overflow-hidden
                ${isSelected
                  ? `${cat.selectedBg} ${cat.selectedBorder} shadow-lg ${cat.shadow}`
                  : `${cat.bg} ${cat.border} hover:brightness-95 hover:shadow-md`
                }
              `}
              style={{
                aspectRatio: "1 / 1",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.95)",
                transition: `opacity 0.55s ease ${i * 60 + 150}ms, transform 0.55s ease ${i * 60 + 150}ms, background-color 0.25s, box-shadow 0.25s, border-color 0.25s`,
              }}
            >
              {/* Checkmark badge */}
              {isSelected && (
                <span className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-sm z-10">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
 
              {/* Per-card image */}
              <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-5 pb-8 sm:pb-10">
                <img
                  src={cat.img}
                  alt={cat.label}
                  className={`w-3/5 h-3/5 object-contain transition-transform duration-300 ${isSelected ? "scale-110" : ""}`}
                />
              </div>
 
              {/* Label */}
              <div className="relative z-10 w-full py-2 sm:py-3 px-2 text-center">
                <span className={`text-xs sm:text-sm font-bold leading-tight transition-colors duration-200 ${isSelected ? cat.selectedText : cat.textColor}`}>
                  {cat.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
 
      {/* Done Button */}
      <div
        className="mt-8 sm:mt-12 w-full max-w-xs sm:max-w-sm"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.7s ease 700ms, transform 0.7s ease 700ms",
        }}
      >
        <button
          onClick={handleSavePreferences}
          disabled={selected.length === 0 || isSaving}
          className={`
            w-full py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg tracking-wide
            shadow-lg transition-all duration-200
            hover:shadow-xl hover:scale-105 active:scale-95
            disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100
            ${selected.length ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-300 text-gray-500"}
          `}
        >
          {isSaving ? "Saving..." : `Done${selected.length > 0 ? ` (${selected.length})` : ""}`}
        </button>
        {submitError && (
          <p className="mt-3 text-sm text-center text-red-600">{submitError}</p>
        )}
      </div>
    </div>
  );
}