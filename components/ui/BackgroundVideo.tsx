'use client'

import { useEffect, useRef, useState } from 'react'

export default function BackgroundVideo() {
  const [isLoaded, setIsLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  console.log('BackgroundVideo component rendered')

  useEffect(() => {
    // 動画の自動再生を確実にする
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay failed:', error)
        // 自動再生が失敗した場合はWebP画像を表示
        const img = document.querySelector('img[src="/background-animation.webp"]') as HTMLImageElement
        if (img) {
          img.style.display = 'block'
        }
        if (videoRef.current) {
          videoRef.current.style.display = 'none'
        }
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* MP4動画背景（メイン） */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      
      {/* フォールバック: WebP静止画 */}
      <div className="absolute inset-0">
        <img
          src="/background-animation.webp"
          alt="Background"
          className="w-full h-full object-cover"
          onLoad={() => setIsLoaded(true)}
        />
      </div>

      {/* 背景のみぼかし効果（顔は鮮明） */}
      <div className="absolute inset-0 backdrop-blur-md bg-white/30" />
      
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white/80" />
    </div>
  )
}
