import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/database'
import { createPresignedGet } from '@/lib/r2'
import { getCurrentUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 一時的に認証をスキップしてテスト用URLを返す
    const { id: photoId } = await params
    const variant = req.nextUrl.searchParams.get('variant') || 'large'

    // テスト用のダミーURLを返す
    const dummyUrl = `https://via.placeholder.com/400x300/FFB6C1/FFFFFF?text=Photo+${photoId}+(${variant})`
    
    return NextResponse.json({ url: dummyUrl })
  } catch (error) {
    console.error('Photo URL generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

