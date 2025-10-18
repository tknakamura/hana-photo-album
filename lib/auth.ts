// 認証関連のユーティリティ関数
import { NextRequest } from 'next/server'
import { getPool } from './database'

export interface User {
  id: string
  family_id: string
  username: string
  name: string
  role: 'admin' | 'parent' | 'child'
  profile_image_url?: string
  bio?: string
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

export function isAdmin(): boolean {
  const user = getCurrentUser()
  return user?.role === 'admin'
}

export function logout(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('user')
}

// サーバーサイド認証（API用）
export async function getCurrentUserFromRequest(req: NextRequest): Promise<User | null> {
  try {
    // セッション/トークンからユーザー取得（既存実装に合わせる）
    // 仮実装: Cookie/Headerからユーザー情報取得
    const token = req.cookies.get('auth_token')?.value
    if (!token) return null

    const pool = getPool()
    const result = await pool.query(
      'SELECT id, username, family_id, role, name, profile_image_url, bio FROM users WHERE id = $1',
      [token] // 実際はJWT検証など
    )
    
    if (result.rows.length === 0) return null
    
    const user = result.rows[0]
    return {
      id: user.id,
      family_id: user.family_id,
      username: user.username,
      name: user.name,
      role: user.role,
      profile_image_url: user.profile_image_url,
      bio: user.bio
    }
  } catch (error) {
    console.error('getCurrentUserFromRequest error:', error)
    return null
  }
}
