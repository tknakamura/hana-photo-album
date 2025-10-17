'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Camera, Heart } from 'lucide-react'
import UploadArea, { UploadFile } from '@/components/upload/UploadArea'
import Button from '@/components/ui/Button'
import { generateThumbnailPath } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'

export default function UploadPage() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [, setCurrentUser] = useState(getCurrentUser())
  const router = useRouter()
  const supabase = createClient()

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      const totalFiles = uploadFiles.length
      let completedFiles = 0

      for (const uploadFile of uploadFiles) {
        try {
          // ファイルをSupabase Storageにアップロード
          const fileExt = uploadFile.file.name.split('.').pop()
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
          const filePath = `photos/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(filePath, uploadFile.file)

          if (uploadError) {
            throw uploadError
          }

          // サムネイル生成（画像の場合）
          let thumbnailPath = null
          if (uploadFile.file.type.startsWith('image/')) {
            // 実際の実装では、サーバーサイドでサムネイルを生成
            thumbnailPath = generateThumbnailPath(filePath)
          }

          // データベースに写真情報を保存
          const { error: dbError } = await supabase
            .from('photos')
            .insert({
              uploaded_by: user.id,
              file_path: filePath,
              thumbnail_path: thumbnailPath,
              original_filename: uploadFile.file.name,
              file_size: uploadFile.file.size,
              mime_type: uploadFile.file.type,
              taken_at: uploadFile.metadata?.takenAt || new Date(),
              caption: '',
              metadata: uploadFile.metadata || {}
            })

          if (dbError) {
            throw dbError
          }

          completedFiles++
          setUploadProgress((completedFiles / totalFiles) * 100)

        } catch (error) {
          console.error('Upload error:', error)
          // エラーハンドリング
        }
      }

      // アップロード完了
      router.push('/gallery?uploaded=true')
      
    } catch (error) {
      console.error('Upload failed:', error)
      alert('アップロードに失敗しました。もう一度お試しください。')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* ヘッダー */}
      <div className="mobile-header">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between">
            <motion.button
              onClick={() => router.back()}
              className="p-2 hover:bg-pink-100 rounded-full transition-colors touch-target"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
            
            <h1 className="text-xl font-bold text-gray-800">
              写真をアップロード
            </h1>
            
            <div className="w-10" /> {/* スペーサー */}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="mobile-container py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* アップロードエリア */}
          <UploadArea
            onUpload={setUploadFiles}
            maxFiles={20}
            maxSize={100 * 1024 * 1024} // 100MB
          />

          {/* アップロードボタン */}
          {uploadFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {/* プログレスバー */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>アップロード中...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-pink-400 to-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={isUploading}
                loading={isUploading}
                fullWidth
                size="lg"
              >
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>
                    {uploadFiles.length}件の写真をアップロード
                  </span>
                </div>
              </Button>
            </motion.div>
          )}

          {/* ヒント */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="card-cute p-6"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  アップロードのヒント
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 複数の写真を一度にアップロードできます</li>
                  <li>• 撮影日時は自動で読み取られます</li>
                  <li>• 写真は自動で最適化されます</li>
                  <li>• 動画もアップロード可能です</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* 最近のアップロード */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="card-cute p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-800">
                華ちゃんの成長記録
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              今日も素敵な瞬間を記録しましょう。家族みんなで華ちゃんの成長を見守っています。
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
