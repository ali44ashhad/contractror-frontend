import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Building2, ChevronRight } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const links = [
  { label: 'Contact', path: '/contact-us' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Terms & Conditions', path: '/terms-conditions' },
];

const links1 = [
  { name: 'About Us', path: '/about-us' },
  { name: 'Help', path: '/help' },
  { name: 'FAQs', path: '/faqs' },
];

/**
 * Footer component matching contractor theme
 */
const Footer = memo<FooterProps>(({ className = '' }) => {
  return (
    <div className={`relative bg-white ${className}`}>
      <footer
        className="w-full text-white"
        style={{ backgroundColor: '#0D1C2E' }}
      >
        {/* Main Footer Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Column 1: Logo & Description */}
            <article>
              <div className="flex items-center mb-6">
                <Building2
                  size={48}
                  className="flex-shrink-0"
                  style={{ color: '#2563EB' }}
                />
                <h1 className="text-4xl font-extrabold ml-3 tracking-wider">
                  <span className="font-light">Con</span>tractor
                </h1>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Our post-construction services give you peace of mind knowing
                that we are still here for you even after the project is
                complete.
              </p>
            </article>

            {/* Column 2: Company */}
            <article>
              <h2
                className="text-xl font-semibold mb-6 uppercase tracking-wider"
                  style={{ color: '#2563EB' }}
              >
                Company
              </h2>
              <ul className="list-none p-0 m-0 space-y-2">
                {links1.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="relative group flex items-start hover:text-white transition duration-200"
                    >
                      <ChevronRight
                        size={18}
                        className="mr-2 mt-0.5"
                        style={{ color: '#2563EB' }}
                      />
                      <span className="relative pb-0.5">
                        {link.name}
                        <span
                          className="absolute bottom-0 left-0 w-0 transition-all duration-300 ease-in-out group-hover:w-full"
                          style={{ backgroundColor: '#2563EB' }}
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>

            {/* Column 3: Legal */}
            <article>
              <h2
                className="text-xl font-semibold mb-6 uppercase tracking-wider"
                  style={{ color: '#2563EB' }}
              >
                Legal
              </h2>
              <ul className="list-none p-0 m-0 space-y-2">
                {links.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="relative group flex items-start text-gray-300 hover:text-white transition duration-200"
                    >
                      <ChevronRight
                        size={18}
                        className="mr-2 mt-0.5"
                        style={{ color: '#2563EB' }}
                      />
                      <span className="relative pb-0.5">
                        {item.label}
                        <span
                          className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-300 ease-in-out group-hover:w-full"
                          style={{ backgroundColor: '#2563EB' }}
                        />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </article>

            {/* Column 4: Contact Us */}
            <article>
              <h2
                className="text-xl font-semibold mb-6 uppercase tracking-wider"
                  style={{ color: '#2563EB' }}
              >
                Contact Us
              </h2>
              <div className="flex items-start mb-4">
                <Phone
                  size={24}
                  className="flex-shrink-0 mt-1"
                  style={{ color: '#2563EB' }}
                />
                <a
                  href="tel:+18091206705"
                  className="ml-3 text-gray-300 hover:text-white transition"
                >
                  +1 809 120 6705
                </a>
              </div>
              <div className="flex items-start mb-4">
                <Mail
                  size={24}
                  className="flex-shrink-0 mt-1"
                  style={{ color: '#2563EB' }}
                />
                <a
                  href="mailto:info@domain.com"
                  className="ml-3 text-gray-300 hover:text-white transition"
                >
                  info@domain.com
                </a>
              </div>
              <div className="flex items-start">
                <MapPin
                  size={24}
                  className="flex-shrink-0 mt-1"
                  style={{ color: '#2563EB' }}
                />
                <p className="ml-3 text-gray-300">
                  37 San Juan Lane, Graaf Florisstraat 22A, 3021 CH
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Bottom Bar */}
        <section className="border-t border-gray-700/50">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm">
            <p className="text-gray-500 mb-4 md:mb-0">
              © 2024 Constructor. All Rights Reserved.
            </p>

            <div className="flex space-x-3">
              {['instagram', 'facebook', 'twitter', 'linkedin'].map(
                (social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-700/50 text-gray-400 transition duration-300 hover:scale-105"
                    style={{
                      backgroundColor: '#0D1C2E',
                      boxShadow: '0 0 10px 0 #0D1C2E',
                      borderColor: '#2563EB',
                    }}
                    aria-label={social}
                  >
                    <span className="text-xl">
                      {social === 'instagram' && '📸'}
                      {social === 'facebook' && '📘'}
                      {social === 'twitter' && '🐦'}
                      {social === 'linkedin' && '🔗'}
                    </span>
                  </a>
                )
              )}
            </div>
          </div>
        </section>
      </footer>
    </div>
  );
});

Footer.displayName = 'Footer';

export default Footer;

