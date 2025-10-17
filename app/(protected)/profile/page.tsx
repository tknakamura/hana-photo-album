'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Camera, User as UserIcon } from 'lucide-react'
import { getCurrentUser, logout as authLogout, User } from '@/lib/auth'
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
  const supabase = createClient()

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
      } catch (error) {
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
      let profileImageUrl = user.profile_image_url

      // プロフィール画像をアップロード
      if (profileImage) {
        const fileExt = profileImage.name.split('.').pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('photos')
          .upload(`profiles/${fileName}`, profileImage, {
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('photos')
          .getPublicUrl(`profiles/${fileName}`)
        
        profileImageUrl = publicUrl
      }

      // ユーザー情報を更新
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name,
          bio,
          profile_image_url: profileImageUrl,
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // ローカルストレージのユーザー情報を更新
      const updatedUser = {
        ...user,
        name,
        bio,
        profile_image_url: profileImageUrl,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      
      setSuccess('プロフィールを更新しました！')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '更新に失敗しました')
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4 sm:p-6 lg:p-8"
    >
      <header className="flex items-center justify-between mb-6">
        <motion.button
          onClick={() => router.back()}
          className="p-2 rounded-full bg-white shadow-md text-gray-600 hover:bg-gray-100 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="戻る"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">プロフィール編集</h1>
        <div className="w-10"></div>
      </header>

      <main className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 space-y-6"
        >
          {/* プロフィール画像 */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 mx-auto mb-4">
                {profileImagePreview ? (
                  <Image
                    src={profileImagePreview}
                    alt="プロフィール画像"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              <motion.label
                className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </motion.label>
            </div>
            <p className="text-sm text-gray-500">プロフィール画像を変更</p>
          </div>

          {/* ユーザー情報 */}
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                ユーザーID
              </label>
              <input
                id="username"
                type="text"
                value={user.username}
                disabled
                className="input-field bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">ユーザーIDは変更できません</p>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                表示名
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="表示名を入力"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                自己紹介
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input-field min-h-[100px] resize-none"
                placeholder="自己紹介を入力（任意）"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{bio.length}/200文字</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                権限
              </label>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.role === 'admin' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? '管理者' : '一般ユーザー'}
                </span>
              </div>
            </div>
          </div>

          {/* エラー・成功メッセージ */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg"
            >
              {success}
            </motion.div>
          )}

          {/* アクションボタン */}
          <div className="flex space-x-4">
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary flex-1"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSaving ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  保存中...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Save className="w-5 h-5 mr-2" />
                  保存
                </span>
              )}
            </motion.button>

            <motion.button
              onClick={handleLogout}
              className="btn-secondary px-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              ログアウト
            </motion.button>
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
}
