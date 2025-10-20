// /components/AnimatedSmiley.tsx
import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type SafeImgProps = {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number | string;
  height?: number | string;
  loading?: "lazy" | "eager" | "auto";
  decoding?: "async" | "sync" | "auto";
  priority?: boolean;
  fetchPriority?: "auto" | "high" | "low";
  crossOrigin?: "anonymous" | "use-credentials" | "";
};

const AnimatedSmiley: React.FC<SafeImgProps> = ({
  src = "/images/Smiley.png",
  alt = "Smiley",
  className = "",
  style,
  width,
  height,
  loading,
  decoding,
  priority,
  fetchPriority,
  crossOrigin,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window === "undefined" ? false : window.matchMedia("(max-width: 640px)").matches
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile((e as any).matches);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange as any);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange as any);
    };
  }, []);

  if (prefersReducedMotion) {
    return (
      <img
        src={src}
        alt={alt}
        className={`select-none pointer-events-none ${className}`}
        style={{ height: "auto", maxWidth: "100%", ...(style || {}) }}
        width={width as any}
        height={height as any}
        {...(loading ? { loading: loading === "auto" ? undefined : loading } : {})}
        {...(decoding ? { decoding } : {})}
        {...(crossOrigin ? { crossOrigin } : {})}
      />
    );
  }

  /**
   * Align keyframe lengths: scale and rotate arrays have same number of items.
   * Using rotate values that progress to 720 for a clean 2-turn spin.
   * transformOrigin ensures the rotation is centered.
   */

  const mobileAnimation = {
    scale: [1, 1.12, 1, 0.97, 1], // 5 frames
    rotate: [0, 180, 360, 540, 720], // 5 frames -> 2 full turns over the animation
    transition: {
      duration: 2.2,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  } as any;

  const desktopAnimation = {
    scale: [1, 1.28, 1, 0.92, 1], // 5 frames
    rotate: [0, 180, 360, 540, 720], // 5 frames
    transition: {
      duration: 3.5,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
    },
  } as any;

  const interactionProps = { whileHover: { scale: 1.08 }, whileTap: { scale: 0.96 } } as const;

  // Make sure transform origin is center so scale/rotate look correct
  const mergedStyle: React.CSSProperties = {
    height: "auto",
    maxWidth: "100%",
    transformOrigin: "50% 50%",
    ...(style || {}),
  };

  const forwardLoading = loading === "lazy" || loading === "eager" ? loading : undefined;
  const forwardFetchPriority =
    fetchPriority === "auto" || fetchPriority === "high" || fetchPriority === "low"
      ? fetchPriority
      : undefined;

  return (
    <motion.img
      src={src}
      alt={alt}
      draggable={false}
      {...interactionProps}
      animate={isMobile ? mobileAnimation : desktopAnimation}
      className={`block will-change-transform select-none pointer-events-auto ${className}`}
      style={mergedStyle}
      width={width as any}
      height={height as any}
      {...(forwardLoading ? { loading: forwardLoading } : {})}
      {...(decoding ? { decoding } : {})}
      {...(crossOrigin ? { crossOrigin } : {})}
      {...(forwardFetchPriority ? { fetchPriority: forwardFetchPriority } : {})}
      {...(priority ? { "data-priority": "true" } : {})}
    />
  );
};

export default AnimatedSmiley;