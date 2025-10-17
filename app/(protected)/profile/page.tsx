'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Camera, User as UserIcon } from 'lucide-react'
import { logout as authLogout, User } from '@/lib/auth'
import Image from 'next/image'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user')
      if (!user) {
        router.push('/login')
        return
      }
      
      try {
        const parsedUser = JSON.parse(user)
        setUser(parsedUser)
        setName(parsedUser.name)
        setBio(parsedUser.bio || '')
        setProfileImagePreview(parsedUser.profile_image_url || '')
      } catch {
        localStorage.removeItem('user')
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const preview = URL.createObjectURL(file)
      setProfileImagePreview(preview)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // プロフィール画像のアップロード（簡易版）
      let profileImageUrl = user.profile_image_url

      if (profileImage) {
        // 実際のアップロード処理は後で実装
        // 現在はプレビューのみ
        profileImageUrl = profileImagePreview
      }

      // ユーザー情報を更新（localStorageのみ）
      const updatedUser = {
        ...user,
        name,
        bio,
        profile_image_url: profileImageUrl
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setSuccess('プロフィールを更新しました！')
    } catch (error) {
      console.error('Profile update error:', error)
      setError('プロフィールの更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    authLogout()
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-black border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* SmugMug風ヘッダー */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="smugmug-nav p-4 flex items-center justify-between"
      >
        <motion.button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>戻る</span>
        </motion.button>

        <div className="flex items-center space-x-2">
          <UserIcon className="w-6 h-6 text-gray-700" />
          <h1 className="text-xl font-bold text-gray-800">プロフィール</h1>
        </div>

        <motion.button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ログアウト
        </motion.button>
      </motion.header>

      {/* メインコンテンツ */}
      <div className="smugmug-container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* プロフィール画像 */}
          <div className="smugmug-card p-6">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                {profileImagePreview ? (
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto">
                    <Image
                      src={profileImagePreview}
                      alt="プロフィール画像"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                    <UserIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <label className="absolute bottom-0 right-0 bg-black text-white rounded-full p-2 cursor-pointer hover:bg-gray-800 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <p className="text-sm text-gray-500">
                プロフィール画像を変更
              </p>
            </div>
          </div>

          {/* ユーザー情報フォーム */}
          <div className="smugmug-card p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  名前
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-smugmug"
                  placeholder="名前を入力"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  自己紹介
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="input-smugmug min-h-[100px] resize-none"
                  placeholder="自己紹介を入力"
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

              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium"
                >
                  {success}
                </motion.div>
              )}

              <motion.button
                onClick={handleSave}
                disabled={isSaving}
                className="smugmug-button w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="loading-dots">
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <span>保存中...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Save className="w-5 h-5" />
                    <span>保存</span>
                  </div>
                )}
              </motion.button>
            </div>
          </div>

          {/* ユーザー情報表示 */}
          <div className="smugmug-card p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">アカウント情報</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ユーザーID:</span>
                <span className="font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">権限:</span>
                <span className="font-medium">{user.role === 'admin' ? '管理者' : 'ユーザー'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}