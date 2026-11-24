import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, MotionConfig } from "framer-motion";
import {
  Check,
  ArrowRight,
  LogOut,
  AlertCircle,
  Loader2,
} from "lucide-react";
import fullLogo from "../assets/logo.png";
import foodImg from "../assets/food.png";
import cityImg from "../assets/city.png";
import entertainmentImg from "../assets/entertainment.png";
import wellnessImg from "../assets/wellness.png";
import adventureImg from "../assets/adventure.png";
import culturalImg from "../assets/cultural.png";
import natureImg from "../assets/nature.png";
import eventsImg from "../assets/events.png";
import { authService } from "../services/authService";
import { useAuth } from "../hooks/AuthProfile";

const EASE_OUT = [0.22, 1, 0.36, 1];

const categories = [
  {
    id: "nature",
    label: "Nature",
    description: "Parks, scenic trails, and coastal escapes",
    img: natureImg,
  },
  {
    id: "cultural",
    label: "Cultural & Historical",
    description: "Museums, heritage landmarks, and architecture",
    img: culturalImg,
  },
  {
    id: "adventure",
    label: "Adventure",
    description: "Outdoor sports, hikes, and active excursions",
    img: adventureImg,
  },
  {
    id: "events",
    label: "Events",
    description: "Festivals, live shows, and seasonal gatherings",
    img: eventsImg,
  },
  {
    id: "food",
    label: "Food",
    description: "Local markets, street food, and dining spots",
    img: foodImg,
  },
  {
    id: "city",
    label: "City Exploration",
    description: "Neighborhood walks, skylines, and shopping districts",
    img: cityImg,
  },
  {
    id: "entertainment",
    label: "Entertainment",
    description: "Theme parks, nightlife, and interactive venues",
    img: entertainmentImg,
  },
  {
    id: "wellness",
    label: "Wellness & Relaxation",
    description: "Spas, quiet retreats, and slow-paced mornings",
    img: wellnessImg,
  },
];

export default function TravelStylePage() {
  const navigate = useNavigate();
  const { user, setAuthSession, clearUser } = useAuth();
  const [selected, setSelected] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const toggle = (id) => {
    setSubmitError("");
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleToggleAll = () => {
    setSubmitError("");
    if (selected.length === categories.length) {
      setSelected([]);
    } else {
      setSelected(categories.map((cat) => cat.id));
    }
  };

  const handleSavePreferences = async () => {
    if (selected.length === 0 || isSaving) {
      return;
    }

    setIsSaving(true);
    setSubmitError("");

    try {
      await authService.savePreferences(selected);
      setAuthSession(user, true);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setSubmitError(
        error.message || "Failed to save preferences. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearUser();
      navigate("/login", { replace: true });
    }
  };

  const allSelected = selected.length === categories.length;

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {/* Top Onboarding Header */}
        <header className="w-full border-b border-[#E2E8F0] bg-white/90 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={fullLogo}
                alt="Tripana"
                className="h-9 w-auto select-none sm:h-10"
              />
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {user?.email && (
                <span className="hidden sm:inline-block text-xs text-[#64748B] truncate max-w-[220px]">
                  {user.email}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-[#475569] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.75} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-between">
          <div>
            {/* Heading & Controls Row */}
            <Motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: EASE_OUT }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8"
            >
              <div>
                <p className="text-xs font-medium text-[#64748B] mb-1.5">
                  Personalize your experience
                </p>
                <h1
                  className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-[#0F172A]"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  Tell us your travel style
                </h1>
                <p className="mt-2 text-sm sm:text-base text-[#475569] max-w-2xl">
                  Select the categories you enjoy most so we can tailor attraction
                  recommendations and daily pacing to your trips.
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                <span className="text-xs sm:text-sm font-medium text-[#475569] tabular-nums">
                  {selected.length} of {categories.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleToggleAll}
                  className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[#2563EB] hover:bg-[#EFF6FF] transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30"
                >
                  {allSelected ? "Clear all" : "Select all"}
                </button>
              </div>
            </Motion.div>

            {/* Error Alert */}
            {submitError && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#DC2626]"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={2} />
                <span>{submitError}</span>
              </div>
            )}

            {/* Category Grid */}
            <Motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.06,
                    delayChildren: 0.08,
                  },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {categories.map((cat) => {
                const isSelected = selected.includes(cat.id);
                return (
                  <Motion.button
                    key={cat.id}
                    type="button"
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.55, ease: EASE_OUT },
                      },
                    }}
                    onClick={() => toggle(cat.id)}
                    aria-pressed={isSelected}
                    className={`group relative flex sm:flex-col items-center sm:items-stretch text-left rounded-2xl border p-4 transition-all duration-300 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 ${
                      isSelected
                        ? "bg-white border-[#2563EB] ring-1 ring-[#2563EB] shadow-sm -translate-y-0.5"
                        : "bg-white border-[#E2E8F0] hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
                    }`}
                  >
                    {/* Top row / illustration container */}
                    <div
                      className={`relative w-20 h-20 sm:w-full sm:h-36 rounded-xl flex items-center justify-center shrink-0 overflow-hidden transition-colors duration-300 ${
                        isSelected
                          ? "bg-[#EFF6FF]"
                          : "bg-[#F8FAFC] group-hover:bg-[#F1F5F9]"
                      }`}
                    >
                      <img
                        src={cat.img}
                        alt={cat.label}
                        className={`w-14 h-14 sm:w-24 sm:h-24 object-contain transition-transform duration-500 ease-out ${
                          isSelected
                            ? "scale-105"
                            : "group-hover:scale-105"
                        }`}
                      />

                      {/* Desktop selection indicator */}
                      <span
                        className={`hidden sm:flex absolute top-3 right-3 w-6 h-6 rounded-full items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? "bg-[#2563EB] text-white shadow-xs"
                            : "bg-white/90 border border-[#E2E8F0] text-transparent group-hover:border-slate-300"
                        }`}
                        aria-hidden="true"
                      >
                        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </span>
                    </div>

                    {/* Text Content */}
                    <div className="ml-4 sm:ml-0 sm:mt-3.5 flex-1 pr-8 sm:pr-0">
                      <h2
                        className={`text-base font-semibold leading-snug transition-colors duration-200 ${
                          isSelected ? "text-[#2563EB]" : "text-[#0F172A]"
                        }`}
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {cat.label}
                      </h2>
                      <p className="mt-1 text-xs text-[#64748B] leading-relaxed line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    {/* Mobile selection indicator */}
                    <span
                      className={`flex sm:hidden absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? "bg-[#2563EB] text-white shadow-xs"
                          : "bg-white border border-[#E2E8F0] text-transparent"
                      }`}
                      aria-hidden="true"
                    >
                      <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </span>
                  </Motion.button>
                );
              })}
            </Motion.div>
          </div>

          {/* Action Footer */}
          <Motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT }}
            className="mt-8 sm:mt-10 pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p className="text-xs sm:text-sm text-[#64748B] text-center sm:text-left">
              {selected.length === 0
                ? "Choose at least one travel interest to continue."
                : `You selected ${selected.length} ${
                    selected.length === 1 ? "category" : "categories"
                  }. You can update these anytime during trip planning.`}
            </p>

            <button
              type="button"
              onClick={handleSavePreferences}
              disabled={selected.length === 0 || isSaving}
              className="w-full sm:w-auto min-w-[220px] h-11 px-6 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium inline-flex items-center justify-center gap-2 shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                  <span>Saving preferences...</span>
                </>
              ) : (
                <>
                  <span>
                    Continue to dashboard
                    {selected.length > 0 ? ` (${selected.length})` : ""}
                  </span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </>
              )}
            </button>
          </Motion.div>
        </main>
      </div>
    </MotionConfig>
  );
}
