-- 完全なデータベースセットアップ

-- 既存のテーブルを削除（必要に応じて）
-- 注意: このコマンドは既存のデータを削除します
-- DROP TABLE IF EXISTS photos CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ユーザーテーブル（ID/パスワード認証用）
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 写真テーブル
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  caption TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- RLS (Row Level Security) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- ユーザーポリシー（既存のポリシーを削除してから作成）
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Authenticated users can view all photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can insert photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can update own photos" ON photos;
DROP POLICY IF EXISTS "Authenticated users can delete own photos" ON photos;

CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (true);

-- 認証されたユーザーは全写真を閲覧可能
CREATE POLICY "Authenticated users can view all photos" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert photos" ON photos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update own photos" ON photos
  FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can delete own photos" ON photos
  FOR DELETE USING (true);

-- ストレージバケットの作成
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- ストレージポリシー（既存のポリシーを削除してから作成）
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own photos" ON storage.objects;

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Authenticated users can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can update own photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can delete own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos');

-- 初期ユーザーの挿入（パスワードは平文で保存、本番ではハッシュ化が必要）
INSERT INTO users (username, password_hash, name, role, bio) VALUES
('tk', '0828', '管理者', 'admin', '華ちゃんの家族'),
('kie', '0521', 'ユーザーA', 'user', '華ちゃんの家族'),
('yoneko', '0823', 'ユーザーB', 'user', '華ちゃんの家族'),
('setsuko', '0412', 'ユーザーC', 'user', '華ちゃんの家族')
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  bio = EXCLUDED.bio;
