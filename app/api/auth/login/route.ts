import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'ユーザー名とパスワードが必要です' }, { status: 400 })
    }

    // データベースで認証
    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json({ error: 'ログインに失敗しました' }, { status: 401 })
    }

    // パスワードハッシュを除外してユーザー情報を返す
    const { password_hash: _, ...userWithoutPassword } = user

    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword 
    })

  } catch (error) {
    console.error('ログインエラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
