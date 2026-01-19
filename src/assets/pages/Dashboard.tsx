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
    <div className="flex w-full flex-col min-h-screen bg-black relative overflow-hidden">
      {/* CloudShader Background */}
      <div className="absolute inset-0 z-0">
        <CloudShader
          speed={0.2}
          octaves={5}
          scale={3}
          className="w-full h-full opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      </div>

      {/* Fun Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        {/* Musical notes floating */}
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-bounce" style={{animationDuration: '3s'}}>🎵</div>
        <div className="absolute top-40 right-20 text-3xl opacity-15 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>🎶</div>
        <div className="absolute bottom-32 left-1/4 text-5xl opacity-10 animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}}>⭐</div>
        <div className="absolute top-1/3 right-10 text-4xl opacity-15 animate-bounce" style={{animationDuration: '4.5s', animationDelay: '0.5s'}}>✨</div>
        <div className="absolute bottom-20 right-1/3 text-3xl opacity-20 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '1.5s'}}>🎸</div>
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
              <Sparkles size={16} className="text-white/60" />
              <span className="text-sm text-white/70 font-medium">
                {userType === "teacher" ? "Teacher Portal" : "Student Dashboard"}
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-white">
              Welcome back,
              <br />
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                {userProfile?.first_name || "there"}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/60 font-light max-w-2xl mx-auto">
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
                className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm p-8 transition-all duration-300 hover:border-white/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                    <Music size={28} className="text-white" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Make Music</h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Create beats, compose melodies, and bring your musical ideas to life with our DAW
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors pt-2">
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
                  className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm p-8 transition-all duration-300 hover:border-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                      <FileText size={28} className="text-white" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">My Assignments</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        View your tasks, submit your work, and track your progress
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors pt-2">
                      <span className="text-sm font-medium">View assignments</span>
                      <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
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
                  className="relative h-full overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm p-8 transition-all duration-300 hover:border-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                      <Globe size={28} className="text-white" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Explore Worlds</h3>
                      <p className="text-white/60 text-sm leading-relaxed">
                        Discover immersive 3D environments for musical exploration
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors pt-2">
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
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Step into immersive 3D environments designed for musical creativity and learning
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* World 1 */}
              <Link to="/world1" className="group">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-white/10 backdrop-blur-sm p-6 transition-all duration-300 hover:border-orange-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative text-center space-y-3">
                    <div className="text-4xl">🔥</div>
                    <h3 className="text-xl font-bold text-white">Fireside World</h3>
                    <p className="text-white/60 text-sm">
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
                  className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 backdrop-blur-sm p-6 transition-all duration-300 hover:border-purple-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative text-center space-y-3">
                    <div className="text-4xl">🎭</div>
                    <h3 className="text-xl font-bold text-white">Auditorium World</h3>
                    <p className="text-white/60 text-sm">
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
