import React from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="absolute top-0 left-0 z-40 w-full bg-transparent">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between -mx-4">
          <div className="px-4 xl:w-[20%] w-[60%]">
            <Link href="/" className="block w-full py-5 navbar-logo">
                <img
                  src="/assets/images/logo/barpot_logo_only_w_text.svg"
                  alt="logo"
                  className="w-full"
                />
            </Link>
          </div>
          <div className="flex items-center justify-between w-full px-4">
            <button
              id="navbarToggler"
              className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 px-3 py-[6px] rounded-lg ring-primary focus:ring-2"
            >
              <span className="block bg-white h-[2px] w-[30px] my-[6px]"></span>
              <span className="block bg-white h-[2px] w-[30px] my-[6px]"></span>
              <span className="block bg-white h-[2px] w-[30px] my-[6px]"></span>
            </button>
            <nav
              id="navbarCollapse"
              className="hidden lg:block lg:w-full lg:bg-transparent"
            >
              <ul className="lg:flex justify-center">
                {[
                  { href: "#home", label: "Home" },
                  { href: "/app", label: "App" },
                  // { href: "#about", label: "About" },
                  { href: "#pricing", label: "Pricing" },
                  // { href: "#team", label: "Team" },
                  { href: "#contact", label: "Contact" },
                  // { href: "/blog-grids", label: "Blog" },
                ].map((menuItem, index) => (
                  <li key={index} className="relative group">
                    <Link href={menuItem.href} className="flex py-2 mx-8 text-base font-medium ud-menu-scroll text-dark group-hover:text-primary dark:text-white lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 lg:text-white lg:group-hover:text-white lg:group-hover:opacity-70">
                        {menuItem.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {/* Sign up / Register Buttons | shown = sm:flex items-center*/}
            <div className="invisible">
              <Link href="/signin" className="px-[22px] py-2 text-base font-medium text-white hover:opacity-70">
                  Sign In
              </Link>
              <Link href="/signup" className="px-6 py-2 text-base font-medium text-white bg-white/20 rounded-md hover:bg-white hover:text-dark">
                  Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;