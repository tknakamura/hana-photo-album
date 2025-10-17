import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  fullWidth?: boolean
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  fullWidth = false,
}: ButtonProps) {
  const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-300 transform active:scale-95 touch-target'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg hover:shadow-xl hover:from-pink-500 hover:to-purple-600',
    secondary: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg hover:shadow-xl hover:from-blue-500 hover:to-blue-600',
    ghost: 'bg-white/80 backdrop-blur-sm text-gray-700 border border-pink-200 hover:bg-white/90 hover:shadow-md',
    danger: 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-lg hover:shadow-xl hover:from-red-500 hover:to-red-600',
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  }
  
  const disabledClasses = 'opacity-50 cursor-not-allowed transform-none'
  
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || loading) && disabledClasses,
        className
      )}
      whileHover={!disabled && !loading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <span>処理中...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}
