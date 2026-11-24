import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";

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
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
      }
    } else if (href.startsWith("http")) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      navigate(href);
    }
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* CTA Banner */}
      <div className="border-b border-slate-800 px-4 py-12 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to plan your next trip?
          </h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-slate-300 sm:text-base">
            Create an account to build route-optimized, fatigue-balanced itineraries tailored to your travel style.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => navigate("/login?mode=signup")}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              Start Planning
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer body */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
        <div>
          <div className="mb-4">
            <img src={logo} alt="Tripana" className="h-10 w-auto" />
          </div>
          <p className="mb-6 max-w-xs text-sm leading-relaxed text-slate-400">
            Smart itineraries for smarter travel. Plan your trip with AI-powered scheduling and route optimization.
          </p>
          <div className="flex gap-3">
            {socialIcons.map(({ label, href, svg }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleNav(href)}
                aria-label={label}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition-colors hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {svg}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Quick Links
          </h3>
          <ul className="space-y-3">
            {quickLinks.map(({ label, href }) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => handleNav(href)}
                  className="cursor-pointer text-sm text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Get in Touch
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li>
              <a
                href="mailto:tripana@gmail.com"
                className="transition-colors hover:text-white"
              >
                tripana@gmail.com
              </a>
            </li>
            <li>
              <a
                href="tel:+1234567890"
                className="transition-colors hover:text-white"
              >
                +1 (234) 567-890
              </a>
            </li>
            <li className="leading-relaxed text-slate-400">
              123 Travel Street
              <br />
              Manila, Philippines 1112
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-center">
          <p className="text-xs text-slate-500">
            © 2026 Tripana. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
