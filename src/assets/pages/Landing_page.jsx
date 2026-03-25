import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CAROUSEL_SLIDES = [
  {
    heading: "Create Your Own Beats. It's Easy!",
    description:
      "Use our Music Studio to drag, drop, and arrange loops into your own songs. It's super easy for beginners to create awesome-sounding rhythms!",
  },
  {
    heading: "Explore Immersive 3D Worlds",
    description:
      "Step into vibrant musical environments where instruments come alive. Interact with djembes, shekeres, and more in a beautiful 3D space designed for discovery.",
  },
  {
    heading: "Learn Rhythm Through Play",
    description:
      "AI-assisted tools help children compose, experiment, and discover Ghanaian musical traditions. Every session is an adventure in creativity and cultural learning.",
  },
];

const TESTIMONIALS = [
  {
    name: "Kwame A.",
    quote: "I made my first beat in 5 minutes! The drums sound so real and it's really fun to play with.",
    imgOffset: "-5%",
  },
  {
    name: "Ama S.",
    quote: "We use it in our class and everyone loves making music together. The 3D worlds are amazing!",
    imgOffset: "-195%",
  },
  {
    name: "Kofi M.",
    quote: "What I like is you can create beats and your teacher gives you feedback. It's cool for learning.",
    imgOffset: "-385%",
  },
];

const Landing_page = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ fontFamily: "'Fredoka', 'Outfit', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(242, 201, 76, 0.3); }
          50% { box-shadow: 0 0 40px rgba(242, 201, 76, 0.6); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .cta-bar { animation: pulse-glow 3s ease-in-out infinite; }
        .nav-scrolled {
          background: rgba(62, 36, 104, 0.95) !important;
          box-shadow: 0 4px 30px rgba(0,0,0,0.2);
        }
      `}</style>

      {/* ═══════════════════════════════════════════ */}
      {/* NAVIGATION */}
      {/* ═══════════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(62, 36, 104, 0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.15)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          {/* Logo */}
          <div
            className="text-2xl md:text-3xl font-bold tracking-wide cursor-pointer"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <span style={{ color: "#D97746" }}>D</span>
            <span style={{ color: "#42C9C9" }}>J</span>
            <span style={{ color: "#F2C94C" }}>E</span>
            <span style={{ color: "#E8627A" }}>M</span>
            <span style={{ color: "#7B5BA8" }}>B</span>
            <span style={{ color: "#4ABA6E" }}>E</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {["About", "Features"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
              >
                {item.toUpperCase()}
              </a>
            ))}
            <button
              onClick={() => navigate("/signup")}
              className="ml-3 px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #D97746, #E6B84D)",
                boxShadow: "0 2px 12px rgba(217, 119, 70, 0.4)",
              }}
            >
              SIGN UP
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all"
            onClick={() => navigate("/login")}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative flex flex-col items-center overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #3E2468 0%, #5B3D8F 50%, #7B5BA8 100%)",
        }}
      >
        {/* Hero image - full width */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full pt-20 md:pt-24 flex justify-center"
        >
          <img
            src="/ui assets/hero image 1.png"
            alt="Djembe - Create music together"
            className="w-full"
          />
        </motion.div>

        {/* CTA Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative z-10 flex items-center gap-3 md:gap-5 -mt-12 md:-mt-16 mb-12 md:mb-16 px-4"
        >
          {/* Smiley Button */}
          <button
            onClick={() => navigate("/login")}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, #E8627A, #F06292)",
              boxShadow: "0 4px 20px rgba(232, 98, 122, 0.4)",
            }}
            title="Login"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2" />
              <circle cx="9" cy="10" r="1.2" />
              <circle cx="15" cy="10" r="1.2" />
              <path d="M8 14.5c1 1.5 2.5 2 4 2s3-0.5 4-2" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>

          {/* Main CTA */}
          <button
            onClick={() => navigate("/signup")}
            className="cta-bar flex items-center gap-4 md:gap-8 px-8 md:px-14 py-4 md:py-5 rounded-full font-bold text-base md:text-lg transition-all hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #F2C94C 0%, #EFBA3C 100%)",
              color: "#3E2468",
              boxShadow: "0 6px 30px rgba(242, 201, 76, 0.4)",
              fontFamily: "'Fredoka', sans-serif",
              letterSpacing: "0.5px",
            }}
          >
            <span>START MAKING</span>
            <span className="w-[2px] h-6 bg-[#3E2468]/20 rounded-full" />
            <span>EXPLORE</span>
          </button>

          {/* Document Button */}
          <button
            onClick={() => navigate("/signup")}
            className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-2xl shadow-lg hover:scale-110 active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, #42C9C9, #5AC8C8)",
              boxShadow: "0 4px 20px rgba(66, 201, 201, 0.4)",
            }}
            title="Sign Up"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <rect x="5" y="3" width="14" height="18" rx="2" fill="none" stroke="white" strokeWidth="2" />
              <line x1="9" y1="8" x2="15" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="12" x2="15" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="9" y1="16" x2="12" y2="16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </motion.div>

        {/* Bottom curve transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V40C240 0 480 0 720 20C960 40 1200 60 1440 40V80H0Z" fill="#6B4F9E" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FEATURES CAROUSEL SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section
        id="features"
        className="relative py-16 md:py-24 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #6B4F9E 0%, #7B5BA8 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Left: Text Content */}
            <div className="flex-1 relative">
              {/* Arrow Left */}
              <button
                onClick={prevSlide}
                className="absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10 backdrop-blur-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div className="px-8 md:px-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <h2
                      className="text-3xl md:text-5xl font-bold text-white leading-tight mb-6"
                      style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                      {CAROUSEL_SLIDES[currentSlide].heading}
                    </h2>
                    <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-lg" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {CAROUSEL_SLIDES[currentSlide].description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Slide indicators */}
                <div className="flex gap-2 mt-8">
                  {CAROUSEL_SLIDES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: currentSlide === i ? "32px" : "10px",
                        backgroundColor: currentSlide === i ? "#F2C94C" : "rgba(255,255,255,0.3)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Preview Card */}
            <div className="flex-1 relative">
              {/* Arrow Right */}
              <button
                onClick={nextSlide}
                className="absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10 backdrop-blur-sm"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <motion.div
                className="relative rounded-3xl overflow-hidden border border-white/15 backdrop-blur-sm"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Mock DAW Preview */}
                <div className="p-4 md:p-6">
                  {/* Title bar */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm font-bold text-white/90" style={{ fontFamily: "'Fredoka', sans-serif" }}>DJEMBE</span>
                    <div className="flex gap-1.5 ml-auto">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                  </div>

                  {/* DAW-like tracks */}
                  <div className="space-y-2 mb-4">
                    {[
                      { name: "Drums", color: "#E8627A", width: "85%" },
                      { name: "Bass", color: "#42C9C9", width: "70%" },
                      { name: "Melody", color: "#F2C94C", width: "90%" },
                      { name: "Rhythm", color: "#D97746", width: "60%" },
                    ].map((track) => (
                      <div key={track.name} className="flex items-center gap-3">
                        <span className="text-[10px] md:text-xs text-white/60 w-12 text-right">{track.name}</span>
                        <div className="flex-1 h-6 md:h-8 rounded-lg overflow-hidden bg-white/5">
                          <div
                            className="h-full rounded-lg"
                            style={{
                              width: track.width,
                              background: `linear-gradient(90deg, ${track.color}80, ${track.color}40)`,
                              boxShadow: `inset 0 1px 0 ${track.color}50`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Playback controls */}
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="4" y="4" width="6" height="16" rx="1" /><rect x="14" y="4" width="6" height="16" rx="1" /></svg>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #D97746, #E6B84D)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21" /></svg>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom curve transition to white */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100V50C360 0 720 80 1080 30C1260 5 1380 10 1440 20V100H0Z" fill="#FAFAFE" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* TESTIMONIALS SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section
        id="about"
        className="relative py-16 md:py-24"
        style={{ background: "#FAFAFE" }}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-bold text-center mb-16"
            style={{ color: "#2D2040", fontFamily: "'Fredoka', sans-serif" }}
          >
            What Kids Are Saying
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                {/* Avatar */}
                <div
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full mb-6 overflow-hidden border-4 bg-white"
                  style={{
                    borderColor: "#C4B5E3",
                    boxShadow: "0 8px 30px rgba(107, 79, 158, 0.15)",
                  }}
                >
                  <img
                    src="./ui assets/avatar.png"
                    alt={testimonial.name}
                    className="h-full object-cover"
                    style={{
                      width: "500%",
                      maxWidth: "none",
                      marginLeft: testimonial.imgOffset,
                      marginTop: "5%",
                    }}
                  />
                </div>

                {/* Name */}
                <h4
                  className="text-lg font-bold mb-3"
                  style={{ color: "#2D2040", fontFamily: "'Fredoka', sans-serif" }}
                >
                  {testimonial.name}
                </h4>

                {/* Quote */}
                <p
                  className="text-sm md:text-base leading-relaxed max-w-xs"
                  style={{ color: "#6B5F7A", fontFamily: "'Outfit', sans-serif" }}
                >
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* CTA SECTION */}
      {/* ═══════════════════════════════════════════ */}
      <section
        className="relative py-20 md:py-28 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #5B3D8F 0%, #7B5BA8 50%, #9B7DC8 100%)",
        }}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[10%] text-4xl opacity-15 text-white" style={{ animation: "float 4s ease-in-out infinite" }}>&#9835;</div>
          <div className="absolute bottom-10 right-[10%] text-3xl opacity-20 text-yellow-300" style={{ animation: "floatSlow 5s ease-in-out infinite 1s" }}>&#9834;</div>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
          >
            Ready to Discover the{" "}
            <span style={{ color: "#F2C94C" }}>Rhythm</span> Within?
          </motion.h2>
          <p className="text-white/70 text-lg mb-10" style={{ fontFamily: "'Outfit', sans-serif" }}>
            No downloads, no setup — just open your browser and let the music begin.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => navigate("/signup")}
              className="px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #F2C94C, #EFBA3C)",
                color: "#3E2468",
                boxShadow: "0 6px 30px rgba(242, 201, 76, 0.35)",
                fontFamily: "'Fredoka', sans-serif",
              }}
            >
              Start Playing Now
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-10 py-4 rounded-full font-bold text-lg text-white border-2 border-white/30 hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              Login
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* FOOTER */}
      {/* ═══════════════════════════════════════════ */}
      <footer style={{ background: "#FAFAFE" }}>
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Footer Links */}
            <div className="flex items-center gap-8">
              <a
                href="#about"
                className="text-sm font-bold tracking-wide hover:opacity-70 transition-opacity"
                style={{ color: "#2D2040", fontFamily: "'Fredoka', sans-serif" }}
              >
                ABOUT US
              </a>
              <a
                href="#features"
                className="text-sm font-bold tracking-wide hover:opacity-70 transition-opacity"
                style={{ color: "#2D2040", fontFamily: "'Fredoka', sans-serif" }}
              >
                HELP
              </a>
            </div>

            {/* Social */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all"
                style={{ color: "#2D2040" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 h-px" style={{ background: "rgba(45, 32, 64, 0.1)" }} />

          {/* Copyright */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs" style={{ color: "#6B5F7A" }}>
            <span>&copy; {new Date().getFullYear()} Djembe. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:opacity-70 transition-opacity">Privacy Policy</a>
              <a href="#" className="hover:opacity-70 transition-opacity">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Decorative sparkle */}
        <div className="relative">
          <div
            className="absolute bottom-4 right-6 text-2xl opacity-30"
            style={{ animation: "floatSlow 4s ease-in-out infinite", color: "#C4B5E3" }}
          >
            &#10022;
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing_page;
