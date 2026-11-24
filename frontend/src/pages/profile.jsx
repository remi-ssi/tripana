import DeactivateModal from "../components/deleteAccount";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import Sidebar from "../components/dashboardNav";
import { useAuth } from "../hooks/AuthProfile";
import { authService } from "../services/authService";
import { itineraryService } from "../services/iteneraryService";

// ─── Brand colors ─────────────────────────────────────────────────────────────
const BRAND = {
    navy: "#1E3A5F",
    blue: "#2B6CB0",
    orange: "#F6821F",
    red: "#D93025",
};

function getInitials(first = "", last = "") {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

const TAG_STYLES = {
    food: "bg-orange-100 text-orange-700",
    adventure: "bg-blue-100 text-blue-800",
    cultural: "bg-emerald-100 text-emerald-800",
    nature: "bg-green-100 text-green-800",
    wellness: "bg-pink-100 text-pink-800",
    entertainment: "bg-purple-100 text-purple-800",
    events: "bg-yellow-100 text-yellow-800",
    "city exploration": "bg-sky-100 text-sky-800",
};

const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function ProfilePage() {
    const navigate = useNavigate();

    const { user: authUser, clearUser } = useAuth();

    // ── User data (replace with real API/context) ──────────────────────────────
    const [user, setUser] = useState({
        firstName: authUser?.first_name || "Jennie",
        lastName: authUser?.last_name || "Kim",
        email: authUser?.email || "jennie@email.com",
        handle: authUser?.username ? `@${authUser.username}` : `@${(authUser?.first_name || "user").toLowerCase()}`,
        since: authUser?.date_created ? new Date(authUser.date_created).getFullYear() : "2024",
    });

    const [stats, setStats] = useState({ itineraries: 0, places: 0 });
    const [preferences, setPreferences] = useState([]);

    useEffect(() => {
        authService.getPreferenceStatus().then((res) => {
            if (res.has_preferences) {
                setPreferences(res.preferred_categories);
            }
        }).catch((err) => console.error("Failed to fetch preferences", err));

        itineraryService.list().then((schedules) => {
            let totalPlaces = 0;
            schedules.forEach(schedule => {
                if (schedule.days) {
                    schedule.days.forEach(day => {
                        if (day.items) {
                            totalPlaces += day.items.filter(item => item.type === 'attraction').length;
                        }
                    });
                }
            });
            setStats({ itineraries: schedules.length, places: totalPlaces });
        }).catch((err) => console.error("Failed to fetch stats", err));
    }, []);

    // ── Personal Info edit state ───────────────────────────────────────────────
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [draft, setDraft] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleEditInfo = () => {
        // Enter edit mode — seed draft from current user
        setDraft({ firstName: user.firstName, lastName: user.lastName, email: user.email });
        setIsEditingInfo(true);
    };

    const handleSaveInfo = async () => {
        setIsSaving(true);
        try {
            await authService.updateProfile({
                first_name: draft.firstName,
                last_name: draft.lastName,
                email: draft.email
            });
            setUser((prev) => ({ ...prev, ...draft }));
            setIsEditingInfo(false);
            // Optionally, update the context authUser if clearUser/setAuthSession is available
        } catch (error) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelInfo = () => {
        setIsEditingInfo(false);
    };

    // ── Preferences — navigate to /user-preference ────────────────────────────
    const handleEditPrefs = () => navigate("/user-preference");

    // ── Logo click → /dashboard ───────────────────────────────────────────────
    const handleLogoClick = () => navigate("/dashboard");

    // ── Other actions ─────────────────────────────────────────────────────────
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);

    const handleChangePassword = () => navigate("/change-password");
    const handleDeactivate = () => setShowDeactivateModal(true);
    
    const handleConfirmDeactivate = async () => {
        try {
            await authService.deleteAccount();
            clearUser();
            navigate("/login");
        } catch (error) {
            alert(error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
        } finally {
            clearUser();
            navigate('/login', { replace: true });
        }
    };

    const initials = getInitials(user.firstName, user.lastName);

    return (
        <div className="min-h-screen bg-[#EEF3FA]">
            <Sidebar onLogout={handleLogout} user={authUser} />
            <div className="ml-16 flex flex-col items-center min-h-screen">
                {/* ── Banner + Avatar wrapper ── */}
                <div className="relative w-full">

                    {/* Banner */}
                    <div
                    className="relative h-36 rounded-b-3xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: BRAND.navy }}
                    >
                    <span
                        className="absolute -top-8 -right-6 w-44 h-44 rounded-full opacity-20"
                        style={{ backgroundColor: BRAND.orange }}
                    />
                    <span className="absolute -bottom-10 left-8 w-28 h-28 rounded-full bg-white opacity-5" />
                    </div>

                    {/* Avatar */}
                    <div className="absolute -bottom-11 left-1/2 -translate-x-1/2">
                        <div className="p-[3px] rounded-full bg-white shadow-lg">
                            <div
                            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold select-none"
                            style={{ background: `linear-gradient(145deg, ${BRAND.navy}, ${BRAND.blue})` }}
                            >
                            {initials}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-3xl flex flex-col">

                {/* ── Body ────────────────────────────────────────────────────────── */}
                <div className="mt-14 px-4 pb-8 flex flex-col gap-4">

                    {/* Name + handle */}
                    <div className="text-center">
                        <p className="text-xl font-semibold" style={{ color: BRAND.navy }}>
                            {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {user.handle}&nbsp;·&nbsp;Member since {user.since}
                        </p>
                    </div>

                    {/* ── Stats ── */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Itineraries", value: stats.itineraries },
                            { label: "Places", value: stats.places },
                        ].map(({ label, value }) => (
                            <div
                                key={label}
                                className="bg-white border border-blue-100 rounded-2xl py-4 text-center"
                            >
                                <span className="block text-3xl font-bold" style={{ color: BRAND.orange }}>
                                    {value}
                                </span>
                                <span className="text-xs uppercase tracking-wide text-slate-400 mt-1 block">
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* ── Personal Info card ── */}
                    <div className="bg-white border border-blue-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                Personal Info
                            </p>

                            <div className="flex items-center gap-2">
                                {isEditingInfo && (
                                    <button
                                        onClick={handleCancelInfo}
                                        className="text-xs font-medium px-3 py-1 rounded-lg text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={isEditingInfo ? handleSaveInfo : handleEditInfo}
                                    disabled={isSaving}
                                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                                    style={
                                        isEditingInfo
                                            ? { backgroundColor: BRAND.blue, color: "#fff" }
                                            : { backgroundColor: "#E8EFF8", color: BRAND.blue }
                                    }
                                >
                                    {isEditingInfo ? (isSaving ? " Saving..." : " Save") : " Edit"}
                                </button>
                            </div>
                        </div>
                        <div className="h-px bg-blue-50 mb-3" />

                        <div className="grid grid-cols-2 gap-3">
                            {/* First name */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400">First name</span>
                                {isEditingInfo ? (
                                    <input
                                        type="text"
                                        value={draft.firstName}
                                        onChange={(e) => setDraft((d) => ({ ...d, firstName: e.target.value }))}
                                        className="text-sm font-medium text-[#1E3A5F] bg-white border-2 rounded-xl px-3 py-2 outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: BRAND.blue }}
                                    />
                                ) : (
                                    <div className="text-sm font-medium text-[#1E3A5F] bg-[#F4F7FC] border border-blue-100 rounded-xl px-3 py-2">
                                        {user.firstName}
                                    </div>
                                )}
                            </div>

                            {/* Last name */}
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400">Last name</span>
                                {isEditingInfo ? (
                                    <input
                                        type="text"
                                        value={draft.lastName}
                                        onChange={(e) => setDraft((d) => ({ ...d, lastName: e.target.value }))}
                                        className="text-sm font-medium text-[#1E3A5F] bg-white border-2 rounded-xl px-3 py-2 outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: BRAND.blue }}
                                    />
                                ) : (
                                    <div className="text-sm font-medium text-[#1E3A5F] bg-[#F4F7FC] border border-blue-100 rounded-xl px-3 py-2">
                                        {user.lastName}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="col-span-2 flex flex-col gap-1">
                                <span className="text-[11px] text-slate-400">Email</span>
                                {isEditingInfo ? (
                                    <input
                                        type="email"
                                        value={draft.email}
                                        onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                                        className="text-sm font-medium text-[#1E3A5F] bg-white border-2 rounded-xl px-3 py-2 outline-none focus:ring-2 transition-all"
                                        style={{ borderColor: BRAND.blue }}
                                    />
                                ) : (
                                    <div className="text-sm font-medium text-[#1E3A5F] bg-[#F4F7FC] border border-blue-100 rounded-xl px-3 py-2">
                                        {user.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Trip Preferences card ── */}
                    <div className="bg-white border border-blue-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                Trip Preferences
                            </p>
                            {/* Edit navigates to /user-preference */}
                            <button
                                onClick={handleEditPrefs}
                                className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg"
                                style={{ color: BRAND.blue, backgroundColor: "#E8EFF8" }}
                            >
                                Edit
                            </button>
                        </div>
                        <div className="h-px bg-blue-50 mb-3" />

                        <div className="flex flex-wrap gap-2 items-center">
                            {preferences.map((tag) => (
                                <span
                                    key={tag}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${TAG_STYLES[tag.toLowerCase()] ?? "bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    {capitalize(tag)}
                                </span>
                            ))}
                            {preferences.length === 0 && (
                                <p className="text-sm text-slate-400">No preferences set yet.</p>
                            )}
                        </div>
                    </div>

                    {/* ── Action buttons ── */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Change Password — Tripana blue */}
                        <button
                            onClick={handleChangePassword}
                            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all"
                            style={{ backgroundColor: BRAND.blue }}
                        >
                            Change Password
                        </button>

                        <button
                            onClick={handleDeactivate}
                            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white hover:opacity-90 active:scale-[0.98] transition-all"
                            style={{ backgroundColor: BRAND.red }}
                        >
                            Delete Account
                        </button>
                    </div>

                </div>
            </div>

            {/* ── Deactivate modal ── */}
            <DeactivateModal
                isOpen={showDeactivateModal}
                onClose={() => setShowDeactivateModal(false)}
                onConfirm={handleConfirmDeactivate}
            />
            </div>
        </div>
    );
}
