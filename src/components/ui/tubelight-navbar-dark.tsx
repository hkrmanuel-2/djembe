import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBarDark({ items, className }: NavBarProps) {
  const location = useLocation()
  const [isMobile, setIsMobile] = useState(false)

  // Determine active tab based on current location
  const activeItem = items.find(item => {
    if (item.url === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(item.url)
  })

  const activeTab = activeItem?.name || items[0].name

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md py-2 px-2 rounded-full border border-white/10">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <RouterLink
              key={item.name}
              to={item.url}
              className={cn(
                "relative cursor-pointer text-sm font-medium px-6 py-2.5 rounded-full transition-all duration-200 flex items-center gap-2",
                isActive
                  ? "text-black bg-white shadow-sm"
                  : "text-white/70 hover:text-white hover:bg-white/10",
              )}
            >
              <Icon size={18} strokeWidth={2} className="md:hidden" />
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden sr-only">{item.name}</span>
            </RouterLink>
          )
        })}
      </div>
    </div>
  )
}
