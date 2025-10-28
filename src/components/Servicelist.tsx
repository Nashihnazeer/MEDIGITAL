// src/components/Servicelist.tsx
import React from "react";
import Image from "next/image";

export type ServiceItem = {
  id?: string | number;
  label: string;
  iconSrc?: string;
  iconAlt?: string;
};

type Props = {
  items: ServiceItem[];
  pillHeight?: number; // height of the orange pill
  iconSize?: number; // diameter of the white circle
  iconInnerScale?: number; // how large the icon inside appears (0–1)
  overlap?: number; // how much the white circle overlaps the pill (0.0–1.0)
};

const ServicePillList: React.FC<Props> = ({
  items,
  pillHeight = 56,
  iconSize = 64, // ⬅️ increased default from 48 → 64
  iconInnerScale = 0.75,
  overlap = 0.4, // ⬅️ increased overlap (0.25 was previous default)
}) => {
  return (
    <ul role="list" className="space-y-6">
      {items.map((it, idx) => {
        const innerSize = Math.max(20, Math.round(iconSize * iconInnerScale));
        const iconSrc = it.iconSrc ?? "/images/example.png";
        const iconAlt = it.iconAlt ?? it.label;

        return (
          <li key={it.id ?? idx} className="relative">
            <div className="flex items-center" style={{ height: pillHeight }}>
              {/* White circular icon badge */}
              <div
                aria-hidden="true"
                className="flex items-center justify-center rounded-full bg-white shadow-md"
                style={{
                  width: iconSize,
                  height: iconSize,
                  marginLeft: -iconSize * overlap, // ⬅️ control overlap dynamically
                  zIndex: 20,
                }}
              >
                {/* next/image for optimized icons (explicit width/height to avoid CLS) */}
                <div style={{ width: innerSize, height: innerSize, position: "relative" }}>
                  <Image
                    src={iconSrc}
                    alt={iconAlt}
                    width={innerSize}
                    height={innerSize}
                    style={{ objectFit: "contain" }}
                    // For remote hosts, add their domain in next.config.js images.domains
                    // e.g. images: { domains: ['placehold.co', 'cdn.example.com'] }
                  />
                </div>
              </div>

              {/* Orange pill */}
              <div
                className="flex items-center pl-6 pr-6 rounded-full shadow-inner"
                style={{
                  background: "#EEAA45",
                  height: pillHeight * 0.92,
                  marginLeft: -iconSize * 0.2,
                  flex: 1,
                  zIndex: 10,
                }}
              >
                <span
                  className="text-black font-medium text-base"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {it.label}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default ServicePillList;