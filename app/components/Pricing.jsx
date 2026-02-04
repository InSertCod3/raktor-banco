'use client';

import React from 'react';
import BackgroundGrid from './BackgroundGrid'

const Pricing = () => {
  const buttonName = {
    purchase: "Get Quote Now",
    contact: "Contact Now"
  }
  const pricingPlans = [
    {
      name: 'Starter',
      price: '1,000',
      features: [
        'Web App',
      ],
      buttonColorHover: "hover:bg-blue-dark",
      buttonColor: "bg-primary",
      buttonText: buttonName.purchase,
      recommended: false,
      title: true,
    },
    {
      name: 'Launch',
      price: '5,750*',
      features: [
        'Web App',
        'Mobile App',
        'Design',
      ],
      buttonColorHover: "hover:bg-blue-dark",
      buttonColor: "bg-primary",
      buttonText: buttonName.purchase,
      recommended: true,
      title: true,
    },
    {
      name: 'Contact us ❤️',
      price: '----',
      features: [
        'Looking for something else?',
      ],
      buttonColorHover: "hover:bg-sky-700",
      buttonColor: "bg-[#1eaa50]",
      buttonText: buttonName.contact,
      recommended: false,
      title: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="relative z-20 overflow-hidden bg-white pb-12 pt-20 dark:bg-dark lg:pb-[90px] lg:pt-[120px]"
    >
      <BackgroundGrid className="z-0" strokeColor="rgba(88, 241, 255, 0.15)" gridSize="80" strokeWidth="2" />
      <div className="container relative z-10 px-4 mx-auto">
        <div className="flex flex-wrap -mx-4">
          <div className="w-full px-4">
            <div className="mx-auto mb-[60px] max-w-[510px] text-center">
              <span className="block mb-2 text-lg font-semibold text-primary">
                Pricing Table
              </span>
              <h2 className="mb-3 text-3xl font-bold text-dark dark:text-white sm:text-4xl md:text-[40px] md:leading-[1.2]">
                Flexible Pricing Plan
              </h2>
              <p className="text-base text-body-color dark:text-dark-6">
                Pricing that fits any stage your at! Whether it's a idea or development plan you want to come alive!
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-center -mx-4">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="relative z-10 px-8 py-10 mb-10 overflow-hidden bg-white rounded-xl shadow-pricing dark:bg-dark-2 sm:p-12 lg:px-6 lg:py-10 xl:p-14">
                {plan.recommended && (
                  <p className="absolute right-[-50px] top-[60px] inline-block -rotate-90 rounded-bl-md rounded-tl-md bg-primary px-5 py-2 text-base font-medium text-white">
                    Recommended
                  </p>
                )}
                <span className="block mb-5 text-xl font-medium text-dark dark:text-white">
                  {plan.name}
                </span>
                <h2 className="mb-11 text-4xl font-semibold text-dark dark:text-white xl:text-[42px] xl:leading-[1.21]">
                  <span className="text-xl font-medium pr-1">$</span>
                  <span className="-ml-1 -tracking-[2px]">{plan.price}</span>
                  <span className="ml-2 text-base font-normal text-body-color dark:text-dark-6">
                    / Project
                  </span>
                </h2>
                <div className="mb-[50px]">
                  {plan.title && <h5 className="mb-5 text-lg font-medium text-dark dark:text-white">
                    Features
                  </h5>}
                  <div className="flex flex-col gap-[14px]">
                    {plan.features.map((feature, i) => (
                      <p
                        key={i}
                        className="text-base text-body-color dark:text-dark-6"
                      >
                        {feature}
                      </p>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => {
                    window.tidioChatApi.display(true);
                    window.tidioChatApi.open()
                  }}
                  type="button"
                  className={`inline-block py-3 text-base font-medium text-center text-white transition rounded-md ${plan.buttonColor} px-7 ${plan.buttonColorHover}`}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;