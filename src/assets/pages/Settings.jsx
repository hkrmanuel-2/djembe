import { motion } from "framer-motion";
import { User, Palette, Bell, Sparkles, GraduationCap } from "lucide-react";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function Settings() {
  const { reset: resetOnboarding } = useOnboarding();

  const handleRestartTutorial = () => {
    resetOnboarding();
    alert('Tutorial reset! The onboarding tour will show again when you reload the page.');
  };

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
    <div className="flex w-full flex-col min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Fun Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-24 right-20 text-3xl opacity-10" style={{ animation: 'float 4s ease-in-out infinite' }}>⚙️</div>
        <div className="absolute bottom-40 left-16 text-4xl opacity-15" style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}>✨</div>
        <div className="absolute top-1/2 left-12 text-2xl opacity-8" style={{ animation: 'float 5s ease-in-out infinite 2s' }}>🎵</div>
        <div className="absolute bottom-32 right-24 text-3xl opacity-10" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>🪘</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen px-6 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4" style={{ backgroundColor: 'rgba(123, 91, 168, 0.1)', borderColor: '#E8DFFF' }}>
              <Sparkles size={16} style={{ color: '#D97746' }} />
              <span className="text-sm font-medium" style={{ color: '#7B5BA8' }}>Preferences</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight mb-4" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>
              Settings
            </h1>

            <p className="text-xl font-light text-gray-500">
              Customize your Djembe experience
            </p>
          </motion.div>

          {/* Settings Cards */}
          <div className="space-y-4">
            {/* Account Settings */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg bg-white shadow-md"
              style={{ borderColor: '#E8DFFF' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}>
                  <User size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Account</h3>
                  <p className="text-sm mb-4 text-gray-500">
                    Manage your profile and account settings
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3EEFF' }}>
                      <span style={{ color: '#3E2468' }}>Display Name</span>
                      <span style={{ color: '#9B7DC8' }}>Edit →</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3EEFF' }}>
                      <span style={{ color: '#3E2468' }}>Email</span>
                      <span style={{ color: '#9B7DC8' }}>Edit →</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span style={{ color: '#3E2468' }}>Password</span>
                      <span style={{ color: '#9B7DC8' }}>Change →</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Appearance */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg bg-white shadow-md"
              style={{ borderColor: '#E8DFFF' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #F2C94C 0%, #D97746 100%)' }}>
                  <Palette size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Appearance</h3>
                  <p className="text-sm mb-4 text-gray-500">
                    Customize how Djembe looks
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3EEFF' }}>
                      <span style={{ color: '#3E2468' }}>Theme</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(66, 201, 201, 0.1)', color: '#42C9C9' }}>Coming Soon</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span style={{ color: '#3E2468' }}>Animations</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(66, 201, 201, 0.1)', color: '#42C9C9' }}>Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Notifications */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg bg-white shadow-md"
              style={{ borderColor: '#E8DFFF' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #42C9C9 0%, #F2C94C 100%)' }}>
                  <Bell size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Notifications</h3>
                  <p className="text-sm mb-4 text-gray-500">
                    Control how you receive updates
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: '#F3EEFF' }}>
                      <span style={{ color: '#3E2468' }}>Push Notifications</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(66, 201, 201, 0.1)', color: '#42C9C9' }}>Coming Soon</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span style={{ color: '#3E2468' }}>Email Updates</span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(66, 201, 201, 0.1)', color: '#42C9C9' }}>Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tutorial */}
            <motion.div
              variants={itemVariants}
              className="rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg bg-white shadow-md"
              style={{ borderColor: '#E8DFFF' }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #E8627A 0%, #D97746 100%)' }}>
                  <GraduationCap size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>Tutorial</h3>
                  <p className="text-sm mb-4 text-gray-500">
                    Restart the onboarding tour to learn about Djembe features
                  </p>
                  <button
                    onClick={handleRestartTutorial}
                    className="w-full py-3 px-4 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 border-2"
                    style={{
                      backgroundColor: 'rgba(217, 119, 70, 0.1)',
                      borderColor: '#D97746',
                      color: '#D97746',
                      fontFamily: "'Fredoka', sans-serif",
                    }}
                  >
                    Restart Tutorial
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
