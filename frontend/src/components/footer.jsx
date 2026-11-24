import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

// ─── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
    const navigate = useNavigate();

    const quickLinks = [
        { label: "Features", href: "#features" },
        { label: "About Us", href: "/about" },
        { label: "Terms and Conditions", href: "/terms" },
        { label: "Privacy Policy", href: "/privacy" },
    ];

    const socialIcons = [
        {
            label: "Instagram",
            href: "https://instagram.com",
            svg: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
                </svg>
            ),
        },
        {
            label: "Facebook",
            href: "https://facebook.com",
            svg: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
            ),
        },
        {
            label: "X / Twitter",
            href: "https://x.com",
            svg: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
        },
    ];

    const handleNav = (href) => {
        if (href.startsWith("#")) {
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else if (href.startsWith("http")) {
            window.open(href, "_blank", "noopener noreferrer");
        } else {
            navigate(href);
        }
    };

    return (
        <footer className="bg-[#0f172a] text-white">
            {/* CTA Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-[#1d4ed8] to-blue-900 px-6 py-20 text-center">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[#3b82f6] opacity-20 blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-16 right-10 h-64 w-64 rounded-full bg-[#f97316] opacity-15 blur-[80px]" />

                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
                    Your next adventure awaits
                </p>
                <h2 className="mb-5 text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-tight tracking-tight">
                    Ready to Plan Your
                    <br />
                    <span className="text-[#F97316]">Next Adventure?</span>
                </h2>
                <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed text-blue-100/80">
                    Join Tripana and experience a smarter, more enjoyable way to travel.
                    Your perfect itinerary is just a few clicks away.
                </p>
                <button
                    onClick={() => navigate("/login?mode=signup")}
                    className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border-2 border-white/30 bg-white/10 px-10 py-4 text-sm font-bold uppercase tracking-widest text-white backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/20 hover:-translate-y-1 active:scale-95"
                >
                    Start Planning
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </button>
            </div>

            {/* Footer body */}
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-8 py-16 sm:grid-cols-3">
                {/* Brand */}
                <div>
                    <div className="mb-4 flex items-center gap-1.5">
                        <img src={logo} alt="Tripana" className="h-16 w-40" />
                    </div>
                    <p className="mb-6 max-w-[220px] text-xs leading-relaxed text-slate-400">
                        Smart Itineraries for Smarter Travel. Plan your perfect trip with
                        AI-powered itinerary generation.
                    </p>
                    <div className="flex gap-3">
                        {socialIcons.map(({ label, href, svg }) => (
                            <button
                                key={label}
                                onClick={() => handleNav(href)}
                                aria-label={label}
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-700 text-slate-400 transition-all duration-200 hover:border-[#2563eb] hover:bg-[#2563eb]/10 hover:text-white"
                            >
                                {svg}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Quick Links
                    </h4>
                    <ul className="space-y-3">
                        {quickLinks.map(({ label, href }) => (
                            <li key={label}>
                                <button
                                    onClick={() => handleNav(href)}
                                    className="cursor-pointer text-sm text-slate-400 transition-colors duration-150 hover:text-white"
                                >
                                    {label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Get in Touch */}
                <div>
                    <h4 className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Get in Touch
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-400">
                        <li>
                            <a
                                href="mailto:payfair.app@gmail.com"
                                className="transition-colors duration-150 hover:text-white"
                            >
                                tripana@gmail.com
                            </a>
                        </li>
                        <li>
                            <a
                                href="tel:+12345678890"
                                className="transition-colors duration-150 hover:text-white"
                            >
                                +1 (234) 567-890
                            </a>
                        </li>
                        <li className="leading-relaxed">
                            123 Travel Street
                            <br />
                            Manila, Philippines 1112
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-slate-800 px-8 py-5">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 sm:flex-row">
                    <p className="text-xs text-slate-600">
                        © 2026 Tripana. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}