-- 家族メンバーテーブル
CREATE TABLE family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 写真テーブル
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  caption TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- インデックス
CREATE INDEX idx_photos_taken_at ON photos(taken_at DESC);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);

-- RLS (Row Level Security) を有効化
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- 家族メンバーは自分の情報のみアクセス可能
CREATE POLICY "Users can view own family member info" ON family_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own family member info" ON family_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 認証されたユーザーは全写真を閲覧可能
CREATE POLICY "Authenticated users can view all photos" ON photos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert photos" ON photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update own photos" ON photos
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Authenticated users can delete own photos" ON photos
  FOR DELETE USING (auth.uid() = uploaded_by);

-- ストレージバケットの作成
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

-- ストレージポリシー
CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update own photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
