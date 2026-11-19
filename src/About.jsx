import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Shirt,
  Palette,
  Gem,
  Heart,
  Sparkles,
  Scissors,
  RefreshCw,
  X,
  ArrowRight,
} from "lucide-react";
import "./About.css";

/* ================================
   CONTENT  (edit the words here)
================================ */

const features = [
  {
    icon: Shirt,
    title: "Handpicked weaves",
    short: "Silks and cottons chosen for how they fall, not only how they look.",
    subtitle: "Every drape begins with the right fabric.",
    long: "We feel every fabric ourselves before it joins the studio, so the pallu falls softly, the pleats hold their shape and the colour stays rich from the first wear to the fiftieth.",
  },
  {
    icon: Palette,
    title: "Colour stories",
    short: "Emerald, saffron, blush and ivory, grouped into looks that feel complete.",
    subtitle: "Colours that belong together.",
    long: "Instead of a random rack, we build small colour stories. Each one pairs borders, blouse pieces and drapes so you can see the whole look before you choose it.",
  },
  {
    icon: Sparkles,
    title: "Made for occasions",
    short: "From quiet puja mornings to late-night receptions.",
    subtitle: "One studio, every celebration.",
    long: "Whether it is a family ritual, a wedding week or a festive dinner, our edit is organised around the moments you are dressing for, so choosing feels simple and joyful.",
  },
  {
    icon: Scissors,
    title: "Finishing touches",
    short: "Borders, zari and details that complete a look.",
    subtitle: "The small things people notice.",
    long: "A clean border, a well-placed motif, the weight of the zari. We look closely at the details that turn a beautiful piece into one you feel special wearing.",
  },
  {
    icon: Heart,
    title: "Chosen with care",
    short: "Every piece is selected as if it were for a friend.",
    subtitle: "Personal, never mass-produced.",
    long: "We keep the collection thoughtful and small. Each piece is picked because we would happily recommend it to someone we love, and we are always here to help you find yours.",
  },
  {
    icon: Gem,
    title: "Timeless style",
    short: "Pieces you will reach for again and again, season after season.",
    subtitle: "Elegance that does not age.",
    long: "Trends come and go, but a graceful saree stays in the family. We favour classic silhouettes and heirloom-worthy details so your wardrobe grows more precious with time.",
  },
];

/* ================================
   SMALL HELPERS
================================ */

const pad = (n) => String(n).padStart(2, "0");

export function Words({ text, delay = 0 }) {
  return (
    <span aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span className="ab-word" key={i} aria-hidden="true">
          <motion.span
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            transition={{
              duration: 0.8,
              delay: delay + i * 0.07,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ================================
   CUSTOM CURSOR (laptops only)
================================ */

export function Cursor() {
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 160, damping: 18, mass: 0.4 });
  const ry = useSpring(y, { stiffness: 160, damping: 18, mass: 0.4 });

  useEffect(() => {
    if (!enabled) return;
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setActive(!!e.target.closest?.("a, button, [role='button']"));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="ab-cursor-ring"
        style={{ x: rx, y: ry }}
        animate={{ scale: active ? 1.7 : 1 }}
        transition={{ duration: 0.25 }}
      />
      <motion.div className="ab-cursor-dot" style={{ x, y }} />
    </>
  );
}

/* ================================
   SCROLL PROGRESS BAR
================================ */

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div className="ab-progress" style={{ scaleX }} />;
}

/* ================================
   FLIP CARD
================================ */

function FlipCard({ item, index, flipped, onToggle, onFlipBack, onOpen }) {
  const Icon = item.icon;
  const canHover =
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover)").matches;

  return (
    <motion.div
      className={`ab-card ${flipped ? "is-flipped" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`${item.title}. Press to flip the card.`}
      onClick={() => {
        if (!canHover) onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.1 }}
    >
      <div className="ab-card-inner">
        {/* FRONT */}
        <div className="ab-face ab-front">
          <div className="ab-icon">
            <Icon size={22} />
          </div>
          <h3>{item.title}</h3>
          <p>{item.short}</p>
          <span className="ab-flip-hint">
            <RefreshCw size={15} /> Hover or tap to flip
          </span>
        </div>

        {/* BACK */}
        <div className="ab-face ab-back">
          <span className="ab-count">
            {pad(index + 1)} / {pad(features.length)}
          </span>
          <h3>{item.title}</h3>
          <p>{item.subtitle}</p>
          <div className="ab-back-actions">
            <button
              type="button"
              className="ab-learn"
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
            >
              Learn more
            </button>
            <button
              type="button"
              className="ab-flipback"
              onClick={(e) => {
                e.stopPropagation();
                onFlipBack();
              }}
            >
              Flip back
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ================================
   DETAIL MODAL
================================ */

function FeatureModal({ index, onClose, onChange }) {
  const total = features.length;
  const item = features[index];
  const Icon = item.icon;

  const prev = useCallback(() => onChange((index - 1 + total) % total), [index, total, onChange]);
  const next = useCallback(() => onChange((index + 1) % total), [index, total, onChange]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <motion.div
      className="ab-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="ab-modal"
        role="dialog"
        aria-modal="true"
        aria-label={item.title}
        initial={{ opacity: 0, y: 50, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="ab-close"
          aria-label="Close"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <div className="ab-modal-icon">
              <Icon size={30} />
            </div>
            <span className="ab-modal-kicker">
              Feature {index + 1} of {total}
            </span>
            <h3>{item.title}</h3>
            <strong>{item.subtitle}</strong>
            <p>{item.long}</p>
          </motion.div>
        </AnimatePresence>

        <div className="ab-modal-nav">
          <button type="button" onClick={prev}>← Previous</button>
          <div className="ab-dots" aria-hidden="true">
            {features.map((_, i) => (
              <i
                key={i}
                className={i === index ? "on" : ""}
                onClick={() => onChange(i)}
              />
            ))}
          </div>
          <button type="button" onClick={next}>Next →</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ================================
   PAGE
================================ */

export default function About() {
  const [flipped, setFlipped] = useState(null);
  const [open, setOpen] = useState(null);

  // mouse parallax on the hero pattern (laptops only)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(useTransform(mx, [-0.5, 0.5], [22, -22]), { stiffness: 60, damping: 20 });
  const py = useSpring(useTransform(my, [-0.5, 0.5], [16, -16]), { stiffness: 60, damping: 20 });

  const onHeroMove = (e) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const closeModal = useCallback(() => setOpen(null), []);

  return (
    <main className="ab-page">
      <Cursor />
      <ScrollProgress />

      {/* HERO */}
      <section className="ab-hero" onPointerMove={onHeroMove}>
        <motion.div className="ab-hero-pattern" style={{ x: px, y: py }} />
        <div className="ab-container">
          <motion.span
            className="ab-eyebrow"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About Kani's Studio
          </motion.span>

          <h1>
            <Words text="Rooted in tradition," delay={0.15} />
            <br />
            <Words text="styled for your moments." delay={0.45} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            Every piece, from the first fabric we touch to the last fold we
            pack, is chosen to help you feel graceful from the morning ritual
            to the final celebration of the night.
          </motion.p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="ab-features">
        <div className="ab-container">
          <div className="ab-features-head">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              Every piece, thoughtfully chosen.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Flip a card for the idea, or open it for the full story.
            </motion.p>
          </div>

          <div className="ab-grid">
            {features.map((item, i) => (
              <FlipCard
                key={item.title}
                item={item}
                index={i}
                flipped={flipped === i}
                onToggle={() => setFlipped((f) => (f === i ? null : i))}
                onFlipBack={() => setFlipped(null)}
                onOpen={() => setOpen(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CLOSING CALL TO ACTION */}
      <section className="ab-cta">
        <motion.div
          className="ab-container ab-cta-inner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="section-kicker">COME SAY HELLO</span>
          <h2>Find the look that feels like <em>you.</em></h2>
          <p>Browse the collections or talk to us about your next occasion.</p>
          <div className="ab-cta-links">
            <Link className="ks-page-link" to="/collections">
              Explore collections <ArrowRight size={17} />
            </Link>
            <Link className="ks-page-link" to="/contact">
              Contact the studio <ArrowRight size={17} />
            </Link>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {open !== null && (
          <FeatureModal
            key="modal"
            index={open}
            onClose={closeModal}
            onChange={setOpen}
          />
        )}
      </AnimatePresence>
    </main>
  );
}