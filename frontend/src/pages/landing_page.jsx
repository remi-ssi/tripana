import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PhMap from "../assets/Philippines_flights.gif";
import { Navbar } from "../components/landingNavBar";
import { Footer } from "../components/footer";

// ─── Philippines Map ───────────────────────────────────────────────────────────
function PhilippinesMap() {
  return (
    <img
      src={PhMap}
      alt="Philippines flight map"
      className="h-[600px] w-full max-w-[600px] select-none drop-shadow-[0_24px_60px_rgba(37,99,235,0.18)]"
      draggable="false"
    />
  );
}

// ─── Hero section ──────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#f4f5f7]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(37,99,235,0.1)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="pointer-events-none absolute -left-[120px] -top-[100px] h-[500px] w-[500px] rounded-full bg-[#bfdbfe] opacity-40 blur-[90px] animate-[blobFloat_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute right-20 top-[200px] h-[360px] w-[360px] rounded-full bg-[#fed7aa] opacity-[0.35] blur-[80px] animate-[blobFloat_8s_ease-in-out_infinite] [animation-delay:3s]" />
      <div className="pointer-events-none absolute bottom-10 left-[35%] h-[280px] w-[280px] rounded-full bg-[#dbeafe] opacity-30 blur-[70px] animate-[blobFloat_8s_ease-in-out_infinite] [animation-delay:5s]" />
      <div className="relative z-10 w-full max-w-7xl mx-auto px-10 pt-24 pb-16 flex items-center gap-50">
        <div className="flex-1 max-w-xl">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-1.5 text-xs font-medium text-[#2563EB] animate-[fadeUp_0.7s_ease_both] [animation-delay:0.3s]">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#F97316] animate-[pulseDot_2s_infinite]" />
            AI-Powered Itinerary Generator
          </div>
          <h1 className="mb-6 animate-[fadeUp_0.7s_ease_both] [animation-delay:0.5s] text-[clamp(1.6rem,3.5vw,5.0rem)] font-black leading-[1.07] tracking-[-2px] text-[#1a1f36]">
            SMART <span className="text-[#2563EB]">ITINERARIES</span>
            <br />
            FOR SMARTER <span className="text-[#F97316]">TRAVEL</span>
          </h1>
          <p className="mb-10 max-w-[500px] animate-[fadeUp_0.7s_ease_both] [animation-delay:0.7s] text-[1.00rem] leading-[1.75] text-gray-500">
            Experience the future of travel planning with AI-powered itinerary generation. Discover attractions, optimize routes, and create perfectly balanced schedules tailored to your preferences.
          </p>
          <div className="flex items-center gap-4 animate-[fadeUp_0.7s_ease_both] [animation-delay:0.9s]">
            <button
              onClick={() => navigate("/login?mode=signup")}
              className="relative cursor-pointer overflow-hidden rounded-xl border-none bg-[#2563EB] px-9 py-4 text-sm font-bold tracking-wide text-white shadow-[0_8px_24px_rgba(37,99,235,0.38)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#1d4ed8] active:scale-95"
            >
              <span className="relative z-10">GET STARTED</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </button>
            <button className="cursor-pointer rounded-xl border-2 border-[#d1d5db] bg-transparent px-7 py-[14px] text-sm font-semibold text-[#1a1f36] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2563EB] hover:text-[#2563EB] active:scale-95">
              See How It Works →
            </button>
          </div>
        </div>
        <div className="shrink-0 animate-[fadeUp_0.9s_ease_both] [animation-delay:0.4s]">
          <PhilippinesMap />
        </div>
      </div>
    </section>
  );
}

// ─── useScrollReveal hook ──────────────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
    title: "AI-Powered Itinerary",
    desc: "Advanced AI creates personalized travel plans based on your preferences, interests, and travel style.",
    accent: "#2563EB",
    bg: "from-blue-50 to-blue-100/40",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    title: "Attraction Discovery",
    desc: "Uncover hidden gems and popular attractions tailored to your interests, from food to culture and nature.",
    accent: "#f97316",
    bg: "from-orange-50 to-orange-100/40",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    title: "Smart Route Optimization",
    desc: "Save time with intelligently optimized routes that minimize travel time between destinations.",
    accent: "#10b981",
    bg: "from-emerald-50 to-emerald-100/40",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: "Fatigue-Balanced Scheduling",
    desc: "Perfectly paced itineraries that balance activities with rest, so you never feel overwhelmed.",
    accent: "#8b5cf6",
    bg: "from-violet-50 to-violet-100/40",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
    title: "Interactive Maps",
    desc: "Visualize your entire journey with interactive maps showing attractions, routes, and real-time navigation.",
    accent: "#ec4899",
    bg: "from-pink-50 to-pink-100/40",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "Group Travel Sync",
    desc: "Plan effortlessly with friends or family — share itineraries, vote on activities, and stay in sync.",
    accent: "#0891b2",
    bg: "from-cyan-50 to-cyan-100/40",
  },
];

function FeatureCard({ feature, index, visible }) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl bg-white p-7 shadow-[0_2px_20px_rgba(0,0,0,0.06)] transition-[box-shadow,transform] duration-500 hover:-translate-y-3 hover:shadow-[0_24px_60px_rgba(0,0,0,0.15)]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(70px) scale(0.88)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${index * 0.13}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${index * 0.13}s`,
      }}
    >
      {/* Gradient bg on hover */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${feature.bg} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Accent line */}
      <div
        className="absolute left-0 top-0 h-1 w-0 rounded-t-2xl transition-all duration-500 group-hover:w-full"
        style={{ background: feature.accent }}
      />

      <div className="relative z-10">
        {/* Icon bubble */}
        <div
          className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `${feature.accent}18`, color: feature.accent }}
        >
          {feature.icon}
        </div>

        <h3 className="mb-2.5 text-[0.95rem] font-bold text-[#1a1f36]">{feature.title}</h3>
        <p className="text-sm leading-relaxed text-gray-500">{feature.desc}</p>
      </div>

      {/* Decorative corner circle */}
      <div
        className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `${feature.accent}12` }}
      />
    </div>
  );
}

function Features() {
  const [ref, visible] = useScrollReveal(0.1);

  return (
    <section id="features" className="bg-[#f8f9fb] px-2 py-16" ref={ref}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div
          className="mb-16 text-center"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(50px) scale(0.95)",
            transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          <span className="mb-3 inline-block rounded-full bg-[#dbeafe] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#2563eb]">
            What We Offer
          </span>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] font-black leading-tight tracking-tight text-[#1a1f36]">
            POWERFULL FEATURES
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
            Everything you need to plan the perfect trip, powered by intelligent technology
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Travel by Interest Carousel ──────────────────────────────────────────────
const INTERESTS = [
  {
    label: "Food",
    count: "41 destinations",
    emoji: "🍜",
    description: "Discover local flavors, street food, and hidden culinary gems.",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    accent: "#f97316",
  },
  {
    label: "City Exploration",
    count: "36 destinations",
    emoji: "🏙️",
    description: "Navigate vibrant urban landscapes and iconic skylines.",
    image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    accent: "#2563eb",
  },
  {
    label: "Entertainment",
    count: "28 destinations",
    emoji: "🎭",
    description: "From live shows to festivals, never miss the action.",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
    accent: "#8b5cf6",
  },
  {
    label: "Wellness",
    count: "22 destinations",
    emoji: "🧘",
    description: "Spas, yoga retreats, hot springs, and mindful escapes.",
    image: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=800&q=80",
    accent: "#10b981",
  },
  {
    label: "Adventure",
    count: "33 destinations",
    emoji: "🏄",
    description: "Surfing, diving, hiking, and adrenaline-packed journeys.",
    image: "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&q=80",
    accent: "#0891b2",
  },
  {
    label: "Cultural",
    count: "45 destinations",
    emoji: "🏛️",
    description: "Heritage sites, local traditions, museums, and art.",
    image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80",
    accent: "#d97706",
  },
  {
    label: "Nature",
    count: "38 destinations",
    emoji: "🌿",
    description: "Waterfalls, forests, islands, and breathtaking landscapes.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    accent: "#16a34a",
  },
  {
    label: "Events",
    count: "19 destinations",
    emoji: "🎉",
    description: "Seasonal festivals, concerts, expos, and local celebrations.",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    accent: "#ec4899",
  },
];

function TravelByInterest() {
  const navigate = useNavigate();
  const [headerRef, headerVisible] = useScrollReveal(0.1);
  const [carouselRef, carouselVisible] = useScrollReveal(0.08);
  const [activeIndex, setActiveIndex] = useState(1);
  const [animDir, setAnimDir] = useState(null); // 'left' | 'right'
  const [isAnimating, setIsAnimating] = useState(false);
  const total = INTERESTS.length;

  const slideTo = (nextIndex, dir) => {
    if (isAnimating) return;
    setAnimDir(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setActiveIndex((nextIndex + total) % total);
      setIsAnimating(false);
      setAnimDir(null);
    }, 380);
  };

  const prev = () => slideTo(activeIndex - 1, "right");
  const next = () => slideTo(activeIndex + 1, "left");

  // Visible cards: prev, active, next
  const getCard = (offset) => INTERESTS[(activeIndex + offset + total) % total];

  return (
    <section className="bg-[#f8f9fb] px-8 py-16 overflow-hidden">
      {/* Header */}
      <div
        ref={headerRef}
        className="mb-16 text-center"
        style={{
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0) scale(1)" : "translateY(60px) scale(0.95)",
          transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <span className="mb-3 inline-block rounded-full bg-[#fef3c7] px-4 py-1 text-xs font-semibold uppercase tracking-widest text-[#d97706]">
          Explore by Passion
        </span>
        <h2 className="mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)] font-black leading-tight tracking-tight text-[#1a1f36]">
          TRAVEL BY INTERESTS
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-500">
          Discover destinations tailored to your passions — pick what excites you most
        </p>
      </div>

      {/* Carousel */}
      <div
        ref={carouselRef}
        className="relative mx-auto max-w-5xl"
        style={{
          opacity: carouselVisible ? 1 : 0,
          transform: carouselVisible ? "translateY(0)" : "translateY(80px)",
          transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s",
        }}
      >
        {/* Cards row */}
        <div className="flex items-center justify-center gap-5 px-16">
          {/* Prev card */}
          <div
            className="relative h-[360px] w-[260px] shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl"
            style={{
              opacity: isAnimating && animDir === "right" ? 0 : 0.55,
              transform: `scale(0.88) ${isAnimating && animDir === "right" ? "translateX(-60px)" : "translateX(0)"}`,
              transition: "opacity 0.38s ease, transform 0.38s ease",
              filter: "brightness(0.75)",
            }}
            onClick={prev}
          >
            <img
              src={getCard(-1).image}
              alt={getCard(-1).label}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5">
              <p className="text-lg font-black text-white">{getCard(-1).label}</p>
              <p className="text-xs text-white/70">{getCard(-1).count}</p>
            </div>
          </div>

          {/* Active card */}
          <div
            className="group relative z-10 h-[440px] w-[320px] shrink-0 cursor-pointer overflow-hidden rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.28)] transition-all duration-500"
            style={{
              opacity: isAnimating ? 0.7 : 1,
              transform: isAnimating
                ? `scale(0.96) translateX(${animDir === "left" ? "-30px" : "30px"})`
                : "scale(1) translateX(0)",
              transition: "opacity 0.38s ease, transform 0.38s ease",
            }}
            onClick={() => navigate("/login?mode=signup")}
          >
            <img
              src={getCard(0).image}
              alt={getCard(0).label}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Accent dot */}
            <div
              className="absolute left-5 top-5 h-10 w-10 rounded-full flex items-center justify-center text-xl shadow-lg"
              style={{ background: getCard(0).accent }}
            >
              {getCard(0).emoji}
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-white/60">
                {getCard(0).count}
              </p>
              <h3 className="mb-2 text-2xl font-black text-white">{getCard(0).label}</h3>
              <p className="mb-4 text-xs leading-relaxed text-white/75">{getCard(0).description}</p>
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-white transition-all duration-300 group-hover:gap-3"
                style={{ background: `${getCard(0).accent}cc` }}
              >
                Explore <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </div>
          </div>

          {/* Next card */}
          <div
            className="relative h-[360px] w-[260px] shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-lg transition-all duration-500 hover:shadow-xl"
            style={{
              opacity: isAnimating && animDir === "left" ? 0 : 0.55,
              transform: `scale(0.88) ${isAnimating && animDir === "left" ? "translateX(60px)" : "translateX(0)"}`,
              transition: "opacity 0.38s ease, transform 0.38s ease",
              filter: "brightness(0.75)",
            }}
            onClick={next}
          >
            <img
              src={getCard(1).image}
              alt={getCard(1).label}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-5 left-5">
              <p className="text-lg font-black text-white">{getCard(1).label}</p>
              <p className="text-xs text-white/70">{getCard(1).count}</p>
            </div>
          </div>
        </div>

        {/* Arrow buttons */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all duration-200 hover:scale-110 hover:border-[#2563eb] hover:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#1a1f36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white shadow-md transition-all duration-200 hover:scale-110 hover:border-[#2563eb] hover:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] active:scale-95"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#1a1f36" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {INTERESTS.map((_, i) => (
            <button
              key={i}
              onClick={() => slideTo(i, i > activeIndex ? "left" : "right")}
              className="cursor-pointer rounded-full transition-all duration-300"
              style={{
                width: i === activeIndex ? "28px" : "8px",
                height: "8px",
                background: i === activeIndex ? "#2563eb" : "#cbd5e1",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Default export ────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Features />
      <TravelByInterest />
      <Footer />
    </>
  );
}