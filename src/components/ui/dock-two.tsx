import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import Image from "next/image"

interface DockProps {
  className?: string
  items: {
    icon: React.ComponentType<any> | string  // Updated to accept both LucideIcon and string paths
    label: string
    onClick?: () => void
    iconColor?: string // Optional color for icons
  }[]
  variant?: "floating" | "fixed"
  selected?: string
  onSelect?: (label: string) => void
}

interface DockIconButtonProps {
  icon: React.ComponentType<any> | string
  label: string
  onClick?: () => void
  className?: string
  isSelected?: boolean
  iconColor?: string // Optional color for icons
}

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-1, 1, -1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}

const DockIconButton = React.forwardRef<HTMLButtonElement, DockIconButtonProps>(
  ({ icon, label, onClick, className, isSelected, iconColor }, ref) => {
    const renderIcon = () => {
      if (typeof icon === 'string') {
        return (
          <Image 
            src={icon} 
            alt={label} 
            width={24} 
            height={24} 
            className="w-6 h-6" 
          />
        )
      } else {
        const Icon = icon as LucideIcon
        return <Icon className={cn("w-5 h-5", iconColor ? iconColor : "text-foreground")} />
      }
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          "relative group p-2 rounded-full",
          isSelected ? "bg-brand-purple/20" : "hover:bg-background/60 transition-colors",
          className
        )}
      >
        <div className={cn(
          "flex items-center justify-center rounded-full",
          isSelected ? "scale-110" : "",
          typeof icon === 'string' ? "" : (iconColor ? "bg-opacity-10 bg-white" : "")
        )}>
          {renderIcon()}
        </div>
        <span className={cn(
          "absolute -top-7 left-1/2 -translate-x-1/2",
          "px-2 py-0.5 rounded text-xs font-medium",
          "bg-black/70 border border-gray-800 text-white",
          "opacity-0 group-hover:opacity-100",
          "transition-opacity whitespace-nowrap pointer-events-none"
        )}>
          {label}
        </span>
      </motion.button>
    )
  }
)
DockIconButton.displayName = "DockIconButton"

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ items, className, variant = "floating", selected, onSelect }, ref) => {
    return (
      <div ref={ref} className={cn("w-full flex items-center justify-center p-2", className)}>
        <motion.div
          initial={variant === "floating" ? "initial" : false}
          animate={variant === "floating" ? "animate" : false}
          variants={floatingAnimation}
          className={cn(
            "flex items-center gap-2 p-1.5 rounded-full",
            "backdrop-blur-lg border shadow-md",
            "bg-[#111]/80 border-gray-800",
            "hover:shadow-lg transition-shadow duration-300"
          )}
        >
          {items.map((item) => (
            <DockIconButton 
              key={item.label} 
              {...item} 
              isSelected={selected === item.label}
              iconColor={item.iconColor}
              onClick={() => {
                if (onSelect) onSelect(item.label);
                if (item.onClick) item.onClick();
              }}
            />
          ))}
        </motion.div>
      </div>
    )
  }
)
Dock.displayName = "Dock"

export { Dock }