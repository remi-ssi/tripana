import { useNavigate } from "react-router-dom";
import { motion as Motion, MotionConfig } from "framer-motion";
import {
  ArrowRight,
  Clock,
  Compass,
  MapPin,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
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

const DESTINATIONS = [
  {
    name: "Luzon",
    region: "Northern & Central Archipelago",
    sub: "Cordillera mountain terraces, heritage towns, and vibrant urban districts.",
    img: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80",
  },
  {
    name: "Visayas",
    region: "Central Island Groups",
    sub: "Coastal sanctuaries, limestone coves, and centuries-old cultural landmarks.",
    img: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80",
  },
  {
    name: "Mindanao",
    region: "Southern Frontier",
    sub: "Highland rainforests, surf breaks, waterfalls, and diverse culinary traditions.",
    img: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800&q=80",
  },
];

const MISSION_PILLARS = [
  {
    number: "01",
    title: "Realistic daily pacing",
    description:
      "Schedules account for visiting hours, transit duration, and natural rest intervals so days never feel rushed.",
  },
  {
    number: "02",
    title: "Geography-aware routing",
    description:
      "Stops are ordered logically across neighborhoods to minimize backtracking and wasted travel time.",
  },
  {
    number: "03",
    title: "Tailored to how you explore",
    description:
      "Every plan adapts to your chosen interests, budget range, and preferred travel tempo.",
  },
];

const COMMITMENTS = [
  {
    icon: ShieldCheck,
    title: "User Privacy & Data Security",
    desc: "Your account details and travel preferences are protected with secure authentication and encrypted data transmission. Your data stays yours.",
  },
  {
    icon: SlidersHorizontal,
    title: "Transparency & User Control",
    desc: "You have full control to update preferences, edit trip details, and delete saved itineraries at any time.",
  },
  {
    icon: Sparkles,
    title: "Responsible AI Development",
    desc: "Our recommendations are generated from objective factors like travel time, availability, and your stated preferences rather than third-party bias.",
  },
  {
    icon: Compass,
    title: "Itineraries as Flexible Suggestions",
    desc: "Tripana presents plans as adaptable suggestions. You review, modify, and confirm while remaining in full control of your journey.",
  },
];

function Hero({ onGetStarted, onReadMission }) {
  return (
    <section className="flex min-h-[100dvh] flex-col justify-center bg-white pt-24 pb-16 lg:pt-20 lg:pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Motion.div
          className="max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <Motion.h1
            variants={fadeUpVariants}
            custom={0}
            className="font-black tracking-tight text-slate-900"
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontSize: "clamp(2.25rem, 4.2vw, 3.5rem)",
              lineHeight: 1.1,
            }}
          >
            THOUGHTFUL <span className="text-[#2563EB]">PLANNING</span> FOR
            MORE MEANINGFUL <span className="text-[#F97316]">JOURNEYS</span>
          </Motion.h1>

          <Motion.p
            variants={fadeUpVariants}
            custom={0.14}
            className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Tripana is an intelligent travel planning companion built to help you organize personalized, route-optimized itineraries across the Philippines so you can focus on experiencing the destination.
          </Motion.p>

          <Motion.div
            variants={fadeUpVariants}
            custom={0.28}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={onGetStarted}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Start Planning
              <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={onReadMission}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            >
              Read Our Mission
            </button>
          </Motion.div>

          <Motion.div
            variants={fadeUpVariants}
            custom={0.42}
            className="mt-10 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3"
          >
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Route className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={1.75} />
              <span>Smart route sequencing</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Clock className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={1.75} />
              <span>Fatigue-aware daily pacing</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={1.75} />
              <span>Philippines-wide coverage</span>
            </div>
          </Motion.div>
        </Motion.div>
      </div>
    </section>
  );
}

function Mission() {
  return (
    <section
      id="mission"
      className="flex min-h-[100dvh] scroll-mt-16 flex-col justify-center border-y border-slate-200 bg-slate-50 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          <Motion.div
            className="lg:col-span-6"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={fadeUpVariants}
          >
            <h2
              className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-[2.625rem] lg:leading-[1.12]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Travel Smarter,{" "}
              <span className="text-[#2563EB]">Plan</span>{" "}
              <span className="text-[#F97316]">Better</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              Many travelers struggle with creating well-structured itineraries that balance travel time, visiting hours, personal preferences, and physical fatigue. Tripana was built to solve that challenge clearly and reliably.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              We believe every trip deserves a thoughtful schedule that lets you experience more without burning out. Our planning engine models how people actually move through a destination so your itinerary feels human, practical, and adaptable.
            </p>
          </Motion.div>

          <Motion.div
            className="lg:col-span-6"
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            variants={staggerContainer}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
              <h3
                className="text-xl font-bold text-slate-900 sm:text-2xl"
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                Built for Real Travelers
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Whether you are visiting a province for the first time or mapping out a multi-stop island itinerary, Tripana adapts to your pace, preferences, and curiosity.
              </p>

              <div className="mt-6 divide-y divide-slate-200 border-t border-slate-200">
                {MISSION_PILLARS.map((pillar) => (
                  <Motion.div
                    key={pillar.number}
                    variants={staggerItem}
                    className="flex items-start gap-4 py-4 first:pt-5 last:pb-0"
                  >
                    <span className="mt-0.5 text-xs font-semibold tabular-nums text-blue-600">
                      {pillar.number}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {pillar.title}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {pillar.description}
                      </p>
                    </div>
                  </Motion.div>
                ))}
              </div>
            </div>
          </Motion.div>
        </div>
      </div>
    </section>
  );
}

function Destinations({ onExplore }) {
  return (
    <section
      id="destinations"
      className="flex min-h-[100dvh] scroll-mt-16 flex-col justify-center bg-white py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Motion.div
          className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUpVariants}
        >
          <div className="max-w-2xl">
            <h2
              className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-[2.625rem] lg:leading-[1.12]"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              EXPLORE ACROSS THE <span className="text-[#2563EB]">PHILIPPINES</span>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              Discover regional highlights across Luzon, Visayas, and Mindanao and turn them into a cohesive day-by-day route.
            </p>
          </div>

          <button
            type="button"
            onClick={onExplore}
            className="group inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-blue-700 hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Plan a Philippines Trip
            <ArrowRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-1" />
          </button>
        </Motion.div>

        <Motion.div
          className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={staggerContainer}
        >
          {DESTINATIONS.map((dest) => (
            <Motion.article
              key={dest.name}
              variants={staggerItem}
              onClick={onExplore}
              className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
            >
              <div className="h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className="text-lg font-bold text-slate-900"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      {dest.name}
                    </h3>
                    <span className="text-xs font-medium text-slate-500">
                      {dest.region}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {dest.sub}
                  </p>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                  <span>Start itinerary in {dest.name}</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
                </div>
              </div>
            </Motion.article>
          ))}
        </Motion.div>
      </div>
    </section>
  );
}

function Commitments() {
  return (
    <section
      id="commitments"
      className="flex min-h-[100dvh] scroll-mt-16 flex-col justify-center border-t border-slate-200 bg-slate-50 py-16 sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <Motion.div
          className="max-w-2xl"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={fadeUpVariants}
        >
          <h2
            className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-[2.625rem] lg:leading-[1.12]"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Built With <span className="text-[#2563EB]">Responsibility</span>
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
            We take ethical development seriously. Here is how Tripana protects your data and keeps you in control of every travel decision.
          </p>
        </Motion.div>

        <Motion.div
          className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 divide-y divide-slate-200 md:grid-cols-2 md:divide-y-0">
            {COMMITMENTS.map((item, idx) => {
              const Icon = item.icon;
              const borderClasses = [
                idx < 2 ? "md:border-b md:border-slate-200" : "",
                idx % 2 === 0 ? "md:border-r md:border-slate-200" : "",
              ].join(" ");
              return (
                <Motion.div
                  key={item.title}
                  variants={staggerItem}
                  className={`group flex items-start gap-4 p-6 transition-colors duration-300 ease-out hover:bg-slate-50/80 ${borderClasses}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 ease-out group-hover:scale-110">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <h3
                      className="text-base font-semibold text-slate-900"
                      style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {item.desc}
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

export default function TripanaAbout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    navigate(user ? "/trip-plan" : "/login?mode=signup");
  };

  const handleReadMission = () => {
    const el = document.getElementById("mission");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="min-h-screen overflow-x-clip bg-white text-slate-900"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <Navbar />
        <main>
          <Hero
            onGetStarted={handleGetStarted}
            onReadMission={handleReadMission}
          />
          <Mission />
          <Destinations onExplore={handleGetStarted} />
          <Commitments />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
