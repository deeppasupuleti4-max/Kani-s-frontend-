import { Link, useLocation } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

/* Small "please sign in" prompt used inside pages such as the cart.
   It sends the customer to the full sign-in page and brings them back here afterwards. */
export function LoginBox({ message = "Sign in to continue.", button = "Sign in" }) {
    const location = useLocation();
    const next = encodeURIComponent(location.pathname + location.search);

    return (
        <div className="login-box" role="note" style={{ marginTop: 16, display: "grid", gap: 12, justifyItems: "start" }}>
            <p className="shop-msg" style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                <Lock size={16} /> {message}
            </p>
            <Link className="shop-btn" to={`/account?next=${next}`} style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                {button} <ArrowRight size={16} />
            </Link>
            <Link className="ct-textlink" to={`/account?mode=register&next=${next}`}>New here? Create an account</Link>
        </div>
    );
}

export default LoginBox;