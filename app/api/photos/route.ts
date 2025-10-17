import { NextRequest, NextResponse } from 'next/server'
import { getPhotos } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const photos = await getPhotos(limit, offset)

    return NextResponse.json({ 
      success: true, 
      photos: photos.map(photo => ({
        id: photo.id,
        file_path: photo.file_path,
        thumbnail_path: photo.thumbnail_path,
        original_filename: photo.original_filename,
        mime_type: photo.mime_type,
        taken_at: photo.taken_at,
        uploaded_at: photo.uploaded_at,
        caption: photo.caption,
        metadata: photo.metadata
      }))
    })

  } catch (error) {
    console.error('写真取得エラー:', error)
    
    // データベース接続エラーの場合
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json({ error: 'データベース接続エラー: 環境変数が設定されていません' }, { status: 500 })
    }
    
    return NextResponse.json({ error: '写真の取得に失敗しました' }, { status: 500 })
  }
}
