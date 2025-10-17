'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // 認証状態をチェックして適切なページにリダイレクト
    const checkAuth = () => {
      try {
        const user = localStorage.getItem('user')
        console.log('Checking auth, user data:', user)
        
        if (user) {
          // ユーザーデータが有効かチェック
          const parsedUser = JSON.parse(user)
          if (parsedUser && parsedUser.username) {
            console.log('Valid user found, redirecting to gallery')
            router.push('/gallery')
            return
          } else {
            console.log('Invalid user data, clearing localStorage')
            localStorage.removeItem('user')
          }
        }
        
        console.log('No valid user found, redirecting to login')
        router.push('/login')
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('user')
        router.push('/login')
      } finally {
        setIsChecking(false)
      }
    }

    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-black border-t-transparent"></div>
      </div>
    )
  }

  return null
}
