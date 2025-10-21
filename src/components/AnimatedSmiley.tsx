// src/components/AnimatedSmiley.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

type SafeImgProps = {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  priority?: boolean;
  fetchPriority?: "auto" | "high" | "low";
  crossOrigin?: "anonymous" | "use-credentials" | "";
  unoptimized?: boolean;
};

const AnimatedSmiley: React.FC<SafeImgProps> = ({
  src = "/images/Smiley.png",
  alt = "Smiley",
  className = "",
  style,
  width = 256,
  height = 256,
  loading = "lazy",
  decoding = "async",
  priority = false,
  fetchPriority,
  crossOrigin,
  unoptimized = true,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange as any);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange as any);
    };
  }, []);

  /**
   * Key idea:
   * - rotate goes through 0 so it never chooses a long rotation path.
   * - repeatType: "reverse" flips the sequence on each loop -> alternates left-first / right-first.
   * - transformOrigin centers the pivot.
   */

  const desktopAnim = {
    rotate: [0, -120, 0, 120, 0], // center -> left -> center -> right -> center
    scale: [1, 1.22, 1.04, 1], // zoom in, slight bounce, back
    transition: {
      duration: 3.6,
      ease: "easeInOut" as any,
      repeat: Infinity as any,
      repeatType: "reverse" as const, // alternate sequence on each repeat
    },
  } as const;

  const mobileAnim = {
    rotate: [0, -120, 0, 120, 0],
    scale: [1, 1.14, 1.02, 1],
    transition: {
      duration: 2.6,
      ease: "easeInOut" as any,
      repeat: Infinity as any,
      repeatType: "reverse" as const,
    },
  } as const;

  const containerStyle: React.CSSProperties = {
    width,
    height,
    display: "inline-block",
    transformOrigin: "50% 50%",
    ...(style || {}),
  };

  const imageStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    imageRendering: "pixelated",
  };

  if (prefersReducedMotion) {
    return (
      <div style={containerStyle} className={`select-none ${className}`}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={loading}
          decoding={decoding}
          priority={priority}
          fetchPriority={fetchPriority as any}
          crossOrigin={crossOrigin as any}
          unoptimized={unoptimized}
          draggable={false}
          style={imageStyle}
        />
      </div>
    );
  }

  return (
    <motion.div
      // small interactive scale on hover/tap
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      animate={(isMobile ? mobileAnim : desktopAnim) as any} // cast to any for TS
      style={containerStyle}
      className={`block will-change-transform select-none pointer-events-auto ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        decoding={decoding}
        priority={priority}
        fetchPriority={fetchPriority as any}
        crossOrigin={crossOrigin as any}
        unoptimized={unoptimized}
        draggable={false}
        style={imageStyle}
      />
    </motion.div>
  );
};

export default AnimatedSmiley;