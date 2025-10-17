'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  const supabase = createClient()

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, name, role')
        .limit(5)
      
      console.log('Database test result:', { data, error })
      if (data) {
        console.log('Available users:', data)
      }
    } catch (err) {
      console.error('Database connection test failed:', err)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // データベース接続テスト
    await testDatabaseConnection()

    try {
      console.log('Attempting login with:', { username, password })
      
      // ユーザー認証
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .single()

      console.log('Login result:', { userData, userError })

      if (userError) {
        console.error('Database error:', userError)
        setError(`データベースエラー: ${userError.message}`)
        setIsLoading(false)
        return
      }

      if (!userData) {
        console.log('No user found with these credentials')
        setError('ログインに失敗しました。IDとパスワードを確認してください。')
        setIsLoading(false)
        return
      }

      // セッションにユーザー情報を保存
      localStorage.setItem('user', JSON.stringify(userData))
      
      console.log('Login successful, redirecting to gallery...')
      
      // 複数の方法でリダイレクトを試行
      try {
        router.push('/gallery')
        // フォールバック: window.locationを使用
        setTimeout(() => {
          if (window.location.pathname === '/login') {
            window.location.href = '/gallery'
          }
        }, 1000)
      } catch (redirectError) {
        console.error('Router redirect failed:', redirectError)
        window.location.href = '/gallery'
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('予期しないエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative login-page">
      <BackgroundVideo />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            {/* ヘッダー */}
            <div className="text-center mb-8 px-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-primary-500 rounded-full mb-4 shadow-lg"
          >
            <Camera className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            華ちゃんのアルバム
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600"
          >
            家族専用の成長記録
          </motion.p>
        </div>

            {/* ログインフォーム */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="card-cute p-8 mx-4"
            >
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                ユーザーID
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-cute"
                placeholder="ユーザーIDを入力"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-cute"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full touch-target"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                  <span>ログイン中...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
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
              className="text-center mt-8 px-4"
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
