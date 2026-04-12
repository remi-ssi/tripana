import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import fullLogo from "../assets/Logo.png";

// ─── Philippines Map SVG ───────────────────────────────────────────────────────
function PhMap() {
  const pins = [
    { label: "Manila", position: "top-[13%] left-[52%]", blue: true, delay: "[animation-delay:1.2s]" },
    { label: "Boracay", position: "top-[46%] left-[28%]", blue: false, delay: "[animation-delay:1.7s]" },
    { label: "Cebu", position: "top-[56%] left-[62%]", blue: true, delay: "[animation-delay:2.1s]" },
    { label: "Palawan", position: "top-[52%] left-[12%]", blue: false, delay: "[animation-delay:2.5s]" },
  ];

  return (
    <div className="relative h-[520px] w-[380px] shrink-0">
      {/* Glow */}
      <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(249,115,22,0.18)_0%,transparent_70%)] animate-[glowPulse_4s_ease-in-out_infinite]" />

      {/* Map */}
      <svg
        viewBox="0 0 260 430"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 h-full w-full fill-[#F97316] [filter:drop-shadow(0_16px_36px_rgba(249,115,22,0.32))] animate-[mapFloat_6s_ease-in-out_infinite]"
      >
        {/* Luzon */}
        <path d="M138,16 C143,14 152,18 156,26 C160,34 158,44 154,50 C160,55 166,63 164,72 C161,81 153,83 148,88 C152,96 153,106 148,112 C144,120 135,122 130,118 C126,125 122,133 116,137 C111,141 104,137 100,132 C95,136 90,142 84,140 C79,137 78,130 81,124 C76,119 71,112 73,105 C75,98 82,94 88,95 C91,88 95,79 102,75 C109,71 116,75 119,82 C124,75 130,65 132,55 C128,47 124,38 127,28 Z"/>
        {/* Mindoro */}
        <path d="M87,148 C93,143 102,145 107,151 C112,157 110,167 105,172 C99,177 90,175 85,169 C80,163 81,153 87,148 Z"/>
        {/* Palawan */}
        <path d="M55,182 C59,177 65,178 69,184 C73,190 72,197 69,203 C79,208 89,213 93,222 C97,231 91,240 83,244 C74,248 65,242 61,233 C54,228 47,221 44,212 C40,203 42,192 49,187 Z"/>
        {/* Samar/Leyte */}
        <path d="M162,174 C168,170 175,172 179,178 C183,184 181,193 175,198 C169,203 161,201 157,195 C153,189 156,178 162,174 Z"/>
        <path d="M148,192 C154,188 160,190 164,196 C168,202 167,211 161,216 C155,221 147,219 143,213 C139,207 142,196 148,192 Z"/>
        <path d="M174,190 C179,186 186,188 189,194 C192,200 191,208 185,213 C179,218 172,216 169,210 C166,204 169,194 174,190 Z"/>
        {/* Negros */}
        <path d="M120,202 C126,196 133,198 137,205 C141,212 139,223 134,228 C128,234 119,232 115,225 C111,218 114,208 120,202 Z"/>
        {/* Cebu */}
        <path d="M140,218 C144,212 149,214 152,220 C155,226 154,233 149,237 C144,241 137,239 135,233 C132,227 136,224 140,218 Z"/>
        {/* Mindanao */}
        <path d="M108,270 C117,261 133,259 143,265 C155,271 160,284 162,297 C164,310 160,323 151,330 C141,337 127,335 116,329 C105,323 98,311 96,298 C93,284 99,278 108,270 Z"/>
        <path d="M148,276 C155,270 164,272 169,280 C174,288 172,299 166,305 C159,311 150,309 145,301 C140,293 141,282 148,276 Z"/>
        <path d="M87,288 C93,281 102,281 107,289 C112,296 110,308 103,313 C96,318 87,316 82,308 C77,300 81,295 87,288 Z"/>
        {/* Sulu */}
        <path d="M98,344 C102,340 107,341 110,346 C113,351 111,358 106,361 C101,363 96,361 93,356 C90,351 94,348 98,344 Z"/>
        <path d="M84,358 C87,354 92,355 94,360 C96,365 95,371 90,373 C85,375 81,373 79,368 C77,363 81,361 84,358 Z"/>
        {/* Batanes */}
        <ellipse cx="144" cy="7" rx="5" ry="4" />
        <ellipse cx="134" cy="13" rx="4" ry="3" />
      </svg>

      {/* Pins */}
      {pins.map((pin) => (
        <div
          key={pin.label}
          className={`absolute z-10 flex items-center gap-1.5 ${pin.position} animate-[pinPop_0.5s_ease_both] ${pin.delay}`}
        >
          <div
            className={`h-3 w-3 shrink-0 rounded-full border-2 border-white ${
              pin.blue
                ? "bg-[#2563EB] animate-[pingBlue_2s_infinite]"
                : "bg-[#F97316] animate-[pingOrange_2s_infinite]"
            }`}
          />
          <span className="bg-white text-[#1a1f36] text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-md whitespace-nowrap">
            {pin.label}
          </span>
        </div>
      ))}
    </div>
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-10 pt-24 pb-16 flex items-center justify-between gap-12">

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
          <PhMap />
        </div>
      </div>
    </section>
  );
}

// ─── Default export ────────────────────────────────────────────────────────────
export default function TripanaHero() {
  return (
    <>
      <Navbar />
      <Hero />
    </>
  );
}