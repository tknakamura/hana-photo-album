-- Render PostgreSQL用マイグレーション
-- 既存テーブル削除
DROP TABLE IF EXISTS photo_variants CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS album_photos CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- usersテーブル（設計書準拠 + family_id必須）
CREATE TABLE users(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'parent' CHECK (role IN ('admin', 'parent', 'child')),
  profile_image_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- photosテーブル（設計書完全準拠）
CREATE TABLE photos(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id),
  bucket_key TEXT NOT NULL,
  mime TEXT NOT NULL,
  bytes BIGINT NOT NULL,
  width INT, 
  height INT,
  taken_at TIMESTAMPTZ,
  exif_json JSONB,
  sha256 CHAR(64) NOT NULL,
  phash CHAR(16),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, sha256)
);

-- photo_variantsテーブル（設計書完全準拠）
CREATE TABLE photo_variants(
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  variant TEXT NOT NULL,
  bucket_key TEXT NOT NULL,
  width INT, 
  height INT, 
  bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(photo_id, variant)
);

-- MVP版では使わないが、将来のためにスキーマ作成
CREATE TABLE albums(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL,
  title TEXT NOT NULL,
  cover_photo_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE album_photos(
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  sort_key BIGINT DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(album_id, photo_id)
);

-- インデックス
CREATE INDEX idx_photos_family_taken ON photos(family_id, taken_at DESC);
CREATE INDEX idx_users_family ON users(family_id);
CREATE INDEX idx_users_username ON users(username);

-- 初期データ: 全員同じfamily_idで家族として登録
DO $$
DECLARE
  family_uuid UUID := gen_random_uuid();
BEGIN
  INSERT INTO users (family_id, username, password_hash, name, role, bio) VALUES
  (family_uuid, 'tk', '0828', '管理者', 'admin', '華ちゃんの家族'),
  (family_uuid, 'kie', '0521', 'ユーザーA', 'parent', '華ちゃんの家族'),
  (family_uuid, 'yoneko', '0823', 'ユーザーB', 'parent', '華ちゃんの家族'),
  (family_uuid, 'setsuko', '0412', 'ユーザーC', 'parent', '華ちゃんの家族');
END $$;

-- テーブル確認
SELECT 'Migration completed' AS status;
SELECT username, name, role, family_id FROM users;

