"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Fade-up ringan sekali jalan. prefers-reduced-motion ditangani MotionConfig di InvitationShell. */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
