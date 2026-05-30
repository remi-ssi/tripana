import DeactivateModal from "../components/deleteAccount";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

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
    Food: "bg-orange-100 text-orange-700",
    Adventure: "bg-blue-100 text-blue-800",
    "City Exploration": "bg-sky-100 text-sky-800",
};

export default function ProfilePage() {
    const navigate = useNavigate();

    // ── User data (replace with real API/context) ──────────────────────────────
    const [user, setUser] = useState({
        firstName: "Jennie",
        lastName: "Kim",
        email: "jennie@email.com",
        handle: "@jenniekim",
        since: "2024",
    });

    const [stats] = useState({ itineraries: 12, places: 8 });
    const [preferences] = useState(["Food", "Adventure", "City Exploration"]);

    // ── Personal Info edit state ───────────────────────────────────────────────
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [draft, setDraft] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    });

    const handleEditInfo = () => {
        // Enter edit mode — seed draft from current user
        setDraft({ firstName: user.firstName, lastName: user.lastName, email: user.email });
        setIsEditingInfo(true);
    };

    const handleSaveInfo = () => {
        // Persist draft → user (replace with your real API call here)
        setUser((prev) => ({ ...prev, ...draft }));
        setIsEditingInfo(false);
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

    const handleChangePassword = () => alert("Open change-password flow");
    const handleDeactivate = () => setShowDeactivateModal(true);
    const handleConfirmDeactivate = () => {
        // TODO: replace with your real delete-account API call, then redirect
        alert("Account deleted.");
        navigate("/");
    };

    const initials = getInitials(user.firstName, user.lastName);

    return (
        <div className="min-h-screen bg-[#EEF3FA] flex flex-col items-center">
            <div className="w-full max-w-md flex flex-col">

                {/* ── Banner ──────────────────────────────────────────────────────── */}
                <div
                    className="relative h-36 rounded-b-3xl overflow-hidden flex-shrink-0"
                    style={{ backgroundColor: BRAND.navy }}
                >
                    {/* Decorative circles */}
                    <span
                        className="absolute -top-8 -right-6 w-44 h-44 rounded-full opacity-20"
                        style={{ backgroundColor: BRAND.orange }}
                    />
                    <span className="absolute -bottom-10 left-8 w-28 h-28 rounded-full bg-white opacity-5" />

                    {/* ── Logo — clicking navigates to /dashboard ── */}
                    <button
                        onClick={handleLogoClick}
                        className="absolute top-4 left-5 flex items-center gap-2 focus:outline-none"
                        aria-label="Go to dashboard"
                    >
                        <img src={logo} alt="Tripana" className="h-8 w-auto" />
                    </button>

                    {/* ── Avatar ── */}
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
                                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                                    style={
                                        isEditingInfo
                                            ? { backgroundColor: BRAND.blue, color: "#fff" }
                                            : { backgroundColor: "#E8EFF8", color: BRAND.blue }
                                    }
                                >
                                    {isEditingInfo ? " Save" : " Edit"}
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
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${TAG_STYLES[tag] ?? "bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    {tag}
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
    );
}