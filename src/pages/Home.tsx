import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import images from '../data/images';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/common.types';
import {
  serviceData,
  services,
  workflowSteps,
  featuresData,
} from '../data/homeData';

const ICON_COLOR = '#2563EB';

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (custom = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.04 * custom },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: (custom = 0) => ({
    opacity: 1,
    transition: { duration: 0.55, delay: 0.04 * custom },
  }),
};

const heroVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.995 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

/**
 * Home page component
 * Replicates contractor Home.jsx with TypeScript
 */
const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const altImages = useMemo(
    () => [images.homeFeature1, images.homeFeature2],
    []
  );

  const handleGetStarted = useCallback(() => {
    if (isAuthenticated && user) {
      // Navigate to respective dashboard based on user role
      if (user.role === UserRole.ADMIN) {
        navigate('/admin-dashboard');
      } else if (user.role === UserRole.CONTRACTOR) {
        navigate('/contractor-dashboard');
      } else {
        // For MEMBER, DEVELOPER, ACCOUNTS, etc.
        navigate('/member-dashboard');
      }
    } else {
      // Not authenticated, go to login
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <>
      {/* Fixed background image */}
      <div className="relative w-full min-h-screen">
        <img
          src={images.heroImage}
          alt="Modern buildings at sunset"
          aria-hidden="true"
          className="fixed z-0 h-full w-full object-cover object-center"
          style={{ top: 0, left: 0 }}
        />

        {/* HERO container */}
        <section
          id="home"
          className="relative z-20 w-full min-h-screen"
        >
          <motion.div
            className="relative z-30 flex h-[calc(100vh-72px)] flex-col items-center justify-center text-center text-white px-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={staggerContainer}
          >
            <motion.p
              variants={heroVariants}
              className="text-sm md:text-base tracking-widest mb-2"
            >
              WELCOME TO BUILT-UP
            </motion.p>

            <motion.h1
              variants={heroVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4"
            >
              Building dreams with <br className="hidden sm:inline" /> precision
              and excellence
            </motion.h1>

            <motion.p
              variants={heroVariants}
              className="text-base sm:text-lg max-w-3xl mb-8 px-2"
            >
              we specialize in turning visions into reality with exceptional
              craftsmanship and meticulous attention to detail. With years of
              experience and a commitment to quality.
            </motion.p>

            <motion.div
              variants={heroVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button variant="primary" onClick={handleGetStarted}>
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 inline-block ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Button>

              <Button variant="secondary" onClick={handleGetStarted}>
                View Projects
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 inline-block ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </div>

      {/* Welcome Section */}
      <div className="relative pb-10 lg:pb-14 bg-white">
        <div className="bg-[#F5F7F9] flex justify-center items-center py-10 px-4 font-inter">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
            <motion.div
              className="lg:col-span-5 flex flex-col justify-center text-center lg:text-left p-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#3A4565] mb-6 leading-tight">
                Welcome to Our Company!
              </h1>
              <p className="max-w-xl mx-auto lg:mx-0 text-gray-500 text-lg">
                Are you looking for reliable immigration consultants to handle your immigration case? Our certified and reliable Immigration Consultant professionals can help you get a positive decision on your case! We provide services in all different areas of immigration.
              </p>
            </motion.div>

            <motion.div
              className="lg:col-span-7 flex justify-center lg:justify-start"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 gap-y-12 gap-x-6 pt-8 w-full"
                variants={staggerContainer}
              >
                {services.map((service, index) => {
                  const Icon = service.Icon;
                  return (
                    <motion.div
                      key={index}
                      className="flex flex-col items-center text-center p-4"
                      variants={fadeIn}
                      custom={index}
                    >
                      <Icon
                        className="mb-4"
                        size={56}
                        color={ICON_COLOR}
                        strokeWidth={1}
                      />
                      <p className="text-lg font-medium text-gray-700 leading-snug">
                        {service.title}
                      </p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="relative py-16 lg:py-24 bg-white">
        <div className="min-h-screen bg-[#f7fafd] py-16 md:py-24 font-inter">
          <div className="container mx-auto px-6 max-w-7xl">
            <header className="text-center mb-16 md:mb-20">
              <motion.p
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-sm tracking-widest font-bold text-[#2563EB] uppercase mb-3"
              >
                OUR SERVICES
              </motion.p>
              <motion.h1
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={heroVariants}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1f2937] leading-tight"
              >
                Our construction services
              </motion.h1>
              <motion.p
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="mt-4 max-w-3xl mx-auto text-lg text-gray-500"
              >
                We specialize in a wide range of construction services, including
                residential, commercial, and industrial projects.
              </motion.p>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {serviceData.map((service, index) => (
                <motion.div
                  key={index}
                  className="relative h-96 w-full overflow-hidden rounded-[2rem] shadow-xl transition-transform duration-300 hover:scale-[1.02] cursor-pointer"
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                  variants={cardVariants}
                >
                  <motion.img
                    src={service.imageUrl}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src =
                        'https://placehold.co/600x600/cccccc/000000?text=Image+Error';
                    }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                  <div className="absolute bottom-0 left-0 p-8 text-white">
                    <h3 className="text-3xl font-semibold mb-2 leading-tight">
                      {service.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </section>
          </div>
        </div>
      </div>

      {/* About Section - First Block */}
      <section id="about-us" className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto pt-5 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] xl:aspect-[3/4] overflow-hidden rounded-3xl shadow-xl">
              <img
                src={images.homeLeftImage}
                alt="Two construction workers standing confidently"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:pl-12">
            <p className="text-[#2563EB] font-semibold text-sm tracking-widest uppercase mb-3">
              ABOUT US
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Crafting structures that <br className="hidden sm:inline" /> last
              a lifetime
            </h2>
            <p className="text-gray-600 text-base lg:text-lg mb-8">
              Crafting structures that last a lifetime requires a holistic
              approach that integrates advanced materials, resilient design,
              regular maintenance, and sustainability practices. By learning from
              historical examples and leveraging modern technology.
            </p>

            <div className="bg-blue-50 bg-opacity-70 rounded-xl p-6 mb-8">
              {[
                'Comprehensive Services',
                'Advanced Technology',
                'Transparent Communication',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center mb-4 last:mb-0">
                  <svg
                    className="w-6 h-6 text-[#2563EB] mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-800 text-lg font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:space-x-8 space-y-6 sm:space-y-0">
              <Button variant="primary" className="w-full sm:w-auto">
                Get Free Quote
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Button>

              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#2563EB]/20 text-[#2563EB] mr-3 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">call support center 24x7</p>
                  <p className="text-gray-900 font-bold text-lg">
                    +1 809 120 6705
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section - Second Block */}
        <div className="max-w-7xl mx-auto pt-5 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
          <div className="lg:pl-12">
            <p className="text-[#2563EB] font-semibold text-sm tracking-widest uppercase mb-3">
              ABOUT US
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              Crafting structures that <br className="hidden sm:inline" /> last
              a lifetime
            </h2>
            <p className="text-gray-600 text-base lg:text-lg mb-8">
              Crafting structures that last a lifetime requires a holistic
              approach that integrates advanced materials, resilient design,
              regular maintenance, and sustainability practices. By learning
              from historical examples and leveraging modern technology.
            </p>

            <div className="bg-blue-50 bg-opacity-70 rounded-xl p-6 mb-8">
              {[
                'Comprehensive Services',
                'Advanced Technology',
                'Transparent Communication',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center mb-4 last:mb-0">
                  <svg
                    className="w-6 h-6 text-[#2563EB] mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-800 text-lg font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:space-x-8 space-y-6 sm:space-y-0">
              <Button variant="primary" className="w-full sm:w-auto">
                Get Free Quote
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Button>

              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#2563EB]/20 text-[#2563EB] mr-3 flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">call support center 24x7</p>
                  <p className="text-gray-900 font-bold text-lg">
                    +1 809 120 6705
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] xl:aspect-[3/4] overflow-hidden rounded-3xl shadow-xl">
              <img
                src={images.homeSecondImage}
                alt="Two construction workers standing confidently"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <div className="relative py-16 lg:py-24 px-4 lg:px-8 bg-white">
        <section className="py-16 sm:py-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <motion.h2
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12 sm:mb-16"
            >
              How It Works
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              {workflowSteps.map((item, index) => (
                <React.Fragment key={item.step}>
                  <motion.div
                    className="flex flex-col items-center text-center w-full sm:w-1/4 mb-12 sm:mb-0 relative"
                    variants={fadeUp}
                    custom={index}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-gray-100 text-2xl font-semibold text-blue-800 border-4 border-gray-200 shadow-md transition duration-300 ease-in-out">
                      {item.step}
                    </div>
                    <p className="mt-4 text-base sm:text-lg font-medium text-gray-700 max-w-[150px] sm:max-w-none">
                      {item.title}
                    </p>
                  </motion.div>

                  {index < workflowSteps.length - 1 && (
                    <div className="flex-grow flex items-center justify-center h-full sm:h-auto">
                      <div className="hidden sm:block w-full mx-2 lg:mx-4 h-px bg-gray-300" />
                      <div className="sm:hidden absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 w-px h-24 bg-gray-300 -mt-12 -mb-12" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </section>
      </div>

      {/* Features Section */}
      <div className="relative py-16 px-4 lg:px-8 bg-white">
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center mb-12 md:mb-16">
              <motion.p
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-sm uppercase tracking-widest font-medium text-[#2563EB] mb-2"
              >
                <span className="inline-block w-2 h-2 bg-[#2563EB] rounded-full mr-2" />
                WHY CHOOSE US?
              </motion.p>
              <motion.h1
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={heroVariants}
                className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-snug"
              >
                Why we're your best choice
              </motion.h1>
              <p className="text-base md:text-lg text-gray-500 max-w-3xl mx-auto">
                Developed in close collaboration with our partners and clients,
                combines industry knowledge, decades of experience, ingenuity and
                adaptability to deliver excellence to our clients.
              </p>
            </div>

            {/* First Grid */}
            <motion.div
              className="grid grid-cols-1 gap-8 items-stretch lg:grid-cols-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={staggerContainer}
            >
              {featuresData.map((item, idx) => (
                <motion.div
                  key={idx}
                  className={`flex justify-center items-center ${item.className}`}
                  variants={cardVariants}
                  custom={idx}
                >
                  {item.type === 'card' ? (
                    <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between h-full w-full">
                      <div className="mb-6">
                        {item.icon && (
                          <item.icon
                            size={28}
                            color={ICON_COLOR}
                            className="mb-2"
                          />
                        )}
                        <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 mb-8 flex-grow">
                        {item.description}
                      </p>
                      <div>
                          <div className="text-4xl md:text-5xl font-bold text-[#2563EB] mb-1">
                          {item.metric}
                        </div>
                        <p className="text-gray-500">{item.metricLabel}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl shadow-2xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.01] w-full max-w-lg lg:max-w-none">
                      <motion.img
                        src={item.image}
                        alt={item.title}
                        className="w-full object-cover"
                        style={{ minHeight: '400px', maxHeight: '550px' }}
                        initial={{ opacity: 0, scale: 1.03 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Second Grid */}
            <div className="container mx-auto mt-5 px-4 max-w-7xl">
              <div className="grid grid-cols-1 gap-8 items-stretch lg:grid-cols-3">
                {featuresData.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-center items-center ${item.className}`}
                  >
                    {item.type === 'card' ? (
                      <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-gray-100 flex flex-col justify-between h-full w-full">
                        <div className="mb-6">
                          {item.icon && (
                            <item.icon
                              size={28}
                              color={ICON_COLOR}
                              className="mb-2"
                            />
                          )}
                          <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                            {item.title}
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-8 flex-grow">
                          {item.description}
                        </p>
                        <div>
                          <div className="text-4xl md:text-5xl font-bold text-[#2563EB] mb-1">
                            {item.metric}
                          </div>
                          <p className="text-gray-500">{item.metricLabel}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl shadow-2xl overflow-hidden transform transition-transform duration-300 hover:scale-[1.01] w-full max-w-lg lg:max-w-none">
                        <img
                          src={altImages[idx] ?? item.image}
                          alt={item.title}
                          className="w-full object-cover"
                          style={{ minHeight: '400px', maxHeight: '550px' }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;

