import { Pool } from 'pg'

// PostgreSQL接続プール
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  }
  return pool
}

// ユーザー認証
export async function authenticateUser(username: string, password: string) {
  const pool = getPool()
  const result = await pool.query(
    'SELECT * FROM users WHERE username = $1 AND password_hash = $2',
    [username, password]
  )
  return result.rows[0] || null
}

// ユーザー情報取得
export async function getUserById(id: number) {
  const pool = getPool()
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  return result.rows[0] || null
}

// 写真一覧取得
export async function getPhotos(limit = 50, offset = 0) {
  const pool = getPool()
  const result = await pool.query(
    'SELECT * FROM photos ORDER BY taken_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  )
  return result.rows
}

// 写真追加
export async function addPhoto(photoData: {
  file_path: string
  thumbnail_path?: string
  original_filename: string
  mime_type: string
  taken_at: Date
  uploaded_by?: number
  caption?: string
  metadata?: Record<string, unknown>
}) {
  const pool = getPool()
  const result = await pool.query(
    `INSERT INTO photos (file_path, thumbnail_path, original_filename, mime_type, taken_at, uploaded_by, caption, metadata)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      photoData.file_path,
      photoData.thumbnail_path || null,
      photoData.original_filename,
      photoData.mime_type,
      photoData.taken_at,
      photoData.uploaded_by || null,
      photoData.caption || null,
      JSON.stringify(photoData.metadata || {})
    ]
  )
  return result.rows[0]
}

// ユーザープロフィール更新
export async function updateUserProfile(id: number, updates: {
  name?: string
  bio?: string
  profile_image_url?: string
}) {
  const pool = getPool()
  const setClause = Object.keys(updates)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ')
  
  const values = [id, ...Object.values(updates).filter(v => v !== undefined)]
  
  const result = await pool.query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    values
  )
  return result.rows[0]
}
