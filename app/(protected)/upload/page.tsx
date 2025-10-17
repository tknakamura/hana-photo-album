'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Camera, Heart } from 'lucide-react'
import UploadArea, { UploadFile } from '@/components/upload/UploadArea'

export default function UploadPage() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [, setCurrentUser] = useState(null)
  const router = useRouter()

  // 認証チェック
  useEffect(() => {
    const checkAuth = () => {
      const user = localStorage.getItem('user')
      if (!user) {
        router.push('/login')
        return
      }
      
      try {
        const parsedUser = JSON.parse(user)
        setCurrentUser(parsedUser)
      } catch {
        localStorage.removeItem('user')
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i]
        
        // 新しいAPIエンドポイントを使用してアップロード
        const formData = new FormData()
        formData.append('file', file.file)
        if (file.caption) {
          formData.append('caption', file.caption)
        }

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          console.error('Upload error:', error)
          continue
        }

        setUploadProgress(((i + 1) / uploadFiles.length) * 100)
      }

      // アップロード完了
      setUploadFiles([])
      setUploadProgress(0)
      router.push('/gallery')
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      setIsUploading(false)
    }
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
          <Camera className="w-6 h-6 text-gray-700" />
          <h1 className="text-xl font-bold text-gray-800">写真をアップロード</h1>
        </div>

        <div className="w-16" /> {/* スペーサー */}
      </motion.header>

      {/* メインコンテンツ */}
      <div className="smugmug-container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* アップロードエリア */}
          <div className="smugmug-card p-6">
            <UploadArea
              onUpload={setUploadFiles}
              maxFiles={10}
              acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']}
            />
          </div>

          {/* アップロードボタン */}
          {uploadFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="smugmug-card p-6"
            >
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  {uploadFiles.length}個のファイルをアップロードします
                </p>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-black h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      {Math.round(uploadProgress)}% 完了
                    </p>
                  </div>
                )}

                <motion.button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="smugmug-button w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                      <span>アップロード中...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>アップロード開始</span>
                    </div>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ヒント */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="smugmug-card p-6"
          >
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">アップロードのヒント</p>
                <ul className="space-y-1 text-xs">
                  <li>• 写真の撮影日時が自動的に抽出されます</li>
                  <li>• 最大10MBまでのファイルをアップロードできます</li>
                  <li>• JPEG、PNG、GIF、WebP、MP4、WebM形式に対応</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}