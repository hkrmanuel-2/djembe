import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { Music, FileText, Globe, Sparkles, ArrowRight } from "lucide-react";

export default function HomeNew() {
  const { userProfile, userType } = useAuthStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="flex w-full flex-col min-h-screen relative overflow-hidden" style={{ backgroundColor: '#F5F1E8' }}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent" />
      </div>

      {/* Fun Doodles - Hidden on very small screens */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
        {/* Musical notes floating */}
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-bounce" style={{ animationDuration: '3s' }}>🎵</div>
        <div className="absolute top-40 right-20 text-3xl opacity-15 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>🎶</div>
        <div className="absolute bottom-32 left-1/4 text-5xl opacity-10 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>⭐</div>
        <div className="absolute top-1/3 right-10 text-4xl opacity-15 animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }}>✨</div>
        <div className="absolute bottom-20 right-1/3 text-3xl opacity-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1.5s' }}>🎸</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto w-full space-y-16"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="text-center space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border backdrop-blur-sm mb-2 sm:mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', borderColor: 'rgba(26, 43, 74, 0.1)' }}>
              <Sparkles size={14} className="sm:w-4 sm:h-4" style={{ color: '#D97746' }} />
              <span className="text-xs sm:text-sm font-medium" style={{ color: '#1A2B4A' }}>
                {userType === "teacher" ? "Teacher Portal" : "Student Dashboard"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold leading-tight tracking-tight" style={{ color: '#1A2B4A' }}>
              Welcome back,
              <br />
              <span style={{ color: '#D97746' }}>
                {userProfile?.first_name || "there"}
              </span>
            </h1>

            <p className="text-base sm:text-xl md:text-2xl font-light max-w-2xl mx-auto px-2" style={{ color: '#5A6B7D' }}>
              {userType === "teacher"
                ? "Ready to inspire your students and create amazing musical experiences"
                : "Your musical adventure awaits. Let's make some magic"}
            </p>
          </motion.div>

          {/* Action Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto"
          >
            {/* DAW Card */}
            <Link to="/daw" className="group">
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="relative h-full overflow-hidden rounded-xl sm:rounded-2xl border backdrop-blur-sm p-5 sm:p-8 transition-all duration-300"
                style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(26, 43, 74, 0.1)' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 70, 0.05) 0%, rgba(74, 155, 155, 0.05) 100%)' }} />

                <div className="relative space-y-3 sm:space-y-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: '#F0EDE4' }}>
                    <Music size={24} className="sm:w-7 sm:h-7" style={{ color: '#D97746' }} />
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#1A2B4A' }}>Make Music</h3>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#5A6B7D' }}>
                      Create beats, mix melodies, and bring your musical ideas to life
                    </p>
                  </div>

                  <div className="flex items-center gap-2 transition-colors pt-1 sm:pt-2" style={{ color: '#1A2B4A' }}>
                    <span className="text-xs sm:text-sm font-medium">Start creating</span>
                    <ArrowRight size={14} className="sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Assignments Card (Students Only) */}
            {userType === "student" && (
              <Link to="/assignments" className="group">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-full overflow-hidden rounded-xl sm:rounded-2xl border backdrop-blur-sm p-5 sm:p-8 transition-all duration-300"
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(26, 43, 74, 0.1)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(74, 155, 155, 0.05) 0%, rgba(230, 184, 77, 0.05) 100%)' }} />

                  <div className="relative space-y-3 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: '#F0EDE4' }}>
                      <FileText size={24} className="sm:w-7 sm:h-7" style={{ color: '#4A9B9B' }} />
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#1A2B4A' }}>My Assignments</h3>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#5A6B7D' }}>
                        View your tasks, submit your work, and track your progress
                      </p>
                    </div>

                    <div className="flex items-center gap-2 transition-colors pt-1 sm:pt-2" style={{ color: '#1A2B4A' }}>
                      <span className="text-xs sm:text-sm font-medium">View assignments</span>
                      <ArrowRight size={14} className="sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Worlds Placeholder for Teachers */}
            {userType === "teacher" && (
              <Link to="/world1" className="group">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-full overflow-hidden rounded-xl sm:rounded-2xl border backdrop-blur-sm p-5 sm:p-8 transition-all duration-300"
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(26, 43, 74, 0.1)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(74, 155, 155, 0.05) 0%, rgba(217, 119, 70, 0.05) 100%)' }} />

                  <div className="relative space-y-3 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-colors" style={{ backgroundColor: '#F0EDE4' }}>
                      <Globe size={24} className="sm:w-7 sm:h-7" style={{ color: '#4A9B9B' }} />
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#1A2B4A' }}>Explore Worlds</h3>
                      <p className="text-xs sm:text-sm leading-relaxed" style={{ color: '#5A6B7D' }}>
                        Discover immersive 3D environments for musical exploration
                      </p>
                    </div>

                    <div className="flex items-center gap-2 transition-colors pt-1 sm:pt-2" style={{ color: '#1A2B4A' }}>
                      <span className="text-xs sm:text-sm font-medium">Enter worlds</span>
                      <ArrowRight size={14} className="sm:w-4 sm:h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}
          </motion.div>

          {/* Worlds Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6 sm:space-y-8">
            <div className="space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#1A2B4A' }}>
                Explore Musical Worlds
              </h2>
              <p className="text-sm sm:text-lg max-w-2xl mx-auto px-2" style={{ color: '#5A6B7D' }}>
                Step into immersive 3D environments designed for musical creativity and learning
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-3xl mx-auto">
              {/* World 1 */}
              <Link to="/world1" className="group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-lg sm:rounded-xl border backdrop-blur-sm p-4 sm:p-6 transition-all duration-300"
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(26, 43, 74, 0.1)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 70, 0.08) 0%, transparent 100%)' }} />

                  <div className="relative text-center space-y-2 sm:space-y-3">
                    <div className="text-2xl sm:text-4xl">🔥</div>
                    <h3 className="text-sm sm:text-xl font-bold" style={{ color: '#1A2B4A' }}>Fireside World</h3>
                    <p className="text-[10px] sm:text-sm hidden sm:block" style={{ color: '#5A6B7D' }}>
                      Gather around the campfire for storytelling and acoustic sessions
                    </p>
                  </div>
                </motion.div>
              </Link>

              {/* World 2 */}
              <Link to="/world2" className="group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-lg sm:rounded-xl border backdrop-blur-sm p-4 sm:p-6 transition-all duration-300"
                  style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(26, 43, 74, 0.1)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(74, 155, 155, 0.08) 0%, transparent 100%)' }} />

                  <div className="relative text-center space-y-2 sm:space-y-3">
                    <div className="text-2xl sm:text-4xl">🎭</div>
                    <h3 className="text-sm sm:text-xl font-bold" style={{ color: '#1A2B4A' }}>Auditorium World</h3>
                    <p className="text-[10px] sm:text-sm hidden sm:block" style={{ color: '#5A6B7D' }}>
                      Experience grand performances in a stunning auditorium setting
                    </p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}