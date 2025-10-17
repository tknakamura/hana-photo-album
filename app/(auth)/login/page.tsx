'use client'

import { useState, useEffect } from 'react'
// import { createClient } from '@/lib/supabase/client' // 不要になったためコメントアウト
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Camera, Sparkles } from 'lucide-react'
import BackgroundVideo from '@/components/ui/BackgroundVideo'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // 既にログインしている場合はギャラリーにリダイレクト
  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = localStorage.getItem('user')
        console.log('Login: Checking existing auth, user data:', user)
        
        if (user) {
          const parsedUser = JSON.parse(user)
          if (parsedUser && parsedUser.username) {
            console.log('Login: User already logged in, redirecting to gallery')
            window.location.href = '/gallery' // 確実なリダイレクト
            return
          } else {
            console.log('Login: Invalid user data, clearing localStorage')
            localStorage.removeItem('user')
          }
        }
      } catch (error) {
        console.error('Login: Auth check error:', error)
        localStorage.removeItem('user')
      }
    }
    checkAuth()
  }, [router])

  // データベース接続テストは不要になったため削除

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', { username, password })
      
      // 新しいAPIエンドポイントを使用してログイン
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const result = await response.json()
      console.log('Login result:', result)

      if (!response.ok) {
        setError(result.error || 'ログインに失敗しました。')
        setIsLoading(false)
        return
      }

      if (!result.success || !result.user) {
        setError('ログインに失敗しました。IDとパスワードを確認してください。')
        setIsLoading(false)
        return
      }

      // セッションにユーザー情報を保存
      localStorage.setItem('user', JSON.stringify(result.user))
      
      console.log('Login successful, redirecting to gallery...')
      
      // 確実なリダイレクト
      window.location.href = '/gallery'
    } catch (error) {
      console.error('Login error:', error)
      setError('予期しないエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundVideo />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            {/* SmugMug風ヘッダー */}
            <div className="text-center mb-12 px-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 bg-black rounded-full mb-6 shadow-2xl"
          >
            <Camera className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="smugmug-title mb-4"
          >
            華ちゃんのアルバム
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="smugmug-subtitle"
          >
            家族専用の成長記録
          </motion.p>
        </div>

            {/* SmugMug風ログインフォーム */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="smugmug-card p-10 mx-6"
            >
              <form onSubmit={handleLogin} className="space-y-8">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    ユーザーID
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-smugmug"
                    placeholder="ユーザーIDを入力"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    パスワード
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-smugmug"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium"
                  >
                    {error}
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="smugmug-button w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <span>ログイン中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Heart className="w-5 h-5" />
                      <span>ログイン</span>
                    </div>
                  )}
                </motion.button>
              </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              家族専用のアルバムです
            </p>
            <p className="text-xs text-gray-400 mt-1">
              管理者から提供されたIDとパスワードでログインしてください
            </p>
          </div>
        </motion.div>

            {/* フッター */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center mt-8 px-6"
            >
              <div className="flex items-center justify-center space-x-2 text-gray-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Made with love for 華ちゃん</span>
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
