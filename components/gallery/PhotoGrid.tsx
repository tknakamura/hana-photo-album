'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// import Image from 'next/image' // プレースホルダー画像用にコメントアウト
import { Calendar, Camera, Play } from 'lucide-react'
import { cn, formatDateShort } from '@/lib/utils'

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

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  className?: string
}

export default function PhotoGrid({ photos, onPhotoClick, className }: PhotoGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})

  const handleImageLoad = useCallback((photoId: string) => {
    setLoadedImages(prev => new Set(prev).add(photoId))
  }, [])

  const isVideo = useCallback((mimeType: string) => mimeType.startsWith('video/'), [])

  // 署名付きURLを取得
  const getImageUrl = useCallback(async (photoId: string, variant: string = 'thumb') => {
    if (imageUrls[photoId]) return imageUrls[photoId]

    try {
      const response = await fetch(`/api/photos/${photoId}/url?variant=${variant}`)
      if (!response.ok) throw new Error('Failed to get image URL')
      
      const { url } = await response.json()
      setImageUrls(prev => ({ ...prev, [photoId]: url }))
      return url
    } catch (error) {
      console.error('Error getting image URL:', error)
      // エラーの場合はシンプルなデータURIを返す
      const fallbackSvg = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#E5E7EB"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
                font-family="Arial, sans-serif" font-size="14" fill="#6B7280">
            Error Loading
          </text>
        </svg>
      `
      const fallbackUrl = `data:image/svg+xml;base64,${btoa(fallbackSvg)}`
      setImageUrls(prev => ({ ...prev, [photoId]: fallbackUrl }))
      return fallbackUrl
    }
  }, [imageUrls])

  // 画像URLを事前取得
  React.useEffect(() => {
    photos.forEach(photo => {
      if (!isVideo(photo.mime) && !imageUrls[photo.id]) {
        getImageUrl(photo.id, 'thumb')
      }
    })
  }, [photos, getImageUrl, imageUrls, isVideo])

  if (photos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          まだ写真がありません
        </h3>
        <p className="text-gray-600">
          最初の写真をアップロードしてみましょう！
        </p>
      </motion.div>
    )
  }

  return (
    <div className={cn('smugmug-photo-grid', className)}>
      <AnimatePresence>
        {photos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.05,
              type: "spring",
              stiffness: 200
            }}
            className="smugmug-photo-item group cursor-pointer"
            onClick={() => onPhotoClick(photo)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 画像/動画コンテナ */}
            <div className="relative w-full h-full overflow-hidden">
                  {isVideo(photo.mime) ? (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center mb-2 mx-auto">
                          <Play className="w-6 h-6 text-gray-500 ml-1" />
                        </div>
                        <p className="text-xs text-gray-600">動画</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* ローディング状態 */}
                      {!loadedImages.has(photo.id) && (
                        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
                      )}
                  
                  {/* 実際の画像 */}
                  {imageUrls[photo.id] && (
                    <img
                      src={imageUrls[photo.id]}
                      alt={photo.caption || photo.original_filename}
                      className={cn(
                        'w-full h-full object-cover transition-opacity duration-300',
                        loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'
                      )}
                      onLoad={() => handleImageLoad(photo.id)}
                    />
                  )}
                </>
              )}

              {/* オーバーレイ */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* 撮影日時 */}
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center space-x-1 text-white text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDateShort(new Date(photo.taken_at))}</span>
                </div>
              </div>

              {/* キャプション */}
              {photo.caption && (
                <div className="absolute top-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs bg-black/50 rounded-lg px-2 py-1 backdrop-blur-sm">
                    {photo.caption}
                  </p>
                </div>
              )}

              {/* 動画アイコン */}
              {isVideo(photo.mime) && (
                <div className="absolute top-2 right-2">
                  <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                    <Play className="w-3 h-3 text-white ml-0.5" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
