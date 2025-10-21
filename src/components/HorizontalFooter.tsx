// src/components/HorizontalFooter.tsx
import React from "react";
import Image from "next/image";

const socialIcons = [
  "/images/Insta.png",
  "/images/Facebook.png",
  "/images/Youtube.png",
  "/images/Twitter.png",
  "/images/Linkedin.png",
];

const HorizontalFooter: React.FC = () => {
  return (
    <footer className="w-screen bg-black text-white">
      {/* === Desktop / Tablet Footer === */}
      <section
        className="hidden md:flex relative flex-col items-center justify-center bg-black text-white"
        style={{
          backgroundImage: "url('/images/Bg_1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          minHeight: "70vh",
        }}
      >
        <div className="w-full max-w-6xl px-10 py-12 flex flex-col md:flex-row items-center md:justify-between gap-8">
          {/* Left: Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/images/Logo.png"
              alt="Logo"
              width={150}
              height={40}
              className="cursor-pointer"
            />
          </div>

          {/* Right: Search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-end gap-4">
            <input
              type="text"
              placeholder="Search for our Services"
              className="bg-gray-800 text-white px-6 py-3 rounded-lg border border-gray-600 focus:border-orange-500 focus:outline-none w-72 sm:w-80"
            />
            <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors duration-300">
              Search
            </button>
          </div>
        </div>

        {/* Bottom social icons */}
        <div className="w-full max-w-6xl px-10 pb-8 flex items-center justify-center md:justify-end gap-6">
          {socialIcons.map((src, idx) => (
            <a
              key={idx}
              href="#"
              className="w-10 h-10 relative flex items-center justify-center hover:scale-110 transition-transform duration-300"
              aria-label={`Social ${idx + 1}`}
            >
              <Image src={src} alt={`social-${idx}`} width={40} height={40} />
            </a>
          ))}
        </div>
      </section>

      {/* === Mobile Footer === */}
      <section
        className="md:hidden min-h-96 bg-black text-white p-6 flex flex-col justify-center items-center"
        style={{
          backgroundImage: "url('/images/Bg_1.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Logo */}
        <Image
          src="/images/Logo.png"
          alt="Logo"
          width={120}
          height={32}
          className="mb-6"
        />

        {/* Search bar */}
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

        {/* Social icons */}
        <div className="flex justify-center space-x-6">
          {socialIcons.map((src, index) => (
            <a
              key={index}
              href="#"
              className="w-8 h-8 relative flex items-center justify-center hover:scale-110 transition-transform duration-300"
            >
              <Image
                src={src}
                alt={`Social Icon ${index + 1}`}
                width={32}
                height={32}
              />
            </a>
          ))}
        </div>
      </section>
    </footer>
  );
};

export default HorizontalFooter;