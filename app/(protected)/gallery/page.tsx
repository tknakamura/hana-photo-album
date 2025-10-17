'use client'

import { useState, useEffect, useCallback } from 'react'
// import { createClient } from '@/lib/supabase/client' // 不要になったためコメントアウト
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Camera, LogOut, Grid, List, User as UserIcon, Home } from 'lucide-react'
import PhotoGrid from '@/components/gallery/PhotoGrid'
import PhotoModal from '@/components/gallery/PhotoModal'
import { getCurrentUser, logout as authLogout, User } from '@/lib/auth'

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
  const [sortOrder] = useState<'newest' | 'oldest'>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [, setCurrentUser] = useState<User | null>(getCurrentUser())
  
  const router = useRouter()

  // 認証チェック
  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = localStorage.getItem('user')
        console.log('Gallery: Checking auth, user data:', user)
        
        if (!user) {
          console.log('Gallery: No user found, redirecting to login')
          router.push('/login')
          return
        }
        
        const parsedUser = JSON.parse(user)
        if (!parsedUser || !parsedUser.username) {
          console.log('Gallery: Invalid user data, clearing localStorage')
          localStorage.removeItem('user')
          router.push('/login')
          return
        }
        
        setCurrentUser(parsedUser)
        console.log('Gallery: User authenticated:', parsedUser.username)
      } catch (error) {
        console.error('Gallery: Auth check error:', error)
        localStorage.removeItem('user')
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  const fetchPhotos = useCallback(async () => {
    try {
      const response = await fetch('/api/photos')
      const result = await response.json()

      if (!response.ok) {
        console.error('Error fetching photos:', result.error)
        return
      }

      setPhotos(result.photos || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

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

  const sortedPhotos = [...photos].sort((a, b) => {
    const dateA = new Date(a.taken_at).getTime()
    const dateB = new Date(b.taken_at).getTime()
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">写真を読み込み中...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-100 relative" style={{ paddingBottom: '64px' }}>
      <div className="w-full max-w-sm mx-auto" style={{ maxWidth: '428px' }}>
      {/* SmugMug風ヘッダー */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="smugmug-nav p-4 flex items-center justify-between"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-full shadow-lg"
        >
          <Camera className="w-6 h-6 text-white" />
        </motion.div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-orange-800">HANA LOG</h1>
          <p className="text-sm text-orange-600">
            {photos.length}枚の写真
          </p>
        </div>
        <div className="w-12"></div>
      </motion.header>

      <main className="flex-grow p-4 pb-20 smugmug-container">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-dots">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        ) : (
          <>
            {photos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-8 smugmug-card"
              >
                <p className="text-lg text-gray-600">まだ写真がありません。最初の写真をアップロードしましょう！</p>
                <motion.button
                  onClick={() => router.push('/upload')}
                  className="smugmug-button mt-4 inline-flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="w-5 h-5" />
                  <span>アップロード</span>
                </motion.button>
              </motion.div>
            ) : (
              <PhotoGrid 
                photos={sortedPhotos} 
                onPhotoClick={handlePhotoClick}
                className={viewMode === 'list' ? 'grid-cols-1' : ''}
              />
            )}
          </>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && selectedPhoto && (
          <PhotoModal 
            photo={selectedPhoto} 
            photos={photos}
            isOpen={isModalOpen}
            onClose={handleCloseModal} 
            onNavigate={handleNavigate}
          />
        )}
      </AnimatePresence>
      </div>

      {/* ボトムタブ */}
      <div 
        className="z-50" 
        style={{ 
          position: 'fixed',
          bottom: '0px',
          left: '0px',
          right: '0px',
          width: '100%',
          height: '64px',
          backgroundColor: '#ee7800 !important',
          borderTop: '1px solid #d46900',
          zIndex: 9999
        }}
      >
        <div className="flex items-center justify-between w-full h-full">
          <motion.button
            onClick={() => router.push('/gallery')}
            className="flex items-center justify-center flex-1"
            style={{ height: '64px', color: '#FFFFFF', backgroundColor: 'transparent', border: 'none' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Home className="w-6 h-6" style={{ color: '#FFFFFF' }} />
          </motion.button>
          
          <motion.button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="flex items-center justify-center flex-1"
            style={{ height: '64px', color: '#FFFFFF', backgroundColor: 'transparent', border: 'none' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {viewMode === 'grid' ? (
              <List className="w-6 h-6" style={{ color: '#FFFFFF' }} />
            ) : (
              <Grid className="w-6 h-6" style={{ color: '#FFFFFF' }} />
            )}
          </motion.button>
          
          <motion.button
            onClick={() => router.push('/upload')}
            className="flex items-center justify-center flex-1"
            style={{ height: '64px', color: '#FFFFFF', backgroundColor: 'transparent', border: 'none' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="w-6 h-6" style={{ color: '#FFFFFF' }} />
          </motion.button>
          
          <motion.button
            onClick={() => router.push('/profile')}
            className="flex items-center justify-center flex-1"
            style={{ height: '64px', color: '#FFFFFF', backgroundColor: 'transparent', border: 'none' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <UserIcon className="w-6 h-6" style={{ color: '#FFFFFF' }} />
          </motion.button>
          
          <motion.button
            onClick={handleLogout}
            className="flex items-center justify-center flex-1"
            style={{ height: '64px', color: '#FFFFFF', backgroundColor: 'transparent', border: 'none' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-6 h-6" style={{ color: '#FFFFFF' }} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
