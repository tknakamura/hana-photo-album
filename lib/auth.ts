// 認証関連のユーティリティ関数

export interface User {
  id: string
  username: string
  name: string
  role: 'admin' | 'user'
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
