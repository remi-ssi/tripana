import { useState } from "react";
import { ChevronDown, User, UserCog, LogOut } from "lucide-react";
import logo from "../assets/white.png";

const navLinks = [
  { label: "DASHBOARD", href: "#" },
  { label: "ITINERARIES", href: "#" },
  { label: "ABOUT US", href: "#" },
];

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  return (
    <nav className="w-full bg-blue-700 px-6 py-3 flex items-center justify-between shadow-lg">
      {/* Logo */}
      <div className="flex items-right ml-8">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("DASHBOARD");
          }}
          aria-label="Go to Dashboard"
          className="inline-flex"
        >
          <img src={logo} alt="Tripana Logo" className="h-10 w-auto object-contain" />
        </a>
      </div>

      {/* Nav Links */}
      <div className="flex items-center gap-1">
        {navLinks.map((link) => (
          <NavButton
            key={link.label}
            label={link.label}
            href={link.href}
            isActive={activeTab === link.label}
            onClick={() => setActiveTab(link.label)}
          />
        ))}
      </div>

      {/* User Icon + Dropdown */}
      <div className="relative flex items-center gap-1">
        <button
          className="text-white p-2 rounded-full cursor-pointer hover:bg-white/10 transition-colors duration-300"
          aria-label="User profile"
        >
          <User size={25} strokeWidth={2} />
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
            {[
              { label: "Edit Profile", Icon: UserCog },
              { label: "Log Out", Icon: LogOut },
            ].map(({ label, Icon }) => (
              <a
                key={label}
                href="#"
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors duration-150"
              >
                <Icon size={16} />
                <span>{label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}

function NavButton({ label, href, isActive, onClick }) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className="relative px-5 py-2 rounded-full text-white text-xs font-bold tracking-widest overflow-hidden cursor-pointer group hover:bg-white/15 transition-colors duration-300"
    >
      {/* Sliding glass shimmer on hover */}
      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out pointer-events-none" />
      {isActive && <span className="absolute left-4 right-4 bottom-0 h-0.5 bg-white rounded-full" />}
      <span className="relative z-10">{label}</span>
    </a>
  );
}