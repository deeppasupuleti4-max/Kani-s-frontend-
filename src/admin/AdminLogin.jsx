import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { api } from "./api.js";
import "./login.css";

const LAYERS = [-18, -12, -6, 0, 6, 12, 18]; // stacked copies give the garment real depth when it turns

const FLIPS = [
  ["Collections", "Curate every drop", "Create collections, add dresses and choose what the store shows."],
  ["Orders", "Every order, on time", "Confirm, pack and ship orders with tracking, and collect payments."],
  ["3D studio", "Dresses in 3D", "Turn product photos into models customers can turn around."],
];

const SPARKS = [
  { l: "8%", t: "18%", d: 0 }, { l: "46%", t: "10%", d: 1.4 }, { l: "88%", t: "22%", d: .7 },
  { l: "12%", t: "78%", d: 2 }, { l: "52%", t: "88%", d: 1 }, { l: "92%", t: "70%", d: 2.6 },
];

function Garment() {
  return (
    <svg viewBox="0 0 200 330" aria-hidden="true">
      <defs>
        <linearGradient id="kl-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#23a06f" /><stop offset="1" stopColor="#0d402f" />
        </linearGradient>
        <linearGradient id="kl-gold" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f3d98b" /><stop offset=".5" stopColor="#d8a33d" /><stop offset="1" stopColor="#f3d98b" />
        </linearGradient>
      </defs>
      <path d="M72 14 Q100 40 128 14 L142 112 Q100 128 58 112 Z" fill="url(#kl-green)" />
      <path d="M58 112 Q100 128 142 112 L192 308 Q100 332 8 308 Z" fill="url(#kl-green)" />
      <path d="M92 130 L70 312 M108 130 L130 312 M100 132 L100 322" stroke="#fff" strokeOpacity=".16" strokeWidth="2" fill="none" />
      <path d="M58 112 Q100 128 142 112" stroke="url(#kl-gold)" strokeWidth="6" fill="none" />
      <path d="M8 308 Q100 332 192 308" stroke="url(#kl-gold)" strokeWidth="7" fill="none" />
      <path d="M72 14 Q100 40 128 14" stroke="url(#kl-gold)" strokeWidth="3" fill="none" />
    </svg>
  );
}

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [welcome, setWelcome] = useState(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [flipped, setFlipped] = useState(null);

  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 });
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/auth/admin/login", { method: "POST", body: form });
      setWelcome(data.admin);
      setTimeout(() => onLogin(data.admin), 1100);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="kl-page" onPointerMove={onMove} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
      <div className="kl-orb kl-orb-a" /><div className="kl-orb kl-orb-b" /><div className="kl-orb kl-orb-c" />
      <div className="kl-pattern" />
      {SPARKS.map((s, i) => (
        <i key={i} className="kl-spark" style={{ left: s.l, top: s.t, animationDelay: `${s.d}s` }}>✦</i>
      ))}

      <div className="kl-grid">
        {/* left: 3D garment + flip cards */}
        <section className="kl-left">
          <div className="kl-brand">KANI'S <b>STUDIO</b> <i>✦</i></div>

          <div className="kl-stage">
            <div className="kl-tilt" style={{ transform: `rotateX(${tilt.y * -14}deg) rotateY(${tilt.x * 18}deg)` }}>
              <div className="kl-spin">
                {LAYERS.map((z) => (
                  <div key={z} className="kl-layer" style={{ transform: `translateZ(${z}px)`, filter: `brightness(${0.62 + (z + 18) / 36 * 0.38})` }}>
                    <Garment />
                  </div>
                ))}
              </div>
            </div>
            <div className="kl-floor" />
          </div>

          <div className="kl-flips">
            {FLIPS.map(([title, line, detail], i) => (
              <button
                key={title} type="button"
                className={`kl-flip ${flipped === i ? "on" : ""}`}
                onClick={() => setFlipped(flipped === i ? null : i)}
                aria-label={`${title}: ${line}`}
              >
                <span className="kl-flip-in">
                  <span className="kl-face kl-front"><strong>{title}</strong><small>{line}</small></span>
                  <span className="kl-face kl-back">{detail}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* right: glass sign-in card */}
        <section className="kl-right">
          <form className="kl-glass" onSubmit={submit}>
            <span className="kl-sheen" />
            <h1>Welcome back</h1>
            <p className="kl-sub">Sign in to manage your studio.</p>

            <label className="kl-field">
              <Mail size={18} />
              <input type="email" required autoComplete="username" placeholder="Admin email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </label>

            <label className="kl-field">
              <Lock size={18} />
              <input type={show ? "text" : "password"} required autoComplete="current-password" placeholder="Password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <button type="button" className="kl-eye" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </label>

            {error && <p className="kl-error" role="alert">{error}</p>}

            <button className="kl-btn" disabled={busy}>
              <span>{busy && !welcome ? "Signing in…" : "Sign in"}</span> <ArrowRight size={18} />
            </button>
          </form>

          {welcome && (
            <div className="kl-welcome" role="status">
              <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" /><path d="M14 27l8 8 16-17" /></svg>
              <p>Welcome, {welcome.name}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
