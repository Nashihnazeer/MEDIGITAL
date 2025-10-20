// src/components/AnimatedSmiley.tsx
import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

type SafeImgProps = {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  loading?: "lazy" | "eager" | "auto";
  priority?: boolean;
  fetchPriority?: "auto" | "high" | "low";
  // decoding, crossOrigin intentionally omitted because next/image manages optimizations.
};

const AnimatedSmiley: React.FC<SafeImgProps> = ({
  src = "/images/Smiley.png",
  alt = "Smiley",
  className = "",
  style,
  width,
  height,
  loading,
  priority,
  fetchPriority,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 640px)").matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile((e as any).matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange as any);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange as any);
    };
  }, []);

  // Animations (same frames you had)
  const mobileAnimation = {
    scale: [1, 1.12, 1, 0.97, 1],
    rotate: [0, 180, 360, 540, 720],
    transition: {
      duration: 2.2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  } as any;

  const desktopAnimation = {
    scale: [1, 1.28, 1, 0.92, 1],
    rotate: [0, 180, 360, 540, 720],
    transition: {
      duration: 3.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  } as any;

  const interactionProps = { whileHover: { scale: 1.08 }, whileTap: { scale: 0.96 } } as const;

  // merged style: keep transform origin so rotation centers
  const mergedStyle: React.CSSProperties = {
    height: "auto",
    maxWidth: "100%",
    transformOrigin: "50% 50%",
    ...(style || {}),
  };

  // Helper: render Next Image either with explicit width/height or with fill (relative parent)
  const renderImage = () => {
    // If width and height are provided as numbers, use them directly (static sizing)
    const numericWidth = typeof width === "number" ? width : undefined;
    const numericHeight = typeof height === "number" ? height : undefined;

    // If both numeric width and height are provided, use fixed sizing Image
    if (numericWidth && numericHeight) {
      return (
        <Image
          src={src}
          alt={alt}
          width={numericWidth}
          height={numericHeight}
          style={{ objectFit: "contain", ...mergedStyle }}
          priority={Boolean(priority)}
          
          fetchPriority={fetchPriority}
          loading={loading === "eager" ? "eager" : "lazy"}
        />
      );
    }

    // Otherwise use fill inside a relative container so Image covers the available area
    return (
      <div className={`relative w-full ${height ? "" : "h-auto"}`} style={height ? { height } : undefined}>
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit: "cover", ...mergedStyle }}
          priority={Boolean(priority)}
          loading={loading === "eager" ? "eager" : "lazy"}
        />
      </div>
    );
  };

  // If user prefers reduced motion, render static Image (no motion wrapper)
  if (prefersReducedMotion) {
    return (
      <div className={`select-none pointer-events-none ${className}`} style={mergedStyle}>
        {renderImage()}
      </div>
    );
  }

  // Animated: wrap the Image in a motion.div and animate the wrapper
  return (
    <motion.div
      {...interactionProps}
      animate={isMobile ? mobileAnimation : desktopAnimation}
      className={`block will-change-transform select-none pointer-events-auto ${className}`}
      style={mergedStyle}
    >
      {renderImage()}
    </motion.div>
  );
};

export default AnimatedSmiley;