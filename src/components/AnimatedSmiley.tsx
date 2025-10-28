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
  loading ,
  decoding = "async",
  // default to true so Next will prioritize this image for LCP and deliver highest quality
  priority = true,
  fetchPriority,
  crossOrigin,
  // serve original image (disable next/image optimization) for absolute fidelity — opt-in choice
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

  // Stronger heartbeat animation with subtle rotate to feel organic.
  // Uses keyframes for scale and rotate; times tuned for punchy beat.
  const heartbeatAnim = {
    scale: isMobile ? [1, 1.16, 0.98, 1.12, 1] : [1, 1.2, 0.98, 1.14, 1],
    rotate: isMobile ? [0, -1.2, 0.8, -0.6, 0] : [0, -1.8, 1.2, -1, 0],
    transition: {
      duration: isMobile ? 1.6 : 2.4, // mobile slightly faster
      ease: "easeInOut" as any,
      times: [0, 0.18, 0.45, 0.75, 1], // punchy early peak
      repeat: Infinity as any,
      repeatType: "loop" as const,
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
    imageRendering: "auto",
    backfaceVisibility: "hidden",
    willChange: "transform",
    transformOrigin: "50% 50%",
    display: "block",
  };

  // Respect reduced motion preference
  if (prefersReducedMotion) {
    return (
      <div style={containerStyle} className={`select-none ${className}`}>
                <Image
  src={src}
  alt={alt}
  width={width}
  height={height}
  {...(!priority ? { loading } : {})}
  decoding={decoding}
  priority={priority}
  fetchPriority={fetchPriority as any}
  crossOrigin={crossOrigin as any}
  unoptimized={unoptimized}
  quality={100}
  sizes={`${width}px`}
  draggable={false}
  style={imageStyle}
/>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      animate={heartbeatAnim as any}
      style={containerStyle}
      className={`block will-change-transform select-none pointer-events-auto ${className}`}
    >
      <Image
  src={src}
  alt={alt}
  width={width}
  height={height}
  {...(!priority ? { loading } : {})}
  decoding={decoding}
  priority={priority}
  fetchPriority={fetchPriority as any}
  crossOrigin={crossOrigin as any}
  unoptimized={unoptimized}
  quality={100}
  sizes={`${width}px`}
  draggable={false}
  style={imageStyle}
/>
    </motion.div>
  );
};

export default AnimatedSmiley;