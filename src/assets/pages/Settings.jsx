import { motion } from "framer-motion";
import CloudShader from "@/components/ui/cloud-shader";
import { User, Palette, Bell, Shield, Sparkles } from "lucide-react";

export default function Settings() {
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4A]/80 via-transparent to-[#D97746]/10" />
      </div>

      {/* Fun Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-24 right-20 text-3xl opacity-15" style={{ animation: 'float 4s ease-in-out infinite' }}>⚙️</div>
        <div className="absolute bottom-40 left-16 text-4xl opacity-20" style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}>✨</div>
        <div className="absolute top-1/2 left-12 text-2xl opacity-10" style={{ animation: 'float 5s ease-in-out infinite 2s' }}>🎵</div>
        <div className="absolute bottom-32 right-24 text-3xl opacity-15" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>🪘</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen px-6 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <Sparkles size={16} style={{ color: '#E6B84D' }} />
              <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>Preferences</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight text-white mb-4">
              <span style={{ color: '#D97746' }}>Settings</span>
            </h1>

            <p className="text-xl font-light" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Customize your Djembe experience
            </p>
          </motion.div>

          {/* Settings Cards */}
          <div className="space-y-4">
            {/* Account Settings */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl backdrop-blur-md p-6 border transition-all duration-300 hover:bg-white/10"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}>
                  <User size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Account</h3>
                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Manage your profile and account settings
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Display Name</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Edit →</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Email</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Edit →</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Password</span>
                      <span style={{ color: 'rgba(255,255,255,0.5)' }}>Change →</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* User Role (for testing) */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl backdrop-blur-md p-6 border transition-all duration-300"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4A9B9B 0%, #1A2B4A 100%)' }}>
                  <Shield size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">User Role</h3>
                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Switch between student and teacher modes (for testing)
                  </p>
                  <select
                    className="w-full backdrop-blur-md border rounded-xl py-3 px-4 focus:outline-none transition-all cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: 'white',
                    }}
                    onChange={(e) => {
                      localStorage.setItem('userRole', e.target.value);
                      window.location.reload();
                    }}
                    defaultValue={localStorage.getItem('userRole') || 'student'}
                  >
                    <option value="student" style={{ backgroundColor: '#1A2B4A', color: 'white' }}>Student</option>
                    <option value="teacher" style={{ backgroundColor: '#1A2B4A', color: 'white' }}>Teacher/Admin</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Appearance */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl backdrop-blur-md p-6 border transition-all duration-300 hover:bg-white/10"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E6B84D 0%, #D97746 100%)' }}>
                  <Palette size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Appearance</h3>
                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Customize how Djembe looks
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Theme</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(74, 155, 155, 0.3)', color: '#4A9B9B' }}>Coming Soon</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Animations</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(74, 155, 155, 0.3)', color: '#4A9B9B' }}>Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl backdrop-blur-md p-6 border transition-all duration-300 hover:bg-white/10"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderColor: 'rgba(255,255,255,0.15)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4A9B9B 0%, #E6B84D 100%)' }}>
                  <Bell size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">Notifications</h3>
                  <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Control how you receive updates
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Push Notifications</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(74, 155, 155, 0.3)', color: '#4A9B9B' }}>Coming Soon</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span style={{ color: 'rgba(255,255,255,0.8)' }}>Email Updates</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(74, 155, 155, 0.3)', color: '#4A9B9B' }}>Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
