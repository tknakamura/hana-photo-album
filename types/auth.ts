// 認証関連の型定義

export interface User {
  id: number
  username: string
  email?: string
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  error?: string
  rateLimit?: {
    remaining: number
    resetTime: number
  }
}

export interface ValidationErrors {
  [key: string]: string
}

export interface LoginAttempts {
  count: number
  lastAttempt: number
}

export interface RateLimitInfo {
  allowed: boolean
  remaining: number
}

// フォーム状態の型定義
export interface LoginFormState {
  username: string
  password: string
  isLoading: boolean
  error: string
  showPassword: boolean
  isValidating: boolean
  validationErrors: ValidationErrors
  loginAttempts: number
}

// セキュリティ関連の型定義
export interface SecurityHeaders {
  'X-Content-Type-Options': string
  'X-Frame-Options': string
  'X-XSS-Protection': string
  'Referrer-Policy': string
  'X-RateLimit-Remaining': string
  'X-RateLimit-Reset': string
}

// レート制限の設定
export interface RateLimitConfig {
  MAX_ATTEMPTS: number
  RATE_LIMIT_WINDOW: number
}

// 入力検証結果の型定義
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

// ログイン統計の型定義
export interface LoginStats {
  totalAttempts: number
  successfulLogins: number
  failedLogins: number
  averageResponseTime: number
}

