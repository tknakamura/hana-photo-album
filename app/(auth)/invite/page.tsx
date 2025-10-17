'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Gift, User, Mail, Lock, Sparkles } from 'lucide-react'

export default function InvitePage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    inviteCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const router = useRouter()
  const supabase = createClient()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleInviteCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.inviteCode) {
      setError('招待コードを入力してください')
      return
    }
    
    // 招待コードの検証（実際の実装では、データベースで検証）
    if (formData.inviteCode === 'HANA2024' || formData.inviteCode === 'hana-family') {
      setStep(2)
      setError('')
    } else {
      setError('無効な招待コードです')
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.displayName,
            invite_code: formData.inviteCode
          }
        }
      })

      if (error) {
        setError('アカウント作成に失敗しました: ' + error.message)
      } else {
        // 家族メンバーとして登録
        const { error: memberError } = await supabase
          .from('family_members')
          .insert({
            display_name: formData.displayName,
            role: 'member'
          })

        if (memberError) {
          console.error('Family member creation error:', memberError)
        }

        router.push('/login?message=アカウントが作成されました。ログインしてください。')
      }
    } catch {
      setError('予期しないエラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center mobile-container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full mb-4 shadow-lg"
          >
            <Gift className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-gray-800 mb-2"
          >
            家族に参加
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-gray-600"
          >
            招待コードで華ちゃんのアルバムに参加
          </motion.p>
        </div>

        {/* ステップ1: 招待コード入力 */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="card-cute p-8"
          >
            <form onSubmit={handleInviteCodeSubmit} className="space-y-6">
              <div>
                <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
                  招待コード
                </label>
                <div className="relative">
                  <input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    value={formData.inviteCode}
                    onChange={handleInputChange}
                    className="input-cute pr-12"
                    placeholder="HANA2024"
                    required
                  />
                  <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  家族から受け取った招待コードを入力してください
                </p>
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
                className="btn-primary w-full touch-target"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>次へ進む</span>
                </div>
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* ステップ2: アカウント作成 */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="card-cute p-8"
          >
            <form onSubmit={handleSignUp} className="space-y-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
                  表示名
                </label>
                <div className="relative">
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="input-cute pr-12"
                    placeholder="お母さん、お父さんなど"
                    required
                    disabled={isLoading}
                  />
                  <User className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-cute pr-12"
                    placeholder="family@example.com"
                    required
                    disabled={isLoading}
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="input-cute pr-12"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード確認
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input-cute pr-12"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                  <Lock className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-pink-400" />
                </div>
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

              <div className="flex space-x-3">
                <motion.button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost flex-1 touch-target"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  戻る
                </motion.button>
                
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 touch-target"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Gift className="w-5 h-5" />
                      <span>参加する</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}

        {/* フッター */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8"
        >
          <motion.button
            onClick={() => router.push('/login')}
            className="text-pink-500 hover:text-pink-600 font-medium text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            すでにアカウントをお持ちの方はこちら
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
