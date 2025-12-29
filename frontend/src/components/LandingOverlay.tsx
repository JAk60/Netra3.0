"use client";

import { useEffect, useState } from "react";
import gsap from "gsap";

export default function LandingOverlay() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("landing_seen");
    if (!seen) setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;

    gsap.from(".hero h1 span", {
      y: 120,
      opacity: 0,
      duration: 1.2,
      ease: "power4.out",
    });

    gsap.from(".tagline", {
      y: 40,
      opacity: 0,
      delay: 0.5,
    });

    gsap.utils.toArray(".word").forEach((el: any, i) => {
      gsap.to(el, {
        y: "+=60",
        x: i % 2 ? "-=40" : "+=40",
        repeat: -1,
        yoyo: true,
        duration: 6 + i,
        ease: "sine.inOut",
      });
    });
  }, [show]);

  const handleEnter = () => {
    localStorage.setItem("landing_seen", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0b0b] text-white flex items-center justify-center overflow-hidden">
      <div className="absolute left-10 top-1/2 -translate-y-1/2 rotate-180 writing-vertical text-[8rem] opacity-10 font-black">
        VISION
      </div>

      <div className="text-center">
        <h1 className="text-[clamp(4rem,10vw,9rem)] font-black leading-none">
          PURE <br />
          <span className="text-red-500">IMPACT</span>
        </h1>

        <div className="tagline mt-6 tracking-[0.4em] opacity-70">
          DESIGN • MOTION • POWER
        </div>

        <button
          onClick={handleEnter}
          className="mt-16 px-16 py-4 border-2 border-white tracking-[0.3em] hover:bg-white hover:text-black transition"
        >
          ENTER
        </button>
      </div>

      {/* floating words */}
      <div className="absolute inset-0 pointer-events-none">
        {["TYPE", "FORM", "GRID", "RAW"].map((w, i) => (
          <div
            key={i}
            className="word absolute text-6xl font-bold opacity-10"
            style={{
              top: `${20 + i * 15}%`,
              left: i % 2 ? "70%" : "10%",
            }}
          >
            {w}
          </div>
        ))}
      </div>
    </div>
  );
}
