import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/database'
import { createPresignedGet } from '@/lib/r2'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 一時的に認証をスキップしてテスト用URLを返す
    const { id: photoId } = await params
    const variant = req.nextUrl.searchParams.get('variant') || 'large'

    // データURIを使用してプレースホルダー画像を生成
    const width = variant === 'thumb' ? 200 : 400
    const height = variant === 'thumb' ? 200 : 300
    
    // SVGベースのデータURIを生成
    const svgContent = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#FFB6C1"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" 
              font-family="Arial, sans-serif" font-size="16" fill="#FFFFFF">
          Photo ${photoId}
        </text>
        <text x="50%" y="65%" text-anchor="middle" dy=".3em" 
              font-family="Arial, sans-serif" font-size="12" fill="#FFFFFF">
          (${variant})
        </text>
      </svg>
    `
    
    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`
    
    return NextResponse.json({ url: dataUri })
  } catch (error) {
    console.error('Photo URL generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

