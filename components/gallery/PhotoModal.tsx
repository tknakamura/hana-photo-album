'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import Image from 'next/image' // プレースホルダー画像用にコメントアウト
import { X, ChevronLeft, ChevronRight, Calendar, Camera, Heart, Download, Share2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'

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

interface PhotoModalProps {
  photo: Photo | null
  photos: Photo[]
  isOpen: boolean
  onClose: () => void
  onNavigate: (direction: 'prev' | 'next') => void
}

export default function PhotoModal({ photo, photos, isOpen, onClose, onNavigate }: PhotoModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  // const [showControls] = useState(true)

  useEffect(() => {
    if (photo) {
      setImageLoaded(false)
      // 署名付きURLを取得
      fetch(`/api/photos/${photo.id}/url?variant=large`)
        .then(response => response.json())
        .then(data => {
          if (data.url) {
            setImageUrl(data.url)
          }
        })
        .catch(error => {
          console.error('Error getting image URL:', error)
        })
    }
  }, [photo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return
      
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          onNavigate('prev')
          break
        case 'ArrowRight':
          onNavigate('next')
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, onNavigate])

  if (!photo || !isOpen) return null

  const currentIndex = photos.findIndex(p => p.id === photo.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < photos.length - 1
  const isVideo = photo.mime.startsWith('video/')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="modal-content max-w-4xl w-full h-full max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ヘッダー */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {photo.original_filename}
                </h3>
                <p className="text-sm text-gray-500">
                  {currentIndex + 1} / {photos.length}
                </p>
              </div>
            </div>
            
            <motion.button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-target"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6 text-gray-600" />
            </motion.button>
          </div>

          {/* メインコンテンツ */}
          <div className="flex-1 relative overflow-hidden">
            {/* 画像/動画 */}
            <div className="relative w-full h-full flex items-center justify-center bg-gray-50">
              {isVideo ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Heart className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-gray-600">動画の再生機能は準備中です</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* ローディング状態 */}
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                      <div className="loading-dots">
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  )}
                  
                  {/* 実際の画像 */}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={photo.caption || photo.original_filename}
                      className={cn(
                        'w-full h-full object-contain transition-opacity duration-300',
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      )}
                      onLoad={() => setImageLoaded(true)}
                    />
                  )}
                </>
              )}

              {/* ナビゲーションボタン */}
              {hasPrev && (
                <motion.button
                  onClick={() => onNavigate('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors touch-target"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronLeft className="w-6 h-6 text-gray-700" />
                </motion.button>
              )}

              {hasNext && (
                <motion.button
                  onClick={() => onNavigate('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors touch-target"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <ChevronRight className="w-6 h-6 text-gray-700" />
                </motion.button>
              )}
            </div>
          </div>

          {/* フッター */}
          <div className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="space-y-4">
              {/* 撮影情報 */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(new Date(photo.taken_at))}</span>
                </div>
                {(() => {
                  const camera = photo.exif_json?.camera
                  if (camera && typeof camera === 'object' && camera !== null && 'make' in camera && 'model' in camera) {
                    return (
                      <div className="flex items-center space-x-1">
                        <Camera className="w-4 h-4" />
                        <span>{String(camera.make)} {String(camera.model)}</span>
                      </div>
                    )
                  }
                  return null
                })()}
              </div>

              {/* キャプション */}
              {photo.caption && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-gray-800">{photo.caption}</p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="flex items-center justify-center space-x-4">
                <motion.button
                  className="smugmug-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  <span>いいね</span>
                </motion.button>
                
                <motion.button
                  className="smugmug-button-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  <span>共有</span>
                </motion.button>
                
                <motion.button
                  className="smugmug-button-secondary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  <span>保存</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
