import { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/landingNavBar";
import fullLogo from "../assets/logo.png";
import { Footer } from "../components/footer";

// ── Scroll-reveal hook ──────────────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Reusable animated wrapper ───────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "", direction = "up" }) {
  const [ref, visible] = useReveal();
  const hiddenMap = {
    up: "opacity-0 translate-y-10",
    left: "opacity-0 -translate-x-10",
    right: "opacity-0 translate-x-10",
    fade: "opacity-0",
  };
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${visible ? "opacity-100 translate-x-0 translate-y-0" : hiddenMap[direction]
        } ${className}`}
    >
      {children}
    </div>
  );
}

// ── Data ────────────────────────────────────────────────────────────────────
const destinations = [
  {
    name: "Luzon",
    img: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=600&q=80",
    sub: "Rice terraces & historic gems",
  },
  {
    name: "Visayas",
    img: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80",
    sub: "Island paradise & crystal waters",
  },
  {
    name: "Mindanao",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80",
    sub: "Rainforests & mountain wonders",
  },
];

const commitments = [
  {
    title: "User Privacy & Data Security",
    desc: "Your account details and travel preferences are protected with secure authentication and encrypted data transmission — your data stays yours.",
  },
  {
    title: "Transparency & User Control",
    desc: "You have full control — update preferences, edit trip details, and delete saved itineraries at any time, no questions asked.",
  },
  {
    title: "Responsible AI Development",
    desc: "Our recommendations are generated from objective data — travel time, availability, and your stated preferences — not biased toward any third party.",
  },
  {
    title: "Itineraries as Suggestions",
    desc: "Tripana presents plans as flexible suggestions. You review, modify, and confirm — the AI assists, but you always stay in control of your journey.",
  },
];

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-16"
      style={{ background: "#EBF2FA" }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(27,58,107,0.10) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Ambient blobs */}
      <div
        className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "#1B3A6B", animation: "drift 12s ease-in-out infinite alternate" }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: "#F5820A", animation: "drift2 10s ease-in-out infinite alternate" }}
      />

      <div className="relative z-10 max-w-3xl w-full">
        {/* Logo hero */}
        <div style={{ animation: "fadeUp 0.9s ease both" }}>
          <img src={fullLogo} alt="Tripana" className="h-32 md:h-48 w-auto mx-auto" />
        </div>

        {/* Tagline */}
        <p
          className="mt-4 mb-6 tracking-[0.25em] text-xs md:text-sm font-bold uppercase"
          style={{
            color: "#5A7BAD",
            fontFamily: "'Poppins', sans-serif",
            animation: "fadeUp 0.9s 0.15s ease both",
          }}
        >
          PLAN. EXPLORE. DISCOVER.
        </p>

        {/* Description */}
        <p
          className="text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
          style={{
            color: "#5A7BAD",
            fontFamily: "'Poppins', sans-serif",
            animation: "fadeUp 0.9s 0.3s ease both",
          }}
        >
          Your intelligent travel companion that transforms the way you plan trips —
          automatically generating optimized, personalized itineraries so you can focus
          on the journey.
        </p>

        {/* CTA */}
        <div style={{ animation: "fadeUp 0.9s 0.45s ease both" }}>
          <a
            href="#mission"
            className="inline-block uppercase tracking-widest text-xs font-bold text-white px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
            style={{ background: "#1B3A6B", fontFamily: "'Poppins', sans-serif" }}
          >
            Discover Us
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-40"
        style={{ animation: "bounce 2s ease-in-out infinite", color: "#1B3A6B" }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
        @keyframes fadeUp   { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
        @keyframes drift    { from { transform:translate(0,0); } to { transform:translate(40px,30px); } }
        @keyframes drift2   { from { transform:translate(0,0); } to { transform:translate(-30px,20px); } }
        @keyframes bounce   { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }
        @keyframes floatBadge { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes spinPlane  { from{transform:rotate(-25deg)} to{transform:rotate(-25deg)} }
      `}</style>
    </section>
  );
}

// ── Mission ─────────────────────────────────────────────────────────────────
function Mission() {
  return (
    <section id="mission" className="py-24 px-6 max-w-5xl mx-auto">
      <Reveal>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: "#F5820A", fontFamily: "'Poppins', sans-serif" }}
        >
          Our Mission
        </p>
      </Reveal>

      <Reveal delay={100}>
        <h2
          className="text-4xl md:text-5xl font-black mb-6 leading-tight"
          style={{ color: "#1B3A6B", fontFamily: "'Nunito', sans-serif" }}
        >
          Travel Smarter,{" "}
          <span style={{ color: "#F5820A" }}>Plan Better</span>
        </h2>
      </Reveal>

      <Reveal delay={200}>
        <p
          className="text-sm md:text-base leading-relaxed mb-4 max-w-2xl"
          style={{ color: "#5A7BAD", fontFamily: "'Poppins', sans-serif" }}
        >
          Many travelers struggle with creating well-structured itineraries that balance travel time,
          visiting hours, personal preferences, and physical fatigue. Tripana was built to solve exactly that.
        </p>
        <p
          className="text-sm md:text-base leading-relaxed max-w-2xl"
          style={{ color: "#5A7BAD", fontFamily: "'Poppins', sans-serif" }}
        >
          We believe every trip deserves a thoughtful plan — one that lets you experience more without
          burning out. Our AI understands how people actually travel, so your schedule feels human, not robotic.
        </p>
      </Reveal>

      {/* Big mission card */}
      <Reveal delay={350}>
        <div
          className="relative mt-10 rounded-3xl p-10 overflow-hidden"
          style={{ background: "#1B3A6B" }}
        >
          {/* Deco circles */}
          <div
            className="absolute top-[-50px] right-[-50px] w-52 h-52 rounded-full opacity-10"
            style={{ background: "#F5820A" }}
          />
          <div
            className="absolute bottom-[-30px] left-[-30px] w-36 h-36 rounded-full opacity-5"
            style={{ background: "#fff" }}
          />

          <h3
            className="text-2xl md:text-3xl font-black text-white mb-3 relative z-10"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Built for Real Travelers
          </h3>
          <p
            className="text-sm md:text-base leading-relaxed relative z-10 max-w-xl"
            style={{ color: "rgba(255,255,255,0.72)", fontFamily: "'Poppins', sans-serif" }}
          >
            Whether you're a first-time tourist or a seasoned explorer, Tripana adapts to your pace,
            preferences, and curiosity — crafting a journey that feels uniquely yours.
          </p>

          {/* Floating badge */}
          <div
            className="absolute bottom-[-16px] right-8 px-6 py-3 rounded-2xl text-white text-sm font-bold shadow-lg z-20"
            style={{
              background: "#F5820A",
              fontFamily: "'Nunito', sans-serif",
              animation: "floatBadge 3s ease-in-out infinite",
            }}
          >
            Itinerary Ready ✓
          </div>
        </div>
      </Reveal>
    </section>
  );
}

// ── Destinations ─────────────────────────────────────────────────────────────
function Destinations() {
  return (
    <section id="destinations" className="py-24 px-6 max-w-5xl mx-auto text-center">
      <Reveal>
        <h2
          className="text-3xl md:text-5xl font-black mb-12 uppercase tracking-tight"
          style={{ color: "#1B3A6B", fontFamily: "'Nunito', sans-serif" }}
        >
          <span style={{ color: "#F5820A" }}>Plan</span> Your Vacation
        </h2>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {destinations.map((dest, i) => (
          <Reveal key={dest.name} delay={i * 120}>
            <div className="relative rounded-2xl overflow-hidden group cursor-pointer h-64 shadow-lg hover:shadow-2xl transition-all duration-400">
              <img
                src={dest.img}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-300" />
              {/* Hover tint */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ background: "#1B3A6B" }}
              />
              {/* Label */}
              <div className="absolute bottom-4 left-5 text-left z-10">
                <p
                  className="text-white text-xl font-black drop-shadow"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                >
                  {dest.name}
                </p>
                <p
                  className="text-white/70 text-xs font-medium mt-0.5"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {dest.sub}
                </p>
              </div>
              {/* Orange dot on hover */}
              <div
                className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"
                style={{ background: "#F5820A" }}
              />
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={400}>
        <button
          className="uppercase tracking-widest text-xs font-bold text-white px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
          style={{ background: "#1B3A6B", fontFamily: "'Poppins', sans-serif" }}
        >
          Anywhere in the Philippines
        </button>
      </Reveal>
    </section>
  );
}

// ── Commitments ──────────────────────────────────────────────────────────────
function Commitments() {
  return (
    <section id="commitments" className="py-24 px-6 max-w-5xl mx-auto">
      <Reveal>
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: "#F5820A", fontFamily: "'Poppins', sans-serif" }}
        >
          Our Commitments
        </p>
      </Reveal>

      <Reveal delay={100}>
        <h2
          className="text-4xl md:text-5xl font-black mb-4 leading-tight"
          style={{ color: "#1B3A6B", fontFamily: "'Nunito', sans-serif" }}
        >
          Built With Responsibility
        </h2>
      </Reveal>

      <Reveal delay={200}>
        <p
          className="text-sm md:text-base leading-relaxed mb-12 max-w-xl"
          style={{ color: "#5A7BAD", fontFamily: "'Poppins', sans-serif" }}
        >
          We take ethical development seriously. Here's how Tripana protects and respects our users.
        </p>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {commitments.map((c, i) => (
          <Reveal
            key={c.title}
            delay={i * 100}
            direction={i % 2 === 0 ? "left" : "right"}
          >
            <div
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex gap-4 border-l-4"
              style={{ borderLeftColor: "#F5820A" }}
            >
              {/* Dot accent */}
              <div
                className="mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: "#F5820A" }}
              />
              <div>
                <h4
                  className="font-bold text-base mb-2"
                  style={{ color: "#1B3A6B", fontFamily: "'Nunito', sans-serif" }}
                >
                  {c.title}
                </h4>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "#5A7BAD", fontFamily: "'Poppins', sans-serif" }}
                >
                  {c.desc}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

// ── Root export ──────────────────────────────────────────────────────────────
export default function TripanaAbout() {
  return (
    <div style={{ background: "#EBF2FA" }}>
      <Navbar />
      <Hero />
      <Mission />
      <Destinations />
      <Commitments />
      <Footer />
    </div>
  );
}
