"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import AnimatedSmiley from "@/components/AnimatedSmiley";
import ServicePillList, { ServiceItem } from "@/components/Servicelist";
import logoData, { type LogoItem } from "@/data/logoData";
import Link from "next/link";
import ClientsCarousel from "@/components/ClientsCarousel";
import HeaderScrollListener from "@/components/HeaderScrollListener";

const services: ServiceItem[] = [
  { label: "Social Media Marketing", iconSrc: "/images/Socialmediamarketting.png" },
  { label: "Google Ads", iconSrc: "/images/Googleads.png" },
  { label: "Performance Marketing", iconSrc: "/images/PFMarketing.png" },
  { label: "Organic Promotions", iconSrc: "/images/Organicmarketing.png" },
  { label: "Influencer Marketing", iconSrc: "/images/Influencer marketting.png" },
  { label: "Email Marketing", iconSrc: "/images/Emailmarketting.png" },
  { label: "Content Marketing", iconSrc: "/images/Contentmarketting.png" },
];

export default function HorizontalScrollWebsite() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const verticalSectionsRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const logoScrollRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [spacerHeight, setSpacerHeight] = useState<number>(0);
  const [viewportWidth, setViewportWidth] = useState<number>(0);
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // ---------- hooks & tiny handlers (paste here, only once) ----------
  const [modalOpen, setModalOpen] = useState(false);
  const [activeLogo, setActiveLogo] = useState<LogoItem | null>(null);

  const openModal = (item: LogoItem) => {
    setActiveLogo(item);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setActiveLogo(null);
  };

  const scrollLogosLeft = () => {
    if (!logoScrollRef.current) return;
    logoScrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
  };
  const scrollLogosRight = () => {
    if (!logoScrollRef.current) return;
    logoScrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
  };
  // --------------------------------------------------------------------

  // REPLACE current handleNavClick with this improved version (keeps your mapping logic)
  const handleNavClick = (e: React.MouseEvent, href: string) => {
    // allow /blog (or other full routes) to behave normally
    if (href === "/blog") return;

    // only handle hash anchors here
    if (!href.startsWith("#")) {
      e.preventDefault();
      return;
    }
    e.preventDefault();

    try {
      const selector = href; // e.g. "#servicesdesktop"
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        console.warn("Target not found:", selector);
        return;
      }

      // If viewport sizes not computed yet, fallback to simple scrolling
      if (!viewportWidth || !viewportHeight) {
        const topSimple = el.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: Math.max(0, Math.floor(topSimple)), behavior: "smooth" });
        // accessibility: focus the element after short delay
        setTimeout(() => {
          try {
            el.setAttribute("tabindex", "-1");
            el.focus({ preventScroll: true });
          } catch {}
        }, 350);
        return;
      }

      // Recreate the same geometry used by your scroll handler
      const horizontalSections = 3;
      const totalWidth = viewportWidth * horizontalSections;
      const horizontalScrollDistance = totalWidth - viewportWidth; // This is how much we need to scroll to see all sections

      const bufferZone = viewportHeight * 0.8;
      const transitionZone = viewportHeight * 1.2;

      const horizontalEnd = horizontalScrollDistance;
      const bufferEnd = horizontalEnd + bufferZone;
      const transitionEnd = bufferEnd + transitionZone;

      // helper: compute offsetLeft of `el` relative to `container` using offsetParent chain
      const computeOffsetLeftWithin = (child: HTMLElement, container: HTMLElement) => {
        let left = 0;
        let node: HTMLElement | null = child;
        while (node && node !== container && node.offsetParent instanceof HTMLElement) {
          left += node.offsetLeft;
          node = node.offsetParent as HTMLElement | null;
        }
        // if node === container, we have accumulated the offset; otherwise fall back to bounding rect method
        if (node === container) return left;
        // fallback (should be rare)
        const childRect = child.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        return Math.round(childRect.left - containerRect.left + (container.scrollLeft || 0));
      };

      // 1) If element lives inside the horizontal container -> compute offsetLeft and map to page Y
      const horizContainer = containerRef.current;
      if (horizContainer && horizContainer.contains(el)) {
        // Use offset-based calculation (robust across transforms)
        const offsetLeftInside = computeOffsetLeftWithin(el, horizContainer);

        // In your layout the page Y for horizontal sections equals the horizontal X offset (identity mapping)
        let targetY = offsetLeftInside;

        // Clamp to document bounds and scroll
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const finalY = Math.min(Math.max(0, targetY), maxScroll);
        window.scrollTo({ top: finalY, behavior: "smooth" });

        // accessibility focus after scroll
        setTimeout(() => {
          try {
            el.setAttribute("tabindex", "-1");
            el.focus({ preventScroll: true });
          } catch {}
        }, 450);

        return;
      }

      // 2) If element is inside the verticalSectionsRef -> compute transitionEnd + offsetTop
      const verticalContainer = verticalSectionsRef.current;
      if (verticalContainer && verticalContainer.contains(el)) {
        const offsetInsideVertical = Math.round(
          el.getBoundingClientRect().top - verticalContainer.getBoundingClientRect().top + (verticalContainer.scrollTop || 0)
        );

        const headerOffset = 0; // set if you have a fixed header
        let targetY = Math.max(0, Math.floor(transitionEnd + offsetInsideVertical - headerOffset));

        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const finalY = Math.min(targetY, maxScroll);

        window.scrollTo({ top: finalY, behavior: "smooth" });

        setTimeout(() => {
          try {
            el.setAttribute("tabindex", "-1");
            el.focus({ preventScroll: true });
          } catch {}
        }, 450);

        return;
      }

      // 3) Fallback: normal anchor (outside both special containers)
      const top = el.getBoundingClientRect().top + window.pageYOffset;
      const headerOffset = 0;
      const desired = Math.max(0, Math.floor(top - headerOffset));
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const finalTop = Math.min(desired, maxScroll);
      window.scrollTo({ top: finalTop, behavior: "smooth" });

      setTimeout(() => {
        try {
          el.setAttribute("tabindex", "-1");
          el.focus({ preventScroll: true });
        } catch {}
      }, 350);
    } catch (err) {
      console.error("handleNavClick error:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // ----- NEW: centralized header-scroll-to handler
 // unified header-scroll + initial-hash handler
useEffect(() => {
  if (typeof window === "undefined") return;
  // compute geometry helper used for mapping element -> page Y when needed
  const getGeometry = () => {
    const vw = viewportWidth || window.innerWidth;
    const vh = viewportHeight || window.innerHeight;
    const horizontalSections = 3; // same as your layout
    const totalWidth = vw * horizontalSections;
    const horizontalScrollDistance = totalWidth - vw;
    const bufferZone = vh * 0.8;
    const transitionZone = vh * 1.2;
    const horizontalEnd = horizontalScrollDistance;
    const bufferEnd = horizontalEnd + bufferZone;
    const transitionEnd = bufferEnd + transitionZone;
    return { vw, vh, horizontalScrollDistance, horizontalEnd, bufferEnd, transitionEnd };
  };

  // helper: compute offsetLeft of `el` relative to `container` using offsetParent chain
  const computeOffsetLeftWithin = (child: HTMLElement, container: HTMLElement) => {
    let left = 0;
    let node: HTMLElement | null = child;
    while (node && node !== container && node.offsetParent instanceof HTMLElement) {
      left += node.offsetLeft;
      node = node.offsetParent as HTMLElement | null;
    }
    if (node === container) return left;
    // fallback to bounding rect if not found
    const childRect = child.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return Math.round(childRect.left - containerRect.left + (container.scrollLeft || 0));
  };

  const scrollContainerToElement = (el: HTMLElement) => {
    const container = containerRef.current;
    if (!container) return false;

    // compute offsetLeft inside container (works for nested children)
    const offsetLeftInside = computeOffsetLeftWithin(el, container);

    // Map horizontal X offset to window Y (your scroll -> transform mapping uses Y to set translateX)
    const targetY = Math.max(0, offsetLeftInside);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    window.scrollTo({ top: Math.min(targetY, maxScroll), behavior: "smooth" });

    // focus accessibility
    setTimeout(() => {
      try { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); } catch {}
    }, 450);
    return true;
  };

  const scrollWindowToVerticalElement = (el: HTMLElement) => {
    const geom = getGeometry();
    // if element is inside your vertical container, compute mapped Y:
    if (verticalSectionsRef.current && verticalSectionsRef.current.contains(el)) {
      const verticalRect = verticalSectionsRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      // offset inside the vertical container
      const offsetInside = Math.round(elRect.top - verticalRect.top + (verticalSectionsRef.current.scrollTop || 0));
      // map to page Y after the horizontal+buffer+transition
      const targetY = Math.max(0, Math.floor(geom.transitionEnd + offsetInside));
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo({ top: Math.min(targetY, maxScroll), behavior: "smooth" });
      setTimeout(() => { try { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); } catch {} }, 450);
      return true;
    }

    // fallback: element is normal document child — use native scrollIntoView
    try {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => { try { el.setAttribute("tabindex", "-1"); el.focus({ preventScroll: true }); } catch {} }, 350);
      return true;
    } catch {
      return false;
    }
  };

  // main handler which attempts container scroll first, then vertical mapping, then fallback
  const performScrollToHash = (hrefOrHash: string) => {
    const raw = String(hrefOrHash || (window.location.hash || ""));
    const id = raw.replace(/^#/, "");
    if (!id) return;
    // Try exact id first
    let el = document.getElementById(id);
    // fallback: try lowercase id if not present (defensive)
    if (!el) el = document.querySelector(`[id="${id.toLowerCase()}"]`) as HTMLElement | null;

    if (!el) {
      console.warn("[header-scroll-to] target element not found for:", id);
      return;
    }

    // If element is inside horizontal container -> scroll the window to the mapped Y
    if (containerRef.current && containerRef.current.contains(el)) {
      scrollContainerToElement(el);
      return;
    }

    // If element is in verticalSectionsRef or general page -> scroll window appropriately
    scrollWindowToVerticalElement(el);
  };

  // event listener for header dispatch
  const onHeaderEvent = (ev: Event) => {
    const detail = (ev as CustomEvent).detail;
    const href = typeof detail === "string" ? detail : (window.location.hash || "");
    // small timeout to ensure the page layout mounted after navigation
    setTimeout(() => performScrollToHash(href), 80);
  };

  // handle direct hash on initial load
  const handleInitialHash = () => {
    if (!window.location.hash) return;
    setTimeout(() => performScrollToHash(window.location.hash), 120);
  };

  window.addEventListener("header-scroll-to", onHeaderEvent);
  // also respond to normal hashchange in case user used browser navigation
  const onHashChange = () => performScrollToHash(window.location.hash);
  window.addEventListener("hashchange", onHashChange);

  // initial run
  handleInitialHash();

  return () => {
    window.removeEventListener("header-scroll-to", onHeaderEvent);
    window.removeEventListener("hashchange", onHashChange);
  };
}, [containerRef, verticalSectionsRef, viewportWidth, viewportHeight]);// depends on viewport sizes (mapping better when set)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isTabletOrMobileUA = /iPhone|iPod|Android|Mobile|iPad|Tablet|PlayBook|Silk/i.test(ua);
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isSmallScreen = width <= 1024 && height <= 1366;
      const isDesktopMac = /Macintosh/i.test(ua) && !/iPad/i.test(ua);
      const shouldUseMobileLayout = !isDesktopMac && (isTabletOrMobileUA || isSmallScreen);
      setIsMobile(shouldUseMobileLayout);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Resize / initial sizes (only for desktop)
  useEffect(() => {
    if (isMobile) return;

    const updateSizes = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Calculate exact scroll distances
      const horizontalSections = 3;
      const totalWidth = vw * horizontalSections;
      const horizontalScrollDistance = totalWidth - vw;

      setContainerWidth(totalWidth);
      setViewportWidth(vw);
      setViewportHeight(vh);

      const bufferZone = vh * 0.8;
      const transitionZone = vh * 1.2;
      const verticalSections = 4.7;
      setSpacerHeight(horizontalScrollDistance + bufferZone + transitionZone + vh * verticalSections);

      if (containerRef.current) {
        containerRef.current.style.width = `${totalWidth}px`;
      }
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [isMobile]);

  // send email api
  const API_URL = "http://127.0.0.1:5001/send-email";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const fd = new FormData(f);
    const payload = {
      name: fd.get("name")?.toString() ?? "",
      email: fd.get("email")?.toString() ?? "",
      mobile: fd.get("mobile")?.toString() ?? "",
      message: fd.get("message")?.toString() ?? "",
    };

    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
        mode: "cors",
      });

      clearTimeout(tid);
      const text = await res.text();
      try {
        const json = JSON.parse(text || "{}");
        if (res.ok && json.ok) {
          alert("✅ Message sent");
          f.reset();
          return;
        }
        alert("❌ Send failed: " + (json.error || text));
      } catch {
        alert("❌ Send failed (non-JSON): " + text);
      }
    } catch (err: any) {
      console.error("Fetch error (client):", err);
      alert("⚠️ Error sending message: " + (err?.message || err));
    }
  };

  // Hide horizontal overflow (only for desktop)
  useEffect(() => {
    if (isMobile) return;
    const prev = document.body.style.overflowX;
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = prev;
    };
  }, [isMobile]);



  //debug block

useEffect(() => {
  if (!containerRef.current) return;

  // prefer explicit selector, but fallback to direct child sections
  let sections = Array.from(containerRef.current.querySelectorAll('[data-horizontal-section]')) as HTMLElement[];

  if (!sections || sections.length === 0) {
    // fallback: use direct children that match full-viewport width (w-screen)
    sections = Array.from(containerRef.current.children).filter((ch) => {
      if (!(ch instanceof HTMLElement)) return false;
      // accept elements that have width roughly equal to viewport width
      const rect = ch.getBoundingClientRect();
      return Math.abs(rect.width - window.innerWidth) < 4; // small tolerance
    }) as HTMLElement[];
  }

  const scrollW = containerRef.current.scrollWidth;
  const clientW = containerRef.current.clientWidth;
  console.info(`[HORIZONTAL] found ${sections.length} sections; scrollWidth=${scrollW}; clientWidth=${clientW}; window.innerWidth=${window.innerWidth}`);
  // optional: list section ids/classes for debugging
  console.info(sections.map((s, i) => ({ idx: i, id: s.id || null, classes: s.className, width: s.getBoundingClientRect().width })));
}, [containerRef, containerWidth]);

  // Scroll handler (only for desktop) — kept your logic intact
  useEffect(() => {
    if (isMobile) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;

        const horizontalScrollDistance = (viewportWidth * 3) - viewportWidth; // 2 * viewportWidth
        const bufferZone = viewportHeight * 0.8;
        const transitionZone = viewportHeight * 1.2;

        const horizontalEnd = horizontalScrollDistance;
        const bufferEnd = horizontalEnd + bufferZone;
        const transitionEnd = bufferEnd + transitionZone;

        if (y <= horizontalEnd) {
          // Phase 1: Horizontal scrolling (Hero → Ideas → Services)
          const x = (y / horizontalEnd) * horizontalScrollDistance;

          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${x}px)`;
            containerRef.current.style.position = "fixed";
            containerRef.current.style.top = "0px";
            containerRef.current.style.zIndex = "30";
            containerRef.current.style.opacity = "1";
          }

          if (verticalSectionsRef.current) {
            verticalSectionsRef.current.style.opacity = "0";
            verticalSectionsRef.current.style.pointerEvents = "none";
            verticalSectionsRef.current.style.transform = "translateY(100vh)";
            verticalSectionsRef.current.style.position = "fixed";
            verticalSectionsRef.current.style.zIndex = "10";
          }
        } else if (y > horizontalEnd && y <= bufferEnd) {
          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${horizontalScrollDistance}px)`;
            containerRef.current.style.position = "fixed";
            containerRef.current.style.top = "0px";
            containerRef.current.style.zIndex = "30";
            containerRef.current.style.opacity = "1";
          }

          if (verticalSectionsRef.current) {
            verticalSectionsRef.current.style.opacity = "0";
            verticalSectionsRef.current.style.pointerEvents = "none";
            verticalSectionsRef.current.style.transform = "translateY(100vh)";
            verticalSectionsRef.current.style.position = "fixed";
            verticalSectionsRef.current.style.zIndex = "10";
          }
        } else if (y > bufferEnd && y <= transitionEnd) {
          const transitionProgress = (y - bufferEnd) / transitionZone;
          const slideUpDistance = transitionProgress * viewportHeight;
          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${horizontalScrollDistance}px) translateY(-${slideUpDistance}px)`;
            containerRef.current.style.position = "fixed";
            containerRef.current.style.top = "0px";
            containerRef.current.style.zIndex = "20";
            containerRef.current.style.opacity = `${1 - transitionProgress * 0.8}`;
          }

          if (verticalSectionsRef.current) {
            const slideInDistance = viewportHeight * (1 - transitionProgress);
            verticalSectionsRef.current.style.opacity = `${transitionProgress}`;
            verticalSectionsRef.current.style.pointerEvents = transitionProgress > 0.5 ? "auto" : "none";
            verticalSectionsRef.current.style.transform = `translateY(${slideInDistance}px)`;
            verticalSectionsRef.current.style.position = "fixed";
            verticalSectionsRef.current.style.zIndex = "25";
          }
        } else {
          const verticalScroll = y - transitionEnd;

          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${horizontalScrollDistance}px) translateY(-${viewportHeight * 2}px)`;
            containerRef.current.style.position = "fixed";
            containerRef.current.style.zIndex = "10";
            containerRef.current.style.opacity = "0";
          }

          if (verticalSectionsRef.current) {
            verticalSectionsRef.current.style.opacity = "1";
            verticalSectionsRef.current.style.pointerEvents = "auto";
            verticalSectionsRef.current.style.transform = `translateY(-${verticalScroll}px)`;
            verticalSectionsRef.current.style.position = "fixed";
            verticalSectionsRef.current.style.zIndex = "30";
          }
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [viewportWidth, viewportHeight, isMobile]);
  // Mobile Layout
  if (isMobile) {
  return (
    
    <div className="min-h-screen bg-white">
      {/* Section 1 - Hero with extended orange rounded background */}
      <div className="relative w-full">
  <section
  className="relative w-full h-screen flex flex-col justify-center items-center text-white rounded-b-[3rem] overflow-hidden z-20 bg-[#EEAA45]"
  style={{
    backgroundImage: "url('/images/Bg_1.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  {/* Top Bar */}
  <div className="flex items-center justify-between px-6 pt-6 absolute top-0 left-0 right-0 z-30">
    <Image
      src="/images/Logo.png"
      alt="Logo"
      width={100}
      height={40}
      className="cursor-pointer"
    />
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="flex flex-col justify-between w-6 h-5 focus:outline-none z-40"
    >
      <span className="block h-0.5 bg-white rounded"></span>
      <span className="block h-0.5 bg-white rounded"></span>
      <span className="block h-0.5 bg-white rounded"></span>
    </button>
  </div>

  {/* Slide-in White Menu */}
<div
  className={`absolute top-0 right-0 w-72 h-[500px] landscape:h-[350px] bg-white text-black shadow-2xl transform transition-transform duration-300 z-50 ${
    menuOpen ? "translate-x-0" : "translate-x-full"
  } rounded-bl-none landscape:rounded-bl-2xl`}
  ref={menuRef}
>
  {/* Logo inside menu */}
  <div className="flex items-center justify-between px-6 pt-6 absolute top-0 left-0 right-0 z-30 translate-x-[80px]">
    <Image
      src="/images/Group1234.png"
      alt="Logo"
      width={100}
      height={40}
      className="cursor-pointer"
    />
  </div>

  {/* Menu Options */}
  <div className="flex flex-col items-start p-6 translate-y-[120px]">
    {/* Menu links with inline height */}
    <a href="#home" className="text-lg font-semibold leading-[50px] landscape:leading-[50px]">
      Home
    </a>
    <a href="#about" className="text-lg font-semibold leading-[50px] landscape:leading-[50px]">
      About
    </a>
    <a href="#services" className="text-lg font-semibold leading-[50px] landscape:leading-[50px]">
      Services
    </a>
    <a href="#portfolio" className="text-lg font-semibold leading-[50px] landscape:leading-[50px]">
      Portfolio
    </a>
    <a href="#contact" className="text-lg font-semibold leading-[50px] landscape:leading-[50px]">
      Contact
    </a>
  </div>
</div>

  {/* Centered Content */}
  <div className="relative z-30 flex flex-col items-center justify-center text-center px-6 landscape:translate-x-[-100px] landscape:translate-y-[100px]">
    <AnimatedSmiley
      src="/images/Smiley.png"
      alt="Smiley"
      className="
        max-h-[300px]
        max-w-[300px]
        landscape:w-[200px]
        landscape:h-[200px]
        translate-y-[-100px]
        landscape:translate-x-[-200px]
        landscape:translate-y-[100px]
      "
    />
  </div>

  {/* Updated Text */}
  <div
    className="transform text-4xl font-extrabold text-white leading-snug translate-y-[80px] landscape:-translate-y-[80px] landscape:translate-x-[200px]"
    style={{
      textShadow: `
        -2px 0 0 #D59A3F,
        2px 0 0 #AF2648
      `,
    }}
  >
    <span>
      Digital is <br /> what&apos;s <br /> happening.
    </span>
  </div>

  {/* Chevron Down */}
  <div className="translate-y-[180px] landscape:translate-y-[-10px]">
    <ChevronDown className="w-10 h-10 text-white animate-bounce" />
  </div>
</section>
  {/* Extended Orange Background */}
  <div className="absolute bottom-[20px] left-0 right-0 h-[80px] bg-[#EEAA45] w-full rounded-b-[3rem] z-`0"></div>
</div>
{/* Section 2 - Ideas */}
<section
    className="relative -mt-24 min-h-screen flex flex-col p-6 bg-cover bg-center bg-no-repeat z-10 landscape:min-h-[130vh] "
  style={{
    backgroundImage: "url('/images/ofcework.png')",
  }}
>
  <div className="flex-1 flex flex-col justify-end items-start text-left pb-12">
    <h2 className="text-4xl font-extrabold text-[#EEAA45] leading-tight mb-6">
      Ideas That<br />Break<br />Through.
    </h2>
    <p className="text-sm text-gray-100 mb-6 leading-relaxed max-w-md">
      We dont play it safe—we push ideas further. A team that tries,
      learns, and reinvents until your brand{" "}
      <span className="text-[#EEAA45]">speaks louder than the crowd.</span>
    </p>
    <button className="w-48 py-3 bg-[#EEAA45] text-white rounded-lg hover:bg-[#EEAA45]">
      Read more
    </button>
  </div>
</section>


  {/* Mobile Section 3 - Services (replaces existing mobile-only markup) */}
<section
  id="servicesdesktop"
  className="md:hidden w-screen bg-[#EEAA45] text-black py-8"
>
  <div className="max-w-screen-sm mx-auto px-6">
    {/* Heading (mobile-scaled version of desktop heading) */}
    <div className="text-center mb-6">
      <h2 className="text-3xl font-extrabold leading-snug">
        Need a digital<br />marketing partner?
      </h2>
      <p className="mt-3 text-sm text-black/90">
        Marketing doesn&apos;t have to be complicated. With us, it&apos;s
        smart, simple, and effective. Let&apos;s get started.
      </p>
    </div>

   

    {/* Service pill list (same component used on desktop) */}
    <div className="bg-white rounded-[20px] p-[30px] shadow-sm">
      {/* Use same props as desktop — tweak iconSize / overlap for mobile if needed */}
      <ServicePillList
        items={services}
        iconSize={48}        // slightly smaller for mobile
        iconInnerScale={0.65}
        overlap={0.5}
      />
    </div>

  </div>
</section>

{/* Mobile Section 4 - Our Way */}
<section
  className="min-h-screen text-white p-6 flex flex-col justify-center rounded-b-[3rem] overflow-hidden md:hidden relative z-10"
  style={{
    backgroundImage: "url('/images/digital-marketing.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  }}
>
  {/* Content */}
  <div className="relative z-10">
    <div className="text-center mb-8">
      <h2 className="text-6xl font-extrabold text-[#EEAA45] mb-6">
        Our<br />Way
      </h2>
    </div>

    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-extrabold text-[#EEAA45] mb-2">Listen</h3>
        <p className="text-white text-sm leading-relaxed">
          Every great idea begins with listening. We tune in closely to
          understand who our clients are, what they value, and what they
          truly need.
        </p>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-extrabold text-[#EEAA45] mb-2">Reflect</h3>
        <p className="text-white text-sm leading-relaxed">
          Clear, thoughtful thinking is where creativity sparks. The
          sharper the thought, the stronger the idea.
        </p>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-extrabold text-[#EEAA45] mb-2">Create</h3>
        <p className="text-white text-sm leading-relaxed">
          Ideas alone are just words. When brought to life with purpose and
          precision, they evolve into impact — and sometimes, into legacies.
        </p>
      </div>
    </div>
  </div>
</section>

{/* Mobile Section 5 - Design Process */}
<section
  className="min-h-[100px] p-6 pt-20 flex flex-col justify-start relative bg-cover bg-center bg-no-repeat -mt-16"
  style={{
    backgroundImage: "url('/images/laptop-table.png')",
  }}
>
  {/* Optional dark overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Content wrapper with extra top spacing */}
  <div className="relative z-10 pt-[100px]">
    {/* Section Heading */}
    <div className="text-center mb-16">
      <h2 className="text-3xl font-extrabold text-[#EEAA45] mb-4">
        Our Design Process
      </h2>
      <p className="text-gray-200 text-base leading-relaxed">
        Reboot Your Brand in{" "}
        <span className="text-[#EEAA45]">4 Daring Steps.</span>
      </p>
    </div>

    {/* Cards Stack */}
    <div className="relative flex flex-col items-center">
      {/* Card 1 */}
      <div className="bg-[#EEAA45] text-white p-8 pt-[80px] h-80 w-[350px] rounded-2xl relative z-50 shadow-lg">
        <h3 className="text-2xl font-extrabold mb-4">Connect & Collaborate</h3>
        <p className="text-base leading-relaxed">
          We begin by immersing ourselves in your brand&apos;s universe. Our
          international client base feeds on trust, enduring partnerships, and
          solid referrals.
        </p>
      </div>

      {/* Card 2 */}
      <div className="bg-white text-gray-800 p-8 pt-[80px] h-80 w-[350px] rounded-b-2xl relative z-40 -translate-y-12 shadow-lg">
        <h3 className="text-2xl font-extrabold text-[#EEAA45] mb-4">
          Define Your Vision
        </h3>
        <p className="text-base leading-relaxed">
          Brilliant campaigns begin with crystal-clear objectives. We reveal your
          brand&apos;s purpose and develop targets that don&apos;t merely reach for the stars.
        </p>
      </div>

      {/* Card 3 */}
      <div className="bg-[#EEAA45] text-white p-8 pt-[80px] h-80 w-[350px] rounded-b-2xl relative z-30 -translate-y-24 shadow-lg">
        <h3 className="text-2xl font-extrabold mb-4">
          Develop a Winning Strategy
        </h3>
        <p className="text-base leading-relaxed">
          Our digital specialists don&apos;t merely plan; they create. We develop a
          vibrant, results-driven media strategy.
        </p>
      </div>

      {/* Card 4 */}
      <div className="bg-white text-gray-800 p-8 pt-[80px] h-80 w-[350px] rounded-b-2xl relative z-20 -translate-y-36 shadow-lg">
        <h3 className="text-2xl font-extrabold text-[#EEAA45] mb-4">
          Make It Happen
        </h3>
        <p className="text-base leading-relaxed">
          Concepts are only as good as their implementation. Our service and
          marketing teams work diligently.
        </p>
      </div>

    </div>
  </div>
</section>



{/* Mobile Section 6 - Portfolio */}
<section
  className="min-h-screen flex flex-col justify-center relative bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/images/working-table-with-computer 1.png')",
  }}
>
  {/* Dark overlay */}
  <div className="absolute inset-0 bg-black/60"></div>

  {/* Section Heading */}
  <div className="relative z-10 flex flex-col justify-center items-center text-center px-4 mb-12">
    <h2 className="text-3xl font-bold text-[#EEAA45] mb-2">
      Our Portfolio
    </h2>
    <h3 className="text-lg font-semibold text-[#EEAA45] mb-2">
      We Advertise. We Amaze.
    </h3>
    <p className="text-white text-sm leading-relaxed max-w-md">
      <span className="text-[#EEAA45]">&quot;Don’t tell, show&quot;</span> is our mantra. 
      Our work speaks — bold, impactful, unforgettable.
    </p>
  </div>

  {/* Dynamic Clients Carousel (replaces hardcoded logos) */}
  <div className="relative z-10 w-full bg-white py-10 flex justify-center items-center">
    {/* 
      ✅ This uses the same Supabase-powered ClientsCarousel 
      ✅ It’ll automatically fetch and render logos dynamically
    */}
    <div className="w-full max-w-none">
      <ClientsCarousel apiUrl="/api/clients" />
    </div>
  </div>
</section>

{/* Hide scrollbar utility */}
<style jsx>{`
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
`}</style>

       {/* Mobile Section 7 - Contact Form nash new 25 */}
<section
  className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-center p-6"
  style={{
    backgroundImage: "url('/images/black-wired-phone-black-background 1.png')",
  }}
>
  {/* Dark overlay for contrast */}
  <div className="absolute inset-0 bg-black/0"></div>

  <div className="relative z-10 flex-1 flex flex-col justify-center items-center">
    {/* Heading */}
    <div className="text-center mb-8">
      <h2 className="text-7xl font-bold text-[#EEAA45] mb-4">
        Let&apos;s Talk!
      </h2>
      <p className="text-white text-sm leading-relaxed max-w-md mx-auto">
        Ready to elevate your brand? Fill our quick <br></br>form, and
        we&apos;ll connect soon.  Prefer email?<br></br>Reach us at <span className="text-[#EEAA45]">connect@.com</span>
      </p>
    </div>

    {/* Contact Form Card */}
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 w-full max-w-md">
      <h3 className="text-xl font-semibold text-[#EEAA45] mb-6 text-center">
        Reach out to us | Say hi
      </h3>

<form onSubmit={handleSubmit} className="space-y-6">
  <input
    type="text"
    name="name"
    placeholder="Name"
    required
    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-[#EEAA45] focus:outline-none text-gray-700 placeholder-gray-500"
  />

  <input
    type="email"
    name="email"
    placeholder="Email id"
    required
    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-[#EEAA45] focus:outline-none text-gray-700 placeholder-gray-500"
  />

  <input
    type="tel"
    name="mobile"
    placeholder="Mobile"
    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-[#EEAA45] focus:outline-none text-gray-700 placeholder-gray-500"
  />

  <textarea
    name="message"
    placeholder="Message"
    rows={3}
    required
    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-[#EEAA45] focus:outline-none text-gray-700 placeholder-gray-500 resize-none"
  />

  <div className="text-center">
    <button
      type="submit"
      className="bg-[#EEAA45] text-white px-8 py-3 rounded-lg hover:bg-[#EEAA45] transition-colors duration-300 font-medium"
    >
      Submit
    </button>
  </div>
</form>
    </div>
  </div>
</section>
        {/* Mobile Section 8 - Search and Footer */}
        <section
          className="min-h-96 bg-black text-white p-6 flex flex-col justify-center items-center"
          style={{
            backgroundImage: "url('/images/Bg_1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Image
            src="/images/Logo.png"
            alt="Logo"
            width={180}
            height={32}
            className="mb-6"
          />
          
      

         <div className="flex justify-center space-x-6 translate-y-8">
  {[
    { src: "/images/Insta.png", alt: "Instagram", href: "https://www.instagram.com/me__digital/" },
    { src: "/images/Facebook.png", alt: "Facebook", href: "https://www.facebook.com/MediaExpressionDigital/" },
    { src: "/images/Youtube.png", alt: "YouTube", href: "https://www.youtube.com/@mediaexpressiondigital" }, // update if needed
    { src: "/images/Twitter.png", alt: "Twitter", href: "https://twitter.com" }, // replace with actual link if available
    { src: "/images/Linkedin.png", alt: "LinkedIn", href: "https://www.linkedin.com/company/mediaexpressiondigital/posts/?feedView=all" },
  ].map((social, index) => (
    <a
      key={index}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 relative flex items-center justify-center hover:scale-110 transition-transform duration-300"
    >
      <Image
        src={social.src}
        alt={social.alt}
        width={32}
        height={32}
        className="object-contain"
      />
    </a>
  ))}
</div>
        </section>
      </div>
    );
  }

  // Desktop Layout (unchanged)
  return (
    <>
     {!isMobile && <HeaderScrollListener />}
      {/* Horizontal fixed container */}
<div
  ref={containerRef}
  data-horizontal-container
  className="fixed top-0 left-0 h-screen flex"
  style={{ width: containerWidth ? `${containerWidth}px` : "300vw", transformOrigin: "top left", willChange: "transform", zIndex: 30 }}
>

        {/* Section 1 - Hero */}
        <section data-horizontal-section 
          className="w-screen h-screen relative flex flex-col justify-between bg-black text-white"
          style={{
            backgroundImage: "url('/images/Bg_1.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Top Bar - Logo + Icons */}
          <div className="flex items-center justify-between px-10 pt-6">
            <div className="flex items-center space-x-6">
              <Image
                src="/images/Logo.png"
                alt="Logo"
                width={100}
                height={40}
                className="cursor-pointer"
              />
            <div className="flex justify-center space-x-6">
  {[
    { src: "/images/Insta.png", alt: "Instagram", href: "https://www.instagram.com/me__digital/" },
    { src: "/images/Facebook.png", alt: "Facebook", href: "https://www.facebook.com/MediaExpressionDigital/" },
    { src: "/images/Youtube.png", alt: "YouTube", href: "https://www.youtube.com/@mediaexpressiondigital" }, // optional if you have one
    { src: "/images/Twitter.png", alt: "Twitter", href: "https://twitter.com" }, // replace if active
    { src: "/images/Linkedin.png", alt: "LinkedIn", href: "https://www.linkedin.com/company/mediaexpressiondigital/posts/?feedView=all" },
  ].map((social, index) => (
    <a
      key={index}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-8 h-8 relative flex items-center justify-center hover:scale-110 transition-transform duration-300"
    >
      <Image
        src={social.src}
        alt={social.alt}
        width={32}
        height={32}
        className="object-contain"
      />
    </a>
  ))}
</div>
            </div>
          </div>

        {/* Main Hero Content */}
<div className="flex flex-1 px-10 items-center justify-between">
  {/* Left Navigation Menu - Vertical Words */}
  <div className="flex flex-col items-center relative">
  <ul className="flex flex-col items-center space-y-[80px]">
  {[
    { label: "ABOUT US", href: "#ourwaydesktop" },
    { label: "SERVICES", href: "#servicesdesktop" },
    { label: "PORTFOLIO", href: "#portfoliodesktop" },
    { label: "BLOG", href: "/blog" },
    { label: "REACH US", href: "#reachusdesktop" },
  ].map((item) => (
    <li
      key={item.href} // USE a stable unique key (href is unique here)
      className="text-gray-200 font-medium text-[9px] hover:text-[#EEAA45] transition-colors duration-300"
    >
      {item.href === "/blog" ? (
        // New Link API — no legacyBehavior; pass className directly to Link
        <Link href="/blog" className="inline-block transform -rotate-90 whitespace-nowrap cursor-pointer hover:text-[#EEAA45] transition-colors duration-300 px-1">
          {item.label}
        </Link>
      ) : (
        <a
          href={item.href}
          onClick={(e) => handleNavClick(e, item.href)}
          className="inline-block transform -rotate-90 whitespace-nowrap cursor-pointer hover:text-[#EEAA45] transition-colors duration-300 px-1"
        >
          {item.label}
        </a>
      )}
    </li>
  ))}
</ul>



    <div className="absolute right-[-30px] top-[-50px] h-[480px] w-[2px] bg-gray-500"></div>
  </div>

  {/* Center Hero Text */}
  <div className="flex flex-col items-start justify-center space-y-8">
    <div
      className="text-[70px] font-extrabold leading-snug max-w-lg text-white -translate-x-20"
      style={{
        textShadow: `
          -2px 0 0 #D59A3F,
          2px 0 0 #AF2648
        `,
      }}
    >
      <span>
        Digital is <br /> what&apos;s <br /> happening.
      </span>
    </div>

    <div className="flex items-center text-sm translate-y-[70px] -translate-x-28">
      <span className="text-[#FF9800] font-medium">Creative</span>
      <span className="mx-[20px] text-white text-lg">•</span>

      <span className="text-[#FF9800] font-medium">Web</span>
      <span className="mx-[20px] text-white text-lg">•</span>

      <span className="text-[#FF9800] font-medium">Performance</span>
      <span className="mx-[20px] text-white text-lg">•</span>

      <span className="text-[#FF9800] font-medium">Content</span>
    </div>
  </div>



            {/* Right Content - Smiley Image */}
<div
  className="relative flex-shrink-0
             scale-110 -translate-x-[180px] -translate-y-[0px]"
>
  <AnimatedSmiley
    src="/images/Smiley.png"
    alt="Smiley"
    // no translate/scale classes here — animation controls transforms
    className=""
    style={{
      maxWidth: "100%",
      height: "auto",
      width: viewportWidth ? viewportWidth * 0.25 + 80 : 300,
    }}
  />
</div>
          </div>
        </section>

        {/* Section 2 - Ideas */}
        <section data-horizontal-section className="w-screen h-screen flex relative">
          <div className="flex-1 flex flex-col justify-center px-10 bg-white relative z-10 translate-x-[100px]">
            <h2 className="text-7xl font-extrabold text-[#EEAA45] leading-tight">
              Ideas That <br /> Break <br /> Through.
            </h2>
            <p className="mt-4 text-[11px] text-gray-600 max-w-[400px]">
              We dont play it safe—we push ideas further. A team that tries,
              learns, and reinvents until your brand{" "}
              <span className="text-[#EEAA45]">speaks louder than the crowd.</span>
            </p>
            <button className="mt-6 w-[200px] py-2 bg-[#EEAA45] text-white rounded-lg hover:bg-[#EEAA45]">
              Read more
            </button>
          </div>

          <div className="flex-1 relative overflow-hidden">
            <Image
              src="/images/ofcework.png"
              alt="Office Work"
              fill
              style={{ objectFit: "contain" }}
              priority
              className="transition-all duration-300"
            />
          </div>
        </section>

        {/* Section 3 - Services */}
        <section data-horizontal-section  id="servicesdesktop"  className="w-screen h-screen flex justify-between items-center px-10 bg-gray-200">
        <div className="p-6 max-w-xl mx-auto translate-x-[700px] w-[400px]">
      <ServicePillList
  items={services}
  iconSize={60}        // makes the circle larger
  iconInnerScale={0.7} // makes the icon inside fill more space
  overlap={0.55}        // increases how much the circle overlaps the pill
/>
    </div>

          <div className="w-1/2 text-left translate-x-[-400px]">
            <h2 className="text-7xl font-extrabold text-black mb-4">
              Need a <br />digital<br /> marketing<br /> partner?
            </h2>
            <div style={{ width: "70%", height: "2px", backgroundColor: "black" }}></div>
            <p className="text-gray-600 max-w-lg  ml-auto text-left -translate-x-[180px] translate-y-[-0px] text-[15px] my-5 py-2">
              Marketing doesn&apos;t have to be complicated. With us, it&apos;s<br /> smart,
              simple, and effective. Let&apos;s get started.
            </p>
            <div style={{ width: "70%", height: "2px", backgroundColor: "black" }}></div>
          </div>
        </section>
      </div>

      {/* Vertical Sections Container */}
      <div
        ref={verticalSectionsRef}
        className="fixed top-0 left-0 w-screen"
        style={{
          height: `${viewportHeight * 5}px`, // Updated from 2 to 5
          opacity: 0,
          pointerEvents: 'none',
          transform: 'translateY(100vh)',
          willChange: 'transform, opacity',
          zIndex: 25,
        }}
      >
        {/* Section 4 - Digital Marketing */}
        <section id="ourwaydesktop"
          className="w-screen h-screen relative flex flex-col justify-center items-center bg-black text-white"
          style={{
            backgroundImage: "url('/images/digital-marketing.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="text-left z-10">
            <h2 className="text-7xl font-extrabold text-[#EEAA45] mb-6 translate-x-[-250px] translate-y-[100px]">
              Our<br></br>Way
            </h2>
          </div>

          <div className="relative flex flex-col items-center text-center text-white mt-20 translate-y-[50px]">
  {/* === Headings row === */}
  <div className="grid grid-cols-3 gap-12 w-full max-w-5xl mb-3">
    <div>
      <h2 className="text-3xl font-extrabold text-[#e29a4d] mb-1">Listen</h2>
    </div>
    <div>
      <h2 className="text-3xl font-extrabold text-[#e29a4d] mb-1">Reflect</h2>
    </div>
    <div>
      <h2 className="text-3xl font-extrabold text-[#e29a4d] mb-1">Create</h2>
    </div>
  </div>

  {/* === Orange line + white arrows === */}
  <div className="relative w-full max-w-5xl mb-8">
    {/* orange line */}
    <div className="h-[2px] bg-[#e29a4d] w-full" />

    {/* arrows */}
    <div
      className="absolute left-[16.6%] -translate-x-1/2"
      style={{ top: "100%" }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "10px solid white",
        }}
      />
    </div>
    <div
      className="absolute left-1/2 -translate-x-1/2"
      style={{ top: "100%" }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "10px solid white",
        }}
      />
    </div>
    <div
      className="absolute left-[83.3%] -translate-x-1/2"
      style={{ top: "100%" }}
    >
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "10px solid white",
        }}
      />
    </div>
  </div>

  {/* === Paragraphs row === */}
  <div className="grid grid-cols-3 gap-12 w-full max-w-5xl text-left">
    {/* Listen */}
    <div>
      <p className="text-white text-[14px] leading-relaxed max-w-xs">
        Every great idea begins with<br></br>
listening. We tune in closely to<br></br>
understand who our clients are,<br></br>
what they value, and what they<br></br>
truly need.
      </p>
    </div>

    {/* Reflect */}
    <div>
      <p className="text-white text-[14px] leading-relaxed max-w-xs">
        Clear, thoughtful thinking is<br></br>
where creativity sparks. The<br></br>
sharper the thought, the<br></br>
stronger the idea.
      </p>
    </div>

    {/* Create */}
    <div>
      <p className="text-white text-[14px] leading-relaxed max-w-xs">
        Ideas alone are just words. When<br></br>
brought to life with purpose and<br></br>
precision, they evolve into impact — and sometimes, into<br></br>legacies.
      </p>
    </div>
  </div>
</div>
        </section>

        {/* Section 5 - Design Process */}
        <section  className="w-screen h-screen relative flex items-center justify-between bg-white px-10 -translate-x-5">
          <div className="flex items-center justify-start w-full h-full translate-y-[-200px] sm:translate-x-[750px]">
  {/* Big number 4 */}
  <div className="text-[150px] font-extrabold text-[#EEAA45] leading-none flex-shrink-0">
    4
  </div>

  {/* Text block (aligned perfectly with the height of 4) */}
  <div className="ml-4 flex flex-col justify-center h-[150px] leading-none">
    <h2 className="text-[50px] font-extrabold text-[#EEAA45]">Daring</h2>
    <h2 className="text-[50px] font-extrabold text-[#EEAA45]">Steps.</h2>

    {/* Subtext below */}
    <p className="text-black text-sm leading-relaxed mt-2">
      Reboot Your Brand in{" "}
      <span className="text-[#EEAA45] font-semibold">4 Daring Steps.</span>
    </p>
  </div>
</div>

          
          <div className="w-1/2 relative h-screen flex items-center justify-start translate-x-[-148px] translate-y-[40px]">
  <div className="relative w-[470px] h-screen -mt-20 z-20">
  <Image
    src="/images/laptop-table.png"
    alt="Design Process"
    fill
    priority
    style={{ objectFit: "cover" }}
    className="transition-all duration-300"
  />


    </div>
</div>

          <div className="translate-x-[-480px]">
                
    {/* Orange line */}
    <div className="absolute h-[2px] bg-[#EEAA45] w-[1000px] left-[0px] top-[60px]" />
            <div className="translate-y-[80px]">
            <h2 className="text-3xl font-extrabold text-[#EEAA45] mb-1">
            Connect & <br></br>
            Collaborate
            </h2>
            <p className="text-white max-w-lg  text-[12px] leading-relaxed" style={{ width: "400px" }}>
            We begin by immersing ourselves in your brand&apos;s <br></br>
universe. Our international client base feeds on trust, <br></br>
enduring partnerships, and solid referrals. Let&apos;s get <br></br>
acquainted, set vision, and lay the groundwork for <br></br>
something amazing.
            </p>
            </div>



            <div className="translate-y-[120px]">
            <h2 className="text-3xl font-extrabold text-[#EEAA45] mb-1">
            Make It <br></br>
Happen
            </h2>
            <p className="text-white  text-[12px] leading-relaxed"
            style={{ width: "400px" }}>
Concepts are only as good as their implementation. Our<br></br>
service and marketing teams work diligently,<br></br>
collaborating with you and the world&apos;s best media to<br></br>
execute on every commitment with accuracy and<br></br>
panache.
            </p>
            </div>


            </div>


            <div className="translate-x-[-500px]">
            <div className="translate-y-[-15px]">
            <h2 className="text-3xl font-extrabold text-[#EEAA45] mb-1">
            Define <br></br>
Your Vision
            </h2>
            <p className="text-black max-w-lg  text-[12px] leading-relaxed" style={{ width: "400px" }}>
            Brilliant campaigns begin with crystal-clear<br></br>
objectives. We reveal your brand&apos;s purpose and<br></br>
develop targets that dont merely reach for the stars—<br></br>
they hit the mark, powering a strategy that inspires<br></br>
and resonates.
            </p>
            </div>



            


            </div>


            <div className="translate-x-[-550px]">
            <div className="translate-y-[-25px]">
            <h2 className="text-3xl font-extrabold text-[#EEAA45] mb-1">
            Develop a <br></br>
Winning Strategy
            </h2>
            <p className="text-black max-w-lg  text-[12px] leading-relaxed" style={{ width: "400px" }}>
            Our digital specialists dont merely plan; they<br></br>
create. We develop a vibrant, results-driven media<br></br>
strategy that&apos;s as distinctive as your brand, aimed<br></br>
at captivating and converting on your budget.
            </p>
            </div>
            
            </div>
            
        </section>

{/* Section 6 - Portfolio */}
<section data-horizontal-section
  id="portfoliodesktop"
  className="w-screen h-screen relative flex items-center justify-between bg-gray-300 overflow-visible translate-x-0"
>
  {/* Left side - Rectangle image */}
  <div className="w-1/2 relative h-screen flex items-center justify-start translate-x-[156px]">
    <div className="w-[470px] h-screen relative">
      <Image
        src="/images/working-table-with-computer 1.png"
        alt="Portfolio Rectangle"
        fill
        style={{ objectFit: "cover" }}
      />
      {/* black transparent overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-65 z-10" />
    </div>
  </div>

  <div className="absolute inset-0 rounded-lg flex flex-col justify-center items-start p-8 translate-y-[-150px] translate-x-[150px] z-20 pointer-events-none">
    <h2 className="text-5xl font-bold text-[#EEAA45] mb-4 pointer-events-auto">
      Our<br />Portfolio
    </h2>
    <h1 className="text-2xl font-semibold text-[#EEAA45] mb-2 pointer-events-auto">
      We Advertise.<br />We Amaze.
    </h1>
    <p className="text-white text-[10px] leading-relaxed pointer-events-auto">
      <span className="text-[#EEAA45]">“Don’t tell, show”</span> is our mantra. Our work speaks—bold,<br />
      impactful, unforgettable. Explore our portfolio and see<br />
      the difference!
    </p>
  </div>

  {/* ABSOLUTE full-bleed carousel at the bottom of Section 6 */}
 <div className="absolute left-0 right-0 bottom-0 z-30 translate-y-[-200px]">
  <div className="w-full bg-white shadow-xl h-[200px] flex items-center justify-center">
    {/* You can adjust h-[400px] → 300px / 500px depending on your design */}
    <div className="w-full max-w-none">
      <ClientsCarousel apiUrl="/api/clients" />
    </div>
  </div>
</div>
</section>


{/* Simple Modal (keep this after the carousel) */}
{modalOpen && activeLogo && (
  <div
    role="dialog"
    aria-modal="true"
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    onClick={closeModal}
  >
    <div className="absolute inset-0 bg-black/60" />
    <div
      className="relative z-10 max-w-lg w-full bg-white rounded-2xl shadow-xl p-6"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={closeModal}
        className="absolute top-3 right-3 text-gray-600 hover:text-black"
      >
        ✕
      </button>

      <div className="flex justify-center mb-4">
        <div className="relative w-48 h-20">
          <Image
            src={activeLogo.src}
            alt={activeLogo.title}
            fill
            style={{ objectFit: "contain" }}
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
        {activeLogo.title}
      </h3>
      <p className="text-center text-gray-700 text-sm leading-relaxed">
        {activeLogo.body}
      </p>
    </div>
  </div>
)}

        {/* Section 7 - Contact Form */}
        <section  id="reachusdesktop" className="w-screen h-screen relative flex items-center justify-between bg-white px-10" >
          {/* Left side - Rectangle image with content */}
          <div className="w-1/2 relative h-full flex items-center justify-start translate-x-[116px]">
            <div className="w-[470px] h-screen relative">
              <Image
                src="/images/black-wired-phone-black-background 1.png" // Replace with your image path
                alt="Contact Rectangle"
                fill
                style={{ objectFit: "cover" }}
                
              />
              {/* Content overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex flex-col justify-center items-start p-8">
                <h2 className="text-5xl font-bold text-[#EEAA45] mb-6">
                  Let&apos;s<br />
                  Talk!
                </h2>
                <p className="text-white text-sm leading-relaxed">
                  Ready to elevate your brand? Fill our quick form, and<br />
                  we&apos;ll connect soon. Prefer email? Reach us at<br />
                  connect@.com
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div id="reachouttous" className="w-1/2 flex flex-col items-center justify-center px-10 " > 
            <div className="w-full max-w-md">
              <h3 className="text-2xl font-semibold text-[#EEAA45] mb-2">
                Reach out to us | Say hi
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
  <div>
    <input
      type="text"
      name="name"
      placeholder="Name"
      required
      className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-[#EEAA45] focus:outline-none text-gray-700 placeholder-gray-400"
    />
  </div>

  <div>
    <input
      type="email"
      name="email"
      placeholder="Email id"
      required
      className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-[#EEAA45] focus:outline-none text-gray-700 placeholder-gray-400"
    />
  </div>

  <div>
    <input
      type="tel"
      name="mobile"
      placeholder="Mobile"
      className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-[#EEAA45] focus:outline-none text-gray-700 placeholder-gray-400"
    />
  </div>

  <div>
    <textarea
      name="message"
      placeholder="Message"
      rows={3}
      required
      className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-[#EEAA45] focus:outline-none text-gray-700 placeholder-gray-400 resize-none"
    />
  </div>

  <button
    type="submit"
    className="bg-[#EEAA45] text-white px-8 py-2 rounded-lg hover:bg-[#EEAA45] transition-colors duration-300 font-medium"
  >
    Submit
  </button>
</form>
            </div>
          </div>
        </section>

        {/* Section 8 - Search and Logos */}
        <section className="w-screen h-[75vh] relative flex flex-col items-center justify-center bg-black text-white"
          style={{
            backgroundImage: "url('/images/Bg_1.png')", // Replace with your background image
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Main logo  */}
          <div className="flex items-center space-x-6 ">
              <Image
                src="/images/Logo.png"
                alt="Logo"
                width={300}
                height={80}
                className="cursor-pointer translate-x-[0px] translate-y-[-50px]"
              />
            
            
          </div>

          {/* Bottom logos */}
          <div className="flex items-center justify-center space-x-8 translate-y-[70px] translate-x-[-30px]">
  {/* Social media icons with correct links */}
  {[
    { src: "/images/Insta.png", alt: "Instagram", href: "https://www.instagram.com/me__digital/" },
    { src: "/images/Facebook.png", alt: "Facebook", href: "https://www.facebook.com/MediaExpressionDigital/" },
    { src: "/images/Youtube.png", alt: "YouTube", href: "https://www.youtube.com/@mediaexpressiondigital" }, // optional, replace with real link if available
    { src: "/images/Twitter.png", alt: "Twitter", href: "https://twitter.com" }, // replace if Medigital has an official Twitter/X
    { src: "/images/Linkedin.png", alt: "LinkedIn", href: "https://www.linkedin.com/company/mediaexpressiondigital/posts/?feedView=all" },
  ].map((social, index) => (
    <a
      key={index}
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-10 h-10 relative flex items-center justify-center hover:scale-110 transition-transform duration-300"
    >
      <Image
        src={social.src}
        alt={social.alt}
        width={40}
        height={40}
        className="object-contain"
      />
    </a>
  ))}
</div>
        </section>


      </div>

      {/* Spacer for total scroll height */}
      <div 
        style={{ 
          height: spacerHeight ? `${spacerHeight}px` : "1600vh",
        }}
      />
    </>
  );
};

