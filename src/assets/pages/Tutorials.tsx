import { motion } from "framer-motion";

export default function Tutorials() {

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-x-hidden"
      style={{
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
      `}</style>

      {/* Fixed background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)",
        }}
      />

      {/* Gradient blobs */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(123, 91, 168, 0.18) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[15%] -right-24 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(217, 119, 70, 0.14) 0%, transparent 70%)", animation: "floatSlow 10s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute -bottom-20 left-[20%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(66, 201, 201, 0.12) 0%, transparent 70%)", animation: "float 9s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute top-[55%] -left-16 w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(242, 201, 76, 0.10) 0%, transparent 70%)", animation: "floatSlow 7s ease-in-out infinite 3s" }}
        />
      </div>

      {/* Floating SVG Musical Elements */}
      <div className="fixed inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
        {/* Large eighth note - top left */}
        <div className="absolute top-24 left-4 md:left-12" style={{ animation: "float 4s ease-in-out infinite", opacity: 0.3 }}>
          <svg width="48" height="56" viewBox="0 0 24 30" fill="#E8627A">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#E8627A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Star - top right */}
        <div className="absolute top-16 right-6 md:right-14" style={{ animation: "floatSlow 4.5s ease-in-out infinite 0.5s", opacity: 0.3 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Quarter note - mid right */}
        <div className="absolute top-[45%] right-4 md:right-8" style={{ animation: "float 5s ease-in-out infinite 2s", opacity: 0.25 }}>
          <svg width="30" height="48" viewBox="0 0 16 32" fill="#42C9C9">
            <rect x="10" y="0" width="2.5" height="24" rx="1" />
            <ellipse cx="7" cy="26" rx="5.5" ry="4" />
          </svg>
        </div>

        {/* Double beamed notes - left side */}
        <div className="absolute top-[50%] left-4 md:left-8" style={{ animation: "floatSlow 5s ease-in-out infinite 1s", opacity: 0.25 }}>
          <svg width="50" height="50" viewBox="0 0 32 32" fill="#E8627A">
            <rect x="6" y="2" width="2.5" height="22" rx="1" />
            <rect x="22" y="6" width="2.5" height="18" rx="1" />
            <ellipse cx="5" cy="25" rx="4.5" ry="3.5" />
            <ellipse cx="21" cy="25" rx="4.5" ry="3.5" />
            <rect x="8" y="2" width="16.5" height="2.5" rx="1" />
            <rect x="8" y="7" width="16.5" height="2.5" rx="1" />
          </svg>
        </div>

        {/* Sparkle - upper center */}
        <div className="absolute top-32 left-[25%]" style={{ animation: "floatSlow 6s ease-in-out infinite 1.5s", opacity: 0.2 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#D97746">
            <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z" />
          </svg>
        </div>

        {/* Star - lower left */}
        <div className="absolute bottom-32 left-[12%]" style={{ animation: "floatSlow 5.5s ease-in-out infinite 4s", opacity: 0.25 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Eighth note - bottom right */}
        <div className="absolute bottom-24 right-[18%]" style={{ animation: "float 4s ease-in-out infinite 3s", opacity: 0.22 }}>
          <svg width="38" height="44" viewBox="0 0 24 30" fill="#42C9C9">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#42C9C9" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Star - right edge */}
        <div className="absolute top-[62%] right-4 md:right-10" style={{ animation: "floatSlow 4s ease-in-out infinite 2.5s", opacity: 0.2 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>
      </div>

      {/* Content — blurred with coming soon overlay */}
      <div className="relative z-10 min-h-screen px-4 sm:px-6 pt-16 pb-12">
        <div className="max-w-5xl mx-auto relative">

          {/* Blurred background content (placeholder) */}
          <div className="filter blur-[6px] pointer-events-none select-none opacity-50">
            <div className="flex items-center gap-4 mb-6">
              <div>
                <h1
                  className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight"
                  style={{ color: "#3E2468", fontFamily: "'Fredoka', sans-serif" }}
                >
                  TUTORIAL
                  <br />
                  <span style={{ color: "#3E2468" }}>ISLAND</span>
                </h1>
              </div>
            </div>

            {/* Blurred placeholder cards */}
            <div className="relative">
              <img
                src="/ui assets/tutorial_bg.png"
                alt=""
                className="w-full"
                style={{ filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.06))" }}
              />
              <div className="relative -mt-64 sm:-mt-80 md:-mt-[420px] lg:-mt-[550px] pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl h-64"
                      style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Overlay */}
          <motion.div
            {...fadeIn}
            className="absolute inset-0 flex flex-col items-center justify-center z-20"
          >
            <div
              className="bg-white/90 backdrop-blur-sm rounded-3xl px-10 py-12 sm:px-16 sm:py-16 flex flex-col items-center text-center max-w-lg mx-auto"
              style={{ boxShadow: "0 12px 48px rgba(62, 36, 104, 0.15)" }}
            >
              {/* Djembe mascot */}
              <div className="w-[140px] h-[160px] sm:w-[180px] sm:h-[200px] overflow-hidden mb-6">
                <img
                  src="/ui assets/djemb_fullbody.png"
                  alt="Djembe mascot"
                  className="w-[300%] h-[300%] max-w-none"
                  style={{
                    transform: "translate(-33.333%, -33.333%)",
                    filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.15))",
                    imageRendering: "auto",
                  }}
                />
              </div>

              <h2
                className="text-3xl sm:text-4xl font-bold mb-3"
                style={{ color: "#3E2468", fontFamily: "'Fredoka', sans-serif" }}
              >
                Coming Soon!
              </h2>

              <p
                className="text-base sm:text-lg mb-2"
                style={{ color: "#7B5BA8", fontFamily: "'Outfit', sans-serif" }}
              >
                Tutorial Island is getting ready for you!
              </p>

              <p
                className="text-sm max-w-sm"
                style={{ color: "#9B8AB8", fontFamily: "'Outfit', sans-serif" }}
              >
                We're creating fun video lessons to help you master the djembe.
                Check back soon for rhythm adventures, technique guides, and more!
              </p>

              {/* Decorative stars */}
              <div className="flex items-center gap-2 mt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="24" height="24" viewBox="0 0 24 24" fill="#F2C94C" opacity={0.8}>
                    <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
                  </svg>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
