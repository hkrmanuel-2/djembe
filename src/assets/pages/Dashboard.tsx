import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import CloudShader from "@/components/ui/cloud-shader";
import { Music, FileText, Globe, Sparkles, ArrowRight } from "lucide-react";

export default function Dashboard() {
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
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  } as const;

  return (
    <div className="flex w-full flex-col min-h-screen relative overflow-hidden" style={{ backgroundColor: '#1A2B4A', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* CloudShader Background with warm tint */}
      <div className="absolute inset-0 z-0">
        <CloudShader
          speed={0.2}
          octaves={5}
          scale={3}
          className="w-full h-full opacity-40"
        />
        {/* Warm gradient overlay to blend with landing page colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4A]/80 via-transparent to-[#D97746]/10" />
      </div>

      {/* Fun Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 text-4xl opacity-20" style={{ animation: 'float 3s ease-in-out infinite' }}>🎵</div>
        <div className="absolute top-40 right-20 text-3xl opacity-15" style={{ animation: 'float 4s ease-in-out infinite 1s' }}>🎶</div>
        <div className="absolute bottom-32 left-1/4 text-5xl opacity-10" style={{ animation: 'float 5s ease-in-out infinite 2s' }}>⭐</div>
        <div className="absolute top-1/3 right-10 text-4xl opacity-15" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>✨</div>
        <div className="absolute bottom-20 right-1/3 text-3xl opacity-20" style={{ animation: 'float 3.5s ease-in-out infinite 1.5s' }}>🪘</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1 items-center justify-center px-6 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto w-full space-y-16"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <Sparkles size={16} style={{ color: '#E6B84D' }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {userType === "teacher" ? "Teacher Portal" : "Student Dashboard"}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white">
              Welcome back,
              <br />
              <span style={{ color: '#D97746' }}>
                {userProfile?.first_name || "there"}
              </span>
            </h1>

            <p className="text-xl md:text-2xl font-light max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {userType === "teacher"
                ? "Ready to inspire your students and create amazing musical experiences"
                : "Your musical adventure awaits. Let's make some magic"}
            </p>
          </motion.div>

          {/* Action Cards */}
          <motion.div
            variants={itemVariants}
            className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
          >
            {/* DAW Card */}
            <Link to="/daw" className="group">
              <motion.div
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="relative h-full overflow-hidden rounded-2xl backdrop-blur-md p-8 transition-all duration-300 border"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)',
                }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 70, 0.15) 0%, rgba(230, 184, 77, 0.1) 100%)' }} />

                <div className="relative space-y-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}>
                    <Music size={28} className="text-white" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Make Music</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Create beats, compose melodies, and bring your musical ideas to life with our DAW
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 transition-colors" style={{ color: '#E6B84D' }}>
                    <span className="text-sm font-medium">Start creating</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
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
                  className="relative h-full overflow-hidden rounded-2xl backdrop-blur-md p-8 transition-all duration-300 border"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(74, 155, 155, 0.15) 0%, rgba(26, 43, 74, 0.1) 100%)' }} />

                  <div className="relative space-y-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4A9B9B 0%, #1A2B4A 100%)' }}>
                      <FileText size={28} className="text-white" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">My Assignments</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        View your tasks, submit your work, and track your progress
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 transition-colors" style={{ color: '#4A9B9B' }}>
                      <span className="text-sm font-medium">View assignments</span>
                      <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Worlds Card for Teachers */}
            {userType === "teacher" && (
              <Link to="/world1" className="group">
                <motion.div
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative h-full overflow-hidden rounded-2xl backdrop-blur-md p-8 transition-all duration-300 border"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(74, 155, 155, 0.15) 0%, rgba(230, 184, 77, 0.1) 100%)' }} />

                  <div className="relative space-y-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4A9B9B 0%, #E6B84D 100%)' }}>
                      <Globe size={28} className="text-white" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Explore Worlds</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Discover immersive 3D environments for musical exploration
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 transition-colors" style={{ color: '#4A9B9B' }}>
                      <span className="text-sm font-medium">Enter worlds</span>
                      <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}
          </motion.div>

          {/* Worlds Section */}
          <motion.div variants={itemVariants} className="text-center space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Explore Musical Worlds
              </h2>
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Step into immersive 3D environments designed for musical creativity and learning
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* World 1 */}
              <Link to="/world1" className="group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-xl backdrop-blur-md p-6 transition-all duration-300 border"
                  style={{
                    backgroundColor: 'rgba(217, 119, 70, 0.15)',
                    borderColor: 'rgba(217, 119, 70, 0.3)',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(217, 119, 70, 0.2) 0%, transparent 100%)' }} />

                  <div className="relative text-center space-y-3">
                    <div className="text-4xl">🔥</div>
                    <h3 className="text-xl font-bold text-white">Fireside World</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
                  className="relative overflow-hidden rounded-xl backdrop-blur-md p-6 transition-all duration-300 border"
                  style={{
                    backgroundColor: 'rgba(74, 155, 155, 0.15)',
                    borderColor: 'rgba(74, 155, 155, 0.3)',
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(135deg, rgba(74, 155, 155, 0.2) 0%, transparent 100%)' }} />

                  <div className="relative text-center space-y-3">
                    <div className="text-4xl">🎭</div>
                    <h3 className="text-xl font-bold text-white">Auditorium World</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
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
