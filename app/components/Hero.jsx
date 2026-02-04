import React from "react";
import Link from "next/link";
import BackgroundGrid from './BackgroundGrid'
import GlowEffect from './GlowEffect/GlowEffect'

const Hero = () => {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-primary pt-[120px] md:pt-[130px] lg:pt-[160px]"
    >
      <GlowEffect/>
      <BackgroundGrid className="z-0" strokeColor="rgba(88, 241, 255, 0.15)" gridSize="80" strokeWidth="2" />
      <div className="container relative px-4 mx-auto z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl mb-6">
            Build Smart. Launch Sooner.
          </h1>
          <p className="text-base font-medium text-white sm:text-lg mb-9 max-w-[600px] mx-auto">
          Get your product developed - Just what you need to launch — no bloat, no overbuild, no headaches.


          </p>
          <div className="flex flex-wrap items-center justify-center gap-5 mb-10">
            <Link href="/app" className="bg-white text-dark px-7 py-[14px] rounded-md shadow-1 hover:bg-opacity-90">
              Open Mind Mapper
            </Link>
            <Link href="#pricing" className="bg-white/[0.12] text-white px-6 py-[14px] rounded-md hover:bg-white hover:text-dark">
              See pricing
            </Link>
          </div>
          <p className="text-white mb-4">The map is the product. AI serves the map.</p>
          <div className="flex items-center justify-center gap-4">
            {/* {[
              { href: "https://github.com/uideck/play-bootstrap/", label: "Bootstrap" },
              { href: "https://github.com/TailGrids/play-tailwind/", label: "Tailwind" },
              { href: "https://github.com/NextJSTemplates/play-nextjs", label: "Next.js" },
            ].map((tech, index) => (
              <Link key={index} href={tech.href} target="_blank" className="text-white/60 hover:text-white">
                  {tech.label}
              </Link>
            ))} */}
          </div>
        </div>
        <div className="mt-8 text-center">
          <img
            src="/assets/images/hero/humaans_walking.svg"
            alt="hero"
            className="max-w-full mx-auto rounded-t-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;