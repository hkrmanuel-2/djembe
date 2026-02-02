import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { LucideIcon, User, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

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

  // Determine active tab based on current location
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

  // Close menu when route changes
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
          <div className="flex items-center justify-between bg-black/40 backdrop-blur-md py-2 px-3 sm:px-4 rounded-full border border-white/10">
            {/* Logo - Always visible */}
            <RouterLink to="/home" className="flex items-center gap-2 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-base"
                style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}
              >
                🪘
              </div>
              <span className="text-base font-bold text-white hidden sm:block">Djembe</span>
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
                      "relative cursor-pointer text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2",
                      isActive
                        ? "text-black bg-white shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/10",
                    )}
                  >
                    <Icon size={16} strokeWidth={2} />
                    <span>{item.name}</span>
                  </RouterLink>
                )
              })}
            </div>

            {/* Mobile Navigation Icons - Show first 4 items */}
            <div className="flex md:hidden items-center gap-3">
              {items.slice(0, 4).map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.name

                return (
                  <RouterLink
                    key={item.name}
                    to={item.url}
                    className={cn(
                      "relative cursor-pointer p-2.5 rounded-full transition-all duration-200",
                      isActive
                        ? "text-black bg-white shadow-sm"
                        : "text-white/70 hover:text-white hover:bg-white/10",
                    )}
                    title={item.name}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </RouterLink>
                )
              })}
            </div>

            {/* Profile Section */}
            {userProfile && (
              <div className="flex items-center gap-2 ml-2">
                <div className="hidden sm:block w-px h-5 bg-white/20" />

                {/* Desktop Profile */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="flex items-center gap-2 text-white/90">
                    <User size={16} strokeWidth={2} />
                    <span className="text-sm font-medium">{userProfile.first_name}</span>
                  </div>
                  <div className="w-px h-4 bg-white/20" />
                  <button
                    onClick={onSignOut}
                    className="transition-colors hover:opacity-80 p-1"
                    style={{ color: '#E6B84D' }}
                    title="Sign Out"
                  >
                    <LogOut size={16} strokeWidth={2} />
                  </button>
                </div>

                {/* Mobile Menu Toggle */}
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
      {showMobileMenu && isMobile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed top-20 left-4 right-4 z-50 bg-black/90 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-2xl"
        >
          {/* Profile Info */}
          {userProfile && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{ background: 'linear-gradient(135deg, #D97746 0%, #E6B84D 100%)' }}
                >
                  {userProfile.first_name.charAt(0)}
                </div>
                <div>
                  <p className="text-white font-medium">{userProfile.first_name}</p>
                  <p className="text-white/50 text-xs">Student</p>
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors hover:bg-white/10"
                style={{ color: '#E6B84D' }}
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
                    isActive
                      ? "text-black bg-white"
                      : "text-white/70 hover:text-white hover:bg-white/10",
                  )}
                >
                  <Icon size={20} strokeWidth={2} />
                  <span className="font-medium">{item.name}</span>
                </RouterLink>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Overlay for mobile menu */}
      {showMobileMenu && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  )
}
