"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import AnimatedSmiley from "@/components/AnimatedSmiley";
import ServicePillList, { ServiceItem } from "@/components/Servicelist";
import logoData, { type LogoItem } from "@/data/logoData";






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
  // Mobile detection (handles landscape too)
  useEffect(() => {
    const checkMobile = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  
      // Detect iPads, iPhones, Android devices (including newer iPadOS Safari that reports as Mac)
      const isTabletOrMobileUA = /iPhone|iPod|Android|Mobile|iPad|Tablet|PlayBook|Silk/i.test(ua);
  
      // Screen-based check — only small widths (not short desktop windows)
      const width = window.innerWidth;
      const height = window.innerHeight;
  
      // iPads (portrait ≤768–1024) and all mobiles (≤480)
      const isSmallScreen = width <= 1024 && height <= 1366;
  
      // Avoid false positives on desktop by checking for "Mac" without "iPad"
      const isDesktopMac = /Macintosh/i.test(ua) && !/iPad/i.test(ua);
  
      // Final decision
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

// send email api
const API_URL = 'http://127.0.0.1:5001/send-email';

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const f = e.currentTarget;
  const fd = new FormData(f);
  const payload = {
    name: fd.get('name')?.toString() ?? '',
    email: fd.get('email')?.toString() ?? '',
    mobile: fd.get('mobile')?.toString() ?? '',
    message: fd.get('message')?.toString() ?? ''
  };
  console.log('Submitting payload:', payload);

  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
      mode: 'cors'
    });

    clearTimeout(tid);
    console.log('Fetch returned:', res.status, res.statusText);
    const text = await res.text();
    console.log('Response text:', text);
    try {
      const json = JSON.parse(text || '{}');
      console.log('Response JSON:', json);
      if (res.ok && json.ok) { alert('✅ Message sent'); f.reset(); return; }
      alert('❌ Send failed: ' + (json.error || text));
    } catch {
      alert('❌ Send failed (non-JSON): ' + text);
    }
  } catch (err: any) {
    console.error('Fetch error (client):', err);
    alert('⚠️ Error sending message: ' + (err?.message || err));
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
  <div className="relative z-30 flex flex-col items-center justify-center text-center px-6">
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
    className="transform text-4xl font-extrabold text-white leading-snug landscape:-translate-y-[80px] landscape:translate-x-[200px]"
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
  <div className="translate-y-[250px] landscape:translate-y-[10px]">
    <ChevronDown className="w-10 h-10 text-white animate-bounce" />
  </div>
</section>
  {/* Extended Orange Background */}
  <div className="absolute bottom-[-10px] left-0 right-0 h-[80px] bg-[#EEAA45] w-full rounded-b-[3rem] z-10"></div>
</div>
{/* Section 2 - Ideas */}
<section
  className="min-h-screen flex flex-col p-6 bg-cover bg-center bg-no-repeat"
  style={{
    backgroundImage: "url('/images/ofcework.png')",
  }}
>
  <div className="flex-1 flex flex-col justify-end items-start text-left pb-12">
    <h2 className="text-4xl font-extrabold text-orange-500 leading-tight mb-6">
      Ideas That<br />Break<br />Through.
    </h2>
    <p className="text-sm text-gray-100 mb-6 leading-relaxed max-w-md">
      We dont play it safe—we push ideas further. A team that tries,
      learns, and reinvents until your brand{" "}
      <span className="text-orange-500">speaks louder than the crowd.</span>
    </p>
    <button className="w-48 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
      Read more
    </button>
  </div>
</section>


       {/* Mobile Section 3 - Services */}
<section className="min-h-screen flex flex-col">
  {/* Top Half */}
  <div className="flex-1 bg-[#EEAA45] p-10 flex flex-col justify-center text-center">
    <h2 className="text-4xl font-extrabold text-black mb-4">
      Need a digital<br />marketing partner?
    </h2>
    <p className="text-black text-sm leading-relaxed">
      Marketing doesn&apos;t have to be complicated.<br />With us, it&apos;s
      smart, simple, and effective. Let&apos;s<br /> get started.
    </p>
  </div>

  {/* Bottom Half */}
  <div className="flex-1 bg-[#C4C6C8] p-6 flex flex-col justify-center items-center">
    <ul className="space-y-4 text-xl text-black text-left w-fit leading-10">
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
      <h2 className="text-6xl font-extrabold text-orange-500 mb-6">
        Our<br />Way
      </h2>
    </div>

    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-extrabold text-orange-500 mb-2">Listen</h3>
        <p className="text-white text-sm leading-relaxed">
          Every great idea begins with listening. We tune in closely to
          understand who our clients are, what they value, and what they
          truly need.
        </p>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-extrabold text-orange-500 mb-2">Reflect</h3>
        <p className="text-white text-sm leading-relaxed">
          Clear, thoughtful thinking is where creativity sparks. The
          sharper the thought, the stronger the idea.
        </p>
      </div>

      <div className="text-center">
        <h3 className="text-2xl font-extrabold text-orange-500 mb-2">Create</h3>
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
  className="min-h-[200vh] p-6 pt-20 flex flex-col justify-start relative bg-cover bg-center bg-no-repeat -mt-16"
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
      <h2 className="text-3xl font-extrabold text-orange-500 mb-4">
        Our Design Process
      </h2>
      <p className="text-gray-200 text-base leading-relaxed">
        Reboot Your Brand in{" "}
        <span className="text-orange-500">5 Daring Steps.</span>
      </p>
    </div>

    {/* Cards Stack */}
    <div className="relative flex flex-col items-center">
      {/* Card 1 */}
      <div className="bg-orange-500 text-white p-8 pt-[80px] h-80 w-[350px] rounded-2xl relative z-50 shadow-lg">
        <h3 className="text-2xl font-extrabold mb-4">Connect & Collaborate</h3>
        <p className="text-base leading-relaxed">
          We begin by immersing ourselves in your brand&apos;s universe. Our
          international client base feeds on trust, enduring partnerships, and
          solid referrals.
        </p>
      </div>

      {/* Card 2 */}
      <div className="bg-white text-gray-800 p-8 pt-[80px] h-80 w-[350px] rounded-b-2xl relative z-40 -translate-y-12 shadow-lg">
        <h3 className="text-2xl font-extrabold text-orange-500 mb-4">
          Define Your Vision
        </h3>
        <p className="text-base leading-relaxed">
          Brilliant campaigns begin with crystal-clear objectives. We reveal your
          brand&apos;s purpose and develop targets that don&apos;t merely reach for the stars.
        </p>
      </div>

      {/* Card 3 */}
      <div className="bg-orange-500 text-white p-8 pt-[80px] h-80 w-[350px] rounded-b-2xl relative z-30 -translate-y-24 shadow-lg">
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
        <h3 className="text-2xl font-extrabold text-orange-500 mb-4">
          Make It Happen
        </h3>
        <p className="text-base leading-relaxed">
          Concepts are only as good as their implementation. Our service and
          marketing teams work diligently.
        </p>
      </div>

      {/* Card 5 */}
      <div className="bg-orange-500 text-white p-8 pt-[80px] h-80 w-[350px] rounded-b-2xl relative z-10 -translate-y-48 shadow-lg">
        <h3 className="text-2xl font-extrabold mb-4">Measure & Master</h3>
        <p className="text-base leading-relaxed">
          Outcomes count. We dig into the metrics, analyzing each campaign to call
          out strengths.
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
    <h2 className="text-3xl font-bold text-orange-500 mb-2">
      Our Portfolio
    </h2>
    <h3 className="text-lg font-semibold text-orange-500 mb-2">
      We Advertise. We Amaze.
    </h3>
    <p className="text-white text-sm leading-relaxed max-w-md">
      <span className="text-orange-500">&quot;don&apos;t tell, show&quot;</span> is our mantra. 
      Our work speaks—bold, impactful, unforgettable.
    </p>
  </div>

{/* Manual Touch Scroll Logo Carousel */}
<div className="relative z-10 w-full bg-white py-6">
  <div className="flex justify-center space-x-8 overflow-x-auto no-scrollbar px-4">
    {[
      "/images/11.png",
      "/images/22.png",
      "/images/33.png",
      "/images/44.png",
      "/images/55.png",
      "/images/66.png",
    ].map((logo, index) => (
      <div
        key={index}
        className="relative flex-shrink-0"
        style={{ width: "120px", height: "80px" }}
      >
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
      <h2 className="text-7xl font-bold text-orange-500 mb-4">
        Let&apos;s Talk!
      </h2>
      <p className="text-white text-sm leading-relaxed max-w-md mx-auto">
        Ready to elevate your brand? Fill our quick <br></br>form, and
        we&apos;ll connect soon.  Prefer email?<br></br>Reach us at <span className="text-orange-500">connect@.com</span>
      </p>
    </div>

    {/* Contact Form Card */}
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-6 w-full max-w-md">
      <h3 className="text-xl font-semibold text-orange-500 mb-6 text-center">
        Reach out to us | Say hi
      </h3>

<form onSubmit={handleSubmit} className="space-y-6">
  <input
    type="text"
    name="name"
    placeholder="Name"
    required
    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-500"
  />

  <input
    type="email"
    name="email"
    placeholder="Email id"
    required
    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-500"
  />

  <input
    type="tel"
    name="mobile"
    placeholder="Mobile"
    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-500"
  />

  <textarea
    name="message"
    placeholder="Message"
    rows={3}
    required
    className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-500 resize-none"
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
            <div className="flex justify-center space-x-6">
  {[
    { src: "/images/Insta.png", alt: "Instagram", href: "https://www.instagram.com/me__digital/" },
    { src: "/images/Facebook.png", alt: "Facebook", href: "https://www.facebook.com/MediaExpressionDigital/" },
    { src: "/images/Youtube.png", alt: "YouTube", href: "https://www.youtube.com/@mediaexpressiondigital" }, // optional if you have one
    { src: "/images/Twitter.png", alt: "Twitter", href: "https://twitter.com" }, // replace if active
    { src: "/images/Linkedin.PNG", alt: "LinkedIn", href: "https://www.linkedin.com/company/mediaexpressiondigital/posts/?feedView=all" },
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
        { label: "ABOUT US", href: "#aboutus" },
        { label: "SERVICES", href: "#services" },
        { label: "PORTFOLIO", href: "#portfolio" },
        { label: "BLOG", href: "/blog" }, // ✅ Updated: blog will now open /blog page
        { label: "REACH US", href: "#reachusdesktop" },
      ].map((item, idx) => (
        <li
          key={idx}
          className="text-gray-200 font-medium text-[9px] hover:text-orange-400 transition-colors duration-300"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "center",
            whiteSpace: "nowrap",
          }}
        >
          <a
            href={item.href}
            className="cursor-pointer"
            onClick={(e) => {
              // ✅ Allow /blog to navigate normally
              if (item.href === "/blog") return; // <--- Let Next.js handle navigation
              
              // Otherwise, handle smooth scrolling for anchors
              e.preventDefault();
              const id = item.href.replace(/^#/, "");
              const el = document.getElementById(id);
              if (!el) {
                console.warn("Target not found:", id);
                return;
              }

              const rect0 = el.getBoundingClientRect();
              const absoluteTopBefore = rect0.top + window.pageYOffset;

              const getScrollParents = (node: HTMLElement | null): HTMLElement[] => {
                const parents: HTMLElement[] = [];
                let p = node?.parentElement || null;
                while (p) {
                  const style = getComputedStyle(p);
                  const overflowY = style.overflowY;
                  const isScrollable =
                    /(auto|scroll|overlay)/.test(overflowY) &&
                    p.scrollHeight > p.clientHeight;
                  if (isScrollable) parents.push(p);
                  p = p.parentElement;
                }
                return parents;
              };

              const wait = (ms: number) =>
                new Promise((res) => setTimeout(res, ms));

              (async () => {
                try {
                  el.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest",
                  });
                } catch {}

                const parents = getScrollParents(el);
                for (let i = 0; i < parents.length; i++) {
                  const parent = parents[i];
                  const parentRect = parent.getBoundingClientRect();
                  const elRect = el.getBoundingClientRect();
                  const offset =
                    elRect.top - parentRect.top + (parent.scrollTop || 0);
                  const maxScroll =
                    parent.scrollHeight - parent.clientHeight;
                  const target = Math.min(
                    Math.max(0, offset),
                    Math.max(0, maxScroll)
                  );
                  try {
                    parent.scrollTo({ top: target, behavior: "smooth" });
                  } catch {
                    parent.scrollTop = target;
                  }
                  await wait(160);
                }

                const finalRect = el.getBoundingClientRect();
                const isVisible =
                  finalRect.top >= 0 && finalRect.top < window.innerHeight;
                if (isVisible) return;

                const headerOffset = 0;
                const desired = Math.max(0, absoluteTopBefore - headerOffset);
                const maxScroll =
                  document.documentElement.scrollHeight - window.innerHeight;
                const finalTarget = Math.min(
                  desired,
                  Math.max(0, maxScroll)
                );
                window.scrollTo({ top: finalTarget, behavior: "smooth" });
              })();
            }}
          >
            {item.label}
          </a>
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
            <div style={{ width: "60%", height: "2px", backgroundColor: "black" }}></div>
            <p className="text-gray-600 max-w-lg  ml-auto text-left -translate-x-[180px] translate-y-[-0px] text-[15px] my-5 py-2">
              Marketing doesn&apos;t have to be complicated. With us, it&apos;s<br /> smart,
              simple, and effective. Let&apos;s get started.
            </p>
            <div style={{ width: "60%", height: "2px", backgroundColor: "black" }}></div>
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
        <section className="w-screen h-screen relative flex items-center justify-between bg-white px-10">
          <div className="flex items-center justify-start w-full translate-y-[-200px] sm:translate-x-[750px]">
  {/* Big number 4 */}
  <div className="text-[150px] font-extrabold text-orange-500 leading-none flex-shrink-0">
    4
  </div>

  {/* Text block (aligned perfectly with the height of 4) */}
  <div className="ml-4 flex flex-col justify-center h-[150px] leading-none">
    <h2 className="text-[50px] font-extrabold text-orange-500">Daring</h2>
    <h2 className="text-[50px] font-extrabold text-orange-500">Steps.</h2>

    {/* Subtext below */}
    <p className="text-black text-sm leading-relaxed mt-2">
      Reboot Your Brand in{" "}
      <span className="text-orange-500 font-semibold">4 Daring Steps.</span>
    </p>
  </div>
</div>

          
          <div className="w-1/2 relative h-screen flex items-center justify-start translate-x-[-169px] translate-y-[40px]">
  <div className="relative w-[470px] h-screen -mt-20 z-20">
  <Image
    src="/images/laptop-table.png"
    alt="Design Process"
    fill
    priority
    style={{ objectFit: "cover" }}
    className="transition-all duration-300"
  />

    
    {/* Orange line */}
    <div className="absolute h-[2px] bg-orange-500 w-[1000px] translate-x-[100px] translate-y-[200px]" />
  </div>
</div>

          <div className="translate-x-[-530px]">
            <div className="translate-y-[80px]">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-1">
            Connect & <br></br>
            Collaborate
            </h2>
            <p className="text-white max-w-lg  text-[13px] leading-relaxed" style={{ width: "400px" }}>
            We begin by immersing ourselves in your brand&apos;s <br></br>
universe. Our international client base feeds on trust, <br></br>
enduring partnerships, and solid referrals. Let&apos;s get <br></br>
acquainted, set vision, and lay the groundwork for <br></br>
something amazing.
            </p>
            </div>



            <div className="translate-y-[120px]">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-1">
            Make It <br></br>
Happen
            </h2>
            <p className="text-white  text-[13px] leading-relaxed"
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
            <div className="translate-y-[-15px]">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-1">
            Define <br></br>
Your Vision
            </h2>
            <p className="text-black max-w-lg  text-[13px] leading-relaxed" style={{ width: "400px" }}>
            Brilliant campaigns begin with crystal-clear<br></br>
objectives. We reveal your brand&apos;s purpose and<br></br>
develop targets that dont merely reach for the stars—<br></br>
they hit the mark, powering a strategy that inspires<br></br>
and resonates.
            </p>
            </div>



            


            </div>


            <div className="translate-x-[-620px]">
            <div className="translate-y-[-25px]">
            <h2 className="text-3xl font-extrabold text-orange-500 mb-1">
            Develop a <br></br>
Winning Strategy
            </h2>
            <p className="text-black max-w-lg  text-[13px] leading-relaxed" style={{ width: "400px" }}>
            Our digital specialists dont merely plan; they<br></br>
create. We develop a vibrant, results-driven media<br></br>
strategy that&apos;s as distinctive as your brand, aimed<br></br>
at captivating and converting on your budget.
            </p>
            </div>
            
            </div>
            <div className="absolute bottom-[0px] right-[200px] z-20">
        <Image
          src="/images/daringsteps.png"
          alt="Daring Steps"
          width={350} // adjust as needed
          height={350}
          className="object-contain"
        />
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
    {/* Logos */}
<div
  ref={logoScrollRef}
  className="flex space-x-16 w-full py-4 overflow-x-auto scroll-smooth no-scrollbar"
>
  {logoData.map((logo) => (
    <button
      key={logo.id}
      type="button"
      onClick={() => openModal(logo)}
      className="w-32 h-20 relative flex-shrink-0 focus:outline-none"
      aria-label={logo.title}
    >
      <div className="relative w-full h-full">
        <Image
          src={logo.src}
          alt={logo.title}
          fill
          style={{ objectFit: "contain" }}
          className="hover:scale-110 transition-transform duration-300"
        />
      </div>
    </button>
  ))}
</div>
  </div>

  </div>
  
</section>
{/* Simple Modal */}
{modalOpen && activeLogo && (
  <div
    role="dialog"
    aria-modal="true"
    className="fixed inset-0 z-50 flex items-center justify-center px-4"
    onClick={closeModal} // clicking outside closes
  >
    <div className="absolute inset-0 bg-black/60" />
    <div className="relative z-10 max-w-lg w-full bg-white rounded-2xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
      <button type="button" onClick={closeModal} className="absolute top-3 right-3 text-gray-600 hover:text-black">✕</button>

      <div className="flex justify-center mb-4">
        <div className="relative w-48 h-20">
          <Image src={activeLogo.src} alt={activeLogo.title} fill style={{ objectFit: "contain" }} />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{activeLogo.title}</h3>
      <p className="text-center text-gray-700 text-sm leading-relaxed">{activeLogo.body}</p>
    </div>
  </div>
)}

        {/* Section 7 - Contact Form */}
        <section id="reachusdesktop" className="w-screen h-screen relative flex items-center justify-between bg-white px-10" >
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
              
              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
  <div>
    <input
      type="text"
      name="name"
      placeholder="Name"
      required
      className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400"
    />
  </div>

  <div>
    <input
      type="email"
      name="email"
      placeholder="Email id"
      required
      className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400"
    />
  </div>

  <div>
    <input
      type="tel"
      name="mobile"
      placeholder="Mobile"
      className="w-full px-0 py-3 border-0 border-b-2 border-gray-300 bg-transparent focus:border-orange-500 focus:outline-none text-gray-700 placeholder-gray-400"
    />
  </div>

  <div>
    <textarea
      name="message"
      placeholder="Message"
      rows={3}
      required
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

