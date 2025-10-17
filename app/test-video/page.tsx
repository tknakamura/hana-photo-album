'use client'

export default function TestVideoPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-2xl mb-4">動画テストページ</h1>
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full max-w-md mx-auto"
          controls
        >
          <source src="/background-video.mp4" type="video/mp4" />
          お使いのブラウザは動画をサポートしていません。
        </video>
        <p className="mt-4">上記の動画が表示されれば、動画ファイルは正常です。</p>
      </div>
    </div>
  )
}
