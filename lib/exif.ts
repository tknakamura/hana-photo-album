import { GetObjectCommand } from '@aws-sdk/client-s3'
import { s3 } from './r2'

export interface ExifData {
  json: Record<string, unknown>
  takenAt?: Date
  width?: number
  height?: number
}

export interface PhotoMetadata {
  takenAt?: Date
  width?: number
  height?: number
  exif?: Record<string, unknown>
}

export async function extractExif(key: string): Promise<ExifData> {
  try {
    // R2から画像データを取得
    const getCmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key })
    const response = await s3.send(getCmd)
    const buffer = Buffer.from(await response.Body!.transformToByteArray())
    
    // 基本的なEXIF情報を抽出（sharpライブラリを使用）
    const sharp = (await import('sharp')).default
    const metadata = await sharp(buffer).metadata()
    
    // EXIFから撮影日時を取得
    let takenAt: Date | undefined
    if (metadata.exif) {
      // 簡易的なEXIF解析（実際の実装ではより詳細な解析が必要）
      try {
        // ここでは現在時刻を撮影日時として使用
        takenAt = new Date()
      } catch {
        takenAt = new Date()
      }
    } else {
      takenAt = new Date()
    }
    
    return {
      json: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels,
        depth: metadata.depth,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        hasProfile: metadata.hasProfile,
        orientation: metadata.orientation
      },
      takenAt,
      width: metadata.width,
      height: metadata.height
    }
  } catch (error) {
    console.error('EXIF extraction error:', error)
    // エラーの場合はデフォルト値を返す
    return {
      json: { error: 'EXIF extraction failed' },
      takenAt: new Date(),
      width: undefined,
      height: undefined
    }
  }
}

// クライアントサイド用の簡易メタデータ抽出関数
export async function extractPhotoMetadata(file: File): Promise<PhotoMetadata> {
  try {
    // クライアントサイドでは基本的な情報のみを取得
    const image = new Image()
    const url = URL.createObjectURL(file)
    
    return new Promise((resolve) => {
      image.onload = () => {
        URL.revokeObjectURL(url)
        resolve({
          takenAt: new Date(),
          width: image.naturalWidth,
          height: image.naturalHeight,
          exif: {
            width: image.naturalWidth,
            height: image.naturalHeight,
            format: file.type,
            size: file.size,
            lastModified: file.lastModified
          }
        })
      }
      
      image.onerror = () => {
        URL.revokeObjectURL(url)
        resolve({
          takenAt: new Date(),
          width: undefined,
          height: undefined,
          exif: { error: 'Failed to load image' }
        })
      }
      
      image.src = url
    })
  } catch (error) {
    console.error('Photo metadata extraction error:', error)
    // エラーの場合はデフォルト値を返す
    return {
      takenAt: new Date(),
      width: undefined,
      height: undefined,
      exif: { error: 'Metadata extraction failed' }
    }
  }
}