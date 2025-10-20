/* eslint-disable react-hooks/rules-of-hooks */
// src/components/Header.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

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
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const [activeHash, setActiveHash] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Mobile menu state
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  // ---- DEBUG: log pathname so we can see what exact path the page reports ----
  useEffect(() => {
    // NOTE: remove or silence this in production
    // eslint-disable-next-line no-console
    console.debug("[Header] pathname:", pathname, "search:", String(searchParams));
  }, [pathname, searchParams]);
  // ---------------------------------------------------------------------------

  // ----- HIDE CONDITIONS (robust) -----
  const hideSubstrings = [
    "horizontalscroll",
    "horizontal-scroll",
    "horizontal",
    "horizontalscrollwebsite",
  ];

  const pathnameLower = pathname.toLowerCase();
  const searchString = String(searchParams || "");
  const hash = typeof window !== "undefined" ? window.location.hash.toLowerCase() : "";

  const shouldHideHeader =
    hideSubstrings.some((s) => pathnameLower.includes(s)) ||
    hideSubstrings.some((s) => searchString.includes(s)) ||
    hideSubstrings.some((s) => hash.includes(s)) ||
    (searchParams && (searchParams.get("hideHeader") === "1" || searchParams.get("hideHeader") === "true"));

  if (shouldHideHeader) {
    // eslint-disable-next-line no-console
    console.debug("[Header] hidden because route/search/hash matched hide rules:", {
      pathname,
      search: searchString,
      hash,
    });
    return null;
  }
  // ------------------------------------------------------------------

  // ids to observe (anchor-only)
  const anchorIds = useMemo(
    () => navItems.filter((n) => n.href.startsWith("#")).map((n) => n.href.replace("#", "")),
    []
  );

  // utility: scroll to an element smoothly if present
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

  // Handles click on nav items
  const handleClick = (e: React.MouseEvent, href: string) => {
    // Close mobile menu when navigating
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
      if (pathname === "/") {
        smoothScrollTo(href);
        return;
      }
      try {
        router.push("/" + href);
      } catch {
        console.warn("[Header] router.push failed for hash navigation:", href);
      }
      setTimeout(() => {
        smoothScrollTo(href);
      }, SCROLL_DELAY_AFTER_NAV_MS);
      return;
    }

    // external links — leave default behavior
  };

  // Quick helper to determine active state for routes
  const isRouteActive = (href: string) => {
    if (!href || !href.startsWith("/")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Close mobile menu on route change (robust)
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Close on escape and click outside
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

  // Scroll spy: observe anchors on the page and highlight nav items appropriately.
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (pathname !== "/") {
      setActiveHash(null);
      const urlHash = window.location.hash;
      if (urlHash) {
        smoothScrollTo(urlHash);
      }
      return;
    }

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
        const id = visible[0].target.id;
        setActiveHash("#" + id);
      } else {
        setActiveHash(null);
      }
    }, options);

    elements.forEach((it) => obs.observe(it.el));
    observerRef.current = obs;

    if (window.location.hash) {
      smoothScrollTo(window.location.hash);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = null;
    };
  }, [pathname, anchorIds]);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash) smoothScrollTo(window.location.hash);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 w-full bg-[#262626] text-white z-50 shadow-md"
      role="banner"
      aria-label="Main header"
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 sm:px-8 py-3">
        {/* Logo */}
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

        {/* Desktop nav */}
        <nav role="navigation" aria-label="Primary navigation" className="hidden md:block">
          <ul className="flex items-center space-x-6">
            {navItems.map((item) => {
              const active =
                item.href.startsWith("/")
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
                  <a
                    href={item.href}
                    onClick={(e) => handleClick(e, item.href)}
                    className={linkClass}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right-side actions: contact button + mobile toggle */}
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

          {/* Mobile menu toggle */}
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
                // close icon
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                // hamburger
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        id="mobile-navigation"
        ref={mobileMenuRef}
        className={`md:hidden bg-[#262626]/95 backdrop-blur-sm border-t border-white/5 transition-all duration-200 overflow-hidden ${mobileOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="px-4 py-4 space-y-3">
          <nav aria-label="Mobile primary" className="space-y-1">
            {navItems.map((item) => {
              const active =
                item.href.startsWith("/")
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