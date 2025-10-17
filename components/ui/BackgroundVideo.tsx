'use client'

import { useEffect, useRef, useState } from 'react'

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay failed:', error)
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full h-full -z-10">
      {/* MP4動画背景 */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedData={() => {
          console.log('Video loaded successfully')
          setIsVideoLoaded(true)
        }}
        onError={(e) => {
          console.error('Video load error:', e)
          setIsVideoLoaded(false)
        }}
        style={{ 
          display: isVideoLoaded ? 'block' : 'none',
          opacity: isVideoLoaded ? 1 : 0,
          transition: 'opacity 0.5s ease-in-out'
        }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
        お使いのブラウザは動画をサポートしていません。
      </video>

      {/* フォールバック背景 */}
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-50 to-orange-100"
        style={{ 
          display: isVideoLoaded ? 'none' : 'block',
          opacity: isVideoLoaded ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out'
        }}
      />

      {/* ぼかし効果とオーバーレイ */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/70" />
    </div>
  )
}
