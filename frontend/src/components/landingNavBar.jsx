import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import fullLogo from "../assets/logo.png";
import { useAuth } from "../hooks/AuthProfile";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: "Features", path: "/#features", hash: "#features" },
    { label: "About Us", path: "/about" },
    { label: "Terms and Conditions", path: "/terms" },
    { label: "Privacy Policy", path: "/privacy" },
  ];

  const handleLinkClick = (link) => {
    setMobileOpen(false);
    if (link.hash && location.pathname === "/") {
      const el = document.querySelector(link.hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(link.path === "/#features" ? "/" : link.path);
  };

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-colors duration-200 ${
        scrolled || mobileOpen
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200"
          : "bg-white/85 backdrop-blur-sm border-b border-slate-200/60"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setMobileOpen(false);
            navigate("/");
          }}
          className="flex items-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <img
            src={fullLogo}
            alt="Tripana"
            className="h-9 w-auto select-none sm:h-10"
          />
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={() => handleLinkClick(link)}
                  className={`cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMobileOpen(false);
              navigate(user ? "/dashboard" : "/login?mode=login");
            }}
            className="hidden cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 md:inline-flex"
          >
            {user ? "Dashboard" : "Log In"}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.label}>
                <button
                  type="button"
                  onClick={() => handleLinkClick(link)}
                  className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                navigate(user ? "/dashboard" : "/login?mode=login");
              }}
              className="w-full cursor-pointer rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              {user ? "Dashboard" : "Log In"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
