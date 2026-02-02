import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import CloudShader from "@/components/ui/cloud-shader";
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

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

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
          speed={0.3}
          octaves={5}
          scale={2.5}
          className="w-full h-full opacity-40"
        />
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4A]/80 via-transparent to-[#D97746]/10" />
      </div>

      {/* Fun Floating Doodles - Hidden on small screens */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
        <div className="absolute top-24 right-16 text-3xl opacity-15" style={{ animation: 'float 4s ease-in-out infinite' }}>🎵</div>
        <div className="absolute bottom-40 left-16 text-4xl opacity-20" style={{ animation: 'float 3.5s ease-in-out infinite 1s' }}>✨</div>
        <div className="absolute top-1/2 left-12 text-2xl opacity-10" style={{ animation: 'float 5s ease-in-out infinite 2s' }}>🎶</div>
        <div className="absolute bottom-28 right-24 text-3xl opacity-15" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>🪘</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Navigation - Matching NavBarDark style */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-4 sm:pt-6 px-4 w-full sm:w-auto">
          <div className="flex items-center justify-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md py-2 px-2 sm:px-3 rounded-full border border-white/10 max-w-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-base sm:text-lg" style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}>🪘</div>
              <span className="text-base sm:text-lg font-bold text-white">Djembe</span>
            </Link>

            <div className="w-px h-5 sm:h-6 bg-white/20" />

            {/* Nav Links - Hidden on very small screens */}
            <Link
              to="/"
              className="hidden xs:block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              Home
            </Link>

            <div className="hidden xs:block w-px h-5 sm:h-6 bg-white/20" />

            {/* Auth Buttons */}
            <Link to="/signup">
              <button className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-black bg-white hover:bg-white/90 transition-all">
                Sign Up
              </button>
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
                className="space-y-8 text-center"
              >
                {/* Header */}
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white">
                    Welcome to <span style={{ color: '#D97746' }}>Djembe</span>
                  </h1>
                  <p className="text-base sm:text-lg font-light" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Sign in to continue your musical journey
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="backdrop-blur-md border px-4 py-3 rounded-xl text-sm"
                    style={{ backgroundColor: 'rgba(220, 38, 38, 0.15)', borderColor: 'rgba(220, 38, 38, 0.3)', color: '#FCA5A5' }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
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
                      className="w-full backdrop-blur-md border rounded-2xl py-4 pl-12 pr-4 focus:outline-none transition-all placeholder:text-white/40"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                      }}
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
                      className="w-full backdrop-blur-md border rounded-2xl py-4 pl-12 pr-4 focus:outline-none transition-all placeholder:text-white/40"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderColor: 'rgba(255,255,255,0.15)',
                        color: 'white',
                      }}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* Remember Device */}
                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="w-4 h-4 rounded cursor-pointer accent-[#D97746]"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
                        disabled={isSubmitting}
                      />
                      <span className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        Remember this device
                      </span>
                    </label>
                    <Link
                      to="#"
                      className="text-sm transition-colors hover:opacity-80"
                      style={{ color: '#E6B84D' }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full rounded-2xl font-semibold py-4 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2"
                    style={{
                      background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)',
                      color: 'white',
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

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>or</span>
                    <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                  </div>

                  {/* Google Sign In */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 backdrop-blur-md border rounded-2xl py-4 transition-all hover:bg-white/10"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: 'white'
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="font-medium">Continue with Google</span>
                  </button>
                </form>

                {/* Sign Up Link */}
                <p className="text-sm pt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Don't have an account?{" "}
                  <Link
                    to="/signup"
                    className="font-semibold underline underline-offset-2 transition-colors hover:opacity-80"
                    style={{ color: '#E6B84D' }}
                  >
                    Sign up
                  </Link>
                </p>

                {/* Terms */}
                <p className="text-xs pt-6 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  By signing in, you agree to our{" "}
                  <Link to="#" className="underline hover:text-white/50 transition-colors">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="#" className="underline hover:text-white/50 transition-colors">
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
