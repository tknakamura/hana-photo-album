-- ユーザーテーブルにプロフィール写真フィールドを追加
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;

-- 既存のユーザーにデフォルト値を設定
UPDATE users SET bio = '華ちゃんの家族' WHERE bio IS NULL;
