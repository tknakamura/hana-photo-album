'use client'

import { useEffect, useRef, useState } from 'react'

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [, setIsVideoLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = async () => {
      try {
        // まずmutedで再生を試行
        video.muted = true
        await video.play()
        console.log('Video autoplay successful')
        setIsVideoLoaded(true)
        setHasError(false)
      } catch (error) {
        console.log('Video autoplay failed:', error)
        setHasError(true)
      }
    }

    // ビデオが読み込まれたら再生
    if (video.readyState >= 3) {
      handlePlay()
    } else {
      video.addEventListener('canplay', handlePlay)
      video.addEventListener('loadeddata', () => {
        console.log('Video loaded data')
        setIsVideoLoaded(true)
      })
    }

    return () => {
      video.removeEventListener('canplay', handlePlay)
      video.removeEventListener('loadeddata', () => {})
    }
  }, [])

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video load error:', e)
    setHasError(true)
  }

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10" 
      role="img" 
      aria-label="背景動画"
      style={{
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* MP4動画背景 - シンプルな実装 */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute top-0 left-0 w-full h-full object-cover"
        style={{
          opacity: hasError ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          objectPosition: '0% center',
          left: '-15%',
          width: '130%',
          height: '100vh',
          objectFit: 'cover'
        }}
        onError={handleVideoError}
        onLoadedData={() => {
          console.log('Video loaded successfully')
          setIsVideoLoaded(true)
          setHasError(false)
        }}
        aria-hidden="true"
      >
        <source src="/background-video.mp4" type="video/mp4" />
        お使いのブラウザは動画をサポートしていません。
      </video>

      {/* フォールバック背景 */}
      {hasError && (
        <div 
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-orange-50 via-pink-50 to-orange-100"
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
      )}

      {/* ぼかし効果とオーバーレイ */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/15" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/40" />
    </div>
  )
}
