import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";
import CloudShader from "@/components/ui/cloud-shader";
import { Trophy, Flame, Music, FileCheck, Download, Star, Lock, Clock } from "lucide-react";

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
        className="flex w-full flex-col min-h-screen relative overflow-hidden"
        style={{ backgroundColor: "#1A2B4A" }}
      >
        <div className="absolute inset-0 z-0">
          <CloudShader speed={0.3} octaves={5} scale={2.5} className="w-full h-full opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 border-white/20 rounded-full animate-spin mx-auto mb-4"
              style={{ borderTopColor: "#D97746" }}
            />
            <p className="text-lg text-white/70">Loading progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex w-full flex-col min-h-screen relative overflow-hidden"
      style={{ backgroundColor: "#1A2B4A", fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <CloudShader speed={0.3} octaves={5} scale={2.5} className="w-full h-full opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen px-6 py-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border mb-4"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}
            >
              <Trophy size={16} style={{ color: "#E6B84D" }} />
              <span className="text-sm font-medium text-white/90">Your Progress</span>
            </div>

            <h1 className="text-5xl font-bold text-white mb-2">
              Level <span style={{ color: "#D97746" }}>{progress?.current_level || 1}</span>
            </h1>
            <p className="text-2xl text-white/80 mb-1">{levelInfo.name}</p>
            <p className="text-lg text-white/50">
              {progress?.total_xp?.toLocaleString() || 0} Total XP
            </p>
          </motion.div>

          {/* XP Progress Bar */}
          <motion.div variants={itemVariants} className="mb-10">
            <div
              className="rounded-2xl p-6 backdrop-blur-md border"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-white/70 text-sm">Progress to Level {(progress?.current_level || 1) + 1}</span>
                <span className="text-white font-medium">
                  {xpProgress.current} / {xpProgress.needed} XP
                </span>
              </div>
              <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, #D97746, #E6B84D)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <StatCard
              icon={<Music size={24} />}
              label="Projects"
              value={progress?.projects_created || 0}
              color="#4A9B9B"
            />
            <StatCard
              icon={<FileCheck size={24} />}
              label="Assignments"
              value={progress?.assignments_completed || 0}
              color="#D97746"
            />
            <StatCard
              icon={<Download size={24} />}
              label="Exports"
              value={progress?.projects_exported || 0}
              color="#E6B84D"
            />
            <StatCard
              icon={<Clock size={24} />}
              label="Time Spent"
              value={formatTimeSpent(progress?.total_time_minutes || 0)}
              color="#4A9B9B"
            />
            <StatCard
              icon={<Flame size={24} />}
              label="Streak"
              value={`${progress?.current_streak || 0} days`}
              color="#D97746"
            />
          </motion.div>

          {/* Badges Section */}
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Star style={{ color: "#E6B84D" }} />
              Badges
            </h2>

            {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold text-white/80 mb-4">
                  {categoryLabels[category] || category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
              <div
                className="rounded-2xl backdrop-blur-md border overflow-hidden"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }}
              >
                {recentActivities.slice(0, 10).map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`px-6 py-4 flex items-center justify-between ${
                      index !== recentActivities.length - 1 ? "border-b border-white/10" : ""
                    }`}
                  >
                    <div>
                      <p className="text-white font-medium">{activity.description}</p>
                      <p className="text-white/50 text-sm">
                        {new Date(activity.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 rounded-full text-sm font-semibold"
                      style={{ backgroundColor: "rgba(230, 184, 77, 0.2)", color: "#E6B84D" }}
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
      className="rounded-xl p-5 backdrop-blur-md border text-center"
      style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }}
    >
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
        style={{ backgroundColor: `${color}30`, color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-white/60 text-sm">{label}</p>
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
      className={`relative rounded-xl p-4 backdrop-blur-md border text-center transition-all ${
        earned ? "border-yellow-500/50" : "opacity-60"
      }`}
      style={{
        backgroundColor: earned ? "rgba(230, 184, 77, 0.1)" : "rgba(255,255,255,0.05)",
        borderColor: earned ? "rgba(230, 184, 77, 0.3)" : "rgba(255,255,255,0.1)",
      }}
    >
      {!earned && (
        <div className="absolute top-2 right-2">
          <Lock size={14} className="text-white/40" />
        </div>
      )}
      <div className="text-3xl mb-2">{icon}</div>
      <p className={`font-semibold text-sm mb-1 ${earned ? "text-white" : "text-white/60"}`}>{name}</p>
      <p className="text-xs text-white/50 mb-2">{description}</p>
      {earned ? (
        <span className="text-xs text-yellow-400">+{xpReward} XP</span>
      ) : (
        <span className="text-xs text-white/40">Locked</span>
      )}
    </div>
  );
}
