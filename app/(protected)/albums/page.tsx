'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Sun, PalmTree, Trophy, Heart, Camera, Star } from 'lucide-react'
import { getCurrentUser, User } from '@/lib/auth'
import BottomTabBar from '@/components/ui/BottomTabBar'

interface Album {
  id: string
  title: string
  description?: string
  cover_photo_id?: string
  photo_count: number
  created_at: string
  updated_at: string
}

export default function AlbumsPage() {
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

  // アルバム一覧を取得
  const fetchAlbums = async () => {
    try {
      // TODO: 実際のAPIエンドポイントに置き換え
      const mockAlbums: Album[] = [
        {
          id: '1',
          title: '夏の思い出',
          description: '2024年の夏休みの思い出です',
          photo_count: 45,
          created_at: '2024-08-15T00:00:00Z',
          updated_at: '2024-08-20T00:00:00Z'
        },
        {
          id: '2',
          title: '家族旅行 in 沖縄',
          description: '沖縄での楽しい家族旅行',
          photo_count: 83,
          created_at: '2024-07-20T00:00:00Z',
          updated_at: '2024-07-25T00:00:00Z'
        },
        {
          id: '3',
          title: '子どもの運動会',
          description: '華ちゃんの初めての運動会',
          photo_count: 32,
          created_at: '2024-10-05T00:00:00Z',
          updated_at: '2024-10-05T00:00:00Z'
        },
        {
          id: '4',
          title: 'お誕生日会',
          description: '華ちゃんの3歳のお誕生日会',
          photo_count: 28,
          created_at: '2024-09-15T00:00:00Z',
          updated_at: '2024-09-15T00:00:00Z'
        },
        {
          id: '5',
          title: '春の散歩',
          description: '桜の季節の家族散歩',
          photo_count: 19,
          created_at: '2024-04-10T00:00:00Z',
          updated_at: '2024-04-10T00:00:00Z'
        }
      ]
      
      setAlbums(mockAlbums)
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchAlbums()
    }
  }, [currentUser])

  const getAlbumIcon = (title: string) => {
    if (title.includes('夏')) return Sun
    if (title.includes('沖縄') || title.includes('旅行')) return PalmTree
    if (title.includes('運動会')) return Trophy
    if (title.includes('誕生日')) return Heart
    if (title.includes('春') || title.includes('桜')) return Star
    return Camera
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'long' 
    })
  }

  const handleAlbumClick = (album: Album) => {
    // TODO: アルバム詳細ページに遷移
    console.log('Album clicked:', album)
  }

  const handleCreateAlbum = () => {
    // TODO: アルバム作成モーダルを開く
    console.log('Create album clicked')
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
            <Camera className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-gray-600">アルバムを読み込み中...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* ヘッダー */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="bg-white border-b border-gray-200 px-4 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => router.back()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </motion.button>
            <h1 className="text-xl font-bold text-gray-800">アルバム一覧</h1>
          </div>
          <motion.button
            onClick={handleCreateAlbum}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.header>

      <main className="px-4 py-6">
        {albums.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {albums.map((album, index) => {
                const Icon = getAlbumIcon(album.title)
                return (
                  <motion.div
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleAlbumClick(album)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4">
                      {/* アルバムカバー */}
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-8 h-8 text-orange-500" />
                      </div>
                      
                      {/* アルバム情報 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                          {album.title}
                        </h3>
                        {album.description && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {album.description}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatDate(album.created_at)}</span>
                          <span>📸 {album.photo_count}枚</span>
                        </div>
                      </div>
                      
                      {/* 矢印 */}
                      <div className="text-gray-400">
                        →
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              まだアルバムがありません
            </h3>
            <p className="text-gray-600 mb-6">
              最初のアルバムを作成して思い出を整理しましょう！
            </p>
            <motion.button
              onClick={handleCreateAlbum}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-orange-500 text-white px-6 py-3 rounded-2xl font-medium hover:bg-orange-600 transition-colors"
            >
              アルバムを作成
            </motion.button>
          </motion.div>
        )}
      </main>

      <BottomTabBar />
    </div>
  )
}
