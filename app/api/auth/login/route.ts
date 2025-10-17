import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/database'
import { headers } from 'next/headers'

// レート制限のためのメモリキャッシュ（本番環境ではRedisなどを推奨）
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15分

// CSRFトークン検証（簡易版）
async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  const headersList = await headers()
  const xRequestedWith = headersList.get('x-requested-with')
  const origin = headersList.get('origin')
  const referer = headersList.get('referer')
  
  // XMLHttpRequestヘッダーの確認
  if (xRequestedWith !== 'XMLHttpRequest') {
    return false
  }
  
  // Originヘッダーの確認（本番環境ではより厳密に）
  if (origin && !origin.includes('hana-photo-album.onrender.com')) {
    return false
  }
  
  return true
}

// レート制限チェック
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier)
  
  if (!attempts) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }
  
  // 時間窓をリセット
  if (now - attempts.lastAttempt > RATE_LIMIT_WINDOW) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 }
  }
  
  // 試行回数チェック
  if (attempts.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 }
  }
  
  // 試行回数を増加
  attempts.count++
  attempts.lastAttempt = now
  
  return { allowed: true, remaining: MAX_ATTEMPTS - attempts.count }
}

// 入力検証
function validateInput(username: string, password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!username || typeof username !== 'string') {
    errors.push('ユーザー名が無効です')
  } else if (username.length < 3 || username.length > 50) {
    errors.push('ユーザー名は3文字以上50文字以下で入力してください')
  } else if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('ユーザー名は英数字、ハイフン、アンダースコアのみ使用できます')
  }
  
  if (!password || typeof password !== 'string') {
    errors.push('パスワードが無効です')
  } else if (password.length < 6 || password.length > 128) {
    errors.push('パスワードは6文字以上128文字以下で入力してください')
  }
  
  return { valid: errors.length === 0, errors }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // CSRFトークン検証
    if (!(await validateCSRFToken(request))) {
      return NextResponse.json(
        { error: 'セキュリティトークンが無効です' }, 
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { username, password } = body
    
    // 入力検証
    const validation = validateInput(username, password)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(', ') }, 
        { status: 400 }
      )
    }
    
    // レート制限チェック
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimit = checkRateLimit(`${clientIP}:${username}`)
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'ログイン試行回数が上限に達しました。15分後に再試行してください。',
          rateLimit: {
            remaining: rateLimit.remaining,
            resetTime: RATE_LIMIT_WINDOW
          }
        }, 
        { status: 429 }
      )
    }
    
    // データベースで認証
    const user = await authenticateUser(username, password)
    
    if (!user) {
      return NextResponse.json(
        { 
          error: 'ログインに失敗しました。ユーザー名とパスワードを確認してください。',
          rateLimit: {
            remaining: rateLimit.remaining,
            resetTime: RATE_LIMIT_WINDOW
          }
        }, 
        { status: 401 }
      )
    }
    
    // ログイン成功時はレート制限をリセット
    loginAttempts.delete(`${clientIP}:${username}`)
    
    // パスワードハッシュを除外してユーザー情報を返す
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...userWithoutPassword } = user
    
    // セキュリティヘッダーの設定
    const response = NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      rateLimit: {
        remaining: MAX_ATTEMPTS,
        resetTime: 0
      }
    })
    
    // セキュリティヘッダーの追加
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('X-RateLimit-Remaining', MAX_ATTEMPTS.toString())
    response.headers.set('X-RateLimit-Reset', '0')
    
    // ログ出力（本番環境では適切なログシステムを使用）
    const processingTime = Date.now() - startTime
    console.log(`Login successful for user: ${username}, IP: ${clientIP}, Time: ${processingTime}ms`)
    
    return response

  } catch (error) {
    console.error('ログインエラー:', error)
    
    // データベース接続エラーの場合
    if (error instanceof Error && error.message.includes('DATABASE_URL')) {
      return NextResponse.json(
        { error: 'データベース接続エラー: 環境変数が設定されていません' }, 
        { status: 500 }
      )
    }
    
    // その他のエラー
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。しばらく時間をおいて再試行してください。' }, 
      { status: 500 }
    )
  }
}
