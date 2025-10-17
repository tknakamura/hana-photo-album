'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, Camera, LogOut, Menu, Grid, List } from 'lucide-react'
import PhotoGrid from '@/components/gallery/PhotoGrid'
import PhotoModal from '@/components/gallery/PhotoModal'
import { getCurrentUser, logout as authLogout } from '@/lib/auth'

interface Photo {
  id: string
  file_path: string
  thumbnail_path?: string
  original_filename: string
  taken_at: string
  uploaded_at: string
  caption?: string
  metadata?: Record<string, unknown>
  mime_type: string
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showMenu, setShowMenu] = useState(false)
  const [currentUser, setCurrentUser] = useState(getCurrentUser())
  
  const router = useRouter()
  const supabase = createClient()

  // 認証チェック
  useEffect(() => {
    if (!currentUser) {
      router.push('/login')
      return
    }
  }, [currentUser, router])

  const fetchPhotos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('taken_at', { ascending: sortOrder === 'oldest' })

      if (error) {
        console.error('Error fetching photos:', error)
        return
      }

      setPhotos(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, sortOrder])

  useEffect(() => {
    fetchPhotos()
  }, [fetchPhotos])

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPhoto(null)
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedPhoto) return

    const currentIndex = photos.findIndex(p => p.id === selectedPhoto.id)
    let newIndex: number

    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedPhoto(photos[newIndex])
  }

  const handleLogout = () => {
    authLogout()
    setCurrentUser(null)
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">写真を読み込み中...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* ヘッダー */}
      <div className="mobile-header">
        <div className="mobile-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  華ちゃんのアルバム
                </h1>
                <p className="text-sm text-gray-500">
                  {photos.length}枚の写真
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* ビューモード切り替え */}
              <motion.button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-pink-100 rounded-full transition-colors touch-target"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {viewMode === 'grid' ? (
                  <List className="w-5 h-5 text-gray-700" />
                ) : (
                  <Grid className="w-5 h-5 text-gray-700" />
                )}
              </motion.button>
              
              {/* メニューボタン */}
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-pink-100 rounded-full transition-colors touch-target"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* メニュー */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mobile-container py-2"
        >
          <div className="card-cute p-4 space-y-3">
            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="w-full text-left p-2 hover:bg-pink-50 rounded-xl transition-colors"
            >
              <span className="text-gray-700">
                並び順: {sortOrder === 'newest' ? '新しい順' : '古い順'}
              </span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full text-left p-2 hover:bg-red-50 rounded-xl transition-colors text-red-600"
            >
              <div className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>ログアウト</span>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* メインコンテンツ */}
      <div className="mobile-container py-6">
        <PhotoGrid
          photos={photos}
          onPhotoClick={handlePhotoClick}
          className={viewMode === 'list' ? 'grid-cols-1' : ''}
        />
      </div>

      {/* フローティングアクションボタン */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        className="fixed bottom-20 right-4 z-40"
      >
        <motion.button
          onClick={() => router.push('/upload')}
          className="btn-primary w-14 h-14 rounded-full shadow-2xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Upload className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* 写真モーダル */}
      <PhotoModal
        photo={selectedPhoto}
        photos={photos}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNavigate={handleNavigate}
      />
    </div>
  )
}
