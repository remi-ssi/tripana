import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Map, CalendarDays, LogOut, ChevronRight, User, FileText, ShieldCheck, Info } from "lucide-react";
import logo from "../assets/white.png";
import LogoutConfirmation from "./confirmLogout";

const NAV_ITEMS = [
  { label: "Dashboard",   icon: LayoutDashboard, href: "/dashboard" },
  { label: "Map",         icon: Map,             href: "/map" },
  { label: "Itinerary",   icon: CalendarDays,    href: "/itineraryPage" },
  { label: "About Us",    icon: Info,        href: "/about" },
  { label: "Terms and Conditions", icon: FileText,   href: "/terms" },
  { label: "Privacy Policy", icon: ShieldCheck,         href: "/privacy" },
];

export default function Sidebar({ onLogout, user }) {
  const navigate   = useNavigate();
  const location   = useLocation();
  const [expanded,               setExpanded]               = useState(false);
  const [profileMenuOpen,        setProfileMenuOpen]        = useState(false);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [isLoggingOut,           setIsLoggingOut]           = useState(false);

  const handleConfirmLogout = async () => {
    if (!onLogout) {
      setShowLogoutConfirmation(false);
      return;
    }
    setIsLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirmation(false);
    }
  };

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  const fullName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim()
    : "User";

  return (
    <>
      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 flex flex-col
          bg-blue-700 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden
          ${expanded ? "w-56" : "w-16"}`}
        onMouseEnter={() => { setExpanded(true);  }}
        onMouseLeave={() => { setExpanded(false); setProfileMenuOpen(false); }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center w-full pt-5 pb-0.5 relative">
          <div
            onClick={() => navigate("/dashboard")}
            className={`flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out
              ${expanded ? "w-20 h-20" : "w-9 h-9"}`}
          >
            <img
              src={logo}
              alt="Tripana"
              className={`object-contain transition-all duration-300 ease-in-out
                ${expanded ? "h-12" : "h-7"}`}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="mx-3 border-t border-white/20 flex-shrink-0" />

        {/* Nav links */}
        <nav className="flex flex-col gap-1 px-2 mt-3 flex-1">
          {NAV_ITEMS.map(({ label, icon: ICON, href }) => {
            const isActive = location.pathname === href;
            return (
              <button
                key={label}
                onClick={() => navigate(href)}
                className={`flex items-center gap-3 px-2.5 py-2.5 rounded-xl w-full text-left
                  transition-all duration-200 group
                  ${isActive
                    ? "bg-white/20 text-white"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"}`}
              >
                <ICON size={20} className="flex-shrink-0" strokeWidth={1.8} />
                <span
                  className={`text-sm font-medium whitespace-nowrap transition-all duration-200
                    ${expanded ? "opacity-100 delay-75" : "opacity-0 w-0 overflow-hidden"}`}
                >
                  {label}
                </span>
                {/* Active indicator dot when collapsed */}
                {isActive && !expanded && (
                  <span className="absolute left-[52px] w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile section */}
        <div className="px-2 pb-4 flex-shrink-0">
          <div className="mx-0 mb-2 border-t border-white/20" />

          {/* Profile button */}
          <button
            onClick={() => setProfileMenuOpen((o) => !o)}
            className="relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl w-full
              text-blue-200 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-blue-400
              flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">{initials}</span>
            </div>

            <div
              className={`flex-1 text-left min-w-0 transition-all duration-200
                ${expanded ? "opacity-100 delay-75" : "opacity-0 w-0 overflow-hidden"}`}
            >
              <p className="text-xs font-semibold text-white truncate">{fullName}</p>
              <p className="text-[10px] text-blue-300">View profile</p>
            </div>

            {expanded && (
              <ChevronRight
                size={14}
                className={`flex-shrink-0 transition-transform duration-200
                  ${profileMenuOpen ? "rotate-90" : ""}`}
              />
            )}
          </button>

          {/* Profile sub-menu (inline, slides down) */}
          <div
            className={`overflow-hidden transition-all duration-200
              ${profileMenuOpen && expanded ? "max-h-24 mt-1" : "max-h-0"}`}
          >
            <div className="flex flex-col gap-0.5 px-1">
               {/* View Profile */}
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left
                    text-blue-200 hover:bg-white/10 hover:text-white transition-colors duration-150"
                >
                  <User size={15} className="flex-shrink-0" />
                  <span className="text-xs font-medium whitespace-nowrap">
                    View Profile
                  </span>
                </button>

              {/* Log Out */}
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  setShowLogoutConfirmation(true);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left
                  text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors duration-150"
              >
                <LogOut size={15} className="flex-shrink-0" />
                <span className="text-xs font-medium whitespace-nowrap">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Logout confirmation modal (same as dashboardNav) */}
      {showLogoutConfirmation && (
        <LogoutConfirmation
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowLogoutConfirmation(false)}
          isLoading={isLoggingOut}
        />
      )}
    </>
  );
}
