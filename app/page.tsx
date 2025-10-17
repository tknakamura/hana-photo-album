'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // 認証状態をチェックして適切なページにリダイレクト
    const user = localStorage.getItem('user')
    if (user) {
      router.push('/gallery')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-primary-500 border-t-transparent"></div>
    </div>
  )
}
