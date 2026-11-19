import { useRef, useState } from "react";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useMotionValueEvent,
    useScroll,
    useSpring,
    useTransform,
} from "framer-motion";
import { Check } from "lucide-react";
import "./LayersShowcase.css";

/* ================================
   CONTENT  (edit the words here)
================================ */

const LAYERS = [
    {
        title: "A waistband that stays put",
        text: "A wide, soft bonded band lies flat at the waist and holds your pleats in place from morning to night.",
        spot: { x: 200, y: 86 },
    },
    {
        title: "Smooth, sculpting panels",
        text: "Seam-free panels shape from waist to hip, so no lines, rolls or bulk show under the drape.",
        spot: { x: 200, y: 206 },
    },
    {
        title: "A grip that stops ride-up",
        text: "A fine silicone grip at the hip keeps the hem exactly where you set it, however long the day.",
        spot: { x: 200, y: 318 },
    },
    {
        title: "A slit that lets you move",
        text: "Hidden under the pleats, a side slit gives your stride room to walk, climb stairs and sit.",
        spot: { x: 296, y: 486 },
    },
];

/* ================================
   DIAGRAM GEOMETRY
================================ */

const SKIRT =
    "M124 62 C104 118 84 188 88 252 C92 318 126 372 140 412 C126 452 92 492 66 528 L334 528 C308 492 274 452 260 412 C274 372 308 318 312 252 C316 188 296 118 276 62 Z";

const PANEL_LINES = [-78, -52, -26, 0, 26, 52, 78].map(
    (u) =>
        `M${200 + u * 0.85} 112 C${200 + u * 0.95} 170 ${200 + u * 1.02} 230 ${200 + u} 300`
);

const GRIP_DOTS = Array.from({ length: 11 }, (_, i) => {
    const x = 100 + i * 20;
    const t = (x - 80) / 240;
    return { x, y: 314 + 52 * t * (1 - t) };
});

const GRID_LINES = Array.from({ length: 11 }, (_, i) => i * 40);

const layerState = (i, active) => (i > active ? "hidden" : i === active ? "on" : "done");
const layerOpacity = { hidden: 0, done: 0.6, on: 1 };

function Diagram({ active, draw }) {
    return (
        <svg viewBox="0 0 400 580" className="ls-svg" role="img" aria-label="Diagram of a Kani's Studio saree shaper, showing each layer as you scroll">
            <defs>
                <clipPath id="ls-skirt">
                    <path d={SKIRT} />
                </clipPath>
                <filter id="ls-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="b" />
                    <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* faint blueprint grid */}
            <g stroke="rgba(246,236,216,.06)" strokeWidth="1">
                {GRID_LINES.map((p) => (
                    <g key={p}>
                        <line x1={p} y1="0" x2={p} y2="580" />
                        <line x1="0" y1={p * 1.45} x2="400" y2={p * 1.45} />
                    </g>
                ))}
            </g>

            {/* body of the piece */}
            <path d={SKIRT} fill="rgba(246,236,216,.05)" />
            <motion.path
                d={SKIRT}
                fill="none"
                stroke="#f6ecd8"
                strokeWidth="2"
                strokeLinejoin="round"
                style={{ pathLength: draw }}
            />

            <g clipPath="url(#ls-skirt)">
                {/* 1 · waistband */}
                <motion.g
                    initial={false}
                    animate={{ opacity: layerOpacity[layerState(0, active)] }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.path
                        d="M100 62H300V110H100Z"
                        fill="#c4922a"
                        initial={false}
                        animate={{ y: active >= 0 ? 0 : -20 }}
                    />
                    <path d="M100 78H300M100 94H300" stroke="#f6ecd8" strokeDasharray="5 4" fill="none" />
                </motion.g>

                {/* 2 · panels */}
                <motion.g
                    initial={false}
                    animate={{ opacity: active >= 1 ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {PANEL_LINES.map((d, i) => (
                        <motion.path
                            key={i}
                            d={d}
                            fill="none"
                            stroke="#f6ecd8"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: active >= 1 ? 1 : 0, opacity: active === 1 ? 1 : 0.55 }}
                            transition={{ duration: 0.8, delay: active >= 1 ? i * 0.07 : 0 }}
                        />
                    ))}
                </motion.g>

                {/* 3 · grip band */}
                <motion.g
                    initial={false}
                    animate={{
                        opacity: layerOpacity[layerState(2, active)],
                        x: active >= 2 ? 0 : -40,
                    }}
                    transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                >
                    <path d="M80 296 Q200 322 320 296 L322 332 Q200 358 78 332Z" fill="#c4922a" />
                    {GRIP_DOTS.map((d) => (
                        <circle key={d.x} cx={d.x} cy={d.y} r="2.4" fill="#0f4a35" />
                    ))}
                </motion.g>
            </g>

            {/* 4 · side slit */}
            <motion.g
                initial={false}
                animate={{ opacity: layerOpacity[layerState(3, active)] }}
                transition={{ duration: 0.5 }}
            >
                <path d="M268 440 L300 528 L322 528Z" fill="#c4922a" fillOpacity=".45" />
                <path d="M268 440L300 528M268 440L322 528" stroke="#c4922a" strokeWidth="2" fill="none" strokeLinecap="round" />
                <motion.path
                    d="M130 552 Q200 580 270 552"
                    fill="none"
                    stroke="#c4922a"
                    strokeWidth="2"
                    strokeDasharray="7 6"
                    strokeLinecap="round"
                    animate={active === 3 ? { strokeDashoffset: [0, -26] } : { strokeDashoffset: 0 }}
                    transition={{ duration: 1.1, repeat: active === 3 ? Infinity : 0, ease: "linear" }}
                />
            </motion.g>

            {/* travelling hotspot */}
            <motion.circle
                r="7"
                fill="#f6ecd8"
                filter="url(#ls-glow)"
                initial={false}
                animate={{ cx: LAYERS[active].spot.x, cy: LAYERS[active].spot.y }}
                transition={{ type: "spring", stiffness: 90, damping: 16 }}
            />
            <motion.circle
                fill="none"
                stroke="#f6ecd8"
                strokeWidth="1.5"
                initial={false}
                animate={{
                    cx: LAYERS[active].spot.x,
                    cy: LAYERS[active].spot.y,
                    r: [8, 26],
                    opacity: [0.8, 0],
                }}
                transition={{
                    cx: { type: "spring", stiffness: 90, damping: 16 },
                    cy: { type: "spring", stiffness: 90, damping: 16 },
                    r: { duration: 1.7, repeat: Infinity, ease: "easeOut" },
                    opacity: { duration: 1.7, repeat: Infinity, ease: "easeOut" },
                }}
            />
        </svg>
    );
}

/* ================================
   SECTION
================================ */

export default function LayersShowcase() {
    const ref = useRef(null);
    const [active, setActive] = useState(0);
    const total = LAYERS.length;

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    });

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        setActive(Math.max(0, Math.min(total - 1, Math.floor(v * total))));
    });

    // scroll-linked movement
    const draw = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
    const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
    const patternY = useTransform(scrollYProgress, [0, 1], [0, -140]);
    const hint = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

    // mouse movement (laptops only)
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const smx = useSpring(mx, { stiffness: 70, damping: 18 });
    const smy = useSpring(my, { stiffness: 70, damping: 18 });
    const rotY = useTransform(smx, [-0.5, 0.5], [-9, 9]);
    const rotX = useTransform(smy, [-0.5, 0.5], [6, -6]);
    const shiftX = useTransform(smx, [-0.5, 0.5], [-10, 10]);
    const patX = useTransform(smx, [-0.5, 0.5], [16, -16]);

    const onMove = (e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => {
        mx.set(0);
        my.set(0);
    };

    const jumpTo = (i) => {
        const el = ref.current;
        if (!el) return;
        const start = window.scrollY + el.getBoundingClientRect().top;
        const range = el.offsetHeight - window.innerHeight;
        window.scrollTo({ top: start + range * ((i + 0.5) / total), behavior: "smooth" });
    };

    return (
        <section className="ls-section" ref={ref} aria-label="How the fit is built">
            <div className="ls-sticky" onPointerMove={onMove} onPointerLeave={onLeave}>
                <motion.div className="ls-pattern" style={{ y: patternY, x: patX }} aria-hidden="true" />

                <div className="ls-diagram-wrap">
                    <motion.div
                        className="ls-tilt"
                        style={{ rotateX: rotX, rotateY: rotY, x: shiftX, transformPerspective: 900 }}
                    >
                        <motion.div
                            className="ls-float"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Diagram active={active} draw={draw} />
                        </motion.div>
                    </motion.div>
                </div>

                <div className="ls-copy">
                    <span className="ls-kicker">How the fit is built</span>
                    <h2>Four details, built to disappear.</h2>

                    <ol className="ls-list">
                        {LAYERS.map((l, i) => {
                            const state = i < active ? "done" : i === active ? "on" : "next";
                            return (
                                <li key={l.title} className={`ls-item ${state}`}>
                                    <button type="button" onClick={() => jumpTo(i)} aria-current={state === "on"}>
                                        <motion.span
                                            className="ls-badge"
                                            animate={{ scale: state === "on" ? 1.12 : 1 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                        >
                                            {state === "done" ? <Check size={15} strokeWidth={3} /> : i + 1}
                                        </motion.span>

                                        <span className="ls-text">
                                            <strong>{l.title}</strong>
                                            <AnimatePresence initial={false}>
                                                {state === "on" && (
                                                    <motion.span
                                                        className="ls-desc"
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
                                                    >
                                                        <span>{l.text}</span>
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>

                    <div className="ls-progress" aria-hidden="true">
                        <motion.i style={{ scaleX: bar }} />
                    </div>
                </div>

                <motion.div className="ls-scroll-hint" style={{ opacity: hint }} aria-hidden="true">
                    <span className="ls-mouse"><i /></span>
                    Scroll to build it
                </motion.div>
            </div>
        </section>
    );
}