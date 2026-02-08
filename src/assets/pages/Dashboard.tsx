import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { Play, FileText, Sparkles, ArrowRight, Users } from "lucide-react";

export default function Dashboard() {
  const { userProfile, userType } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  } as const;

  return (
    <div
      className="flex w-full flex-col h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)",
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
        @keyframes mascot-bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>

      {/* Gradient blobs - background depth */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div
          className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(123, 91, 168, 0.12) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[20%] -right-16 w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(217, 119, 70, 0.1) 0%, transparent 70%)", animation: "floatSlow 10s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute -bottom-10 left-[30%] w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(66, 201, 201, 0.08) 0%, transparent 70%)", animation: "float 9s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute top-[60%] -left-10 w-[300px] h-[300px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(242, 201, 76, 0.08) 0%, transparent 70%)", animation: "floatSlow 7s ease-in-out infinite 3s" }}
        />
      </div>

      {/* Floating SVG Musical Elements */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {/* Eighth note - top left */}
        <div
          className="absolute top-24 left-4 md:left-12"
          style={{ animation: "float 4s ease-in-out infinite", opacity: 0.25 }}
        >
          <svg width="48" height="56" viewBox="0 0 24 30" fill="#7B5BA8">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#7B5BA8" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Double beamed notes - lower left */}
        <div
          className="absolute top-[60%] left-6 md:left-10"
          style={{ animation: "floatSlow 5s ease-in-out infinite 1s", opacity: 0.18 }}
        >
          <svg width="52" height="52" viewBox="0 0 32 32" fill="#D97746">
            <rect x="6" y="2" width="2.5" height="22" rx="1" />
            <rect x="22" y="6" width="2.5" height="18" rx="1" />
            <ellipse cx="5" cy="25" rx="4.5" ry="3.5" />
            <ellipse cx="21" cy="25" rx="4.5" ry="3.5" />
            <rect x="8" y="2" width="16.5" height="2.5" rx="1" />
            <rect x="8" y="7" width="16.5" height="2.5" rx="1" />
          </svg>
        </div>

        {/* Small note - bottom left */}
        <div
          className="absolute bottom-28 left-[15%]"
          style={{ animation: "float 3.5s ease-in-out infinite 0.5s", opacity: 0.15 }}
        >
          <svg width="32" height="38" viewBox="0 0 24 30" fill="#42C9C9">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#42C9C9" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Star - top right */}
        <div
          className="absolute top-20 right-8 md:right-16"
          style={{ animation: "floatSlow 4.5s ease-in-out infinite 0.5s", opacity: 0.2 }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Quarter note - mid right */}
        <div
          className="absolute top-[48%] right-4 md:right-10"
          style={{ animation: "float 5s ease-in-out infinite 2s", opacity: 0.18 }}
        >
          <svg width="28" height="46" viewBox="0 0 16 32" fill="#7B5BA8">
            <rect x="10" y="0" width="2.5" height="24" rx="1" />
            <ellipse cx="7" cy="26" rx="5.5" ry="4" />
          </svg>
        </div>

        {/* 4-point sparkle - upper center-left */}
        <div
          className="absolute top-36 left-[25%]"
          style={{ animation: "floatSlow 6s ease-in-out infinite 1.5s", opacity: 0.14 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#D97746">
            <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z" />
          </svg>
        </div>

        {/* Eighth note - bottom right area */}
        <div
          className="absolute bottom-36 right-[20%]"
          style={{ animation: "float 4s ease-in-out infinite 3s", opacity: 0.14 }}
        >
          <svg width="36" height="42" viewBox="0 0 24 30" fill="#42C9C9">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#42C9C9" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Small star - center right */}
        <div
          className="absolute top-[30%] right-[25%]"
          style={{ animation: "floatSlow 5.5s ease-in-out infinite 4s", opacity: 0.12 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Small sparkle - lower center */}
        <div
          className="absolute bottom-20 left-[45%]"
          style={{ animation: "float 7s ease-in-out infinite 2.5s", opacity: 0.1 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#7B5BA8">
            <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z" />
          </svg>
        </div>
      </div>

      {/* Mascot - absolutely positioned bottom right on desktop */}
      <div
        className="hidden md:block absolute bottom-8 right-8 lg:right-16 z-[8]"
        style={{ animation: "mascot-bob 3s ease-in-out infinite" }}
      >
        <div
          className="w-[250px] h-[290px] lg:w-[300px] lg:h-[340px] overflow-hidden"
        >
          <img
            src="/ui assets/djemb_fullbody.png"
            alt="Djembe mascot"
            className="w-[300%] h-[300%] max-w-none"
            style={{
              filter: "drop-shadow(0 8px 24px rgba(62, 36, 104, 0.2))",
              imageRendering: "auto",
            }}
          />
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1 justify-center px-6 py-8 md:py-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto w-full"
        >
          {/* Centered Welcome Section */}
          <div className="text-center mb-8">
            {/* Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <div
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 shadow-sm"
                style={{ backgroundColor: "white", borderColor: "#E8DFFF" }}
              >
                <Sparkles size={16} style={{ color: "#D97746" }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#7B5BA8", fontFamily: "'Fredoka', sans-serif" }}
                >
                  {userType === "teacher" ? "Teacher Portal" : "Student Dashboard"}
                </span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-4"
              style={{ color: "#3E2468", fontFamily: "'Fredoka', sans-serif" }}
            >
              Welcome back,
              <br />
              <span style={{ color: "#D97746" }}>
                {userProfile?.first_name || "there"}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl mx-auto max-w-lg"
              style={{ color: "#7B5BA8" }}
            >
              {userType === "teacher"
                ? "Ready to inspire your students and create amazing musical experiences"
                : "Your musical adventure awaits. Let's make some magic"}
            </motion.p>
          </div>

          {/* Action Cards - centered */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-3xl mx-auto"
          >
            {/* Make Music Card */}
            <Link to="/daw" className="group">
              <motion.div
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="relative h-full overflow-hidden rounded-3xl p-6 md:p-7 transition-all duration-300 bg-white"
                style={{
                  border: "3px solid #D97746",
                  boxShadow: "0 4px 20px rgba(217, 119, 70, 0.12)",
                }}
              >
                <div className="relative space-y-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#D97746" }}
                  >
                    <Play size={26} className="text-white" fill="white" />
                  </div>

                  <div>
                    <h3
                      className="text-xl font-bold mb-1.5"
                      style={{ color: "#3E2468", fontFamily: "'Fredoka', sans-serif" }}
                    >
                      Make Music
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-500">
                      Create beats, compose melodies, and bring your musical ideas to life with our DAW
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1" style={{ color: "#D97746" }}>
                    <span
                      className="text-sm font-semibold"
                      style={{ fontFamily: "'Fredoka', sans-serif" }}
                    >
                      Start creating
                    </span>
                    <ArrowRight
                      size={16}
                      className="transform group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Assignments / Students Card */}
            {userType === "student" ? (
              <Link to="/assignments" className="group">
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-full overflow-hidden rounded-3xl p-6 md:p-7 transition-all duration-300 bg-white"
                  style={{
                    border: "3px solid #42C9C9",
                    boxShadow: "0 4px 20px rgba(66, 201, 201, 0.12)",
                  }}
                >
                  <div className="relative space-y-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#42C9C9" }}
                    >
                      <FileText size={26} className="text-white" />
                    </div>

                    <div>
                      <h3
                        className="text-xl font-bold mb-1.5"
                        style={{ color: "#3E2468", fontFamily: "'Fredoka', sans-serif" }}
                      >
                        My Assignments
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-500">
                        View your tasks, submit your work, and track your progress
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1" style={{ color: "#42C9C9" }}>
                      <span
                        className="text-sm font-semibold"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                      >
                        View assignments
                      </span>
                      <ArrowRight
                        size={16}
                        className="transform group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ) : (
              <Link to="/students" className="group">
                <motion.div
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-full overflow-hidden rounded-3xl p-6 md:p-7 transition-all duration-300 bg-white"
                  style={{
                    border: "3px solid #42C9C9",
                    boxShadow: "0 4px 20px rgba(66, 201, 201, 0.12)",
                  }}
                >
                  <div className="relative space-y-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#42C9C9" }}
                    >
                      <Users size={26} className="text-white" />
                    </div>

                    <div>
                      <h3
                        className="text-xl font-bold mb-1.5"
                        style={{ color: "#3E2468", fontFamily: "'Fredoka', sans-serif" }}
                      >
                        My Students
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-500">
                        View student progress, manage classes, and support learning
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1" style={{ color: "#42C9C9" }}>
                      <span
                        className="text-sm font-semibold"
                        style={{ fontFamily: "'Fredoka', sans-serif" }}
                      >
                        View students
                      </span>
                      <ArrowRight
                        size={16}
                        className="transform group-hover:translate-x-1 transition-transform"
                      />
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}
          </motion.div>

        </motion.div>
      </div>

    </div>
  );
}
