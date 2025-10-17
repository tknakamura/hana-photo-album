'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Calendar, Camera, Play } from 'lucide-react'
import { cn, formatDateShort } from '@/lib/utils'

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

interface PhotoGridProps {
  photos: Photo[]
  onPhotoClick: (photo: Photo) => void
  className?: string
}

export default function PhotoGrid({ photos, onPhotoClick, className }: PhotoGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())

  const handleImageLoad = useCallback((photoId: string) => {
    setLoadedImages(prev => new Set(prev).add(photoId))
  }, [])

  const isVideo = (mimeType: string) => mimeType.startsWith('video/')

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
                  {isVideo(photo.mime_type) ? (
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
                  <Image
                    src={photo.thumbnail_path || photo.file_path}
                    alt={photo.caption || photo.original_filename}
                    fill
                    className={cn(
                      'image-optimized transition-opacity duration-300',
                      loadedImages.has(photo.id) ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => handleImageLoad(photo.id)}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
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
              {isVideo(photo.mime_type) && (
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
