import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/database'
import { createPresignedPut } from '@/lib/r2'
import { getCurrentUserFromRequest } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    // 認証チェック
    const user = await getCurrentUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { filename, size, mime, sha256 } = await req.json()

    // バリデーション
    if (!['image/jpeg', 'image/png', 'image/webp', 'video/mp4'].includes(mime)) {
      return NextResponse.json({ error: 'Invalid MIME type' }, { status: 400 })
    }
    if (size > 2 * 1024 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // 重複チェック
    const pool = getPool()
    const existing = await pool.query(
      'SELECT id FROM photos WHERE family_id = $1 AND sha256 = $2',
      [user.family_id, sha256]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ 
        duplicate: true, 
        photoId: existing.rows[0].id 
      })
    }

    // 一時レコード作成
    const photoId = crypto.randomUUID()
    const ext = mime.split('/')[1]
    const key = `orig/${user.family_id}/${photoId}.${ext}`

    await pool.query(
      `INSERT INTO photos (id, family_id, owner_user_id, bucket_key, mime, bytes, sha256) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [photoId, user.family_id, user.id, key, mime, size, sha256]
    )

    // 署名付きPUT URL発行
    const putUrl = await createPresignedPut({ key, mime })

    return NextResponse.json({ putUrl, photoId, key })
  } catch (error) {
    console.error('Upload init error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

