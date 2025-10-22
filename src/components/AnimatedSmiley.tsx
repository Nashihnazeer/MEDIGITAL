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
  unoptimized = false, // default to optimized delivery for high quality
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

  // Subtle heartbeat: much smaller scale and slower to avoid pixelation
  const heartbeatAnim = {
    scale: [1, 1.08, 1, 1.04, 1], // reduced amplitude
    transition: {
      duration: isMobile ? 2.0 : 3.0, // slightly slower for smoother rendering
      ease: "easeInOut" as any,
      repeat: Infinity as any,
      repeatType: "reverse" as const,
    },
  };

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
    imageRendering: "auto", // important: don't force pixelated rendering
    backfaceVisibility: "hidden",
    willChange: "transform",
    transformOrigin: "50% 50%",
    display: "block",
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
          quality={100}               // request highest quality
          sizes={`${width}px`}        // help next/image select the best source
          draggable={false}
          style={imageStyle}
        />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      animate={heartbeatAnim as any}
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
        quality={100}               // highest quality
        sizes={`${width}px`}
        draggable={false}
        style={imageStyle}
      />
    </motion.div>
  );
};

export default AnimatedSmiley;
