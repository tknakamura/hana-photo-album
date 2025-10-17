'use client'

import { useState, useEffect, useRef } from 'react'
// import { createClient } from '@/lib/supabase/client' // 不要になったためコメントアウト
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Camera, Sparkles, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import BackgroundVideo from '@/components/ui/BackgroundVideo'
import { LoginFormState, ValidationErrors, LoginResponse } from '@/types/auth'

export default function LoginPage() {
  const [formState, setFormState] = useState<LoginFormState>({
    username: '',
    password: '',
    isLoading: false,
    error: '',
    showPassword: false,
    isValidating: false,
    validationErrors: {},
    loginAttempts: 0
  })
  
  const router = useRouter()
  const usernameRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  
  // フォーム状態の更新ヘルパー
  const updateFormState = (updates: Partial<LoginFormState>) => {
    setFormState(prev => ({ ...prev, ...updates }))
  }

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

  // 入力検証関数
  const validateInputs = (): boolean => {
    const errors: ValidationErrors = {}
    
    if (!formState.username.trim()) {
      errors.username = 'ユーザーIDを入力してください'
    } else if (formState.username.length < 3) {
      errors.username = 'ユーザーIDは3文字以上で入力してください'
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formState.username)) {
      errors.username = 'ユーザーIDは英数字、ハイフン、アンダースコアのみ使用できます'
    }
    
    if (!formState.password) {
      errors.password = 'パスワードを入力してください'
    } else if (formState.password.length < 6) {
      errors.password = 'パスワードは6文字以上で入力してください'
    }
    
    updateFormState({ validationErrors: errors })
    return Object.keys(errors).length === 0
  }

  // レート制限チェック
  const checkRateLimit = (): boolean => {
    const attempts = parseInt(localStorage.getItem('loginAttempts') || '0')
    const lastAttempt = localStorage.getItem('lastLoginAttempt')
    const now = Date.now()
    
    if (lastAttempt && now - parseInt(lastAttempt) < 300000) { // 5分間
      if (attempts >= 5) {
        updateFormState({ error: 'ログイン試行回数が上限に達しました。5分後に再試行してください。' })
        return false
      }
    } else {
      // 5分経過した場合はカウンターリセット
      localStorage.setItem('loginAttempts', '0')
      updateFormState({ loginAttempts: 0 })
    }
    
    return true
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    
    // 入力検証
    if (!validateInputs()) {
      return
    }
    
    // レート制限チェック
    if (!checkRateLimit()) {
      return
    }
    
    updateFormState({ 
      isLoading: true, 
      error: '', 
      validationErrors: {} 
    })

    try {
      console.log('Attempting login with:', { username: formState.username })
      
      // 新しいAPIエンドポイントを使用してログイン
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // CSRF対策
        },
        body: JSON.stringify({ 
          username: formState.username, 
          password: formState.password 
        }),
      })

      const result: LoginResponse = await response.json()
      console.log('Login result:', result)

      if (!response.ok) {
        // ログイン試行回数を増加
        const attempts = parseInt(localStorage.getItem('loginAttempts') || '0') + 1
        localStorage.setItem('loginAttempts', attempts.toString())
        localStorage.setItem('lastLoginAttempt', Date.now().toString())
        
        updateFormState({ 
          error: result.error || 'ログインに失敗しました。',
          isLoading: false,
          loginAttempts: attempts
        })
        return
      }

      if (!result.success || !result.user) {
        updateFormState({ 
          error: 'ログインに失敗しました。IDとパスワードを確認してください。',
          isLoading: false
        })
        return
      }

      // ログイン成功時はカウンターリセット
      localStorage.removeItem('loginAttempts')
      localStorage.removeItem('lastLoginAttempt')
      
      // セッションにユーザー情報を保存
      localStorage.setItem('user', JSON.stringify(result.user))
      
      console.log('Login successful, redirecting to gallery...')
      
      // 確実なリダイレクト
      window.location.href = '/gallery'
    } catch (error) {
      console.error('Login error:', error)
      updateFormState({ 
        error: '予期しないエラーが発生しました。ネットワーク接続を確認してください。',
        isLoading: false
      })
    }
  }

  // リアルタイム検証
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    updateFormState({ username: value })
    
    if (formState.validationErrors.username) {
      updateFormState({ 
        validationErrors: { 
          ...formState.validationErrors, 
          username: '' 
        }
      })
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value
    updateFormState({ password: value })
    
    if (formState.validationErrors.password) {
      updateFormState({ 
        validationErrors: { 
          ...formState.validationErrors, 
          password: '' 
        }
      })
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
                  <label 
                    htmlFor="username" 
                    className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide"
                    aria-describedby={formState.validationErrors.username ? "username-error" : undefined}
                  >
                    ユーザーID
                  </label>
                  <div className="relative">
                    <input
                      ref={usernameRef}
                      id="username"
                      type="text"
                      value={formState.username}
                      onChange={handleUsernameChange}
                      className={`input-smugmug pr-10 ${formState.validationErrors.username ? 'border-red-500 focus:border-red-500' : 'focus:border-black'}`}
                      placeholder="ユーザーIDを入力"
                      required
                      disabled={formState.isLoading}
                      autoComplete="username"
                      aria-invalid={!!formState.validationErrors.username}
                      aria-describedby={formState.validationErrors.username ? "username-error" : undefined}
                    />
                    {formState.username && !formState.validationErrors.username && (
                      <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {formState.validationErrors.username && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center mt-2 text-sm text-red-600"
                      id="username-error"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formState.validationErrors.username}
                    </motion.div>
                  )}
                </div>

                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide"
                    aria-describedby={formState.validationErrors.password ? "password-error" : undefined}
                  >
                    パスワード
                  </label>
                  <div className="relative">
                    <input
                      ref={passwordRef}
                      id="password"
                      type={formState.showPassword ? "text" : "password"}
                      value={formState.password}
                      onChange={handlePasswordChange}
                      className={`input-smugmug pr-10 ${formState.validationErrors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-black'}`}
                      placeholder="••••••••"
                      required
                      disabled={formState.isLoading}
                      autoComplete="current-password"
                      aria-invalid={!!formState.validationErrors.password}
                      aria-describedby={formState.validationErrors.password ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => updateFormState({ showPassword: !formState.showPassword })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                      disabled={formState.isLoading}
                      aria-label={formState.showPassword ? "パスワードを隠す" : "パスワードを表示"}
                    >
                      {formState.showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {formState.validationErrors.password && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center mt-2 text-sm text-red-600"
                      id="password-error"
                      role="alert"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {formState.validationErrors.password}
                    </motion.div>
                  )}
                </div>

                {formState.error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg"
                    role="alert"
                    aria-live="polite"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>{formState.error}</span>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={formState.isLoading || Object.keys(formState.validationErrors).length > 0}
                  className="smugmug-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: formState.isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: formState.isLoading ? 1 : 0.98 }}
                  aria-describedby={formState.loginAttempts > 0 ? "login-attempts" : undefined}
                >
                  {formState.isLoading ? (
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
                
                {formState.loginAttempts > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center mt-2 text-sm text-gray-600"
                    id="login-attempts"
                  >
                    ログイン試行回数: {formState.loginAttempts}/5
                  </motion.div>
                )}
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
