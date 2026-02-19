import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginNew() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { signIn, error, clearError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    const result = await signIn(email, password, rememberDevice);

    if (result.success) {
      navigate("/");
    }

    setIsSubmitting(false);
  };

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  return (
    <div className="flex w-full flex-col min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #3E2468 0%, #5B3D8F 50%, #7B5BA8 100%)', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Fun Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
        <div className="absolute top-24 right-16 text-3xl opacity-20" style={{ animation: 'float 4s ease-in-out infinite' }}>🎵</div>
        <div className="absolute bottom-40 left-16 text-4xl opacity-25" style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}>✨</div>
        <div className="absolute top-1/2 left-12 text-2xl opacity-15" style={{ animation: 'float 5s ease-in-out infinite 2s' }}>🎶</div>
        <div className="absolute bottom-28 right-24 text-3xl opacity-20" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>🪘</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Navigation */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-4 sm:pt-6 px-4 w-full sm:w-auto">
          <div
            className="flex items-center justify-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded-full border shadow-lg max-w-full"
            style={{
              background: 'linear-gradient(135deg, #3E2468 0%, #5B3D8F 100%)',
              borderColor: 'rgba(155, 125, 200, 0.3)',
            }}
          >
            <Link to="/" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-base sm:text-lg" style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}>🪘</div>
              <span className="text-base sm:text-lg font-bold" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                <span style={{ color: "#D97746" }}>D</span>
                <span style={{ color: "#42C9C9" }}>J</span>
                <span style={{ color: "#F2C94C" }}>E</span>
                <span style={{ color: "#E8627A" }}>M</span>
                <span style={{ color: "#9B7DC8" }}>B</span>
                <span style={{ color: "#4ABA6E" }}>E</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 flex-col justify-center items-center px-4 sm:px-6">
          <div className="w-full mt-[80px] sm:mt-[100px] max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Frosted Glass Card */}
                <div
                  className="rounded-3xl shadow-2xl p-8 sm:p-10 space-y-6 border border-white/10 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, rgba(91,61,143,0.85) 0%, rgba(62,36,104,0.92) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Drum Face */}
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                    className="w-28 h-28 sm:w-32 sm:h-32 mx-auto"
                    style={{
                      backgroundImage: `url('/ui assets/djembe_faces.png')`,
                      backgroundSize: "300% 300%",
                      backgroundPosition: "0% 0%",
                      backgroundRepeat: "no-repeat",
                      filter: "drop-shadow(0 6px 20px rgba(62, 36, 104, 0.25))",
                    }}
                  />

                  {/* Header */}
                  <div className="space-y-2 text-center">
                    <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: 'white', fontFamily: "'Fredoka', sans-serif" }}>
                      Welcome Back!
                    </h1>
                    <p className="text-base text-white/60">
                      Sign in to continue your musical journey
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="border px-4 py-3 rounded-xl text-sm"
                      style={{ backgroundColor: 'rgba(232, 98, 122, 0.1)', borderColor: 'rgba(232, 98, 122, 0.3)', color: '#E8627A' }}
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <Mail size={20} />
                      </div>
                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none transition-all placeholder:text-gray-300"
                        style={{
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.08)',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Password Input */}
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        <Lock size={20} />
                      </div>
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none transition-all placeholder:text-gray-300"
                        style={{
                          borderColor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          backgroundColor: 'rgba(255,255,255,0.08)',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.4)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Remember Device */}
                    <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rememberDevice}
                          onChange={(e) => setRememberDevice(e.target.checked)}
                          className="w-5 h-5 rounded cursor-pointer accent-[#7B5BA8]"
                          disabled={isSubmitting}
                        />
                        <span className="text-sm text-white/60">
                          Remember this device
                        </span>
                      </label>
                      <Link
                        to="#"
                        className="text-sm font-medium transition-colors hover:text-white"
                        style={{ color: '#F2C94C' }}
                      >
                        Forgot password?
                      </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full rounded-2xl font-semibold py-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2 text-white text-lg"
                      style={{
                        background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)',
                        fontFamily: "'Fredoka', sans-serif",
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isSubmitting ? "Signing in..." : "Sign In"}
                        {!isSubmitting && (
                          <ArrowRight
                            size={20}
                            className="transform group-hover:translate-x-1 transition-transform"
                          />
                        )}
                      </span>
                      {!isSubmitting && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      )}
                    </button>
                  </form>
                </div>

                {/* Sign Up Link */}
                <p className="text-sm text-center mt-4 text-white/70">
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold underline underline-offset-2 transition-colors hover:text-white"
                    style={{ color: '#F2C94C' }}
                  >
                    Sign up
                  </Link>
                </p>

                {/* Terms */}
                <p className="text-xs text-center pt-6 max-w-md mx-auto text-white/50">
                  By signing in, you agree to our{" "}
                  <Link to="#" className="underline hover:text-white/70 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="underline hover:text-white/70 transition-colors">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
