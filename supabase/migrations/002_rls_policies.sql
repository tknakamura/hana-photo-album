-- Enable Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Family members policies
CREATE POLICY "Users can view all family members" ON family_members
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own family member record" ON family_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family member record" ON family_members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete family members" ON family_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Photos policies
CREATE POLICY "Authenticated users can view all photos" ON photos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert photos" ON photos
  FOR INSERT WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can update their own photos" ON photos
  FOR UPDATE USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their own photos" ON photos
  FOR DELETE USING (auth.uid() = uploaded_by);

-- Albums policies
CREATE POLICY "Authenticated users can view all albums" ON albums
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create albums" ON albums
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own albums" ON albums
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own albums" ON albums
  FOR DELETE USING (auth.uid() = created_by);

-- Photo albums junction table policies
CREATE POLICY "Authenticated users can view photo-album relationships" ON photo_albums
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can add photos to albums" ON photo_albums
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can remove photos from albums" ON photo_albums
  FOR DELETE USING (auth.role() = 'authenticated');

-- Reactions policies
CREATE POLICY "Authenticated users can view all reactions" ON reactions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can add reactions" ON reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions" ON reactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON reactions
  FOR DELETE USING (auth.uid() = user_id);
