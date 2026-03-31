import { useState } from "react";
import { ChevronDown, User } from "lucide-react";
import logo from "../assets/logoWhite.png";

const navLinks = [
  { label: "DASHBOARD", href: "#" },
  { label: "ITINERARIES", href: "#" },
  { label: "ABOUT US", href: "#" },
];

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="w-full bg-blue-600 px-6 py-3 flex items-center justify-between shadow-lg">
      {/* Logo */}
      <div className="flex items-center">
        <Logo>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <NavButton key={link.label} label={link.label} href={link.href} />
        ))}
      </div>

      {/* User Icon + Dropdown */}
      <div className="relative flex items-center gap-1">
        <button
          className="text-white p-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors duration-300"
          aria-label="User profile"
        >
          <User size={24} strokeWidth={1.5} />
        </button>

        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="text-white p-1 rounded cursor-pointer bg-transparent border-none hover:bg-white/10 transition-colors duration-300"
          aria-label="Toggle dropdown"
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-xl overflow-hidden z-50">
            {["My Profile", "Settings", "Sign Out"].map((item) => (
              <a
                key={item}
                href="#"
                className="block px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors duration-150"
                style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavButton({ label, href }) {
  return (
    <a
      href={href}
      onClick={(e) => e.preventDefault()}
      className="relative px-5 py-2 rounded-full text-white text-sm font-bold tracking-widest overflow-hidden cursor-pointer group hover:bg-white/15 transition-colors duration-300"
      style={{ fontFamily: "Helvetica, Arial, sans-serif" }}
    >
      {/* Sliding glass shimmer on hover */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out pointer-events-none" />
      <span className="relative z-10">{label}</span>
    </a>
  );
}