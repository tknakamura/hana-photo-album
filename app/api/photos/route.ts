import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/database'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // 一時的に認証をスキップしてテスト用データを返す
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // テスト用のダミーデータを返す
    const dummyPhotos = Array.from({ length: Math.min(limit, 6) }, (_, i) => ({
      id: `photo-${i + 1}`,
      bucket_key: `dummy-photo-${i + 1}.jpg`,
      original_filename: `photo-${i + 1}.jpg`,
      taken_at: new Date(Date.now() - i * 86400000).toISOString(), // 過去の日付
      created_at: new Date().toISOString(),
      caption: `テスト写真 ${i + 1}`,
      mime: 'image/jpeg',
      width: 800,
      height: 600,
      bytes: 1024000,
      owner_name: 'テストユーザー'
    }))

    return NextResponse.json({ photos: dummyPhotos })
  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}