'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Intersection Observer でビデオの可視性を監視
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observerRef.current.observe(video)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // ビデオの再生制御
  useEffect(() => {
    const video = videoRef.current
    if (!video || hasError) return

    const handlePlay = async () => {
      try {
        // バッファリングを待つ
        await video.play()
        console.log('Video autoplay successful')
      } catch (error) {
        console.log('Video autoplay failed:', error)
        // オートプレイが失敗した場合は静音で再試行
        video.muted = true
        try {
          await video.play()
        } catch (retryError) {
          console.log('Video autoplay retry failed:', retryError)
          setHasError(true)
        }
      }
    }

    if (isIntersecting && video.readyState >= 3) {
      handlePlay()
    }
  }, [isIntersecting, hasError])

  const handleVideoLoad = useCallback(() => {
    console.log('Video loaded successfully')
    setIsVideoLoaded(true)
    setHasError(false)
  }, [])

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video load error:', e)
    setIsVideoLoaded(false)
    setHasError(true)
  }, [])

  const handleVideoCanPlay = useCallback(() => {
    if (videoRef.current && isIntersecting && !hasError) {
      videoRef.current.play().catch((error) => {
        console.log('Video play failed:', error)
      })
    }
  }, [isIntersecting, hasError])

  return (
    <div className="fixed inset-0 w-full h-full -z-10" role="img" aria-label="背景動画">
      {/* MP4動画背景 - パフォーマンス最適化 */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover"
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        onCanPlay={handleVideoCanPlay}
        style={{ 
          display: (isVideoLoaded && !hasError) ? 'block' : 'none',
          opacity: (isVideoLoaded && !hasError) ? 1 : 0,
          transition: 'opacity 0.8s ease-in-out'
        }}
        aria-hidden="true"
      >
        <source src="/background-video.mp4" type="video/mp4" />
        <source src="/background-animation.webp" type="image/webp" />
        お使いのブラウザは動画をサポートしていません。
      </video>

      {/* 改善されたフォールバック背景 */}
      <div 
        className="absolute inset-0 w-full h-full bg-white"
        style={{ 
          display: (isVideoLoaded && !hasError) ? 'none' : 'block',
          opacity: (isVideoLoaded && !hasError) ? 0 : 1,
          transition: 'opacity 0.8s ease-in-out'
        }}
        aria-hidden="true"
      >
        {/* パターンオーバーレイ */}
        <div className="absolute inset-0 opacity-5" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               backgroundSize: '60px 60px'
             }} 
        />
      </div>

      {/* 改善されたぼかし効果とオーバーレイ */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/15" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/25 to-white/60" />
      
      {/* 追加の視覚的エフェクト */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/20" />
    </div>
  )
}
