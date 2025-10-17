'use client'

import { useEffect, useRef } from 'react'

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // 動画の自動再生を確実にする
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log('Video autoplay failed:', error)
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10">
      {/* MP4動画背景 */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>

      {/* ぼかし効果とオーバーレイ */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-white/70" />
    </div>
  )
}
