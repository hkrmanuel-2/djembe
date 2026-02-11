import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";
import { Trophy, Flame, Music, FileCheck, Download, Star, Lock, Clock, Sparkles } from "lucide-react";

export default function StudentProgress() {
  const { userProfile } = useAuthStore();
  const {
    progress,
    badges,
    allBadges,
    recentActivities,
    isLoading,
    loadProgress,
    getXPProgress,
    getLevelInfo,
  } = useProgressStore();

  useEffect(() => {
    if (userProfile?.student_id) {
      loadProgress(userProfile.student_id);
    }
  }, [userProfile?.student_id, loadProgress]);

  const xpProgress = getXPProgress();
  const levelInfo = getLevelInfo(progress?.current_level || 1);

  // Get earned badge IDs for checking
  const earnedBadgeIds = new Set(badges.map((b) => b.badge_id));

  // Group badges by category
  const badgesByCategory = allBadges.reduce((acc, badge) => {
    const category = badge.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push({
      ...badge,
      earned: earnedBadgeIds.has(badge.id),
    });
    return acc;
  }, {} as Record<string, any[]>);

  const categoryLabels: Record<string, string> = {
    creative: "Creative",
    assignment: "Assignments",
    milestone: "Milestones",
    streak: "Streaks",
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (isLoading) {
    return (
      <div
        className="flex w-full flex-col h-screen relative overflow-x-hidden"
        style={{
          background: "linear-gradient(180deg, #F3EEFF 0%, #E8DFFF 50%, #F8F5FF 100%)",
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: '#E8DFFF', borderTopColor: '#D97746' }}
            />
            <p className="text-lg text-gray-500">Loading progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-x-hidden"
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

      {/* Gradient blobs - bigger, bolder, more colorful */}
      <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(123, 91, 168, 0.22) 0%, transparent 70%)", animation: "float 8s ease-in-out infinite" }}
        />
        <div
          className="absolute top-[15%] -right-24 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(217, 119, 70, 0.18) 0%, transparent 70%)", animation: "floatSlow 10s ease-in-out infinite 2s" }}
        />
        <div
          className="absolute -bottom-20 left-[20%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(66, 201, 201, 0.15) 0%, transparent 70%)", animation: "float 9s ease-in-out infinite 1s" }}
        />
        <div
          className="absolute top-[55%] -left-16 w-[450px] h-[450px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(242, 201, 76, 0.14) 0%, transparent 70%)", animation: "floatSlow 7s ease-in-out infinite 3s" }}
        />
        <div
          className="absolute top-[35%] right-[10%] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(232, 98, 122, 0.12) 0%, transparent 70%)", animation: "float 11s ease-in-out infinite 1.5s" }}
        />
        <div
          className="absolute top-[5%] left-[40%] w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(242, 201, 76, 0.1) 0%, transparent 70%)", animation: "floatSlow 9s ease-in-out infinite 4s" }}
        />
      </div>

      {/* Floating SVG Musical Elements - bigger, bolder */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden hidden sm:block">
        {/* Large eighth note - top left */}
        <div className="absolute top-24 left-4 md:left-12" style={{ animation: "float 4s ease-in-out infinite", opacity: 0.35 }}>
          <svg width="56" height="64" viewBox="0 0 24 30" fill="#E8627A">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#E8627A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Big star - top right */}
        <div className="absolute top-16 right-6 md:right-14" style={{ animation: "floatSlow 4.5s ease-in-out infinite 0.5s", opacity: 0.35 }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Star - top center-left */}
        <div className="absolute top-12 left-[28%]" style={{ animation: "float 5s ease-in-out infinite 1s", opacity: 0.25 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Small star - top center-right */}
        <div className="absolute top-28 right-[30%]" style={{ animation: "floatSlow 6s ease-in-out infinite 2s", opacity: 0.2 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#D97746">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Double beamed notes - left side */}
        <div className="absolute top-[50%] left-4 md:left-8" style={{ animation: "floatSlow 5s ease-in-out infinite 1s", opacity: 0.3 }}>
          <svg width="58" height="58" viewBox="0 0 32 32" fill="#E8627A">
            <rect x="6" y="2" width="2.5" height="22" rx="1" />
            <rect x="22" y="6" width="2.5" height="18" rx="1" />
            <ellipse cx="5" cy="25" rx="4.5" ry="3.5" />
            <ellipse cx="21" cy="25" rx="4.5" ry="3.5" />
            <rect x="8" y="2" width="16.5" height="2.5" rx="1" />
            <rect x="8" y="7" width="16.5" height="2.5" rx="1" />
          </svg>
        </div>

        {/* Quarter note - mid right */}
        <div className="absolute top-[45%] right-4 md:right-8" style={{ animation: "float 5s ease-in-out infinite 2s", opacity: 0.28 }}>
          <svg width="34" height="52" viewBox="0 0 16 32" fill="#42C9C9">
            <rect x="10" y="0" width="2.5" height="24" rx="1" />
            <ellipse cx="7" cy="26" rx="5.5" ry="4" />
          </svg>
        </div>

        {/* 4-point sparkle - upper area */}
        <div className="absolute top-32 left-[22%]" style={{ animation: "floatSlow 6s ease-in-out infinite 1.5s", opacity: 0.22 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#D97746">
            <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z" />
          </svg>
        </div>

        {/* Sparkle - right side mid */}
        <div className="absolute top-[32%] right-[15%]" style={{ animation: "float 5.5s ease-in-out infinite 3s", opacity: 0.2 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#D97746">
            <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z" />
          </svg>
        </div>

        {/* Large note - bottom right */}
        <div className="absolute bottom-24 right-[18%]" style={{ animation: "float 4s ease-in-out infinite 3s", opacity: 0.28 }}>
          <svg width="44" height="52" viewBox="0 0 24 30" fill="#42C9C9">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#42C9C9" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Star - lower left */}
        <div className="absolute bottom-32 left-[14%]" style={{ animation: "floatSlow 5.5s ease-in-out infinite 4s", opacity: 0.3 }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Star - mid center */}
        <div className="absolute top-[40%] left-[45%]" style={{ animation: "floatSlow 7s ease-in-out infinite 2s", opacity: 0.18 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Eighth note - bottom left */}
        <div className="absolute bottom-16 left-[6%]" style={{ animation: "float 4.5s ease-in-out infinite 0.5s", opacity: 0.25 }}>
          <svg width="42" height="50" viewBox="0 0 24 30" fill="#7B5BA8">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#7B5BA8" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Sparkle - lower center */}
        <div className="absolute bottom-12 right-[38%]" style={{ animation: "float 6s ease-in-out infinite 1.5s", opacity: 0.18 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#7B5BA8">
            <path d="M12 0l1.8 8.2L22 12l-8.2 1.8L12 22l-1.8-8.2L2 12l8.2-1.8z" />
          </svg>
        </div>

        {/* Star - right edge lower */}
        <div className="absolute top-[62%] right-4 md:right-10" style={{ animation: "floatSlow 4s ease-in-out infinite 2.5s", opacity: 0.25 }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>

        {/* Eighth note - left mid-upper */}
        <div className="absolute top-[28%] left-[5%]" style={{ animation: "floatSlow 5s ease-in-out infinite 3.5s", opacity: 0.22 }}>
          <svg width="38" height="44" viewBox="0 0 24 30" fill="#E8627A">
            <path d="M9 3v20a5 5 0 1 1-2-4V3h2z" />
            <path d="M9 3c0 0 4-1 7 2s4 6 4 6" stroke="#E8627A" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>

        {/* Small star - bottom center-left */}
        <div className="absolute bottom-44 left-[35%]" style={{ animation: "float 5s ease-in-out infinite 1s", opacity: 0.2 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#F2C94C">
            <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
          </svg>
        </div>
      </div>

      {/* Top fade overlay - prevents content showing behind navbar */}
      <div
        className="absolute top-0 left-0 right-0 h-24 z-[15] pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, #F3EEFF 0%, #F3EEFF 40%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen px-4 sm:px-6 pt-16 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Level + Mascot + XP Bar Section */}
          <motion.div variants={itemVariants} className="relative mb-8">
            {/* Mascot - absolutely positioned, bottom-aligned with the XP bar */}
            <div
              className="hidden sm:block absolute right-0 md:-right-4 bottom-0 z-[2] pointer-events-none"
              style={{ transform: 'translateY(20px)' }}
            >
              <img
                src="/ui assets/achievement_mascot.png"
                alt="Achievement mascot"
                className="w-[320px] md:w-[420px]"
                style={{
                  filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.15))",
                  transform: "scaleX(-1)",
                }}
              />
            </div>

            {/* Level info */}
            <div className="mb-1">
              <h2
                className="text-4xl sm:text-5xl font-bold mb-1"
                style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
              >
                Level <span style={{ color: '#D97746' }}>{progress?.current_level || 1}</span>
              </h2>
              <p
                className="text-xl sm:text-2xl font-semibold mb-1"
                style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
              >
                {levelInfo.name}
              </p>
              <p className="text-base text-gray-400">
                {progress?.total_xp?.toLocaleString() || 0} Total XP
              </p>
            </div>

            {/* XP Progress Bar - shortened so it ends at mascot's feet */}
            <div
              className="rounded-2xl p-5 bg-white shadow-sm border-2 sm:mr-[180px] md:mr-[240px]"
              style={{ borderColor: '#E8DFFF' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-5 bg-gray-100 rounded-full overflow-hidden relative">
                    {/* Star decorations along the bar */}
                    <div className="absolute inset-0 flex items-center justify-around px-2 z-10 pointer-events-none">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < Math.floor(xpProgress.percentage / 8.33) ? "#F2C94C" : "#D1D5DB"} opacity={0.5}>
                          <path d="M12 2l2.09 6.26L20.18 9l-5.09 3.74L16.18 19 12 15.27 7.82 19l1.09-6.26L3.82 9l6.09-.74z" />
                        </svg>
                      ))}
                    </div>
                    <motion.div
                      className="h-full rounded-full relative"
                      style={{ background: "linear-gradient(90deg, #D97746, #E6B84D)" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress.percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
                <span
                  className="text-sm font-semibold whitespace-nowrap"
                  style={{ color: '#3E2468' }}
                >
                  {xpProgress.current} / {xpProgress.needed} XP
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid - First Steps achievement + stat cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-10">
            {/* First Steps - special achievement card */}
            <div
              className="rounded-2xl p-4 bg-white border-2 text-center col-span-1"
              style={{ borderColor: '#E6B84D', boxShadow: '0 4px 16px rgba(230, 184, 77, 0.15)' }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: 'linear-gradient(135deg, #F2C94C20, #D9774620)' }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="14" width="20" height="6" rx="2" fill="#D97746" />
                  <rect x="4" y="10" width="4" height="4" rx="1" fill="#3E2468" />
                  <rect x="8" y="10" width="4" height="4" rx="1" fill="white" stroke="#E8DFFF" />
                  <rect x="12" y="10" width="4" height="4" rx="1" fill="#3E2468" />
                  <rect x="16" y="10" width="4" height="4" rx="1" fill="white" stroke="#E8DFFF" />
                  <path d="M14 6c0 0 2-2 4-2s4 2 4 2" stroke="#E8627A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <p
                className="font-bold text-sm mb-0.5"
                style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
              >
                First Steps
              </p>
              <p className="text-xs text-gray-400 mb-1.5">Create your first music project</p>
              <div className="flex items-center justify-center gap-1">
                <span className="text-xs font-bold" style={{ color: '#4CAF50' }}>+25 XP</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50">
                  <circle cx="12" cy="12" r="10" fill="#4CAF50" />
                  <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>

            {/* Projects */}
            <StatCard
              icon={<Music size={22} />}
              label="Projects"
              value={progress?.projects_created || 0}
              color="#7B5BA8"
            />

            {/* Time Spent */}
            <StatCard
              icon={<Clock size={22} />}
              label="Time Spent"
              value={formatTimeSpent(progress?.total_time_minutes || 0)}
              color="#42C9C9"
            />

            {/* Exports */}
            <StatCard
              icon={<Download size={22} />}
              label="Exports"
              value={progress?.projects_exported || 0}
              color="#D97746"
            />

            {/* Streak */}
            <StatCard
              icon={<Flame size={22} />}
              label="Streak"
              value={`${progress?.current_streak || 0} days`}
              color="#E8627A"
            />
          </motion.div>

          {/* Badge Collection */}
          <motion.div variants={itemVariants}>
            <h2
              className="text-2xl sm:text-3xl font-bold mb-6 flex items-center justify-center gap-2"
              style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
            >
              <Star size={24} style={{ color: '#E6B84D' }} />
              BADGE COLLECTION
            </h2>

            {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
              <div key={category} className="mb-8">
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{ color: '#5B3D8F', fontFamily: "'Fredoka', sans-serif" }}
                >
                  {categoryLabels[category] || category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {categoryBadges.map((badge) => (
                    <BadgeCard
                      key={badge.id}
                      name={badge.name}
                      description={badge.description}
                      icon={badge.icon}
                      earned={badge.earned}
                      xpReward={badge.xp_reward}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Recent Activity */}
          {recentActivities.length > 0 && (
            <motion.div variants={itemVariants} className="mt-10">
              <h2
                className="text-2xl font-bold mb-6 flex items-center gap-2"
                style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
              >
                <Sparkles size={20} style={{ color: '#D97746' }} />
                Recent Activity
              </h2>
              <div
                className="rounded-2xl bg-white shadow-sm border-2 overflow-hidden"
                style={{ borderColor: '#E8DFFF' }}
              >
                {recentActivities.slice(0, 10).map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`px-5 sm:px-6 py-4 flex items-center justify-between ${
                      index !== Math.min(recentActivities.length, 10) - 1 ? "border-b" : ""
                    }`}
                    style={{ borderColor: '#E8DFFF' }}
                  >
                    <div>
                      <p className="font-medium text-sm sm:text-base" style={{ color: '#3E2468' }}>{activity.description}</p>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        {new Date(activity.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0 ml-3"
                      style={{ backgroundColor: "rgba(230, 184, 77, 0.15)", color: "#E6B84D" }}
                    >
                      +{activity.xp_awarded} XP
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Format minutes into readable time string
function formatTimeSpent(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 bg-white shadow-sm border-2 text-center"
      style={{ borderColor: '#E8DFFF' }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <p
        className="text-xl sm:text-2xl font-bold"
        style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}
      >
        {value}
      </p>
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function BadgeCard({
  name,
  description,
  icon,
  earned,
  xpReward,
}: {
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  xpReward: number;
}) {
  return (
    <div
      className={`relative rounded-2xl p-4 border-2 text-center transition-all ${
        earned ? "bg-white shadow-sm" : "bg-gray-50/60"
      }`}
      style={{
        borderColor: earned ? '#E6B84D' : '#E8DFFF',
      }}
    >
      {!earned && (
        <div className="absolute top-3 right-3">
          <Lock size={14} className="text-gray-300" />
        </div>
      )}
      <div className={`text-3xl mb-2 ${!earned ? 'grayscale opacity-40' : ''}`}>{icon}</div>
      <p
        className="font-bold text-sm mb-1"
        style={{
          color: earned ? '#3E2468' : '#9CA3AF',
          fontFamily: "'Fredoka', sans-serif",
        }}
      >
        {name}
      </p>
      <p className="text-xs text-gray-400 mb-2 leading-tight">{description}</p>
      {earned ? (
        <span className="text-xs font-bold" style={{ color: '#E8627A' }}>UNLOCK!</span>
      ) : (
        <span className="text-xs text-gray-400">Locked</span>
      )}
    </div>
  );
}
