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
        onLoadedData={() => setIsVideoLoaded(true)}
        style={{ display: isVideoLoaded ? 'block' : 'none' }}
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      {/* フォールバック背景 */}
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-50 to-orange-100"
        style={{ display: isVideoLoaded ? 'none' : 'block' }}
      />

      {/* ぼかし効果とオーバーレイ */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/70" />
    </div>
  )
}
