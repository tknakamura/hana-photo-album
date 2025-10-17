# 華ちゃんのフォトアルバム 🌸

家族専用の華ちゃんの成長記録フォトアルバムウェブサイトです。

## 🌟 特徴

- **モバイルファースト**: スマートフォンでの使用に最適化
- **可愛らしいUI**: パステルカラーベースの子供向けデザイン
- **自動日付ソート**: EXIFデータから撮影日時を自動読み取り
- **家族限定**: 招待リンクによる安全なアクセス制御
- **永久保存**: Supabaseによる信頼性の高いデータ保存

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Supabase (認証、データベース、ストレージ)
- **デプロイ**: Vercel
- **画像処理**: sharp (EXIF抽出)、next/image (最適化)
- **アニメーション**: Framer Motion

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. `supabase/migrations/` フォルダ内のSQLファイルを実行してデータベースをセットアップ
3. ストレージバケット `photos` を作成
4. Row Level Security (RLS) ポリシーを適用

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 📱 使用方法

### 初回セットアップ

1. 招待コード `HANA2024` または `hana-family` を使用してアカウントを作成
2. 家族メンバーとして登録
3. 写真・動画のアップロード開始

### 主な機能

- **写真アップロード**: ドラッグ&ドロップで複数ファイル対応
- **自動日付ソート**: EXIFデータから撮影日時を自動取得
- **ギャラリー表示**: タイムライン形式で写真を表示
- **写真詳細**: フルスクリーンで写真を閲覧
- **家族限定アクセス**: 招待リンクによる安全な共有

## 🎨 デザイン

- **カラーパレット**: パステルピンク、パープル、ブルー
- **フォント**: Nunito (可愛らしい丸みのあるフォント)
- **アニメーション**: スムーズなトランジションとホバー効果
- **レスポンシブ**: モバイルファーストの設計

## 🔒 セキュリティ

- Supabase RLSによるデータ保護
- 署名付きURLによる画像アクセス制御
- 家族限定の招待制アクセス
- 認証されたユーザーのみが写真を閲覧・アップロード可能

## 📊 データベース構造

### テーブル

- `family_members`: 家族メンバー情報
- `photos`: 写真・動画のメタデータ
- `albums`: アルバム情報 (将来の拡張用)
- `reactions`: いいね・リアクション (将来の拡張用)

### ストレージ

- `photos`: オリジナル画像・動画ファイル
- `thumbnails`: 自動生成されたサムネイル

## 🚀 デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com)でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ完了

### 環境変数の設定

Vercelのダッシュボードで以下の環境変数を設定：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## 🔮 将来の拡張予定

- **AI機能**: 顔認識による自動タグ付け
- **インタラクティブ機能**: コメント・いいね機能
- **共有機能**: アルバム単位での外部共有
- **思い出機能**: 「1年前の今日」通知
- **データ管理**: 一括ダウンロード機能

## 💰 コスト

- **初期費用**: 無料
- **月額費用**: 
  - Supabase Free: $0 (1GB ストレージ、2GB 帯域幅)
  - Supabase Pro: $25 (8GB ストレージ、50GB 帯域幅)
  - Vercel Hobby: $0

## 📝 ライセンス

このプロジェクトは家族専用のプライベートプロジェクトです。

## 🤝 サポート

質問や問題がある場合は、家族内で相談してください。

---

**Made with ❤️ for 華ちゃん**