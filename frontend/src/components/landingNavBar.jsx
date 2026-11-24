import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fullLogo from "../assets/logo.png";
import { useAuth } from "../hooks/AuthProfile";

// ─── Navbar ────────────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

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
        className="h-11 w-auto select-none cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate("/")}
      />

      {/* Links */}
      <ul className="flex gap-8 list-none m-0 p-0">
        {[
          { label: "Features", path: "/" },
          { label: "About Us", path: "/about" },
          { label: "Terms and Conditions", path: "/terms" },
          { label: "Privacy Policy", path: "/privacy" },
        ].map((link) => (
          <li key={link.label}>
            <button
              onClick={() => navigate(link.path)}
              className="text-sm font-medium text-gray-500 no-underline transition-colors duration-200 hover:text-[#1a1f36] bg-transparent border-none cursor-pointer"
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={() => navigate(user ? "/dashboard" : "/login?mode=login")}
        className="cursor-pointer rounded-full border-none bg-[#2563EB] px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-px hover:bg-blue-700 active:scale-95"
      >
        {user ? "Dashboard" : "Log In"}
      </button>
    </nav>
  );
}
