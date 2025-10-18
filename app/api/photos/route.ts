import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/database'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const pool = getPool()
    const result = await pool.query(
      `SELECT p.*, u.name as owner_name 
       FROM photos p 
       JOIN users u ON p.owner_user_id = u.id 
       WHERE p.family_id = $1 
       ORDER BY p.taken_at DESC 
       LIMIT $2 OFFSET $3`,
      [user.family_id, limit, offset]
    )

    return NextResponse.json({ photos: result.rows })
  } catch (error) {
    console.error('Get photos error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}