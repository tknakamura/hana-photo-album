import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { addPhoto } from '@/lib/database'
// import { extractExif } from '@/lib/exif' // 現在未使用

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadedBy = formData.get('uploadedBy') as string

    if (!file) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 })
    }

    // ファイルサイズチェック（10MB制限）
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'ファイルサイズが大きすぎます（10MB以下）' }, { status: 400 })
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'サポートされていないファイル形式です' }, { status: 400 })
    }

    // ファイルを保存
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // アップロードディレクトリを作成
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // ファイル名を生成（タイムスタンプ + 元のファイル名）
    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const filePath = join(uploadDir, filename)

    // ファイルを保存
    await writeFile(filePath, buffer)

    // EXIFデータを抽出
    let metadata = {}
    let takenAt = new Date()

    if (file.type.startsWith('image/')) {
      try {
        // 一時ファイルとして保存してからEXIFを抽出
        const tempPath = join('/tmp', `temp_${Date.now()}_${file.name}`)
        await writeFile(tempPath, buffer)
        
        // 簡易的なメタデータ抽出（sharpライブラリを使用）
        const sharp = (await import('sharp')).default
        const imageMetadata = await sharp(buffer).metadata()
        
        metadata = {
          width: imageMetadata.width,
          height: imageMetadata.height,
          format: imageMetadata.format,
          space: imageMetadata.space,
          channels: imageMetadata.channels,
          depth: imageMetadata.depth,
          density: imageMetadata.density,
          hasAlpha: imageMetadata.hasAlpha,
          hasProfile: imageMetadata.hasProfile,
          orientation: imageMetadata.orientation
        }
        
        // 撮影日時は現在時刻を使用（実際のEXIF解析は複雑なため）
        takenAt = new Date()
      } catch (error) {
        console.warn('EXIFデータの抽出に失敗:', error)
        takenAt = new Date()
      }
    }

    // データベースに記録
    const photo = await addPhoto({
      file_path: `/uploads/${filename}`,
      original_filename: file.name,
      mime_type: file.type,
      taken_at: takenAt,
      uploaded_by: uploadedBy ? parseInt(uploadedBy) : undefined,
      metadata: metadata
    })

    return NextResponse.json({ 
      success: true, 
      photo: {
        id: photo.id,
        file_path: photo.file_path,
        original_filename: photo.original_filename,
        mime_type: photo.mime_type,
        taken_at: photo.taken_at,
        metadata: photo.metadata
      }
    })

  } catch (error) {
    console.error('アップロードエラー:', error)
    
    // データベース接続エラーの場合
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json({ error: 'データベース接続エラー: 環境変数が設定されていません' }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 })
  }
}
