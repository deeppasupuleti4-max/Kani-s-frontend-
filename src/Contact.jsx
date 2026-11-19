import { useEffect, useRef, useState } from "react";

/* Header, footer, scroll-progress bar and back-to-top come from your app layout.
   All styles for this page live at the bottom of index.css (classes start with kc-). */

const BRAND = {
    name: "Kani's Studio",
    person: "Bharathi",
    email: "kanisstudio.business@gmail.com",
    phone: "+91 93466 05559",
    address: "Kani's Studio, Dhanavaipeta, Opposite Fastrack, Rajahmundry",
};
const API = "/api/v1/contact"; // POST /api/v1/contact/:type  (enquiry | early-access | survey)

/* ───────── hooks ───────── */
function useReveal() {
    useEffect(() => {
        const els = document.querySelectorAll(".kc-reveal");
        const io = new IntersectionObserver(
            (es) =>
                es.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("kc-in");
                        io.unobserve(e.target);
                    }
                }),
            { threshold: 0.15 }
        );
        els.forEach((el) => io.observe(el));
        return () => io.disconnect();
    }, []);
}

/* ───────── custom cursor (ring + dot) ───────── */
function Cursor() {
    const ring = useRef(null);
    const dot = useRef(null);
    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) return;
        document.documentElement.classList.add("kc-nocursor");
        let x = -100, y = -100, rx = -100, ry = -100, raf;
        const move = (e) => {
            x = e.clientX;
            y = e.clientY;
            if (dot.current) dot.current.style.transform = `translate(${x}px,${y}px)`;
        };
        const loop = () => {
            rx += (x - rx) * 0.16;
            ry += (y - ry) * 0.16;
            if (ring.current) ring.current.style.transform = `translate(${rx}px,${ry}px)`;
            raf = requestAnimationFrame(loop);
        };
        const over = (e) => {
            const hot = e.target.closest("a,button,label,select,input,textarea");
            ring.current?.classList.toggle("kc-hot", !!hot);
        };
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseover", over);
        raf = requestAnimationFrame(loop);
        return () => {
            document.documentElement.classList.remove("kc-nocursor");
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseover", over);
            cancelAnimationFrame(raf);
        };
    }, []);
    return (
        <>
            <div className="kc-cur-ring" ref={ring} />
            <div className="kc-cur-dot" ref={dot} />
        </>
    );
}

/* ───────── button with ripple + magnetic pull ───────── */
function Btn({ children, loading, ...rest }) {
    const ref = useRef(null);
    const ripple = (e) => {
        const b = ref.current;
        const r = b.getBoundingClientRect();
        const s = document.createElement("span");
        s.className = "kc-ripple";
        s.style.left = e.clientX - r.left + "px";
        s.style.top = e.clientY - r.top + "px";
        b.appendChild(s);
        setTimeout(() => s.remove(), 700);
    };
    const mag = (e) => {
        const b = ref.current;
        const r = b.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.12;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.2;
        b.style.transform = `translate(${dx}px,${dy}px)`;
    };
    const reset = () => (ref.current.style.transform = "");
    return (
        <button
            ref={ref}
            className={"kc-btn" + (loading ? " kc-loading" : "")}
            onClick={ripple}
            onMouseMove={mag}
            onMouseLeave={reset}
            disabled={loading}
            {...rest}
        >
            <span className="kc-btn-label">{children}</span>
            <span className="kc-btn-spin" />
        </button>
    );
}

const Field = ({ label, i = 0, children, className = "" }) => (
    <label className={"kc-field " + className} style={{ "--i": i }}>
        <span className="kc-lbl">{label}</span>
        {children}
    </label>
);

/* ───────── forms ───────── */
function Enquiry({ onSubmit, loading }) {
    return (
        <form onSubmit={onSubmit}>
            <h2 className="kc-card-title">Ask us anything</h2>
            <div className="kc-row">
                <Field label="Your name" i={1}><input name="name" required /></Field>
                <Field label="Phone" i={2}><input name="phone" type="tel" /></Field>
            </div>
            <Field label="Email" i={3}><input name="email" type="email" required /></Field>
            <Field label="What is it about?" i={4}>
                <select name="topic" defaultValue="Product question">
                    <option>Product question</option>
                    <option>Order support</option>
                    <option>Custom fit</option>
                    <option>Partnership</option>
                    <option>Other</option>
                </select>
            </Field>
            <Field label="Message" i={5}><textarea name="message" rows={4} required /></Field>
            <div className="kc-fi" style={{ "--i": 6 }}>
                <Btn type="submit" loading={loading}>Send enquiry</Btn>
            </div>
        </form>
    );
}

function EarlyAccess({ onSubmit, loading }) {
    return (
        <form onSubmit={onSubmit}>
            <h2 className="kc-card-title">Join the early-access list</h2>
            <div className="kc-row">
                <Field label="Your name" i={1}><input name="name" required /></Field>
                <Field label="City" i={2}><input name="city" /></Field>
            </div>
            <div className="kc-row">
                <Field label="Email" i={3}><input name="email" type="email" required /></Field>
                <Field label="Phone" i={4}><input name="phone" type="tel" /></Field>
            </div>
            <div className="kc-row kc-three">
                <Field label="Shade" i={5}>
                    <select name="shade" defaultValue="Beige">
                        <option>Beige</option><option>Black</option><option>Nude</option><option>Ivory</option>
                    </select>
                </Field>
                <Field label="Size" i={6}>
                    <select name="size" defaultValue="S">
                        {["XS", "S", "M", "L", "XL", "XXL"].map((s) => <option key={s}>{s}</option>)}
                    </select>
                </Field>
                <Field label="Saree you wear most" i={7}>
                    <select name="saree" defaultValue="Silk">
                        <option>Silk</option><option>Cotton</option><option>Georgette</option>
                        <option>Chiffon</option><option>Organza</option>
                    </select>
                </Field>
            </div>
            <Field label="Anything we should know? (optional)" i={8}>
                <textarea name="notes" rows={4} />
            </Field>
            <div className="kc-fi" style={{ "--i": 9 }}>
                <Btn type="submit" loading={loading}>Request early access</Btn>
            </div>
        </form>
    );
}

function Survey({ onSubmit, loading }) {
    const issues = [
        "Waistband rolls down",
        "Shapewear rides up under the saree",
        "Cannot take a full stride",
        "Slips under heavy silk",
    ];
    return (
        <form onSubmit={onSubmit}>
            <h2 className="kc-card-title">Tell us your saree struggle</h2>
            <p className="kc-q kc-fi" style={{ "--i": 1 }}>What goes wrong with your shapewear? (pick any)</p>
            <div className="kc-checks">
                {issues.map((t, k) => (
                    <label className="kc-check kc-fi" style={{ "--i": 2 + k * 0.5 }} key={t}>
                        <input type="checkbox" name="issues" value={t} />
                        <span className="kc-box"><svg viewBox="0 0 16 16"><path d="M3 8.5l3.2 3L13 4.5" /></svg></span>
                        <span>{t}</span>
                    </label>
                ))}
            </div>
            <Field label="How long do you wear a saree at a stretch?" i={4} className="kc-mt">
                <select name="duration" defaultValue="Under 4 hours">
                    <option>Under 4 hours</option><option>4 – 8 hours</option>
                    <option>8 – 12 hours</option><option>More than 12 hours</option>
                </select>
            </Field>
            <p className="kc-q kc-fi kc-mt" style={{ "--i": 5 }}>
                How comfortable is your current shapewear? (1 = not at all, 5 = very)
            </p>
            <div className="kc-rate kc-fi" style={{ "--i": 6 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n}>
                        <input type="radio" name="comfort" value={n} />
                        <span>{n}</span>
                    </label>
                ))}
            </div>
            <Field label="Your worst saree moment (optional)" i={7} className="kc-mt">
                <textarea name="story" rows={4} />
            </Field>
            <Field label="Email, if you want us to reply (optional)" i={8}>
                <input name="email" type="email" />
            </Field>
            <div className="kc-fi" style={{ "--i": 9 }}>
                <Btn type="submit" loading={loading}>Send my answers</Btn>
            </div>
        </form>
    );
}

function Success({ onReset }) {
    return (
        <div className="kc-success">
            <svg viewBox="0 0 52 52" className="kc-tick">
                <circle cx="26" cy="26" r="24" />
                <path d="M14 27l8 8 16-17" />
            </svg>
            <h2 className="kc-card-title">Thank you!</h2>
            <p>We have received your message and will get back to you soon.</p>
            <button className="kc-link" onClick={onReset}>Send another</button>
        </div>
    );
}

const TABS = [
    { id: "enquiry", label: "Enquiry", C: Enquiry },
    { id: "early-access", label: "Early access", C: EarlyAccess },
    { id: "survey", label: "Saree survey", C: Survey },
];

/* ───────── page ───────── */
export default function Contact() {
    const [tab, setTab] = useState("enquiry");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    useReveal();

    const Active = TABS.find((t) => t.id === tab).C;

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        const data = {};
        for (const k of new Set(fd.keys())) {
            const all = fd.getAll(k);
            data[k] = all.length > 1 ? all : all[0];
        }
        try {
            const res = await fetch(`${API}/${tab}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Request failed");
            setDone(true);
        } catch {
            setError("Could not send right now. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const switchTab = (id) => {
        setTab(id);
        setDone(false);
        setError("");
    };

    return (
        <div className="kc-page">
            <Cursor />

            <section className="kc-hero">
                <div className="kc-pattern" />
                <div className="kc-wrap kc-hero-in">
                    <span className="kc-eyebrow kc-hero-a" style={{ "--d": "0.1s" }}>Contact</span>
                    <h1 className="kc-hero-a" style={{ "--d": "0.25s" }}>Let’s talk about your drape.</h1>
                    <p className="kc-hero-a" style={{ "--d": "0.45s" }}>
                        Questions, early access, partnerships or your own saree story. We read everything.
                    </p>
                </div>
            </section>

            <main className="kc-wrap kc-grid">
                <aside className="kc-info kc-reveal">
                    <h3>{BRAND.person}</h3>
                    <span className="kc-brand-sm">{BRAND.name.toUpperCase()}</span>
                    <ul>
                        <li>
                            <span className="kc-ico">
                                <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7l8.5 6 8.5-6" /></svg>
                            </span>
                            <div><small>Email</small><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></div>
                        </li>
                        <li>
                            <span className="kc-ico">
                                <svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                            </span>
                            <div><small>Phone</small><a href={`tel:${BRAND.phone.replace(/\s/g, "")}`}>{BRAND.phone}</a></div>
                        </li>
                        <li>
                            <span className="kc-ico">
                                <svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
                            </span>
                            <div><small>Address</small><span>{BRAND.address}</span></div>
                        </li>
                    </ul>
                </aside>

                <section className="kc-panel kc-reveal">
                    <div className="kc-tabs">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                className={"kc-pill" + (tab === t.id ? " kc-on" : "")}
                                onClick={() => switchTab(t.id)}
                                type="button"
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <div className="kc-card" key={tab + done}>
                        {done ? <Success onReset={() => setDone(false)} /> : <Active onSubmit={submit} loading={loading} />}
                        {error && <p className="kc-err">{error}</p>}
                    </div>
                </section>
            </main>
        </div>
    );
}