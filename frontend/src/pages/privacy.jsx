import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  ClipboardList,
  Cookie,
  Fingerprint,
  Mail,
  RefreshCw,
  Share2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Navbar } from "../components/landingNavBar";
import { Footer } from "../components/footer";

const sections = [
  {
    id: "information-collected",
    icon: UserCheck,
    title: "Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you create a Tripana account, we collect your name, email address, password, and profile details. This information is used to identify you, provide access to your saved trips, and personalize your experience.",
      },
      {
        subtitle: "Travel Preferences & Trip Data",
        text: "To generate optimized itineraries, we collect travel details you provide, such as destinations, travel dates, budget range, preferred attractions, and activity preferences. This data is central to how Tripana's AI planning features work.",
      },
      {
        subtitle: "Usage & Device Data",
        text: "We collect standard usage data such as pages visited, features used, session duration, device type, operating system, and browser version. This helps us improve app performance and user experience.",
      },
      {
        subtitle: "Location Data",
        text: "With your permission, we may access your device's location to provide map integration, route optimization, and nearby attraction recommendations. You can disable location access at any time through your device settings.",
      },
    ],
  },
  {
    id: "how-we-use",
    icon: ClipboardList,
    title: "How We Use Your Information",
    content: [
      {
        subtitle: "AI-Powered Itinerary Generation",
        text: "Your preferences and trip details are used by our AI system to generate personalized, optimized day-by-day travel plans. The AI analyzes travel times, attraction availability, and fatigue balancing to suggest realistic and enjoyable itineraries.",
      },
      {
        subtitle: "Route & Schedule Optimization",
        text: "We use your destination and location data to calculate efficient travel routes, minimize unnecessary travel time, and organize your selected attractions in a logical and time-saving sequence.",
      },
      {
        subtitle: "Account & Trip Management",
        text: "Your account data allows you to save, revisit, edit, and manage your travel plans. We use your information to authenticate your sessions and ensure your data is securely tied to your account.",
      },
      {
        subtitle: "App Improvement",
        text: "Aggregated and anonymized usage data helps us identify performance issues, understand feature usage patterns, and continuously improve the Tripana experience for all users.",
      },
    ],
  },
  {
    id: "data-sharing",
    icon: Share2,
    title: "Data Sharing & Disclosure",
    content: [
      {
        subtitle: "We Do Not Sell Your Data",
        text: "Tripana does not sell, rent, or trade your personal information to third parties for commercial purposes. Your data is used solely to provide and improve the services we offer to you.",
      },
      {
        subtitle: "Third-Party Service Providers",
        text: "We may share limited data with trusted service providers, such as cloud hosting providers, map API services, and analytics platforms, strictly to operate and maintain Tripana. These providers are bound by confidentiality agreements and may not use your data for their own purposes.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required by law, court order, or governmental authority. We will notify you of such disclosures whenever permitted by law.",
      },
    ],
  },
  {
    id: "data-security",
    icon: ShieldCheck,
    title: "Data Security",
    content: [
      {
        subtitle: "Encryption & Secure Transmission",
        text: "All data transmitted between your device and our servers is protected using industry-standard TLS (Transport Layer Security) encryption. Sensitive data such as passwords are stored using strong hashing algorithms and are never stored in plain text.",
      },
      {
        subtitle: "Access Controls",
        text: "Access to your personal data within our systems is restricted to authorized personnel only. We enforce role-based access controls and regularly audit who can access user data.",
      },
      {
        subtitle: "Responsible AI Use",
        text: "Our AI features are designed to make recommendations based on user-provided preferences and objective data such as travel times and attraction availability. We continuously monitor our AI systems to detect and prevent bias or misuse.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: Fingerprint,
    title: "Your Rights & Controls",
    content: [
      {
        subtitle: "Access & Portability",
        text: "You have the right to request a copy of the personal data we hold about you. We will provide this in a readable format within 30 days of your request.",
      },
      {
        subtitle: "Edit & Update",
        text: "You can update your profile, travel preferences, and account information at any time directly within the Tripana app.",
      },
      {
        subtitle: "Delete Your Data",
        text: "You may request deletion of your account and all associated data at any time. Once deleted, your information will be permanently removed from our active systems within 30 days, except where retention is required by law.",
      },
      {
        subtitle: "Itinerary Control",
        text: "All generated itineraries are presented as suggestions. You have full control to review, modify, or discard any AI-generated travel plan. We encourage you to verify important travel details before finalizing your trips.",
      },
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies & Tracking",
    content: [
      {
        subtitle: "Essential Cookies",
        text: "We use essential cookies to maintain your session, remember your login state, and keep your preferences active across visits. These cookies are required for the app to function and cannot be disabled.",
      },
      {
        subtitle: "Analytics Cookies",
        text: "With your consent, we use analytics cookies to understand how users navigate Tripana. This data is aggregated and anonymized and helps us improve features and fix issues faster.",
      },
      {
        subtitle: "Managing Cookies",
        text: "You can manage cookie preferences through your browser settings. Disabling non-essential cookies will not affect core Tripana functionality.",
      },
    ],
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "Changes to This Policy",
    content: [
      {
        subtitle: "Policy Updates",
        text: "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or applicable laws. When we make significant changes, we will notify you via in-app notification or email before the changes take effect.",
      },
      {
        subtitle: "Continued Use",
        text: "Your continued use of Tripana after any policy update constitutes your acceptance of the revised Privacy Policy. We encourage you to review this page periodically.",
      },
    ],
  },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const sectionRefs = useRef({});

  useEffect(() => {
    const observers = [];
    sections.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(s.id);
        },
        { threshold: 0.25, rootMargin: "-80px 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50 text-slate-900"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <Navbar />

      {/* Document Header */}
      <div className="border-b border-slate-200 bg-white pt-24 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Privacy Policy
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Tripana is committed to protecting your personal data. This policy explains what information we collect, how it powers your itineraries, and the controls you have over your account.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-xs font-medium tabular-nums text-slate-500">
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" strokeWidth={1.75} />
                Effective: April 16, 2025
              </span>
              <span className="text-slate-300" aria-hidden="true">
                |
              </span>
              <span className="inline-flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-blue-600" strokeWidth={1.75} />
                Last Updated: April 16, 2025
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile horizontal jump links */}
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm lg:hidden">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 min-w-max">
            {sections.map((s, idx) => {
              const isActive = activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="mr-1.5 tabular-nums text-slate-400">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  On This Page
                </p>
                <nav aria-label="Privacy sections" className="space-y-1">
                  {sections.map((s, idx) => {
                    const Icon = s.icon;
                    const isActive = activeSection === s.id;
                    return (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        onClick={() => setActiveSection(s.id)}
                        className={`group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                          isActive
                            ? "bg-blue-50 font-semibold text-blue-600"
                            : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`h-4 w-4 shrink-0 ${
                              isActive
                                ? "text-blue-600"
                                : "text-slate-400 group-hover:text-slate-600"
                            }`}
                            strokeWidth={1.75}
                          />
                          <span className="truncate">{s.title}</span>
                        </span>
                        <span
                          className={`text-xs tabular-nums ${
                            isActive ? "text-blue-600" : "text-slate-400"
                          }`}
                        >
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                      </a>
                    );
                  })}
                </nav>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <p className="text-sm font-semibold text-slate-900">
                  Privacy Questions?
                </p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  We are here to help with any data requests or privacy questions.
                </p>
                <a
                  href="mailto:privacy@tripana.app"
                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
                >
                  <Mail className="h-3.5 w-3.5" strokeWidth={1.75} />
                  privacy@tripana.app
                </a>
              </div>
            </div>
          </aside>

          {/* Section Cards */}
          <div className="space-y-6 lg:col-span-8">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => (sectionRefs.current[section.id] = el)}
                  className="scroll-mt-28 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
                >
                  <div className="flex items-center gap-3.5 border-b border-slate-200 px-6 py-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div>
                      <span className="text-xs font-semibold tabular-nums text-slate-400">
                        Section {String(i + 1).padStart(2, "0")}
                      </span>
                      <h2
                        className="text-lg font-bold leading-snug text-slate-900"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                      >
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {section.content.map((item, j) => (
                      <div key={j} className="px-6 py-5">
                        <h3 className="text-sm font-semibold text-slate-900">
                          {item.subtitle}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}

            {/* Contact Summary Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Mail className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h2
                    className="text-lg font-bold text-slate-900"
                    style={{ fontFamily: "'Nunito', sans-serif" }}
                  >
                    Contact Us About Your Privacy
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your personal data, please reach out to our team.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200 pt-4 text-xs text-slate-600">
                    <p>
                      <span className="font-semibold text-slate-900">Email:</span>{" "}
                      <a
                        href="mailto:privacy@tripana.app"
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        privacy@tripana.app
                      </a>
                    </p>
                    <p>
                      <span className="font-semibold text-slate-900">In-App:</span>{" "}
                      Profile &amp; Account Settings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
