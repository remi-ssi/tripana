import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import fullLogo from "../assets/Logo.png";
import PhMap from "../assets/Philippines_flights.gif";

// ─── Philippines Map SVG ───────────────────────────────────────────────────────
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

// ─── Navbar ────────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-10 py-4 backdrop-blur-[14px] transition-all duration-300 animate-[slideDown_0.7s_ease_both] ${
        scrolled
          ? "bg-[rgba(244,245,247,0.92)] border-b border-black/10"
          : "bg-[rgba(244,245,247,0.5)] border-b border-transparent"
      }`}
    >
      {/* Logo */}
      <img
        src={fullLogo}
        alt="Tripana"
        className="h-11 w-auto select-none"
      />

      {/* Links */}
      <ul className="flex gap-8 list-none m-0 p-0">
        {["Features", "About Us", "Contact"].map((link) => (
          <li key={link}>
            <a
              href="#"
              className="text-sm font-medium text-gray-500 no-underline transition-colors duration-200 hover:text-[#1a1f36]"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => navigate("/login?mode=login")}
        className="cursor-pointer rounded-full border-none bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-blue-700 active:scale-95"
      >
        Log In
      </button>
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate();
  const travelers = [
    { initial: "J", bg: "bg-[#bfdbfe]" },
    { initial: "M", bg: "bg-[#fed7aa]" },
    { initial: "R", bg: "bg-[#bbf7d0]" },
    { initial: "A", bg: "bg-[#fde68a]" },
  ];

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#f4f5f7]">
      {/* Dot grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(37,99,235,0.1)_1px,transparent_1px)] [background-size:36px_36px]" />

      {/* Blobs */}
      <div className="pointer-events-none absolute -left-[120px] -top-[100px] h-[500px] w-[500px] rounded-full bg-[#bfdbfe] opacity-40 blur-[90px] animate-[blobFloat_8s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute right-20 top-[200px] h-[360px] w-[360px] rounded-full bg-[#fed7aa] opacity-[0.35] blur-[80px] animate-[blobFloat_8s_ease-in-out_infinite] [animation-delay:3s]" />
      <div className="pointer-events-none absolute bottom-10 left-[35%] h-[280px] w-[280px] rounded-full bg-[#dbeafe] opacity-30 blur-[70px] animate-[blobFloat_8s_ease-in-out_infinite] [animation-delay:5s]" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-10 pt-24 pb-16 flex items-center gap-50">

        {/* Left */}
        <div className="flex-1 max-w-xl">
          {/* Badge */}
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-4 py-1.5 text-xs font-medium text-[#2563EB] animate-[fadeUp_0.7s_ease_both] [animation-delay:0.3s]"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#F97316] animate-[pulseDot_2s_infinite]" />
            AI-Powered Itinerary Generator
          </div>

          {/* Headline */}
          <h1
            className="mb-6 animate-[fadeUp_0.7s_ease_both] [animation-delay:0.5s] text-[clamp(1.6rem,3.5vw,5.0rem)] font-black leading-[1.07] tracking-[-2px] text-[#1a1f36]"
          >
            SMART{" "}
            <span className="text-[#2563EB]">ITINERARIES</span>
            <br />
            FOR SMARTER{" "}
            <span className="text-[#F97316]">TRAVEL</span>
          </h1>

          {/* Description */}
          <p
            className="mb-10 max-w-[500px] animate-[fadeUp_0.7s_ease_both] [animation-delay:0.7s] text-[1.00rem] leading-[1.75] text-gray-500"
          >
            Experience the future of travel planning with AI-powered itinerary
            generation. Discover attractions, optimize routes, and create
            perfectly balanced schedules tailored to your preferences.
          </p>

          {/* CTAs */}
          <div
            className="flex items-center gap-4 animate-[fadeUp_0.7s_ease_both] [animation-delay:0.9s]"
          >
            <button
              onClick={() => navigate("/login?mode=signup")}
              className="relative cursor-pointer overflow-hidden rounded-xl border-none bg-[#2563EB] px-9 py-4 text-sm font-bold tracking-wide text-white shadow-[0_8px_24px_rgba(37,99,235,0.38)] transition-all duration-200 hover:-translate-y-1 hover:bg-[#1d4ed8] active:scale-95"
            >
              <span className="relative z-10">GET STARTED</span>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </button>

            <button
              className="cursor-pointer rounded-xl border-2 border-[#d1d5db] bg-transparent px-7 py-[14px] text-sm font-semibold text-[#1a1f36] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#2563EB] hover:text-[#2563EB] active:scale-95"
            >
              See How It Works →
            </button>
          </div>
        </div>

        {/* Right — Map */}
        <div
          className="shrink-0 animate-[fadeUp_0.9s_ease_both] [animation-delay:0.4s]"
        >
          <PhilippinesMap />
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
    </>
  );
}
