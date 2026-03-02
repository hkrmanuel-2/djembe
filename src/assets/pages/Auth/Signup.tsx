import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { supabase } from "@/lib/supabase";
import { validateEmailDomain } from "@/lib/emailValidation";
import { Mail, Lock, User, Building2, ArrowRight, ArrowLeft } from "lucide-react";
import { logger } from "@/lib/logger";

interface School {
  school_id: string;
  name: string;
  allowed_domains?: string[] | null;
}

// Sprite sheet face positions (row, col) for the 3x3 grid
const STEP_FACES: Record<number, { row: number; col: number }> = {
  1: { row: 0, col: 0 },  // Happy/smiling
  2: { row: 0, col: 1 },  // Surprised
  3: { row: 2, col: 2 },  // Music/sleepy
  4: { row: 1, col: 1 },  // Angry/determined
  5: { row: 0, col: 0 },  // Happy/smiling (success)
};

const STEP_COLORS = ["#42C9C9", "#F2C94C", "#4ABA6E", "#D97746", "#7B5BA8"];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

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
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const navigate = useNavigate();
  const { signUp, error, clearError } = useAuthStore();

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
        logger.warn("No schools found in database");
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

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // --- Carousel navigation ---
  const goNext = () => {
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 5));
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 1: return !!userType;
      case 2: return !!firstName.trim() && !!lastName.trim();
      case 3: return !!schoolId;
      case 4: return !!email && !!password && password.length >= 6 && !emailError;
      default: return false;
    }
  };

  const handleFinalSubmit = async () => {
    setDirection(1);
    setCurrentStep(5);
    setIsSubmitting(true);
    clearError();
    setEmailError(null);

    if (!schoolId) {
      useAuthStore.setState({ error: "Please select a school" });
      setIsSubmitting(false);
      setCurrentStep(3);
      return;
    }

    if (email && schoolId) {
      const validation = validateEmailDomain(email, allowedDomains);
      if (!validation.isValid) {
        setEmailError(validation.error || "Invalid email domain");
        useAuthStore.setState({ error: validation.error || "Invalid email domain" });
        setIsSubmitting(false);
        setCurrentStep(4);
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
      setIsSubmitting(false);
      setTimeout(() => navigate("/"), 1200);
    } else {
      setIsSubmitting(false);
      setDirection(-1);
      setCurrentStep(4);
    }
  };

  // --- Drum face helper ---
  const DrumFace = ({ step, size }: { step: number; size?: string }) => {
    const face = STEP_FACES[step] || { row: 0, col: 0 };
    return (
      <motion.div
        key={`face-${step}`}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
        className={`${size || "w-28 h-28 sm:w-32 sm:h-32"} mx-auto`}
        style={{
          backgroundImage: `url('/ui assets/djembe_faces.png')`,
          backgroundSize: "300% 300%",
          backgroundPosition: `${face.col * 50}% ${face.row * 50}%`,
          backgroundRepeat: "no-repeat",
          filter: "drop-shadow(0 6px 20px rgba(62, 36, 104, 0.25))",
        }}
      />
    );
  };

  // --- Navigation buttons ---
  const NavButtons = ({ onNext, nextLabel = "Next", nextDisabled = false }: {
    onNext: () => void;
    nextLabel?: string;
    nextDisabled?: boolean;
  }) => (
    <div className="flex gap-3 pt-2">
      {currentStep > 1 && (
        <button
          type="button"
          onClick={goBack}
          className="flex-shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all hover:bg-white/10"
          style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }}
        >
          <ArrowLeft size={22} />
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="group relative flex-1 rounded-2xl font-semibold py-4 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden text-white text-lg"
        style={{
          background: nextDisabled
            ? "#ccc"
            : "linear-gradient(135deg, #D97746 0%, #E6B84D 100%)",
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {nextLabel}
          <ArrowRight
            size={20}
            className="transform group-hover:translate-x-1 transition-transform"
          />
        </span>
        {!nextDisabled && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        )}
      </button>
    </div>
  );

  // --- Step renderers ---
  const renderStep1 = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-1">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "white", fontFamily: "'Fredoka', sans-serif" }}
        >
          Who are you?
        </h2>
        <p className="text-white/60 text-sm sm:text-base">Pick your role to get started!</p>
      </div>

      <DrumFace step={1} />

      <div className="grid grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setUserType("student");
            setTimeout(goNext, 300);
          }}
          className="flex flex-col items-center gap-2 p-5 sm:p-6 rounded-2xl border-[3px] transition-all"
          style={{
            borderColor: userType === "student" ? "#42C9C9" : "rgba(255,255,255,0.15)",
            background: userType === "student"
              ? "linear-gradient(135deg, rgba(66,201,201,0.25) 0%, rgba(66,201,201,0.1) 100%)"
              : "rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-4xl">🎵</span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "'Fredoka', sans-serif", color: "white" }}
          >
            Student
          </span>
          <span className="text-xs text-white/50">I'm here to learn!</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => {
            setUserType("teacher");
            setTimeout(goNext, 300);
          }}
          className="flex flex-col items-center gap-2 p-5 sm:p-6 rounded-2xl border-[3px] transition-all"
          style={{
            borderColor: userType === "teacher" ? "#D97746" : "rgba(255,255,255,0.15)",
            background: userType === "teacher"
              ? "linear-gradient(135deg, rgba(217,119,70,0.25) 0%, rgba(217,119,70,0.1) 100%)"
              : "rgba(255,255,255,0.08)",
          }}
        >
          <span className="text-4xl">🎓</span>
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "'Fredoka', sans-serif", color: "white" }}
          >
            Teacher
          </span>
          <span className="text-xs text-white/50">I'm here to teach!</span>
        </motion.button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-1">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "white", fontFamily: "'Fredoka', sans-serif" }}
        >
          What's your name?
        </h2>
        <p className="text-white/60 text-sm sm:text-base">Tell us about yourself!</p>
      </div>

      <DrumFace step={2} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canAdvance()) goNext();
        }}
        className="space-y-4 text-left"
      >
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }}>
            <User size={20} />
          </div>
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none transition-all placeholder:text-gray-300"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "white", backgroundColor: "rgba(255,255,255,0.08)" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
            autoFocus
          />
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }}>
            <User size={20} />
          </div>
          <input
            type="text"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none transition-all placeholder:text-gray-300"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "white", backgroundColor: "rgba(255,255,255,0.08)" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
          />
        </div>

        <NavButtons onNext={goNext} nextDisabled={!canAdvance()} />
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 text-center">
      <div className="space-y-1">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "white", fontFamily: "'Fredoka', sans-serif" }}
        >
          Where do you learn?
        </h2>
        <p className="text-white/60 text-sm sm:text-base">Find your school!</p>
      </div>

      <DrumFace step={3} />

      <div className="space-y-4 text-left">
        <div className="relative">
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <Building2 size={22} />
          </div>
          <select
            value={schoolId}
            onChange={(e) => {
              setSchoolId(e.target.value);
              setEmailError(null);
            }}
            className="w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none transition-all appearance-none cursor-pointer"
            style={{
              borderColor: "rgba(255,255,255,0.2)",
              color: schoolId ? "white" : "rgba(255,255,255,0.4)",
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
            disabled={isLoadingSchools}
          >
            <option value="">
              {isLoadingSchools ? "Loading schools..." : "Select your school"}
            </option>
            {schools.map((school) => (
              <option key={school.school_id} value={school.school_id}>
                {school.name}
              </option>
            ))}
          </select>
          {selectedSchool && allowedDomains.length > 0 && (
            <p className="text-xs mt-2 px-1 text-white/40">
              Allowed domains: {allowedDomains.join(", ")}
            </p>
          )}
        </div>

        <NavButtons onNext={goNext} nextDisabled={!canAdvance()} />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5 text-center">
      <div className="space-y-1">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "white", fontFamily: "'Fredoka', sans-serif" }}
        >
          Almost there!
        </h2>
        <p className="text-white/60 text-sm sm:text-base">Set up your login</p>
      </div>

      <DrumFace step={4} />

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border px-4 py-3 rounded-xl text-sm text-left"
          style={{
            backgroundColor: "rgba(232, 98, 122, 0.1)",
            borderColor: "rgba(232, 98, 122, 0.3)",
            color: "#E8627A",
          }}
        >
          {error}
        </motion.div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canAdvance()) handleFinalSubmit();
        }}
        className="space-y-4 text-left"
      >
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Mail size={20} />
          </div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none transition-all placeholder:text-gray-300"
            style={{
              borderColor: emailError ? "#E8627A" : "rgba(255,255,255,0.2)",
              color: "white",
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = emailError ? "#E8627A" : "rgba(255,255,255,0.4)")
            }
            onBlur={(e) =>
              (e.target.style.borderColor = emailError ? "#E8627A" : "rgba(255,255,255,0.2)")
            }
            autoFocus
          />
          {emailError && (
            <p className="text-xs mt-1.5 px-1" style={{ color: "#E8627A" }}>
              {emailError}
            </p>
          )}
          {schoolId && allowedDomains.length > 0 && !emailError && email && (
            <p className="text-xs mt-1.5 px-1" style={{ color: "#4ABA6E" }}>
              Email verified for {selectedSchool?.name}
            </p>
          )}
        </div>

        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Lock size={20} />
          </div>
          <input
            type="password"
            placeholder="Password (min. 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none transition-all placeholder:text-gray-300"
            style={{ borderColor: "rgba(255,255,255,0.2)", color: "white", backgroundColor: "rgba(255,255,255,0.08)" }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.4)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
            minLength={6}
          />
        </div>

        <div className="flex items-center px-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-5 h-5 rounded cursor-pointer accent-[#7B5BA8]"
            />
            <span className="text-sm text-white/60">Remember this device</span>
          </label>
        </div>

        <NavButtons
          onNext={handleFinalSubmit}
          nextLabel="Create Account"
          nextDisabled={!canAdvance()}
        />
      </form>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 text-center py-6">
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <DrumFace step={5} size="w-32 h-32 sm:w-40 sm:h-40" />
      </motion.div>

      <div className="space-y-2">
        <h2
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: "white", fontFamily: "'Fredoka', sans-serif" }}
        >
          {isSubmitting ? "Creating your account..." : "You're all set!"}
        </h2>
        <p className="text-white/60">
          {isSubmitting ? "This will just take a moment" : "Welcome to Djembe!"}
        </p>
      </div>

      {isSubmitting && (
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#7B5BA8" }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}

      {!isSubmitting && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #4ABA6E 0%, #42C9C9 100%)",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
    </div>
  );

  // --- Main render ---
  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #3E2468 0%, #5B3D8F 50%, #7B5BA8 100%)",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
        <div className="absolute top-32 left-20 text-3xl opacity-20" style={{ animation: "float 4s ease-in-out infinite 0.5s" }}>🎶</div>
        <div className="absolute bottom-48 right-24 text-4xl opacity-25" style={{ animation: "float 3.5s ease-in-out infinite 1.5s" }}>⭐</div>
        <div className="absolute top-2/3 right-16 text-2xl opacity-15" style={{ animation: "float 5s ease-in-out infinite" }}>✨</div>
        <div className="absolute top-24 right-32 text-3xl opacity-20" style={{ animation: "float 4.5s ease-in-out infinite 1s" }}>🪘</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Navigation */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-4 sm:pt-6 px-4 w-full sm:w-auto">
          <div
            className="flex items-center justify-center gap-2 sm:gap-3 py-2 px-2 sm:px-3 rounded-full border shadow-lg max-w-full"
            style={{
              background: "linear-gradient(135deg, #3E2468 0%, #5B3D8F 100%)",
              borderColor: "rgba(155, 125, 200, 0.3)",
            }}
          >
            <Link to="/" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-base sm:text-lg"
                style={{ background: "linear-gradient(135deg, #D97746 0%, #E6B84D 100%)" }}
              >
                🪘
              </div>
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
        <div className="flex flex-1 flex-col justify-center items-center px-4 sm:px-6 py-16 sm:py-24">
          <div className="w-full mt-[60px] sm:mt-[60px] max-w-lg">
            {/* Progress Dots */}
            {currentStep <= 4 && (
              <div className="flex justify-center gap-2.5 mb-6">
                {[1, 2, 3, 4].map((step) => (
                  <motion.div
                    key={step}
                    className="rounded-full h-2.5"
                    animate={{
                      width: step === currentStep ? 32 : 10,
                      backgroundColor:
                        step <= currentStep
                          ? STEP_COLORS[currentStep - 1]
                          : "rgba(255,255,255,0.25)",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                ))}
              </div>
            )}

            {/* Carousel */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {/* Card */}
                <div
                  className="rounded-3xl shadow-2xl p-7 sm:p-10 border border-white/10 relative overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, rgba(91,61,143,0.85) 0%, rgba(62,36,104,0.92) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                  {currentStep === 5 && renderStep5()}
                </div>

                {/* Login link */}
                {(currentStep === 1 || currentStep === 4) && (
                  <p className="text-sm text-center mt-4 text-white/70">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold underline underline-offset-2 transition-colors hover:text-white"
                      style={{ color: "#F2C94C" }}
                    >
                      Log in
                    </Link>
                  </p>
                )}

                {/* Terms */}
                {currentStep <= 4 && (
                  <p className="text-xs text-center pt-4 max-w-md mx-auto text-white/50">
                    By creating an account, you agree to our{" "}
                    <Link to="#" className="underline hover:text-white/70 transition-colors">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="#" className="underline hover:text-white/70 transition-colors">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
