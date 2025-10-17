import { redirect } from 'next/navigation'

export default function HomePage() {
  // クライアントサイドで認証チェックを行うため、常にログインページにリダイレクト
  redirect('/login')
}
