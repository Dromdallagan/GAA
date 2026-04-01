"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useSpring } from "motion/react";

interface NumberMorphProps {
  value: number;
  format?: (n: number) => string;
  className?: string;
}

export function NumberMorph({ value, format, className }: NumberMorphProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 20 });
  const formatRef = useRef(format);
  formatRef.current = format;

  const [display, setDisplay] = useState(() =>
    format ? format(0) : "0"
  );

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (v: number) => {
      const fn = formatRef.current;
      setDisplay(fn ? fn(v) : Math.round(v).toLocaleString());
    });
    return unsubscribe;
  }, [spring]);

  return <span className={className}>{display}</span>;
}
