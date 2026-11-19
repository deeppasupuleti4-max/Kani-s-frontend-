import { useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import "./ScrollReveal.css";

/* ================================
   CONTENT  (edit the words here)
================================ */
const DEFAULT_ITEMS = [
    {
        title: "A waistband that stays put",
        text: "A wide, soft band holds its place from the first pleat to the last.",
    },
    {
        title: "A grip that stops ride-up",
        text: "Quiet silicone grip keeps the fit exactly where you set it.",
    },
    {
        title: "A slit that lets you move",
        text: "Walk, climb and sit without the drape pulling against you.",
    },
];

/* Scroll-driven list: the active line turns green and bold,
   the rest fade back, and the arch swaps its picture.        */
export default function ScrollReveal({ image, items = DEFAULT_ITEMS }) {
    const ITEMS = items;
    const ref = useRef(null);
    const [active, setActive] = useState(0);
    const total = ITEMS.length;

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    });

    useMotionValueEvent(scrollYProgress, "change", (v) => {
        setActive(Math.max(0, Math.min(total - 1, Math.floor(v * total))));
    });

    return (
        <section className="sr-section" ref={ref}>
            <div className="sr-sticky">
                <ol className="sr-list">
                    {ITEMS.map((it, i) => {
                        const on = i === active;
                        return (
                            <li key={it.title} className={on ? "on" : ""}>
                                <span className="sr-num">
                                    <i />
                                    {String(i + 1).padStart(2, "0")}
                                </span>

                                <motion.h3
                                    animate={{
                                        color: on ? "#17704e" : "#9cb8aa",
                                        opacity: on ? 1 : 0.75,
                                        x: on ? 0 : -6,
                                    }}
                                    transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                                >
                                    {it.title}
                                </motion.h3>

                                <AnimatePresence initial={false}>
                                    {on && (
                                        <motion.p
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            {it.text}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </li>
                        );
                    })}
                </ol>

                <div className="sr-arch">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={active}
                            src={ITEMS[active].image || image}
                            alt={ITEMS[active].title}
                            initial={{ opacity: 0, y: 18, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                            draggable={false}
                        />
                    </AnimatePresence>
                </div>
            </div>
        </section>
    );
}