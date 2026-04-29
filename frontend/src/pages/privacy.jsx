import { useState } from "react";

const sections = [
  {
    id: "information-collected",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you create a Tripana account, we collect your name, email address, password, and profile details. This information is used to identify you, provide access to your saved trips, and personalize your experience.",
      },
      {
        subtitle: "Travel Preferences & Trip Data",
        text: "To generate optimized itineraries, we collect travel details you provide — such as destinations, travel dates, budget range, preferred attractions, and activity preferences. This data is central to how Tripana's AI planning features work.",
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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    title: "Data Sharing & Disclosure",
    content: [
      {
        subtitle: "We Do Not Sell Your Data",
        text: "Tripana does not sell, rent, or trade your personal information to third parties for commercial purposes. Your data is used solely to provide and improve the services we offer to you.",
      },
      {
        subtitle: "Third-Party Service Providers",
        text: "We may share limited data with trusted service providers — such as cloud hosting providers, map API services, and analytics platforms — strictly to operate and maintain Tripana. These providers are bound by confidentiality agreements and may not use your data for their own purposes.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required by law, court order, or governmental authority. We will notify you of such disclosures whenever permitted by law.",
      },
    ],
  },
  {
    id: "data-security",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
      </svg>
    ),
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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
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
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
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
  const [activeSection, setActiveSection] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-gray-900 font-semibold text-lg tracking-tight">Tripana</span>
          </div>
          <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Privacy Policy</span>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Your Privacy Matters
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">Privacy Policy</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            Tripana is committed to protecting your personal data. This policy explains what we collect, how we use it, and the choices you have — clearly and without legal jargon.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Effective: April 16, 2025
            </span>
            <span className="text-gray-200">|</span>
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Last Updated: April 16, 2025
            </span>
          </div>
        </div>
      </div>

      {/* Quick nav pills */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs text-gray-500 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-full border border-gray-200 hover:border-blue-200 transition-all whitespace-nowrap font-medium"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4 px-2">Sections</p>
              <nav className="space-y-1">
                {sections.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    onClick={() => setActiveSection(s.id)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                      activeSection === s.id
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <span className={`flex-shrink-0 ${activeSection === s.id ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"}`}>
                      {s.icon}
                    </span>
                    <span className="font-medium leading-snug">{s.title}</span>
                  </a>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 mb-1">Questions?</p>
                <p className="text-xs text-blue-600 leading-relaxed mb-3">We're here to help with any privacy concerns.</p>
                <a
                  href="mailto:privacy@tripana.app"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  privacy@tripana.app
                </a>
              </div>
            </div>
          </aside>

          {/* Main sections */}
          <div className="lg:col-span-2 space-y-6">
            {sections.map((section, i) => (
              <section
                key={section.id}
                id={section.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden scroll-mt-24"
              >
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-50">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    {section.icon}
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-medium">Section {String(i + 1).padStart(2, "0")}</span>
                    <h2 className="text-base font-semibold text-gray-900 leading-tight">{section.title}</h2>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {section.content.map((item, j) => (
                    <div key={j} className="px-6 py-5">
                      <h3 className="text-sm font-semibold text-blue-700 mb-2">{item.subtitle}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Contact card */}
            <div className="bg-blue-700 rounded-2xl p-8 text-white">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-1">Contact Us</h2>
                  <p className="text-blue-200 text-sm leading-relaxed mb-4">
                    If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your data, please don't hesitate to reach out.
                  </p>
                  <div className="space-y-1.5 text-sm text-blue-100">
                    <p><span className="text-blue-300 font-medium">Email:</span> privacy@tripana.app</p>
                    <p><span className="text-blue-300 font-medium">App:</span> Settings → Help & Support → Privacy</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer note */}
            <p className="text-xs text-gray-400 text-center pb-4 leading-relaxed">
              © 2025 Tripana. All rights reserved. This Privacy Policy was last updated on April 16, 2025.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}