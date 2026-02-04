"use client";

import React from "react";
import "./FloatingBlob.css";

const featuresData = [
  {
    title: "Security First",
    description:
      "We proactively safeguard your business with strong cybersecurity measures designed to prevent breaches before they happen.",
    seed: 2,
    icon: (
      <svg
        id="10015.io"
        viewBox="0 0 480 480"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#474bff"
          d="M372,342.5Q358,445,262,406.5Q166,368,129.5,304Q93,240,130,177Q167,114,240,114Q313,114,349.5,177Q386,240,372,342.5Z"
        />
      </svg>
    ),
    delay: ".1s",
  },
  {
    title: "Infrastructure Focus",
    description:
      "When your tools and systems work seamlessly, your business can grow, evolve, and reach its full potential.",
    seed: 0,
    icon: (
      <svg
        id="10015.io"
        viewBox="0 0 480 480"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#474bff"
          d="M400.5,337.5Q353,435,256.5,407Q160,379,83,309.5Q6,240,64.5,138.5Q123,37,224.5,63.5Q326,90,387,165Q448,240,400.5,337.5Z"
        />
      </svg>
    ),
    delay: ".15s",
  },
  {
    title: "High-quality Design",
    description:
      "We help you create a technology ecosystem that is both visually stunning and effective, making a lasting impression on your customers and stakeholders.",
    seed: 1,
    icon: (
      <svg
        id="10015.io"
        viewBox="0 0 480 480"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#474bff"
          d="M395,307.5Q318,375,227,397.5Q136,420,78,330Q20,240,87.5,166Q155,92,247,80Q339,68,405.5,154Q472,240,395,307.5Z"
        />
      </svg>
    ),
    delay: ".2s",
  },
  {
    title: "All Essential Elements",
    description:
      "Our approach is designed to address every need, providing a cohesive and integrated technology ecosystem that drives results.",
    seed: 0,
    icon: (
      <svg
        id="10015.io"
        viewBox="0 0 480 480"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#474bff"
          d="M373,324.5Q338,409,230.5,426Q123,443,65.5,341.5Q8,240,84.5,171.5Q161,103,237,108Q313,113,360.5,176.5Q408,240,373,324.5Z"
        />
      </svg>
    ),
    delay: ".25s",
  },
];

const Features = () => {
  return (
    <section className="pb-8 pt-20 dark:bg-dark lg:pb-[70px] lg:pt-[120px]">
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4">
            <div className="mx-auto mb-12 max-w-[485px] text-center lg:mb-[70px]">
              <span className="block mb-2 text-lg font-semibold text-primary">
                Features
              </span>
              <h2 className="mb-3 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]">
                Our approach to better software
              </h2>
              <p className="text-base text-body-color dark:text-dark-6">
                There are many variations of software development, we've chosen
                a strategy that enhances your product's lifecycle for a more
                robust idea to market pipeline.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap -mx-4">
          {featuresData.map((feature, index) => (
            <div key={index} className="w-full px-4 md:w-1/2 lg:w-1/4">
              <div
                className="flex flex-col items-center mb-12 wow fadeInUp group"
                data-wow-delay={feature.delay}
                style={{ visibility: "visible", animationDelay: feature.delay }}
              >
                <div className="floating-cube mb-4">
                  <span
                    className={`floating-blob-${feature.seed} absolute left-0 top-0 -z-1 mb-8 flex h-[70px] w-[70px] rotate-[25deg] items-center justify-center rounded-[14px] bg-primary/20 duration-300 group-hover:rotate-45`}
                  ></span>
                  {feature.icon}
                </div>
                <h4 className="relative z-10 mb-3 text-xl font-bold text-dark dark:text-white">
                  {feature.title}
                </h4>
                <p className="relative z-10 mb-8 text-center text-body-color dark:text-dark-6 lg:mb-9">
                  {feature.description}
                </p>
                {/* <button className="relative z-10 text-base font-medium text-dark hover:text-primary dark:text-white dark:hover:text-primary">
                  Learn More
                </button> */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
