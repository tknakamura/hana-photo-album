import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/database'
import { createPresignedGet } from '@/lib/r2'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: photoId } = await params
    const variant = req.nextUrl.searchParams.get('variant') || 'large'

    const pool = getPool()
    
    // family_idで認可
    const photoResult = await pool.query(
      'SELECT bucket_key FROM photos WHERE id = $1 AND family_id = $2',
      [photoId, user.family_id]
    )
    
    if (photoResult.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    let key = photoResult.rows[0].bucket_key

    // バリアント取得
    if (variant !== 'orig') {
      const variantResult = await pool.query(
        'SELECT bucket_key FROM photo_variants WHERE photo_id = $1 AND variant = $2',
        [photoId, variant]
      )
      if (variantResult.rows.length > 0) {
        key = variantResult.rows[0].bucket_key
      }
    }

    const url = await createPresignedGet({ key })
    
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Photo URL generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

