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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword 
    })

  } catch (error) {
    console.error('ログインエラー:', error)
    
    // データベース接続エラーの場合
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json({ error: 'データベース接続エラー: 環境変数が設定されていません' }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
