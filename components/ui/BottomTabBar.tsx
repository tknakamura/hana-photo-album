'use client'

import { useRouter, usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Images, Upload, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TabItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

const tabs: TabItem[] = [
  { id: 'home', label: 'ホーム', icon: Home, path: '/gallery' },
  { id: 'albums', label: 'アルバム', icon: Images, path: '/albums' },
  { id: 'upload', label: 'アップ', icon: Upload, path: '/upload' },
  { id: 'settings', label: '設定', icon: Settings, path: '/profile' }
]

export default function BottomTabBar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around h-20 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          const Icon = tab.icon

          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabClick(tab.path)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200',
                isActive ? 'text-orange-500' : 'text-gray-500'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="relative"
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className="w-6 h-6 mb-1" />
                {isActive && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
              <span className={cn(
                'text-xs font-medium',
                isActive ? 'text-orange-500' : 'text-gray-500'
              )}>
                {tab.label}
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
