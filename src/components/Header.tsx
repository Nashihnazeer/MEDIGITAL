// src/components/Header.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavItem = { label: string; href: string };

const navItems: NavItem[] = [
  { label: "REACH US", href: "#reachusdesktop" },
  { label: "BLOG", href: "/blog" },
  { label: "PORTFOLIO", href: "#portfolio" },
  { label: "SERVICES", href: "#services" },
  { label: "ABOUT US", href: "#aboutus" },
];

const SCROLL_DELAY_AFTER_NAV_MS = 300;

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname() ?? "";

  // === hooks (all declared up front; do NOT conditionally return before these) ===
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  const [searchString, setSearchString] = useState<string>("");

  // Memo for anchor ids (stable)
  const anchorIds = useMemo(
    () => navItems.filter((n) => n.href.startsWith("#")).map((n) => n.href.replace("#", "")),
    []
  );

  // Client-only search string setter
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchString(window.location.search || "");
    }
  }, []);

  // Debug logging only in dev
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[Header] pathname:", pathname, "search:", searchString);
    }
  }, [pathname, searchString]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on escape and detect outside clicks
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        toggleButtonRef.current?.focus();
      }
    };
    const onClickOutside = (e: MouseEvent) => {
      if (!mobileOpen) return;
      const el = mobileMenuRef.current;
      const btn = toggleButtonRef.current;
      if (el && !el.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClickOutside);
    };
  }, [mobileOpen]);

  // Scroll-spy observation (only runs in browser)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // if not homepage, clear activeHash and attempt a one-time scroll to any hash
    if (pathname !== "/") {
      setActiveHash(null);
      const urlHash = window.location.hash;
      if (urlHash) {
        // try to scroll once
        const id = urlHash.replace(/^#/, "");
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    // disconnect previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const elements = anchorIds
      .map((id) => ({ id, el: document.getElementById(id) }))
      .filter((x) => x.el) as { id: string; el: HTMLElement }[];

    if (elements.length === 0) return;

    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: "-35% 0% -55% 0%",
      threshold: 0,
    };

    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((en) => en.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
      if (visible.length > 0) {
        setActiveHash("#" + visible[0].target.id);
      } else {
        setActiveHash(null);
      }
    }, options);

    elements.forEach((it) => obs.observe(it.el));
    observerRef.current = obs;

    if (window.location.hash) {
      const id = window.location.hash.replace(/^#/, "");
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = null;
    };
  }, [pathname, anchorIds]);

  // hashchange listener
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash) {
        const id = window.location.hash.replace(/^#/, "");
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  // === end of hooks ===

  // ----- HIDE CONDITIONS (robust) -----
  const hideSubstrings = [
    "horizontalscroll",
    "horizontal-scroll",
    "horizontal",
    "horizontalscrollwebsite",
  ];

  const pathnameLower = (pathname || "").toLowerCase();
  const searchStringLower = (searchString || "").toLowerCase();
  const hash = typeof window !== "undefined" ? window.location.hash.toLowerCase() : "";

  // support ?hideHeader=1 or ?hideHeader=true
  const queryParams = typeof window !== "undefined" ? new URLSearchParams(searchString) : new URLSearchParams();
  const hideHeaderFlag = queryParams.get("hideHeader");
  const shouldHideHeader =
    hideSubstrings.some((s) => pathnameLower.includes(s)) ||
    hideSubstrings.some((s) => searchStringLower.includes(s)) ||
    hideSubstrings.some((s) => hash.includes(s)) ||
    hideHeaderFlag === "1" ||
    hideHeaderFlag === "true";

  if (shouldHideHeader) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[Header] hidden because route/search/hash matched hide rules:", {
        pathname,
        search: searchString,
        hash,
      });
    }
    return null;
  }

  // anchor -> route map (adjust if the route name differs)
  const anchorRouteMap: Record<string, string> = {
    "#reachusdesktop": "/horizontalscrollwebsite",
  };

  // utility: smooth scroll
  const smoothScrollTo = (hashVal: string) => {
    const id = hashVal.replace(/^#/, "");
    const el = typeof document !== "undefined" ? document.getElementById(id) : null;
    if (!el) {
      console.warn("[Header] Anchor not found:", id);
      return false;
    }
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    try {
      history.replaceState(null, "", "#" + id);
    } catch {
      /* ignore */
    }
    return true;
  };

  const handleClick = (e: React.MouseEvent, href: string) => {
    const closeMobile = () => setMobileOpen(false);

    if (href.startsWith("/")) {
      e.preventDefault();
      closeMobile();
      router.push(href);
      return;
    }

    if (href.startsWith("#")) {
      e.preventDefault();
      closeMobile();

      const targetRoute = anchorRouteMap[href] ?? "/";

      if (pathname === targetRoute) {
        smoothScrollTo(href);
        return;
      }

      try {
        router.push(targetRoute + href);
      } catch (err) {
        console.warn("[Header] router.push failed for anchor navigation:", err);
      }

      // fallback attempt
      setTimeout(() => {
        smoothScrollTo(href);
      }, SCROLL_DELAY_AFTER_NAV_MS);

      return;
    }

    // external - default
  };

  const isRouteActive = (href: string) => {
    if (!href || !href.startsWith("/")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header
      className="fixed top-0 left-0 w-full bg-[#262626] text-white z-50 shadow-md"
      role="banner"
      aria-label="Main header"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
        <Link href="/" aria-label="Go to homepage" className="flex items-center space-x-2">
          <div className="relative w-[90px] h-[34px] sm:w-[100px] sm:h-[35px]">
            <Image
              src="/images/Group 18.png"
              alt="medigital logo"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </Link>

        <nav role="navigation" aria-label="Primary navigation" className="hidden md:block">
          <ul className="flex items-center space-x-6">
            {navItems.map((item) => {
              const active = item.href.startsWith("/")
                ? isRouteActive(item.href)
                : item.href.startsWith("#")
                ? activeHash === item.href
                : false;

              const baseClass = "text-sm font-medium tracking-wide transition-colors";
              const linkClass = active
                ? `${baseClass} text-white underline underline-offset-4 decoration-2 decoration-orange-400`
                : `${baseClass} text-gray-300 hover:text-orange-400`;

              if (item.href.startsWith("/")) {
                return (
                  <li key={item.label}>
                    <Link href={item.href} onClick={(e) => handleClick(e as any, item.href)} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.label}>
                  <a href={item.href} onClick={(e) => handleClick(e, item.href)} className={linkClass} aria-current={active ? "page" : undefined}>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <button
            className="hidden md:inline-flex bg-[#E29A4D] hover:bg-[#ffae54] text-black font-semibold text-xs px-4 py-2 rounded-md transition-all duration-300"
            onClick={() => {
              if (pathname === "/") {
                smoothScrollTo("#reachusdesktop");
              } else {
                router.push("/#reachusdesktop");
                setTimeout(() => smoothScrollTo("#reachusdesktop"), SCROLL_DELAY_AFTER_NAV_MS);
              }
            }}
            aria-label="Contact us"
          >
            Contact Us
          </button>

          <button
            ref={toggleButtonRef}
            className="inline-flex items-center justify-center p-2 rounded-md md:hidden text-gray-200 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((s) => !s)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              {mobileOpen ? (
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-navigation"
        ref={mobileMenuRef}
        className={`md:hidden bg-[#262626]/95 backdrop-blur-sm border-t border-white/5 transition-all duration-200 overflow-hidden ${
          mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-3">
          <nav aria-label="Mobile primary" className="space-y-1">
            {navItems.map((item) => {
              const active = item.href.startsWith("/")
                ? isRouteActive(item.href)
                : item.href.startsWith("#")
                ? activeHash === item.href
                : false;

              const baseClass = "block px-3 py-2 rounded text-base font-medium transition-colors";
              const linkClass = active
                ? `${baseClass} text-white bg-white/5 underline underline-offset-4 decoration-2 decoration-orange-400`
                : `${baseClass} text-gray-200 hover:text-orange-400`;

              if (item.href.startsWith("/")) {
                return (
                  <div key={item.label}>
                    <Link href={item.href} onClick={(e) => handleClick(e as any, item.href)} className={linkClass}>
                      {item.label}
                    </Link>
                  </div>
                );
              }

              return (
                <div key={item.label}>
                  <a href={item.href} onClick={(e) => handleClick(e, item.href)} className={linkClass}>
                    {item.label}
                  </a>
                </div>
              );
            })}
          </nav>

          <div className="pt-2">
            <button
              className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-[#E29A4D] text-black font-semibold rounded-md hover:bg-[#ffae54] transition"
              onClick={() => {
                setMobileOpen(false);
                if (pathname === "/") {
                  smoothScrollTo("#reachusdesktop");
                } else {
                  router.push("/#reachusdesktop");
                  setTimeout(() => smoothScrollTo("#reachusdesktop"), SCROLL_DELAY_AFTER_NAV_MS);
                }
              }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;