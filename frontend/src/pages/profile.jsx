import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Compass,
  KeyRound,
  Loader2,
  Mail,
  Map,
  MapPin,
  Pencil,
  ShieldAlert,
  Trash2,
  User,
  X,
} from 'lucide-react'
import DeactivateModal from '../components/deleteAccount'
import Sidebar from '../components/dashboardNav'
import { useAuth } from '../hooks/AuthProfile'
import { authService } from '../services/authService'
import { itineraryService } from '../services/iteneraryService'

function getInitials(first = '', last = '') {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'TR'
}

function capitalize(str) {
  if (!str) return ''
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user: authUser, clearUser, refreshUser } = useAuth()

  const [user, setUser] = useState({
    firstName: authUser?.first_name || 'Jennie',
    lastName: authUser?.last_name || 'Kim',
    email: authUser?.email || 'jennie@email.com',
    handle: authUser?.username
      ? `@${authUser.username}`
      : `@${(authUser?.first_name || 'user').toLowerCase()}`,
    since: authUser?.date_created
      ? new Date(authUser.date_created).getFullYear()
      : '2024',
  })

  const [stats, setStats] = useState({ itineraries: 0, places: 0 })
  const [preferences, setPreferences] = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [draft, setDraft] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [infoError, setInfoError] = useState('')
  const [infoSuccess, setInfoSuccess] = useState('')

  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!authUser) return
    const nextFirst = authUser.first_name || 'Jennie'
    const nextLast = authUser.last_name || 'Kim'
    const nextEmail = authUser.email || 'jennie@email.com'
    const nextHandle = authUser.username
      ? `@${authUser.username}`
      : `@${nextFirst.toLowerCase()}`
    const nextSince = authUser.date_created
      ? new Date(authUser.date_created).getFullYear()
      : '2024'

    setUser({
      firstName: nextFirst,
      lastName: nextLast,
      email: nextEmail,
      handle: nextHandle,
      since: nextSince,
    })
  }, [authUser])

  useEffect(() => {
    let active = true

    Promise.allSettled([
      authService.getPreferenceStatus(),
      itineraryService.list(),
    ]).then(([prefResult, schedulesResult]) => {
      if (!active) return

      if (prefResult.status === 'fulfilled' && prefResult.value?.has_preferences) {
        setPreferences(prefResult.value.preferred_categories || [])
      }

      if (schedulesResult.status === 'fulfilled') {
        const schedules = schedulesResult.value || []
        let totalPlaces = 0
        schedules.forEach((schedule) => {
          if (typeof schedule.attractionCount === 'number') {
            totalPlaces += schedule.attractionCount
          } else if (schedule.days) {
            schedule.days.forEach((day) => {
              if (day.items) {
                totalPlaces += day.items.filter(
                  (item) => item.type === 'attraction',
                ).length
              }
            })
          }
        })
        setStats({ itineraries: schedules.length, places: totalPlaces })
      }

      setLoadingData(false)
    })

    return () => {
      active = false
    }
  }, [])

  const handleEditInfo = () => {
    setInfoError('')
    setInfoSuccess('')
    setDraft({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    })
    setIsEditingInfo(true)
  }

  const handleCancelInfo = () => {
    setInfoError('')
    setIsEditingInfo(false)
  }

  const handleSaveInfo = async (e) => {
    if (e) e.preventDefault()
    const firstName = draft.firstName.trim()
    const lastName = draft.lastName.trim()
    const email = draft.email.trim()

    if (!firstName || !lastName || !email) {
      setInfoError('First name, last name, and email are required.')
      return
    }

    setIsSaving(true)
    setInfoError('')
    setInfoSuccess('')
    try {
      await authService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        email,
      })
      setUser((prev) => ({
        ...prev,
        firstName,
        lastName,
        email,
      }))
      setIsEditingInfo(false)
      setInfoSuccess('Personal information updated.')
      if (typeof refreshUser === 'function') {
        refreshUser()
      }
    } catch (error) {
      setInfoError(error.message || 'Failed to update personal information.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditPrefs = () => navigate('/user-preference')
  const handleChangePassword = () => navigate('/change-password')

  const handleOpenDeactivate = () => {
    setDeleteError('')
    setShowDeactivateModal(true)
  }

  const handleConfirmDeactivate = async () => {
    setIsDeleting(true)
    setDeleteError('')
    try {
      await authService.deleteAccount()
      setShowDeactivateModal(false)
      clearUser()
      navigate('/login')
    } catch (error) {
      setDeleteError(error.message || 'Failed to delete account.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } finally {
      clearUser()
      navigate('/login', { replace: true })
    }
  }

  const initials = getInitials(user.firstName, user.lastName)

  return (
    <div className="min-h-screen bg-slate-50 font-['Poppins'] text-slate-900">
      <Sidebar onLogout={handleLogout} user={authUser} />

      <div className="ml-16 flex min-h-screen flex-col">
        {/* Top Workspace Header */}
        <header className="border-b border-slate-200 bg-white px-6 py-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-['Nunito'] text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Account & Profile
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your personal details, default travel interests, and account security settings.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/itineraryPage')}
              className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              <span>View saved itineraries</span>
              <ArrowRight size={14} strokeWidth={1.85} />
            </button>
          </div>
        </header>

        {/* Main Workspace Two-Column Grid */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8 lg:px-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Profile Identity, Travel Stats, and Trip Preferences */}
            <div className="space-y-6 lg:col-span-5">
              {/* Profile Identity Card */}
              <section
                aria-label="Profile overview"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-blue-600 font-['Nunito'] text-xl font-semibold text-white select-none">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-['Nunito'] text-xl font-semibold text-slate-900">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="mt-0.5 truncate text-sm text-slate-500">
                      {user.email}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 tabular-nums">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 font-medium text-slate-700">
                        {user.handle}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={13} strokeWidth={1.85} className="text-slate-400" />
                        Member since {user.since}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Travel Statistics */}
                <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-200 pt-5">
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                        Itineraries
                      </p>
                      <p className="mt-1 font-['Nunito'] text-2xl font-semibold text-slate-900 tabular-nums">
                        {stats.itineraries}
                      </p>
                    </div>
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <Map size={18} strokeWidth={1.85} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                        Places
                      </p>
                      <p className="mt-1 font-['Nunito'] text-2xl font-semibold text-slate-900 tabular-nums">
                        {stats.places}
                      </p>
                    </div>
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <MapPin size={18} strokeWidth={1.85} />
                    </div>
                  </div>
                </div>
              </section>

              {/* Trip Preferences Card */}
              <section
                aria-label="Trip preferences"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Compass size={18} strokeWidth={1.85} className="text-blue-600" />
                      <h2 className="font-['Nunito'] text-lg font-semibold text-slate-900">
                        Trip Preferences
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Default categories used to personalize attraction suggestions.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleEditPrefs}
                    className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  >
                    <Pencil size={13} strokeWidth={1.85} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="mt-4">
                  {loadingData ? (
                    <div className="flex items-center gap-2 py-2 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin text-blue-600" />
                      <span>Loading preferences...</span>
                    </div>
                  ) : preferences.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {preferences.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        >
                          {capitalize(tag)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center">
                      <p className="text-sm font-medium text-slate-700">
                        No preferences configured yet
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Select your travel interests to tailor Tripana recommendations.
                      </p>
                      <button
                        type="button"
                        onClick={handleEditPrefs}
                        className="mt-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                      >
                        <span>Choose travel preferences</span>
                        <ArrowRight size={13} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Column: Personal Info Editor, Account Security, and Danger Zone */}
            <div className="space-y-6 lg:col-span-7">
              {/* Personal Info Card */}
              <section
                aria-label="Personal information"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <User size={18} strokeWidth={1.85} className="text-blue-600" />
                      <h2 className="font-['Nunito'] text-lg font-semibold text-slate-900">
                        Personal Information
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Update your name and primary contact email address.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingInfo ? (
                      <>
                        <button
                          type="button"
                          onClick={handleCancelInfo}
                          disabled={isSaving}
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-50"
                        >
                          <X size={13} strokeWidth={1.85} />
                          <span>Cancel</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveInfo}
                          disabled={isSaving}
                          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none disabled:opacity-60"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save changes</span>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEditInfo}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                      >
                        <Pencil size={13} strokeWidth={1.85} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>

                {infoError && (
                  <div
                    role="alert"
                    className="mt-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
                  >
                    <AlertCircle size={15} strokeWidth={1.85} className="shrink-0 text-red-600" />
                    <span>{infoError}</span>
                  </div>
                )}

                {infoSuccess && !isEditingInfo && (
                  <div
                    role="status"
                    className="mt-4 flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-3.5 py-2.5 text-xs text-green-700"
                  >
                    <CheckCircle2 size={15} strokeWidth={1.85} className="shrink-0 text-green-600" />
                    <span>{infoSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleSaveInfo} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* First name */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="profile-first-name"
                      className="text-xs font-medium text-slate-600"
                    >
                      First name
                    </label>
                    {isEditingInfo ? (
                      <input
                        id="profile-first-name"
                        type="text"
                        value={draft.firstName}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, firstName: e.target.value }))
                        }
                        className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                      />
                    ) : (
                      <div className="flex min-h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-900">
                        {user.firstName}
                      </div>
                    )}
                  </div>

                  {/* Last name */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="profile-last-name"
                      className="text-xs font-medium text-slate-600"
                    >
                      Last name
                    </label>
                    {isEditingInfo ? (
                      <input
                        id="profile-last-name"
                        type="text"
                        value={draft.lastName}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, lastName: e.target.value }))
                        }
                        className="min-h-[42px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                      />
                    ) : (
                      <div className="flex min-h-[42px] items-center rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-900">
                        {user.lastName}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label
                      htmlFor="profile-email"
                      className="text-xs font-medium text-slate-600"
                    >
                      Email address
                    </label>
                    {isEditingInfo ? (
                      <div className="relative">
                        <Mail
                          size={15}
                          strokeWidth={1.85}
                          className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="profile-email"
                          type="email"
                          value={draft.email}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, email: e.target.value }))
                          }
                          className="min-h-[42px] w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-3.5 pl-10 text-sm text-slate-900 transition-colors focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
                        />
                      </div>
                    ) : (
                      <div className="flex min-h-[42px] items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-900">
                        <Mail size={15} strokeWidth={1.85} className="shrink-0 text-slate-400" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}
                  </div>
                </form>
              </section>

              {/* Account Security Card */}
              <section
                aria-label="Account security"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3.5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <KeyRound size={18} strokeWidth={1.85} />
                    </div>
                    <div>
                      <h2 className="font-['Nunito'] text-lg font-semibold text-slate-900">
                        Password & Security
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Update your account password to keep your saved trips secure.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                  >
                    <span>Change password</span>
                    <ArrowRight size={14} strokeWidth={1.85} />
                  </button>
                </div>
              </section>

              {/* Danger Zone Card */}
              <section
                aria-label="Danger zone"
                className="rounded-2xl border border-red-200/80 bg-white p-6 shadow-xs"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-3.5">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
                      <ShieldAlert size={18} strokeWidth={1.85} />
                    </div>
                    <div>
                      <h2 className="font-['Nunito'] text-lg font-semibold text-slate-900">
                        Delete Account
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Permanently remove your profile, preferences, and all saved itineraries.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenDeactivate}
                    className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white shadow-2xs transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <Trash2 size={14} strokeWidth={1.85} />
                    <span>Delete account</span>
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Account Confirmation Modal */}
      <DeactivateModal
        isOpen={showDeactivateModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeactivateModal(false)
            setDeleteError('')
          }
        }}
        onConfirm={handleConfirmDeactivate}
        isDeleting={isDeleting}
        error={deleteError}
      />
    </div>
  )
}
