import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import CloudShader from "@/components/ui/cloud-shader";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { validateEmailDomain } from "@/lib/emailValidation";
import { Mail, Lock, User, GraduationCap, Building2, ArrowRight } from "lucide-react";

interface School {
  school_id: string;
  name: string;
  allowed_domains?: string[] | null;
}

export default function SignupNew() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userType, setUserType] = useState<"teacher" | "student">("student");
  const [schoolId, setSchoolId] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSchools, setIsLoadingSchools] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [rememberDevice, setRememberDevice] = useState(true);
  const navigate = useNavigate();
  const { signUp, error, clearError } = useAuthStore();

  // Load schools on mount
  useEffect(() => {
    loadSchools();
  }, []);

  const loadSchools = async () => {
    setIsLoadingSchools(true);
    try {
      let { data, error } = await supabase
        .from("schools")
        .select("school_id, name, allowed_domains")
        .order("name");

      if (error && (error.message?.includes("relation") || error.code === "PGRST116")) {
        const result = await supabase
          .from("schools")
          .select("school_id, name, allowed_domains")
          .order("name");
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("Error loading schools:", error);
        useAuthStore.setState({
          error: `Failed to load schools: ${error.message}. Please check your database connection.`,
        });
        return;
      }

      setSchools(data || []);

      if (!data || data.length === 0) {
        console.warn("No schools found in database");
        useAuthStore.setState({
          error: "No schools available. Please contact your administrator.",
        });
      } else {
        clearError();
      }
    } catch (err: any) {
      console.error("Error loading schools:", err);
      useAuthStore.setState({
        error: `Error loading schools: ${err.message || "Unknown error"}`,
      });
    } finally {
      setIsLoadingSchools(false);
    }
  };

  const selectedSchool = useMemo(() => {
    return schools.find((s) => s.school_id === schoolId);
  }, [schools, schoolId]);

  const allowedDomains = useMemo(() => {
    if (!selectedSchool?.allowed_domains) return [];
    if (Array.isArray(selectedSchool.allowed_domains)) {
      return selectedSchool.allowed_domains;
    }
    if (typeof selectedSchool.allowed_domains === "string") {
      try {
        return JSON.parse(selectedSchool.allowed_domains);
      } catch {
        return [selectedSchool.allowed_domains];
      }
    }
    return [];
  }, [selectedSchool]);

  // Validate email domain when email or school changes
  useEffect(() => {
    if (!email || !schoolId) {
      setEmailError(null);
      return;
    }

    const validation = validateEmailDomain(email, allowedDomains);
    if (!validation.isValid) {
      setEmailError(validation.error || "Invalid email domain");
    } else {
      setEmailError(null);
    }
  }, [email, schoolId, allowedDomains]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    setEmailError(null);

    if (!schoolId) {
      useAuthStore.setState({ error: "Please select a school" });
      setIsSubmitting(false);
      return;
    }

    if (email && schoolId) {
      const validation = validateEmailDomain(email, allowedDomains);
      if (!validation.isValid) {
        setEmailError(validation.error || "Invalid email domain");
        useAuthStore.setState({ error: validation.error || "Invalid email domain" });
        setIsSubmitting(false);
        return;
      }
    }

    const result = await signUp(
      email,
      password,
      userType,
      firstName,
      lastName,
      schoolId,
      rememberDevice
    );

    if (result.success) {
      navigate("/");
    }

    setIsSubmitting(false);
  };

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  return (
    <div className="flex w-full flex-col min-h-screen bg-black relative overflow-hidden">
      {/* CloudShader Background */}
      <div className="absolute inset-0 z-0">
        <CloudShader
          speed={0.3}
          octaves={5}
          scale={2.5}
          className="w-full h-full opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      </div>

      {/* Fun Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-32 left-20 text-3xl opacity-15 animate-bounce" style={{animationDuration: '4s', animationDelay: '0.5s'}}>🎶</div>
        <div className="absolute bottom-48 right-24 text-4xl opacity-20 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '1.5s'}}>⭐</div>
        <div className="absolute top-2/3 right-16 text-2xl opacity-10 animate-bounce" style={{animationDuration: '5s'}}>✨</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Mini Navigation */}
        <header className="fixed top-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center px-6 py-3 backdrop-blur-sm rounded-full border border-white/10 bg-black/30">
          <div className="flex items-center gap-6">
            <div className="relative w-5 h-5 flex items-center justify-center">
              <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 top-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
              <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 left-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
              <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 right-0 top-1/2 transform -translate-y-1/2 opacity-80"></span>
              <span className="absolute w-1.5 h-1.5 rounded-full bg-gray-200 bottom-0 left-1/2 transform -translate-x-1/2 opacity-80"></span>
            </div>
            <nav className="flex items-center space-x-6 text-sm">
              <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                Home
              </Link>
            </nav>
            <Link to="/login">
              <button className="px-4 py-2 text-xs sm:text-sm font-semibold text-black bg-gradient-to-br from-gray-100 to-gray-300 rounded-full hover:from-gray-200 hover:to-gray-400 transition-all duration-200">
                Log In
              </button>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 flex-col justify-center items-center px-6 py-24">
          <div className="w-full mt-[60px] max-w-lg">
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
                  <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight text-white">
                    Join Djembe
                  </h1>
                  <p className="text-lg text-white/70 font-light">
                    Create your account and start making music
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                  {/* User Type Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white/80 text-center">
                      I am a
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType("student")}
                        disabled={isSubmitting}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200",
                          userType === "student"
                            ? "bg-white text-black"
                            : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                        )}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("teacher")}
                        disabled={isSubmitting}
                        className={cn(
                          "flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200",
                          userType === "teacher"
                            ? "bg-white text-black"
                            : "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10"
                        )}
                      >
                        Teacher
                      </button>
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full backdrop-blur-sm bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/40 text-sm"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full backdrop-blur-sm bg-white/5 text-white border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/40 text-sm"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* School Selection */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 z-10">
                      <Building2 size={20} />
                    </div>
                    <select
                      value={schoolId}
                      onChange={(e) => {
                        setSchoolId(e.target.value);
                        setEmailError(null);
                      }}
                      className="w-full backdrop-blur-sm bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                      required
                      disabled={isSubmitting || isLoadingSchools}
                    >
                      <option value="" className="bg-gray-900 text-white">
                        {isLoadingSchools ? "Loading schools..." : "Select your school"}
                      </option>
                      {schools.map((school) => (
                        <option key={school.school_id} value={school.school_id} className="bg-gray-900 text-white">
                          {school.name}
                        </option>
                      ))}
                    </select>
                    {selectedSchool && allowedDomains.length > 0 && (
                      <p className="text-xs text-white/50 mt-1.5 px-1">
                        Allowed domains: {allowedDomains.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={cn(
                        "w-full backdrop-blur-sm bg-white/5 text-white border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:bg-white/10 transition-all placeholder:text-white/40",
                        emailError
                          ? "border-red-500/50 focus:border-red-500"
                          : "border-white/10 focus:border-white/30"
                      )}
                      required
                      disabled={isSubmitting}
                    />
                    {emailError && (
                      <p className="text-xs text-red-400 mt-1.5 px-1">{emailError}</p>
                    )}
                    {schoolId && allowedDomains.length > 0 && !emailError && email && (
                      <p className="text-xs text-green-400 mt-1.5 px-1">
                        ✓ Email verified for {selectedSchool?.name}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
                      <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      placeholder="Password (min. 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full backdrop-blur-sm bg-white/5 text-white border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/40"
                      required
                      disabled={isSubmitting}
                      minLength={6}
                    />
                  </div>

                  {/* Remember Device */}
                  <div className="flex items-center px-1">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberDevice}
                        onChange={(e) => setRememberDevice(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-white focus:ring-white/50 focus:ring-offset-0 cursor-pointer"
                        disabled={isSubmitting}
                      />
                      <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                        Remember this device
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group relative w-full rounded-xl bg-white text-black font-semibold py-3.5 hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-6"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isSubmitting ? "Creating account..." : "Create Account"}
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
                    <div className="h-px bg-white/10 flex-1" />
                    <span className="text-white/40 text-sm">or</span>
                    <div className="h-px bg-white/10 flex-1" />
                  </div>

                  {/* Google Sign In (Placeholder) */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl py-3.5 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </form>

                {/* Login Link */}
                <p className="text-sm text-white/50 pt-4">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-white hover:text-white/80 underline underline-offset-2 transition-colors"
                  >
                    Log in
                  </Link>
                </p>

                {/* Terms */}
                <p className="text-xs text-white/30 pt-4 max-w-md mx-auto">
                  By creating an account, you agree to our{" "}
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
