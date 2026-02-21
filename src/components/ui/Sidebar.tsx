import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { LucideIcon, LogOut } from "lucide-react";
import NotificationBell from "./NotificationBell";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavItem[];
  userProfile?: {
    first_name: string;
  } | null;
  onSignOut?: () => void;
}

// Fun accent colors for each nav item name
const itemColors: Record<string, string> = {
  Home: "#F2C94C",
  "Music Studio": "#D97746",
  Challenges: "#42C9C9",
  "My Journey": "#E8627A",
  Tutorials: "#4ABA6E",
  Worlds: "#9B7DC8",
  Settings: "#A0A0A0",
  // Teacher items
  Students: "#F2C94C",
  Submissions: "#E8627A",
  Analytics: "#42C9C9",
  Projects: "#D97746",
};

function getItemColor(name: string) {
  return itemColors[name] || "#9B7DC8";
}

export function Sidebar({ items, userProfile, onSignOut }: SidebarProps) {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const activeItem = items.find((item) => {
    if (item.url === "/") return location.pathname === "/";
    return location.pathname.startsWith(item.url);
  });
  const activeTab = activeItem?.name || items[0]?.name;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileExpanded(false);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile expanded on route change
  useEffect(() => {
    setMobileExpanded(false);
  }, [location.pathname]);

  const sidebarWidth = isMobile && !mobileExpanded ? 60 : 220;

  const sidebarContent = (expanded: boolean) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-4 flex-shrink-0"
        style={{ height: 64 }}
      >
        <RouterLink
          to="/home"
          className="flex items-center gap-2 w-full"
          style={{ justifyContent: expanded ? "flex-start" : "center" }}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #D97746 0%, #E6B84D 100%)",
            }}
          >
            🪘
          </div>
          {expanded && (
            <span
              className="text-lg font-bold whitespace-nowrap"
              style={{ fontFamily: "'Fredoka', sans-serif" }}
            >
              <span style={{ color: "#D97746" }}>D</span>
              <span style={{ color: "#42C9C9" }}>J</span>
              <span style={{ color: "#F2C94C" }}>E</span>
              <span style={{ color: "#E8627A" }}>M</span>
              <span style={{ color: "#9B7DC8" }}>B</span>
              <span style={{ color: "#4ABA6E" }}>E</span>
            </span>
          )}
        </RouterLink>
      </div>

      {/* Divider */}
      <div
        className="mx-3 mb-2"
        style={{
          height: 1,
          background: "rgba(155, 125, 200, 0.2)",
        }}
      />

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;
          const color = getItemColor(item.name);

          return (
            <RouterLink key={item.name} to={item.url} title={item.name}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  height: 48,
                  padding: expanded ? "0 14px" : "0",
                  justifyContent: expanded ? "flex-start" : "center",
                  background: isActive ? color : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
                  fontFamily: "'Fredoka', sans-serif",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 15,
                }}
              >
                <Icon size={24} strokeWidth={2} />
                {expanded && <span>{item.name}</span>}
              </motion.div>
            </RouterLink>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="flex-shrink-0 px-2 pb-3">
        {/* Divider */}
        <div
          className="mx-1 mb-3"
          style={{
            height: 1,
            background: "rgba(155, 125, 200, 0.2)",
          }}
        />

        {/* Notification Bell */}
        <div
          className="flex mb-2"
          style={{ justifyContent: expanded ? "flex-start" : "center", paddingLeft: expanded ? 14 : 0 }}
        >
          <NotificationBell />
        </div>

        {/* User profile + sign out */}
        {userProfile && (
          <div
            className="flex items-center gap-3 rounded-xl px-3 py-2"
            style={{
              justifyContent: expanded ? "flex-start" : "center",
              background: "rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #E8627A 0%, #D97746 100%)",
              }}
            >
              {userProfile.first_name.charAt(0)}
            </div>
            {expanded && (
              <>
                <span
                  className="text-white text-sm font-medium flex-1 truncate"
                  style={{ fontFamily: "'Fredoka', sans-serif" }}
                >
                  {userProfile.first_name}
                </span>
                <button
                  onClick={onSignOut}
                  className="text-white/50 hover:text-white transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar */}
      <div
        className="fixed top-0 left-0 h-screen z-40 flex-shrink-0 transition-all duration-200"
        style={{
          width: sidebarWidth,
          background: "linear-gradient(180deg, #3E2468 0%, #5B3D8F 100%)",
          borderRight: "1px solid rgba(155, 125, 200, 0.2)",
        }}
      >
        {sidebarContent(!isMobile || mobileExpanded)}
      </div>

      {/* Mobile: tap collapsed strip to expand */}
      {isMobile && !mobileExpanded && (
        <div
          className="fixed top-0 left-0 h-screen z-41 cursor-pointer"
          style={{ width: 60 }}
          onClick={() => setMobileExpanded(true)}
          aria-label="Expand navigation"
        />
      )}

      {/* Mobile expanded overlay */}
      <AnimatePresence>
        {isMobile && mobileExpanded && (
          <>
            {/* Expanded sidebar on top */}
            <motion.div
              initial={{ x: -160 }}
              animate={{ x: 0 }}
              exit={{ x: -160 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-screen z-50"
              style={{
                width: 220,
                background:
                  "linear-gradient(180deg, #3E2468 0%, #5B3D8F 100%)",
                borderRight: "1px solid rgba(155, 125, 200, 0.2)",
              }}
            >
              {sidebarContent(true)}
            </motion.div>

            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-45"
              style={{ backgroundColor: "rgba(62, 36, 104, 0.5)" }}
              onClick={() => setMobileExpanded(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  );
}
