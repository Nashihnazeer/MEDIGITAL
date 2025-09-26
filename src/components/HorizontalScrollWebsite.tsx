"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const HorizontalScrollWebsite = () => {
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



  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scrollLogosLeft = () => {
    logoScrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollLogosRight = () => {
    logoScrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  // Resize / initial sizes (only for desktop)
  useEffect(() => {
    if (isMobile) return;

    const updateSizes = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      
      // Calculate exact scroll distances
      const horizontalSections = 3;
      const totalWidth = vw * horizontalSections;
      const horizontalScrollDistance = totalWidth - vw; // This is how much we need to scroll to see all sections
      
      setContainerWidth(totalWidth);
      setViewportWidth(vw);
      setViewportHeight(vh);
      
      // Total scroll height: horizontal scroll + buffer + transition + vertical sections
      const bufferZone = vh * 0.8; // Let section 3 be visible for longer
      const transitionZone = vh * 1.2; // Slower transition
      const verticalSections = 4.7; // Updated from 2 to 5
      setSpacerHeight(horizontalScrollDistance + bufferZone + transitionZone + (vh * verticalSections));

      if (containerRef.current) {
        containerRef.current.style.width = `${totalWidth}px`;
      }
    };

    updateSizes();
    window.addEventListener("resize", updateSizes);
    return () => window.removeEventListener("resize", updateSizes);
  }, [isMobile]);

  // Hide horizontal overflow (only for desktop)
  useEffect(() => {
    if (isMobile) return;
    
    const prev = document.body.style.overflowX;
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = prev;
    };
  }, [isMobile]);

  // Scroll handler (only for desktop)
  useEffect(() => {
    if (isMobile) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        
        // Calculate scroll zones based on viewport width (more precise)
        const horizontalScrollDistance = (viewportWidth * 3) - viewportWidth; // 2 * viewportWidth
        const bufferZone = viewportHeight * 0.8;
        const transitionZone = viewportHeight * 1.2;
        
        const horizontalEnd = horizontalScrollDistance;
        const bufferEnd = horizontalEnd + bufferZone;
        const transitionEnd = bufferEnd + transitionZone;
        
        console.log('Scroll:', y, 'Horizontal End:', horizontalEnd, 'Buffer End:', bufferEnd, 'Transition End:', transitionEnd);
        
        if (y <= horizontalEnd) {
          // Phase 1: Horizontal scrolling (Hero → Ideas → Services)
          const x = (y / horizontalEnd) * horizontalScrollDistance;
          
          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${x}px)`;
            containerRef.current.style.position = 'fixed';
            containerRef.current.style.top = '0px';
            containerRef.current.style.zIndex = '30';
            containerRef.current.style.opacity = '1';
          }
          
          // Keep vertical sections hidden below
          if (verticalSectionsRef.current) {
            verticalSectionsRef.current.style.opacity = '0';
            verticalSectionsRef.current.style.pointerEvents = 'none';
            verticalSectionsRef.current.style.transform = 'translateY(100vh)';
            verticalSectionsRef.current.style.position = 'fixed';
            verticalSectionsRef.current.style.zIndex = '10';
          }
          
        } else if (y > horizontalEnd && y <= bufferEnd) {
          // Phase 2: Section 3 stays visible (buffer zone)
          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${horizontalScrollDistance}px)`;
            containerRef.current.style.position = 'fixed';
            containerRef.current.style.top = '0px';
            containerRef.current.style.zIndex = '30';
            containerRef.current.style.opacity = '1';
          }
          
          // Vertical sections still hidden
          if (verticalSectionsRef.current) {
            verticalSectionsRef.current.style.opacity = '0';
            verticalSectionsRef.current.style.pointerEvents = 'none';
            verticalSectionsRef.current.style.transform = 'translateY(100vh)';
            verticalSectionsRef.current.style.position = 'fixed';
            verticalSectionsRef.current.style.zIndex = '10';
          }
          
        } else if (y > bufferEnd && y <= transitionEnd) {
          // Phase 3: Transition animation
          const transitionProgress = (y - bufferEnd) / transitionZone;
          
          // Section 3 slides up
          const slideUpDistance = transitionProgress * viewportHeight;
          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${horizontalScrollDistance}px) translateY(-${slideUpDistance}px)`;
            containerRef.current.style.position = 'fixed';
            containerRef.current.style.top = '0px';
            containerRef.current.style.zIndex = '20';
            containerRef.current.style.opacity = `${1 - transitionProgress * 0.8}`;
          }
          
          // Vertical section slides in from bottom
          if (verticalSectionsRef.current) {
            const slideInDistance = viewportHeight * (1 - transitionProgress);
            verticalSectionsRef.current.style.opacity = `${transitionProgress}`;
            verticalSectionsRef.current.style.pointerEvents = transitionProgress > 0.5 ? 'auto' : 'none';
            verticalSectionsRef.current.style.transform = `translateY(${slideInDistance}px)`;
            verticalSectionsRef.current.style.position = 'fixed';
            verticalSectionsRef.current.style.zIndex = '25';
          }
          
        } else {
          // Phase 4: Normal vertical scrolling
          const verticalScroll = y - transitionEnd;
          
          // Hide horizontal sections completely
          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(-${horizontalScrollDistance}px) translateY(-${viewportHeight * 2}px)`;
            containerRef.current.style.position = 'fixed';
            containerRef.current.style.zIndex = '10';
            containerRef.current.style.opacity = '0';
          }
          
          // Vertical sections scroll normally
          if (verticalSectionsRef.current) {
            verticalSectionsRef.current.style.opacity = '1';
            verticalSectionsRef.current.style.pointerEvents = 'auto';
            verticalSectionsRef.current.style.transform = `translateY(-${verticalScroll}px)`;
            verticalSectionsRef.current.style.position = 'fixed';
            verticalSectionsRef.current.style.zIndex = '30';
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
           <section
      className="w-screen h-screen relative flex flex-col justify-center bg-black text-white md:hidden"
      style={{
        backgroundImage: "url('/images/Bg_1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Top Bar - Logo + Hamburger */}
      <div className="flex items-center justify-between px-6 pt-6 absolute top-0 left-0 right-0 z-50">
        <Image
          src="/images/Logo.png"
          alt="Logo"
          width={100}
          height={40}
          className="cursor-pointer"
        />
        {/* Hamburger */}
        <button
  onClick={() => setMenuOpen(!menuOpen)}
  className="flex flex-col justify-between w-6 h-5 focus:outline-none"
  aria-label={menuOpen ? "Close menu" : "Open menu"}
>
  <span className="block h-0.5 bg-white rounded"></span>
  <span className="block h-0.5 bg-white rounded"></span>
  <span className="block h-0.5 bg-white rounded"></span>
</button>

      </div>

      {/* Mobile Menu Overlay */}
     <div
  ref={menuRef}
  className={`fixed top-16 right-0 w-48 bg-white text-black rounded-md shadow-lg transform transition-transform duration-300 z-50 md:hidden
    ${menuOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"}
  `}
>
  <ul className="flex flex-col space-y-4 p-4">
    {["ABOUT US", "SERVICES", "PORTFOLIO", "BLOG"].map((item, idx) => (
      <li key={idx} className="text-base font-medium cursor-pointer">
        {item}
      </li>
    ))}

    {/* Reach Us with link to section id */}
    <li className="text-base font-medium cursor-pointer">
      <a href="#reachouttous">REACH US</a>
    </li>

    {/* Orange items */}
    <li className="mt-2 text-orange-500 font-medium">Creative</li>
    <li className="text-orange-500 font-medium">Web</li>
    <li className="text-orange-500 font-medium">Performance</li>
    <li className="text-orange-500 font-medium">Content</li>
  </ul>
</div>

      {/* Centered Hero Content */}
      <div className="flex flex-col items-center justify-center text-center px-6">
  <Image
    src="/images/Smiley.png"
    alt="Smiley"
    width={viewportWidth ? viewportWidth * 0.4 : 150}
    height={viewportWidth ? viewportWidth * 0.4 : 150}
    style={{ maxWidth: "100%", height: "auto" }}
  />
  <div
    className="text-4xl font-extrabold text-white leading-snug mt-4"
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

  {/* Downward Arrow */}
  <ChevronDown className="w-10 h-10 mt-10 text-white animate-bounce" />
</div>
    </section>
        {/* Mobile Section 2 - Ideas */}
        <section className="min-h-screen flex flex-col bg-white p-6">
          <div className="flex-1 flex flex-col justify-center text-center">
            <h2 className="text-4xl font-extrabold text-orange-500 leading-tight mb-6">
              Ideas That<br />Break<br />Through.
            </h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              We dont play it safe—we push ideas further. A team that tries,
              learns, and reinvents until your brand{" "}
              <span className="text-orange-500">speaks louder than the crowd.</span>
            </p>
            <button className="mx-auto w-48 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 mb-6">
              Read more
            </button>
          </div>

          <div className="flex-1 relative min-h-64">
            <Image
              src="/images/ofcework.png"
              alt="Office Work"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </section>

        {/* Mobile Section 3 - Services */}
        <section className="min-h-screen bg-gray-200 p-6 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-black mb-4">
              Need a digital<br />marketing<br />partner?
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Marketing doesn&apos;t have to be complicated. With us, it&apos;s<br />
              smart, simple, and effective. Let&apos;s get started.
            </p>
          </div>

          <div className="flex justify-center">
            <ul className="space-y-4 text-sm text-gray-800">
              <li>• Social Media Marketing</li>
              <li>• Google Ads</li>
              <li>• Search Engine Optimisation</li>
              <li>• Organic Promotions</li>
              <li>• Influencer Marketing</li>
              <li>• Email Marketing</li>
              <li>• App Promotions</li>
              <li>• Content Marketing</li>
            </ul>
          </div>
        </section>

        {/* Mobile Section 4 - Our Way */}
        <section
          className="min-h-screen bg-black text-white p-6 flex flex-col justify-center"
          style={{
            backgroundImage: "url('/images/digital-marketing.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="text-center mb-8">
            <h2 className="text-4xl font-extrabold text-orange-500 mb-6">
              Our<br />Way
            </h2>
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-white mb-2">Listen</h3>
              <p className="text-white text-sm leading-relaxed">
                Every great idea begins with listening. We tune in closely to
                understand who our clients are, what they value, and what they
                truly need.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-white mb-2">Reflect</h3>
              <p className="text-white text-sm leading-relaxed">
                Clear, thoughtful thinking is where creativity sparks. The
                sharper the thought, the stronger the idea.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-extrabold text-white mb-2">Create</h3>
              <p className="text-white text-sm leading-relaxed">
                Ideas alone are just words. When brought to life with purpose and
                precision, they evolve into impact — and sometimes, into legacies.
              </p>
            </div>
          </div>
        </section>

        {/* Mobile Section 5 - Design Process */}
        <section className="min-h-screen bg-white p-6 flex flex-col justify-center">
          <div className="text-center mb-8 ">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-4">
              Our Design Process
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Reboot Your Brand in <span className="text-orange-500">5 Daring Steps.</span>
            </p>
          </div>

          <div className="relative mb-8 h-48">
            <Image
              src="/images/laptop-table.png"
              alt="Design Process"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-extrabold text-orange-500 mb-2">
                Connect & Collaborate
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                We begin by immersing ourselves in your brand&apos;s universe. Our international client base feeds on trust, enduring partnerships, and solid referrals.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-orange-500 mb-2">
                Define Your Vision
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Brilliant campaigns begin with crystal-clear objectives. We reveal your brand&apos;s purpose and develop targets that dont merely reach for the stars.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-orange-500 mb-2">
                Develop a Winning Strategy
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Our digital specialists dont merely plan; they create. We develop a vibrant, results-driven media strategy.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-orange-500 mb-2">
                Make It Happen
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Concepts are only as good as their implementation. Our service and marketing teams work diligently.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-lg font-extrabold text-orange-500 mb-2">
                Measure & Master
              </h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                Outcomes count. We dig into the metrics, analyzing each campaign to call out strengths.
              </p>
            </div>
          </div>
        </section>

        {/* Mobile Section 6 - Portfolio */}
        <section className="min-h-screen bg-gray-300 p-6 flex flex-col justify-center">
          <div className="relative mb-6 h-64 rounded-lg overflow-hidden">
            <Image
              src="/images/working-table-with-computer 1.png"
              alt="Portfolio"
              fill
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-65 flex flex-col justify-center items-center text-center p-4">
              <h2 className="text-3xl font-bold text-orange-500 mb-2">
                Our Portfolio
              </h2>
              <h3 className="text-lg font-semibold text-orange-500 mb-2">
                We Advertise. We Amaze.
              </h3>
              <p className="text-white text-xs leading-relaxed">
                <span className="text-orange-500">&quot;dont tell, show&quot;</span> is git add .our mantra. Our work speaks—bold,
                impactful, unforgettable.
              </p>
            </div>
          </div>

          {/* Mobile Logo Carousel */}
          <div className="relative bg-white rounded-lg p-4">
            <div
              ref={logoScrollRef}
              className="flex space-x-8 overflow-x-auto scroll-smooth no-scrollbar pb-4"
            >
              {[
                "/images/11.png",
                "/images/22.png",
                "/images/33.png",
                "/images/44.png",
                "/images/55.png",
                "/images/66.png",
              ].map((logo, index) => (
                <div key={index} className="w-20 h-12 relative flex-shrink-0">
                  <Image
                    src={logo}
                    alt={`Client Logo ${index + 1}`}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile Section 7 - Contact Form */}
        <section className="min-h-screen bg-white p-6 flex flex-col">
          <div className="relative mb-6 h-48 rounded-lg overflow-hidden">
            <Image
              src="/images/black-wired-phone-black-background 1.png"
              alt="Contact"
              fill
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center items-center text-center p-4">
              <h2 className="text-3xl font-bold text-orange-500 mb-4">
                Let&apos;s Talk!
              </h2>
              <p className="text-white text-sm leading-relaxed">
                Ready to elevate your brand? Fill our quick form, and
                we&apos;ll connect soon.
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-orange-500 mb-6 text-center">
              Reach out to us | Say hi
            </h3>
            
            <form className="space-y-6">
              <input
                type="text"
                placeholder="Name"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400"
              />
              <input
                type="email"
                placeholder="Email id"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400"
              />
              <input
                type="tel"
                placeholder="Mobile"
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400"
              />
              <textarea
                placeholder="Message"
                rows={3}
                className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400 resize-none"
              />
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-medium"
                >
                  Submit
                </button>
              </div>
            </form>
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
            width={120}
            height={32}
            className="mb-6"
          />
          
          <div className="w-full max-w-sm mb-6">
            <input
              type="text"
              placeholder="Search for our Services"
              className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none mb-3"
            />
            <button className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300">
              Search
            </button>
          </div>

          <div className="flex justify-center space-x-6">
            {[
              "/images/Insta.png",
              "/images/Facebook.png", 
              "/images/Youtube.png",
              "/images/Twitter.png",
              "/images/Linkedin.png"
            ].map((social, index) => (
              <a
                key={index}
                href="#"
                className="w-8 h-8 relative flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <Image
                  src={social}
                  alt={`Social Icon ${index + 1}`}
                  width={32}
                  height={32}
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
      {/* Horizontal fixed container */}
      <div
        ref={containerRef}
        className="fixed top-0 left-0 h-screen flex"
        style={{
          width: containerWidth ? `${containerWidth}px` : "300vw",
          transformOrigin: "top left",
          willChange: "transform",
          zIndex: 30,
        }}
      >
        {/* Section 1 - Hero */}
        <section
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
              <div className="flex space-x-4">
                {[
                  { src: "/images/Insta.png", alt: "Instagram" },
                  { src: "/images/Facebook.png", alt: "Facebook" },
                  { src: "/images/Youtube.png", alt: "YouTube" },
                  { src: "/images/Twitter.png", alt: "Twitter" },
                  { src: "/images/Linkedin.PNG", alt: "LinkedIn" },
                ].map((icon, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-6 h-6 flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Image src={icon.src} alt={icon.alt} width={24} height={24} />
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
  {["ABOUT US", "SERVICES", "PORTFOLIO", "BLOG", "REACH US"].map(
    (item, idx) => (
      <li
        key={idx}
        className="text-gray-200 font-medium text-[9px] hover:text-orange-400 transition-colors duration-300"
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "center",
          whiteSpace: "nowrap",
        }}
      >
        {item === "REACH US" ? (
          <a href="#reachouttous" className="cursor-pointer">
            {item}
          </a>
        ) : (
          item
        )}
      </li>
    )
  )}
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
            <div className="relative flex-shrink-0">
              <Image
                src="/images/Smiley.png"
                alt="Smiley"
                width={viewportWidth ? viewportWidth * 0.25 + 80 : 300}
                height={viewportWidth ? viewportWidth * 0.25 + 80 : 300}
                style={{ maxWidth: "100%", height: "auto" }}
                className="scale-110 -translate-x-[180px] -translate-y-[0px]"
              />
            </div>
          </div>
        </section>

        {/* Section 2 - Ideas */}
        <section className="w-screen h-screen flex relative">
          <div className="flex-1 flex flex-col justify-center px-10 bg-white relative z-10 translate-x-[100px]">
            <h2 className="text-7xl font-extrabold text-orange-500 leading-tight">
              Ideas That <br /> Break <br /> Through.
            </h2>
            <p className="mt-4 text-[11px] text-gray-600 max-w-[400px]">
              We dont play it safe—we push ideas further. A team that tries,
              learns, and reinvents until your brand{" "}
              <span className="text-orange-500">speaks louder than the crowd.</span>
            </p>
            <button className="mt-6 w-[200px] py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
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
        <section className="w-screen h-screen flex justify-between items-center px-10 bg-gray-200">
          <div className="w-1/2 translate-x-[700px]">
            <ul className="space-y-7 text-sm text-gray-800">
              <li>• Social Media Marketing</li>
              <li>• Google Ads</li>
              <li>• Search Engine Optimisation</li>
              <li>• Organic Promotions</li>
              <li>• Influencer Marketing</li>
              <li>• Email Marketing</li>
              <li>• App Promotions</li>
              <li>• Content Marketing</li>
            </ul>
          </div>

          <div className="w-1/2 text-left translate-x-[-400px]">
            <h2 className="text-7xl font-extrabold text-black mb-4">
              Need a <br />digital<br /> marketing<br /> partner?
            </h2>
            <p className="text-gray-600 max-w-lg ml-auto text-left -translate-x-20 translate-y-5 text-[11px]">
              Marketing doesn&apos;t have to be complicated. With us, it&apos;s<br /> smart,
              simple, and effective. Let&apos;s get started.
            </p>
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
        <section
          className="w-screen h-screen relative flex flex-col justify-center items-center bg-black text-white"
          style={{
            backgroundImage: "url('/images/digital-marketing.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="text-left z-10">
            <h2 className="text-7xl font-extrabold text-orange-500 mb-6 translate-x-[-250px] translate-y-[100px]">
              Our<br></br>Way
            </h2>
          </div>

          <div>

          <div className="translate-y-[210px] translate-x-[-150px]">
            <h2 className="text-3xl font-extrabold text-white mb-1">
            Listen

            </h2>
            <p className="text-white max-w-lg  text-[8px] leading-relaxed" style={{ width: "400px" }}>
            Every great idea begins with<br></br>
listening. We tune in closely to<br></br>
understand who our clients are,<br></br>
what they value, and what they<br></br>
truly need.

            </p>
            </div>
            <div className="translate-y-[106px] translate-x-[150px]">
            <h2 className="text-3xl font-extrabold text-white mb-1">
            Reflect
            </h2>
            <p className="text-white max-w-lg  text-[8px] leading-relaxed" style={{ width: "400px" }}>
            Clear, thoughtful thinking is<br></br>
where creativity sparks. The<br></br>
sharper the thought, the<br></br>
stronger the idea.
            </p>
            </div>
            <div className="translate-y-[15px] translate-x-[450px]">
            <h2 className="text-3xl font-extrabold text-white mb-1">
            Create
            </h2>
            <p className="text-white max-w-lg  text-[8px] leading-relaxed" style={{ width: "400px" }}>
            Ideas alone are just words. When<br></br>
brought to life with purpose and<br></br>
precision, they evolve into impact —<br></br>
and sometimes, into legacies.
            </p>
            </div>
            </div>
        </section>

        {/* Section 5 - Design Process */}
        <section className="w-screen h-screen relative flex items-center justify-between bg-white px-10">
          <div className="w-1/2 translate-x-[650px] translate-y-[-200px]">
            <h2 className="text-5xl font-extrabold text-orange-500 mb-6" style={{ width: "300px" }}>
              Our Design <br /> Process
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed w-full" style={{ width: "300px" }}>
            Reboot Your Brand in <span className="text-orange-500">5 Daring Steps.</span> 
            </p>
            
          </div>

          
          <div className="w-1/2 relative h-screen flex items-center justify-start translate-x-[-185px]">
  <div className="w-[470px] h-screen relative">
    <Image
      src="/images/laptop-table.png"
      alt="Design Process"
      fill
      style={{ objectFit: "cover" }} // same fit as second block
      priority
      className="transition-all duration-300"
    />
    
    {/* Orange line */}
    <div className="absolute h-[2px] bg-orange-500 w-[1000px] translate-x-[100px] translate-y-[280px]" />
  </div>
</div>

          <div className="translate-x-[-450px]">
            <div className="translate-y-[50px]">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-1">
            Connect & <br></br>
            Collaborate
            </h2>
            <p className="text-white max-w-lg  text-[8px] leading-relaxed" style={{ width: "400px" }}>
            We begin by immersing ourselves in your brand&apos;s <br></br>
universe. Our international client base feeds on trust, <br></br>
enduring partnerships, and solid referrals. Let&apos;s get <br></br>
acquainted, set vision, and lay the groundwork for <br></br>
something amazing.
            </p>
            </div>



            <div className="translate-y-[100px]">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-1">
            Make It <br></br>
Happen
            </h2>
            <p className="text-white  text-[8px] leading-relaxed"
            style={{ width: "400px" }}>
Concepts are only as good as their implementation. Our<br></br>
service and marketing teams work diligently,<br></br>
collaborating with you and the world&apos;s best media to<br></br>
execute on every commitment with accuracy and<br></br>
panache.
            </p>
            </div>


            </div>


            <div className="translate-x-[-550px]">
            <div className="translate-y-[50px]">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-1">
            Define <br></br>
Your Vision
            </h2>
            <p className="text-black max-w-lg  text-[8px] leading-relaxed" style={{ width: "400px" }}>
            Brilliant campaigns begin with crystal-clear<br></br>
objectives. We reveal your brand&apos;s purpose and<br></br>
develop targets that dont merely reach for the stars—<br></br>
they hit the mark, powering a strategy that inspires<br></br>
and resonates.
            </p>
            </div>



            <div className="translate-y-[100px]">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-1">
            Measure & <br></br>
Master
            </h2>
            <p className="text-black  text-[8px] leading-relaxed"
            style={{ width: "400px" }}>
           Outcomes count. We dig into the metrics, analyzing<br></br>
each campaign to call out strengths, identify<br></br>
opportunities, and optimize for maximum<br></br>
effectiveness. Your success fuels wiser strategies for<br></br>
the future.

            </p>
            </div>


            </div>


            <div className="translate-x-[-650px]">
            <div className="translate-y-[-25px]">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-1">
            Develop a <br></br>
Winning Strategy
            </h2>
            <p className="text-black max-w-lg  text-[8px] leading-relaxed" style={{ width: "400px" }}>
            Our digital specialists dont merely plan; they<br></br>
create. We develop a vibrant, results-driven media<br></br>
strategy that&apos;s as distinctive as your brand, aimed<br></br>
at captivating and converting on your budget.
            </p>
            </div>
            </div>
        </section>

{/* Section 6 - Portfolio */}
<section className="w-screen h-screen relative flex items-center justify-between bg-gray-300 ">
  {/* Left side - Rectangle image */}
  <div className="w-1/2 relative h-screen flex items-center justify-start translate-x-[155px]">
    <div className="w-[470px] h-screen relative">
      <Image
        src="/images/working-table-with-computer 1.png" // Replace with your image path
        alt="Portfolio Rectangle"
        fill
        style={{ objectFit: "cover" }}
       
      />
{/* black transparent overlay */}
<div className="absolute inset-0 bg-black bg-opacity-65 z-10" />
      {/* Content overlay */}
     
    </div>
  </div>
  <div className="absolute inset-0  rounded-lg flex flex-col justify-center items-start p-8 translate-y-[-150px] translate-x-[150px]">
        <h2 className="text-5xl font-bold text-orange-500 mb-4">
          Our<br />Portfolio
        </h2>
        <h1 className="text-2xl font-semibold text-orange-500 mb-2">
          We Advertise.<br />We Amaze.
        </h1>
        <p className="text-white text-[10px] leading-relaxed">
          <span className="text-orange-500">“Don’t tell, show”</span> is our mantra. Our work speaks—bold,<br></br>
           impactful, unforgettable. Explore our portfolio and see<br></br>
           the difference!
        </p>
      </div>
  {/* Right side - Logo carousel with button control */}
  <div className="w-screen h-auto flex items-center justify-center translate-y-[90px] translate-x-[-480px]">
  <div className="relative w-screen h-[200px] bg-white rounded-lg flex items-center px-10 overflow-hidden">
    {/* Left button */}
    <button
      onClick={scrollLogosLeft}
      type="button"
      aria-label="Previous logos"
      className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-300"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>

    {/* Right button */}
    <button
      onClick={scrollLogosRight}
      type="button"
      aria-label="Next logos"
      className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow-lg hover:bg-gray-300"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>

    {/* Logos */}
    <div
      ref={logoScrollRef}
      className="flex space-x-16 w-full py-4 overflow-x-auto scroll-smooth no-scrollbar"
    >
      {[
        "/images/11.png",
        "/images/22.png",
        "/images/33.png",
        "/images/44.png",
        "/images/55.png",
        "/images/66.png",
        "/images/11.png",
        "/images/22.png",
        "/images/33.png",
        "/images/44.png"
      ].map((logo, index) => (
        <div key={index} className="w-32 h-20 relative flex-shrink-0">
          <Image
            src={logo}
            alt={`Client Logo ${index + 1}`}
            fill
            style={{ objectFit: "contain" }}
            className="hover:scale-110 transition-transform duration-300"
          />
        </div>
      ))}
    </div>
  </div>

  </div>
  
</section>


        {/* Section 7 - Contact Form */}
        <section className="w-screen h-screen relative flex items-center justify-between bg-white px-10">
          {/* Left side - Rectangle image with content */}
          <div className="w-1/2 relative h-full flex items-center justify-start translate-x-[115px]">
            <div className="w-[470px] h-screen relative">
              <Image
                src="/images/black-wired-phone-black-background 1.png" // Replace with your image path
                alt="Contact Rectangle"
                fill
                style={{ objectFit: "cover" }}
                
              />
              {/* Content overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex flex-col justify-center items-start p-8">
                <h2 className="text-5xl font-bold text-orange-500 mb-6">
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
              <h3 className="text-2xl font-semibold text-orange-500 mb-2">
                Reach out to us | Say hi
              </h3>
              
              <form className="space-y-6 mt-8">
                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <input
                    type="email"
                    placeholder="Email id"
                    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <input
                    type="tel"
                    placeholder="Mobile"
                    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <textarea
                    placeholder="Message"
                    rows={3}
                    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400 resize-none"
                  />
                </div>
                
                <button
                  type="submit"
                  className="bg-orange-500 text-white px-8 py-2 rounded-lg hover:bg-orange-600 transition-colors duration-300 font-medium"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Section 8 - Search and Logos */}
        <section 
          className="w-screen h-[75vh] relative flex flex-col items-center justify-center bg-black text-white"
          style={{
            backgroundImage: "url('/images/Bg_1.png')", // Replace with your background image
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          {/* Main logo and search */}
          <div className="flex items-center space-x-6 ">
              <Image
                src="/images/Logo.png"
                alt="Logo"
                width={150}
                height={40}
                className="cursor-pointer translate-x-[250px] translate-y-[-100px]"
              />
            
            {/* Search bar */}
            <div className="flex items-center justify-center space-x-4 mb-8 translate-y-[20px]">
              <input
                type="text"
                placeholder="Search for our Services"
                className="bg-gray-800 text-white px-6 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none w-80"
              />
              <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300 translate-y-[60px] translate-x-[-230px]">
                Search
              </button>
            </div>
          </div>

          {/* Bottom logos */}
          <div className="flex items-center justify-center space-x-8 translate-y-[70px] translate-x-[30px]">
            {/* Social media icons - replace with your actual icons */}
            {[
              
"/images/Insta.png",
"/images/Facebook.png", 
"/images/Youtube.png",
"/images/Twitter.png",
"/images/Linkedin.png"
            ].map((social, index) => (
              <a
                key={index}
                href="#"
                className="w-10 h-10 relative flex items-center justify-center hover:scale-110 transition-transform duration-300"
              >
                <Image
                  src={social} // Replace with your actual social media icons
                  alt={`Social Icon ${index + 1}`}
                  width={40}
                  height={40}
                 
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

export default HorizontalScrollWebsite;