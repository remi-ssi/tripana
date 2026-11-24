import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Landmark,
  MapPin,
  Route,
  Sparkles,
  Ticket,
  Trees,
  Utensils,
  HeartHandshake,
} from "lucide-react";
import PhMap from "../assets/philippines_flights.gif";
import { Navbar } from "../components/landingNavBar";
import { Footer } from "../components/footer";
import { useAuth } from "../hooks/AuthProfile";

const EASE_OUT = [0.22, 1, 0.36, 1];
const VIEWPORT_ONCE = { once: true, amount: 0.25 };

const fadeUpVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.85, delay, ease: EASE_OUT },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: EASE_OUT },
  },
};

const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Set dates and travel style",
    description:
      "Choose your destination, trip duration, and travel preferences so recommendations fit how you explore.",
  },
  {
    number: "02",
    title: "Select attractions and breaks",
    description:
      "Pick places you want to visit and set rest intervals to keep each day comfortable and realistic.",
  },
  {
    number: "03",
    title: "Review your optimized itinerary",
    description:
      "Get a chronological day-by-day schedule with travel times, route order, and an interactive map.",
  },
];

const CAPABILITIES = [
  {
    icon: Sparkles,
    title: "AI-Powered Itinerary",
    description:
      "Generates personalized day-by-day schedules based on your interests, trip type, and dates.",
  },
  {
    icon: MapPin,
    title: "Attraction Discovery",
    description:
      "Browse curated spots across food, culture, nature, wellness, and city exploration.",
  },
  {
    icon: Route,
    title: "Smart Route Optimization",
    description:
      "Orders stops logically to reduce unnecessary backtracking and transit time between locations.",
  },
  {
    icon: Clock,
    title: "Fatigue-Balanced Scheduling",
    description:
      "Balances activities with scheduled breaks so your days stay enjoyable from morning to evening.",
  },
];

const INTERESTS = [
  {
    id: "food",
    label: "Food",
    icon: Utensils,
    description:
      "Discover local flavors, neighborhood eateries, markets, and culinary stops worth planning around.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&q=80",
  },
  {
    id: "city",
    label: "City Exploration",
    icon: Building2,
    description:
      "Navigate vibrant districts, walkable neighborhoods, viewpoints, and urban landmarks.",
    image:
      "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=900&q=80",
  },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: Ticket,
    description:
      "Find live venues, evening districts, performances, and lively local experiences.",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=80",
  },
  {
    id: "wellness",
    label: "Wellness",
    icon: HeartHandshake,
    description:
      "Build restorative trips around spas, hot springs, quiet retreats, and unhurried pacing.",
    image:
      "https://images.unsplash.com/photo-1545389336-cf090694435e?w=900&q=80",
  },
  {
    id: "adventure",
    label: "Adventure",
    icon: Compass,
    description:
      "Plan active itineraries featuring coastal spots, trails, water activities, and outdoor routes.",
    image:
      "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=900&q=80",
  },
  {
    id: "cultural",
    label: "Cultural",
    icon: Landmark,
    description:
      "Explore heritage districts, museums, historic architecture, and local traditions.",
    image:
      "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=900&q=80",
  },
  {
    id: "nature",
    label: "Nature",
    icon: Trees,
    description:
      "Connect waterfalls, parks, scenic lookouts, and natural landscapes into a smooth route.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&q=80",
  },
  {
    id: "events",
    label: "Events",
    icon: Calendar,
    description:
      "Schedule your trip around seasonal gatherings, markets, exhibitions, and celebrations.",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80",
  },
];

function Hero({ onGetStarted, onSeeHowItWorks }) {
  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-white pt-24 pb-12 lg:pt-20 lg:pb-12">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8">
        <Motion.div
          className="lg:col-span-7"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Motion.h1
            variants={fadeUpVariants}
            custom={0}
            className="font-black tracking-tight text-slate-900"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3.25rem)", lineHeight: 1.1 }}
          >
            SMART <span className="text-[#2563EB]">ITINERARIES</span>
            <br />
            FOR SMARTER <span className="text-[#F97316]">TRAVELS</span>
          </Motion.h1>
          <Motion.p
            variants={fadeUpVariants}
            custom={0.14}
            className="mt-4 max-w-xl text-base leading-relaxed text-slate-600"
          >
            Build day-by-day travel schedules tailored to your interests, pace, and rest preferences. Discover attractions, optimize routes, and view your trip on an interactive map.
          </Motion.p>

          <Motion.div
            variants={fadeUpVariants}
            custom={0.28}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={onGetStarted}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onSeeHowItWorks}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              See How It Works
            </button>
          </Motion.div>

          <Motion.div
            variants={fadeUpVariants}
            custom={0.42}
            className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-3 sm:gap-4"
          >
            <div className="flex items-center gap-2 text-sm text-slate-600 transition-colors duration-300 hover:text-slate-900">
              <Route className="h-4 w-4 shrink-0 text-blue-600" />
              <span>Route-optimized days</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 transition-colors duration-300 hover:text-slate-900">
              <Clock className="h-4 w-4 shrink-0 text-blue-600" />
              <span>Fatigue-balanced pacing</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 transition-colors duration-300 hover:text-slate-900">
              <MapPin className="h-4 w-4 shrink-0 text-blue-600" />
              <span>Interactive map view</span>
            </div>
          </Motion.div>
        </Motion.div>

        <Motion.div
          className="flex justify-center lg:col-span-5"
          initial={{ opacity: 0, scale: 0.94, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.95, delay: 0.2, ease: EASE_OUT }}
        >
          <img
            src={PhMap}
            alt="Philippines flight and destination route map"
            className="h-auto w-full max-w-[500px] select-none object-contain transition-transform duration-500 ease-out hover:scale-[1.03] sm:max-w-[608px] max-h-[504px]"
            draggable="false"
          />
        </Motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="features"
      className="flex min-h-[100dvh] scroll-mt-16 flex-col justify-center border-y border-slate-200 bg-slate-50 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Motion.div
          className="max-w-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUpVariants}
        >
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-[2.625rem] lg:leading-[1.12]">
            Built for <span className="text-[#2563EB]">Clear</span>, Realistic{" "}
            <span className="text-[#F97316]">Trip Planning</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            Every itinerary is structured around your schedule, travel style, and energy levels so you spend less time coordinating and more time exploring.
          </p>
        </Motion.div>

        {/* 3-step planning flow */}
        <Motion.div
          className="mt-8 grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={staggerContainer}
        >
          {WORKFLOW_STEPS.map((step) => (
            <Motion.div
              key={step.number}
              variants={staggerItem}
              className="group flex flex-col rounded-xl p-3 -m-3 transition-colors duration-300 ease-out hover:bg-white/80"
            >
              <span className="text-xs font-semibold tabular-nums text-blue-600 transition-transform duration-300 ease-out group-hover:translate-x-1">
                {step.number}
              </span>
              <h3 className="mt-1.5 text-base font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {step.description}
              </p>
            </Motion.div>
          ))}
        </Motion.div>

        {/* Grouped core capabilities */}
        <Motion.div
          className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-y-0">
            {CAPABILITIES.map((item, idx) => {
              const Icon = item.icon;
              const borderClasses = [
                idx < 2 ? "md:border-b md:border-slate-200" : "",
                idx % 2 === 0 ? "md:border-r md:border-slate-200" : "",
              ].join(" ");
              return (
                <Motion.div
                  key={item.title}
                  variants={staggerItem}
                  className={`group flex items-start gap-3.5 p-4 transition-colors duration-300 ease-out hover:bg-slate-50/80 sm:p-5 ${borderClasses}`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 ease-out group-hover:scale-110">
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </Motion.div>
              );
            })}
          </div>
        </Motion.div>
      </div>
    </section>
  );
}

function TravelByInterest({ onExplore }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = INTERESTS[activeIndex];
  const total = INTERESTS.length;

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-white py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Motion.div
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUpVariants}
        >
          <div className="max-w-xl">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-[2.625rem] lg:leading-[1.12]">
              TRAVEL <span className="text-[#2563EB]">BY</span>{" "}
              <span className="text-[#F97316]">INTEREST</span>
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600 sm:text-base">
              Choose the experiences that matter most to you, from local food to outdoor adventure.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous interest category"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next interest category"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-xs active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </Motion.div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Category selector */}
          <Motion.div
            className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:col-span-4 lg:grid-cols-1 lg:gap-1.5"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={staggerContainer}
          >
            {INTERESTS.map((interest, idx) => {
              const Icon = interest.icon;
              const isSelected = idx === activeIndex;
              return (
                <Motion.button
                  key={interest.id}
                  type="button"
                  variants={staggerItem}
                  onClick={() => setActiveIndex(idx)}
                  aria-pressed={isSelected}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all duration-300 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${isSelected
                      ? "border-blue-200 bg-blue-50 text-blue-700 shadow-xs"
                      : "border-slate-200 bg-white text-slate-700 hover:translate-x-1 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors duration-200 ${isSelected ? "text-blue-600" : "text-slate-500"
                      }`}
                    strokeWidth={1.75}
                  />
                  <span className="truncate text-sm font-medium">
                    {interest.label}
                  </span>
                </Motion.button>
              );
            })}
          </Motion.div>

          {/* Active preview card */}
          <Motion.div
            className="lg:col-span-8"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUpVariants}
            custom={0.12}
          >
            <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-shadow duration-300 ease-out hover:shadow-md">
              <AnimatePresence mode="wait">
                <Motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.42, ease: EASE_OUT }}
                >
                  <div className="h-52 w-full overflow-hidden bg-slate-100 sm:h-64 lg:h-72">
                    <img
                      src={active.image}
                      alt={active.label}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {active.label}
                      </h3>
                      <p className="mt-1 max-w-lg text-sm leading-relaxed text-slate-600">
                        {active.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onExplore}
                      className="group/btn inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                    >
                      Plan a trip
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </Motion.div>
              </AnimatePresence>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    navigate(user ? "/trip-plan" : "/login?mode=signup");
  };

  const handleSeeHowItWorks = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-white text-slate-900">
        <Navbar />
        <main>
          <Hero
            onGetStarted={handleGetStarted}
            onSeeHowItWorks={handleSeeHowItWorks}
          />
          <HowItWorksSection />
          <TravelByInterest onExplore={handleGetStarted} />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
