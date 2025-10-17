'use client'

import { useEffect, useRef, useState } from 'react'

export default function BackgroundVideo() {
  const [isLoaded, setIsLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // WebPがサポートされていない場合のフォールバック
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0
    }

    if (!checkWebPSupport() && videoRef.current) {
      // WebPがサポートされていない場合はMP4を表示
      const img = document.querySelector('img[src="/background-animation.webp"]') as HTMLImageElement
      if (img) {
        img.style.display = 'none'
      }
      if (videoRef.current) {
        videoRef.current.style.display = 'block'
        videoRef.current.play()
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* WebP背景 */}
      <div className="absolute inset-0">
        <img
          src="/background-animation.webp"
          alt="Background"
          className="w-full h-full object-cover"
          onLoad={() => setIsLoaded(true)}
        />
      </div>
      
      {/* フォールバック: MP4 */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover hidden"
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      {/* 背景のみぼかし効果（顔は鮮明） */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/30" />
      
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/80" />
    </div>
  )
}
