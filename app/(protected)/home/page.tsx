'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Calendar, Sun, Palmtree, Trophy, Images } from 'lucide-react'
import { User } from '@/lib/auth'
import BottomTabBar from '@/components/ui/BottomTabBar'
import PhotoGrid from '@/components/gallery/PhotoGrid'

interface Photo {
  id: string
  bucket_key: string
  original_filename: string
  taken_at: string
  created_at: string
  caption?: string
  exif_json?: Record<string, unknown>
  mime: string
  width?: number
  height?: number
  bytes: number
  owner_name?: string
}

interface Album {
  id: string
  title: string
  cover_photo_id?: string
  photo_count: number
  created_at: string
}

export default function HomePage() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  const router = useRouter()

  // 認証チェック
  useEffect(() => {
    const checkAuth = () => {
      try {
        const user = localStorage.getItem('user')
        if (!user) {
          router.push('/login')
          return
        }
        
        const parsedUser = JSON.parse(user)
        if (!parsedUser || !parsedUser.username) {
          localStorage.removeItem('user')
          router.push('/login')
          return
        }
        
        setCurrentUser(parsedUser)
      } catch (error) {
        console.error('Auth check error:', error)
        localStorage.removeItem('user')
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  // 最近の写真を取得
  const fetchRecentPhotos = useCallback(async () => {
    try {
      const response = await fetch('/api/photos?limit=6')
      const result = await response.json()
      if (response.ok) {
        setPhotos(result.photos || [])
      }
    } catch (error) {
      console.error('Error fetching recent photos:', error)
    }
  }, [])

  // アルバム一覧を取得（仮実装）
  const fetchAlbums = useCallback(async () => {
    // TODO: アルバムAPIが実装されたら置き換え
    const mockAlbums: Album[] = [
      {
        id: '1',
        title: '夏の思い出',
        photo_count: 45,
        created_at: '2024-08-15T00:00:00Z'
      },
      {
        id: '2',
        title: '家族旅行 in 沖縄',
        photo_count: 83,
        created_at: '2024-07-20T00:00:00Z'
      },
      {
        id: '3',
        title: '子どもの運動会',
        photo_count: 32,
        created_at: '2024-10-05T00:00:00Z'
      }
    ]
    setAlbums(mockAlbums)
  }, [])

  useEffect(() => {
    if (currentUser) {
      Promise.all([fetchRecentPhotos(), fetchAlbums()]).finally(() => {
        setLoading(false)
      })
    }
  }, [currentUser, fetchRecentPhotos, fetchAlbums])

  const getAlbumIcon = (title: string) => {
    if (title.includes('夏')) return Sun
    if (title.includes('沖縄') || title.includes('旅行')) return Palmtree
    if (title.includes('運動会')) return Trophy
    return Calendar
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-600">読み込み中...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="main-content">
      {/* ヘッダー */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="page-header"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-lg">👨‍👩‍👧‍👦</span>
            </div>
            <div>
              <h1 className="page-title">家族アルバム</h1>
              <p className="page-subtitle">思い出を共有しよう</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Search className="w-6 h-6 text-gray-600" />
          </motion.button>
        </div>
      </motion.header>

      <main className="px-4 py-6 space-y-8">
        {/* 最近のアップロード */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">最近のアップロード</h2>
          </div>
          
          {photos.length > 0 ? (
            <div className="card">
              <div className="text-sm text-gray-600 mb-3">
                {formatDate(photos[0]?.taken_at || photos[0]?.created_at)} の思い出
              </div>
              <PhotoGrid 
                photos={photos.slice(0, 4)} 
                onPhotoClick={(photo) => {
                  // TODO: 写真詳細モーダルを開く
                  console.log('Photo clicked:', photo)
                }}
                className="grid-cols-2"
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">まだ写真がありません</p>
              <p className="text-sm text-gray-500 mt-1">最初の写真をアップロードしましょう！</p>
            </div>
          )}
        </motion.section>

        {/* アルバムピックアップ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Images className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">アルバムピックアップ</h2>
          </div>
          
          <div className="space-y-3">
            {albums.map((album, index) => {
              const Icon = getAlbumIcon(album.title)
              return (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // TODO: アルバム詳細ページに遷移
                    console.log('Album clicked:', album)
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{album.title}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(album.created_at)} • 📸{album.photo_count}枚
                      </p>
                    </div>
                    <div className="text-orange-500">
                      →
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      </main>

      <BottomTabBar />
    </div>
  )
}
