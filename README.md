# 華ちゃんのフォトアルバム 🌸

家族専用の華ちゃんの成長記録フォトアルバムウェブサイトです。

## 🌟 特徴

- **モバイルファースト**: スマートフォンでの使用に最適化
- **可愛らしいUI**: パステルカラーベースの子供向けデザイン
- **自動日付ソート**: EXIFデータから撮影日時を自動読み取り
- **家族限定**: 招待リンクによる安全なアクセス制御
- **高速ストレージ**: Cloudflare R2による高速・低コストな画像保存
- **自動サムネイル**: アップロード時の自動サムネイル生成

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **データベース**: Render Managed PostgreSQL
- **ストレージ**: Cloudflare R2 (署名付きURL)
- **デプロイ**: Render
- **画像処理**: sharp (EXIF抽出、サムネイル生成)
- **アニメーション**: Framer Motion

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Cloudflare R2
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_BUCKET=hana-photos
R2_ACCESS_KEY=your-access-key
R2_SECRET_KEY=your-secret-key
```

### 3. データベースとR2の設定

#### データベース (Render Managed PostgreSQL)
1. [Render](https://render.com)でPostgreSQLデータベースを作成
2. `render-migration.sql` を実行してデータベーススキーマをセットアップ

#### Cloudflare R2
1. [Cloudflare R2](https://dash.cloudflare.com)でバケット `hana-photos` を作成
2. API Tokenを発行（Read/Write権限）
3. CORS設定を追加:
```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://your-domain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

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

- family_idによるデータ分離とアクセス制御
- R2署名付きURLによる画像アクセス制御
- 家族限定の招待制アクセス
- 認証されたユーザーのみが写真を閲覧・アップロード可能
- 重複ファイル検知（SHA256ハッシュ）

## 📊 データベース構造

### テーブル

- `users`: 家族メンバー情報（family_idでグループ化）
- `photos`: 写真・動画のメタデータ
- `photo_variants`: サムネイル・派生画像の情報
- `albums`: アルバム情報 (将来の拡張用)
- `album_photos`: アルバムと写真の関連 (将来の拡張用)

### R2ストレージ構造

```
hana-photos/
├── orig/<family_id>/<photo_id>.jpg    # オリジナル画像
├── thumb/<family_id>/<photo_id>.webp  # サムネイル (320px)
└── large/<family_id>/<photo_id>.webp  # 大サイズ (2048px)
```

## 🚀 デプロイ

### Renderへのデプロイ

1. GitHubリポジトリにプッシュ
2. [Render](https://render.com)でWeb Serviceを作成
3. 環境変数を設定
4. デプロイ完了

### 環境変数の設定

Renderのダッシュボードで以下の環境変数を設定：

- `DATABASE_URL` (Render Managed PostgreSQLの接続文字列)
- `R2_ENDPOINT`
- `R2_BUCKET`
- `R2_ACCESS_KEY`
- `R2_SECRET_KEY`

## 🔮 将来の拡張予定

- **AI機能**: 顔認識による自動タグ付け
- **インタラクティブ機能**: コメント・いいね機能
- **共有機能**: アルバム単位での外部共有
- **思い出機能**: 「1年前の今日」通知
- **データ管理**: 一括ダウンロード機能

## 💰 コスト

- **初期費用**: 無料
- **月額費用**: 
  - Render Web Service: $7 (Starter)
  - Render PostgreSQL: $7 (Starter)
  - Cloudflare R2: $0.015/GB/月 (エグレス無料)
  - 合計: 約$14/月 + ストレージ料金

## 📝 ライセンス

このプロジェクトは家族専用のプライベートプロジェクトです。

## 🤝 サポート

質問や問題がある場合は、家族内で相談してください。

---

**Made with ❤️ for 華ちゃん**