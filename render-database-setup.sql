-- Render.com PostgreSQL データベースセットアップ
-- このスクリプトをRender.comのPostgreSQLデータベースで実行してください

-- ユーザーテーブル（ID/パスワード認証用）
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 写真テーブル
CREATE TABLE IF NOT EXISTS photos (
  id SERIAL PRIMARY KEY,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  caption TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(taken_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 初期ユーザーの挿入（パスワードは平文で保存、本番ではハッシュ化が必要）
INSERT INTO users (username, password_hash, name, role, bio) VALUES
('tk', '0828', '管理者', 'admin', '華ちゃんの家族')
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash, 
  name = EXCLUDED.name, 
  role = EXCLUDED.role, 
  bio = EXCLUDED.bio;

INSERT INTO users (username, password_hash, name, role, bio) VALUES
('kie', '0521', 'ユーザーA', 'user', '華ちゃんの家族')
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash, 
  name = EXCLUDED.name, 
  role = EXCLUDED.role, 
  bio = EXCLUDED.bio;

INSERT INTO users (username, password_hash, name, role, bio) VALUES
('yoneko', '0823', 'ユーザーB', 'user', '華ちゃんの家族')
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash, 
  name = EXCLUDED.name, 
  role = EXCLUDED.role, 
  bio = EXCLUDED.bio;

INSERT INTO users (username, password_hash, name, role, bio) VALUES
('setsuko', '0412', 'ユーザーC', 'user', '華ちゃんの家族')
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash, 
  name = EXCLUDED.name, 
  role = EXCLUDED.role, 
  bio = EXCLUDED.bio;
