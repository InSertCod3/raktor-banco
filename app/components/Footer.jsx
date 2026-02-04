import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="relative z-10 bg-[#090E34] pt-20 lg:pt-[100px]">
      <div className="container px-4 mx-auto">
        <div className="flex flex-wrap -mx-4">
          {/* Column 1 */}
          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-4/12 xl:w-3/12">
            <div className="w-full mb-10">
              <Link href="/" className="mb-6 inline-block max-w-[160px]">
                <Image
                  src="/assets/images/logo/barpot_logo_only_w_text.svg"
                  alt="logo"
                  width={160}
                  height={40}
                />
              </Link>
              <p className="mb-8 max-w-[270px] text-base text-gray-7">
                Get your product developed Just what you need to launch — no bloat, no overbuild, no headaches.
              </p>
              <div className="flex items-center -mx-3">
                {/* Social Icons */}
                {[1, 2, 3, 4].map((_, index) => (
                  <Link
                    key={index}
                    href="/"
                    className="px-3 text-gray-7 hover:text-white"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="fill-current"
                    >
                      {/* Add your SVG content here */}
                      <circle cx="11" cy="11" r="10" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Column 2 */}
          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-2/12 xl:w-2/12">
            <div className="w-full mb-10">
              <h4 className="text-lg font-semibold text-white mb-9">About Us</h4>
              <ul>
                {['Home', 'Features', 'About', 'Testimonial'].map((item, index) => (
                  <li key={index}>
                    <Link
                      href="/"
                      className="inline-block mb-3 text-base text-gray-7 hover:text-primary"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Column 3 */}
          <div className="w-full px-4 sm:w-1/2 md:w-1/2 lg:w-3/12 xl:w-2/12">
            <div className="w-full mb-10">
              <h4 className="text-lg font-semibold text-white mb-9">Features</h4>
              <ul>
                {['How it works', 'Privacy policy', 'Terms of Service', 'Refund policy'].map(
                  (item, index) => (
                    <li key={index}>
                      <Link
                        href="/"
                        className="inline-block mb-3 text-base text-gray-7 hover:text-primary"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          {/* Column 4 */}
          <div className="w-full hidden px-4 sm:w-1/2 md:w-1/2 lg:w-3/12 xl:w-2/12">
            <div className="w-full mb-10">
              <h4 className="text-lg font-semibold text-white mb-9">
                Our Products
              </h4>
              <ul>
                {['LineIcons', 'Ecommerce HTML', 'TailAdmin', 'PlainAdmin'].map(
                  (item, index) => (
                    <li key={index}>
                      <Link
                        href="/"
                        className="inline-block mb-3 text-base text-gray-7 hover:text-primary"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
          {/* Column 5 */}
          <div className="w-full hidden px-4 md:w-2/3 lg:w-6/12 xl:w-3/12">
            <div className="w-full mb-10">
              <h4 className="text-lg font-semibold text-white mb-9">Latest blog</h4>
              <div className="flex flex-col gap-8">
                {[1, 2].map((_, index) => (
                  <Link
                    key={index}
                    href="/blog-details"
                    className="group flex items-center gap-[22px]"
                  >
                    <div className="overflow-hidden rounded-sm">
                      <Image
                        src={`/assets/images/blog/blog-footer-0${index + 1}.jpg`}
                        alt="blog"
                        width={64}
                        height={64}
                      />
                    </div>
                    <span className="max-w-[180px] text-base text-gray-7 group-hover:text-white">
                      {index === 0
                        ? 'I think really important to design with...'
                        : 'Recognizing the need is the primary...'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-[#8890A4]/40 py-8 lg:mt-[60px]">
        <div className="container px-4 mx-auto">
          <div className="flex flex-wrap -mx-4">
            <div className="w-full px-4 md:w-2/3 lg:w-1/2">
              <div className="my-1">
                <div className="flex items-center justify-center -mx-3 md:justify-start">
                  {['Privacy policy', 'Legal notice', 'Terms of service'].map((item, index) => (
                    <Link
                      key={index}
                      href="/"
                      className="px-3 text-base text-gray-7 hover:text-white hover:underline"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full px-4 md:w-1/3 lg:w-1/2">
              <div className="flex justify-center my-1 md:justify-end">
                <p className="text-base text-gray-7">
                  Designed and Developed with ❤️ in Syracuse
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <span className="absolute left-0 top-0 z-[-1]">
          <Image
            src="/assets/images/footer/shape-1.svg"
            alt="Shape 1"
            layout="fill"
          />
        </span>

        <span className="absolute bottom-0 right-0 z-[-1]">
          <Image
            src="/assets/images/footer/shape-3.svg"
            alt="Shape 3"
            layout="fill"
          />
        </span>

        <span className="absolute right-0 top-0 z-[-1]">
          <svg
            width="102"
            height="102"
            viewBox="0 0 102 102"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.8667 33.1956C2.89765 33.1956 3.7334 34.0318 3.7334 35.0633C3.7334 36.0947 2.89765 36.9309 1.8667 36.9309C0.835744 36.9309 4.50645e-08 36.0947 0 35.0633C-4.50645e-08 34.0318 0.835744 33.1956 1.8667 33.1956Z"
              fill="white"
              fillOpacity="0.08"
            />
            {/* Add additional SVG paths if needed */}
          </svg>
        </span>
      </div>
    </footer>
  );
};

export default Footer;