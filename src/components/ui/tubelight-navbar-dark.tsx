import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { LucideIcon, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import NotificationBell from "./NotificationBell"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
  userProfile?: {
    first_name: string
  } | null
  onSignOut?: () => void
}

export function NavBarDark({ items, className, userProfile, onSignOut }: NavBarProps) {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const activeItem = items.find(item => {
    if (item.url === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(item.url)
  })

  const activeTab = activeItem?.name || items[0]?.name

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setShowMobileMenu(false)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    setShowMobileMenu(false)
  }, [location.pathname])

  return (
    <>
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 px-4 pt-4 sm:pt-6",
          className,
        )}
      >
        <div className="max-w-5xl mx-auto">
          <div
            className="flex items-center justify-between py-2 px-3 sm:px-4 rounded-full border shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3E2468 0%, #5B3D8F 100%)',
              borderColor: 'rgba(155, 125, 200, 0.3)',
            }}
          >
            {/* Colorful Logo */}
            <RouterLink to="/home" className="flex items-center gap-2 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}
              >
                🪘
              </div>
              <span className="text-base font-bold hidden lg:block" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                <span style={{ color: "#D97746" }}>D</span>
                <span style={{ color: "#42C9C9" }}>J</span>
                <span style={{ color: "#F2C94C" }}>E</span>
                <span style={{ color: "#E8627A" }}>M</span>
                <span style={{ color: "#9B7DC8" }}>B</span>
                <span style={{ color: "#4ABA6E" }}>E</span>
              </span>
            </RouterLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {items.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <RouterLink
                    key={item.name}
                    to={item.url}
                    className={cn(
                      "relative cursor-pointer text-sm font-medium px-3 py-2 rounded-full transition-all duration-200 flex items-center gap-2",
                      isActive
                        ? "shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/10",
                    )}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, #F2C94C 0%, #D97746 100%)',
                      color: '#3E2468',
                      fontFamily: "'Fredoka', sans-serif",
                    } : { fontFamily: "'Outfit', sans-serif" }}
                    title={item.name}
                  >
                    <Icon size={18} strokeWidth={2} />
                    {isActive && <span>{item.name}</span>}
                  </RouterLink>
                )
              })}
            </div>

            {/* Mobile Navigation Icons */}
            <div className="flex md:hidden items-center gap-1">
              {items.slice(0, 4).map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <RouterLink
                    key={item.name}
                    to={item.url}
                    className={cn(
                      "relative cursor-pointer p-2 rounded-full transition-all duration-200",
                      !isActive && "text-white/70 hover:text-white hover:bg-white/10",
                    )}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, #F2C94C 0%, #D97746 100%)',
                      color: '#3E2468',
                    } : undefined}
                    title={item.name}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </RouterLink>
                )
              })}
            </div>

            {/* Right Section */}
            {userProfile && (
              <div className="flex items-center gap-2">
                <NotificationBell />

                <button
                  onClick={onSignOut}
                  className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full transition-colors hover:bg-white/10"
                  title="Sign Out"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #E8627A 0%, #D97746 100%)' }}
                  >
                    {userProfile.first_name.charAt(0)}
                  </div>
                  <LogOut size={16} className="text-white/60" />
                </button>

                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="sm:hidden p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {showMobileMenu && isMobile && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-20 left-4 right-4 z-50 rounded-2xl p-4 shadow-2xl border"
              style={{
                background: 'linear-gradient(135deg, #3E2468 0%, #5B3D8F 100%)',
                borderColor: 'rgba(155, 125, 200, 0.3)',
              }}
            >
              {/* Profile Info */}
              {userProfile && (
                <div className="flex items-center justify-between pb-4 mb-4" style={{ borderBottom: '1px solid rgba(155, 125, 200, 0.2)' }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #E8627A 0%, #D97746 100%)' }}
                    >
                      {userProfile.first_name.charAt(0)}
                    </div>
                    <p className="text-white font-medium" style={{ fontFamily: "'Fredoka', sans-serif" }}>{userProfile.first_name}</p>
                  </div>
                  <button
                    onClick={onSignOut}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors hover:bg-white/10"
                    style={{ color: '#F2C94C' }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              {/* All Navigation Items */}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.name

                  return (
                    <RouterLink
                      key={item.name}
                      to={item.url}
                      onClick={() => setShowMobileMenu(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        !isActive && "text-white/70 hover:text-white hover:bg-white/10",
                      )}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, #F2C94C 0%, #D97746 100%)',
                        color: '#3E2468',
                        fontFamily: "'Fredoka', sans-serif",
                      } : undefined}
                    >
                      <Icon size={20} strokeWidth={2} />
                      <span className="font-medium">{item.name}</span>
                    </RouterLink>
                  )
                })}
              </div>
            </motion.div>

            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ backgroundColor: 'rgba(62, 36, 104, 0.5)' }}
              onClick={() => setShowMobileMenu(false)}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
