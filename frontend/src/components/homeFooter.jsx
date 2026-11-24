import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

// ─── Footer ────────────────────────────────────────────────────────────────────
export function Footer() {
    const navigate = useNavigate();

    const handleNav = (href) => {
        if (href.startsWith("#")) {
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else if (href.startsWith("http")) {
            window.open(href, "_blank", "noopener noreferrer");
        } else {
            navigate(href);
        }
    };

    return (
        <footer className="bg-[#0f172a] text-white">

            {/* Bottom bar */}
            <div className="border-t border-slate-800 px-8 py-5">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-3 sm:flex-row">
                    <p className="text-xs text-slate-600">
                        © 2026 Tripana. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}