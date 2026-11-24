import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  CalendarDays,
  ChevronRight,
  FileText,
  Info,
  LayoutDashboard,
  LogOut,
  Map,
  ShieldCheck,
  User,
} from 'lucide-react'
import tripanaLogo from '../assets/logo.png'
import LogoutConfirmation from './confirmLogout'

const PRIMARY_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Map', icon: Map, href: '/map' },
  { label: 'Itinerary', icon: CalendarDays, href: '/itineraryPage' },
]

const SECONDARY_NAV_ITEMS = [
  { label: 'About Us', icon: Info, href: '/about' },
  { label: 'Terms & Conditions', icon: FileText, href: '/terms' },
  { label: 'Privacy Policy', icon: ShieldCheck, href: '/privacy' },
]

export default function Sidebar({ onLogout, user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirmLogout = async () => {
    if (!onLogout) {
      setShowLogoutConfirmation(false)
      return
    }
    setIsLoggingOut(true)
    try {
      await onLogout()
    } finally {
      setIsLoggingOut(false)
      setShowLogoutConfirmation(false)
    }
  }

  const initials = user
    ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || 'U'
    : 'U'

  const fullName = user
    ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || 'Traveler'
    : 'Traveler'

  const isNavItemActive = (href) => {
    if (href === '/itineraryPage') {
      return (
        location.pathname === '/itineraryPage' ||
        location.pathname === '/itinerary' ||
        location.pathname.startsWith('/itinerary/')
      )
    }
    return location.pathname === href
  }

  return (
    <>
      <aside
        aria-label="Primary navigation"
        className={`fixed top-0 left-0 z-50 flex h-full flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 ease-out motion-reduce:transition-none ${
          expanded ? 'w-60 shadow-lg shadow-slate-900/5' : 'w-16'
        }`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => {
          setExpanded(false)
          setProfileMenuOpen(false)
        }}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-center border-b border-slate-100 px-2.5">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            aria-label="Go to Dashboard"
            className="group flex w-full items-center justify-center rounded-xl p-1.5 transition-colors duration-200 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <img
              src={tripanaLogo}
              alt="Tripana"
              className={`w-auto select-none object-contain transition-all duration-300 ease-out ${
                expanded ? 'h-9' : 'h-5'
              }`}
            />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-1 flex-col justify-between overflow-x-hidden overflow-y-auto px-2.5 py-4">
          <div className="space-y-1">
            <p
              className={`px-2.5 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase transition-opacity duration-200 ${
                expanded ? 'opacity-100' : 'sr-only opacity-0'
              }`}
            >
              Workspace
            </p>
            <nav className="flex flex-col gap-1">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const isActive = isNavItemActive(item.href)
                const IconComponent = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    title={!expanded ? item.label : undefined}
                    onClick={() => navigate(item.href)}
                    className={`group relative flex min-h-[42px] w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                      isActive
                        ? 'bg-blue-50 font-semibold text-blue-600'
                        : 'font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-blue-600" />
                    )}
                    <IconComponent
                      size={20}
                      strokeWidth={isActive ? 2.1 : 1.85}
                      className={`shrink-0 transition-colors duration-200 ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-slate-500 group-hover:text-slate-800'
                      }`}
                    />
                    <span
                      className={` text-sm whitespace-nowrap transition-all duration-200 ${
                        expanded
                          ? 'opacity-100 delay-75'
                          : 'w-0 overflow-hidden opacity-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div className="space-y-1 pt-4">
            <div className="mx-1.5 mb-3 border-t border-slate-100" />
            <p
              className={`px-2.5 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase transition-opacity duration-200 ${
                expanded ? 'opacity-100' : 'sr-only opacity-0'
              }`}
            >
              Resources
            </p>
            <nav className="flex flex-col gap-1">
              {SECONDARY_NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.href
                const IconComponent = item.icon
                return (
                  <button
                    key={item.label}
                    type="button"
                    title={!expanded ? item.label : undefined}
                    onClick={() => navigate(item.href)}
                    className={`group relative flex min-h-[40px] w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                      isActive
                        ? 'bg-blue-50 font-semibold text-blue-600'
                        : 'font-medium text-slate-500 hover:bg-slate-100/80 hover:text-slate-800'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-2 bottom-2 left-0 w-1 rounded-r-full bg-blue-600" />
                    )}
                    <IconComponent
                      size={18}
                      strokeWidth={isActive ? 2 : 1.75}
                      className={`shrink-0 transition-colors duration-200 ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-slate-400 group-hover:text-slate-700'
                      }`}
                    />
                    <span
                      className={`text-xs whitespace-nowrap transition-all duration-200 ${
                        expanded
                          ? 'opacity-100 delay-75'
                          : 'w-0 overflow-hidden opacity-0'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="shrink-0 border-t border-slate-200 bg-slate-50/60 p-2.5">
          <button
            type="button"
            onClick={() => {
              if (!expanded) setExpanded(true)
              setProfileMenuOpen((open) => !open)
            }}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-200 hover:bg-white hover:shadow-2xs focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-blue-200 bg-blue-50 text-xs font-semibold text-blue-700">
              {initials}
            </div>

            <div
              className={`min-w-0 flex-1 transition-all duration-200 ${
                expanded ? 'opacity-100 delay-75' : 'w-0 overflow-hidden opacity-0'
              }`}
            >
              <p className="truncate text-xs font-semibold text-slate-900">
                {fullName}
              </p>
              <p className="truncate text-[11px] text-slate-500">
                Account settings
              </p>
            </div>

            {expanded && (
              <ChevronRight
                size={15}
                className={`shrink-0 text-slate-400 transition-transform duration-200 ${
                  profileMenuOpen ? 'rotate-90 text-slate-700' : ''
                }`}
              />
            )}
          </button>

          {/* Expandable Profile Actions */}
          <div
            className={`overflow-hidden transition-all duration-200 ${
              profileMenuOpen && expanded ? 'mt-1.5 max-h-28' : 'max-h-0'
            }`}
          >
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false)
                  navigate('/profile')
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-900"
              >
                <User size={15} className="shrink-0 text-slate-500" />
                <span className="whitespace-nowrap">View Profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileMenuOpen(false)
                  setShowLogoutConfirmation(true)
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut size={15} className="shrink-0" />
                <span className="whitespace-nowrap">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {showLogoutConfirmation && (
        <LogoutConfirmation
          onConfirm={handleConfirmLogout}
          onCancel={() => setShowLogoutConfirmation(false)}
          isLoading={isLoggingOut}
        />
      )}
    </>
  )
}
