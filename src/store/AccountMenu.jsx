import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useCustomer, logoutCustomer } from "./customerSession.js";
import "./AccountMenu.css";

export default function AccountMenu() {
    const { customer, loading } = useCustomer();
    const navigate = useNavigate();
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    if (loading) return null;

    if (!customer) {
        return (
            <Link to="/account" className="am-link">
                <User size={18} /> <span>Sign in</span>
            </Link>
        );
    }

    const out = async () => {
        setBusy(true);
        setError("");
        try {
            await logoutCustomer();
            navigate("/account", { replace: true });
        } catch (e) {
            setError(e.message || "Could not sign out. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <span className="am-wrap">
            <span className="am-hi">Hi, {(customer.name || "").split(" ")[0]}</span>
            <button type="button" className="am-out" onClick={out} disabled={busy} aria-label="Sign out">
                <LogOut size={18} /> <span>{busy ? "Signing out…" : "Logout"}</span>
            </button>
            {error && <span className="am-err" role="alert">{error}</span>}
        </span>
    );
}
