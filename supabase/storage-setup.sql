-- ============================================
-- CONFIGURAÇÃO DE STORAGE BUCKETS
-- ============================================
-- Execute este script no SQL Editor do Supabase após criar os buckets

-- ============================================
-- CRIAR BUCKETS (Execute via interface ou CLI)
-- ============================================
-- Os buckets devem ser criados via interface do Supabase ou CLI:
-- 1. videos (público: false)
-- 2. thumbnails (público: true)
-- 3. avatars (público: true)

-- ============================================
-- POLÍTICAS PARA BUCKET: videos
-- ============================================
-- Usuários autenticados podem fazer upload de vídeos
CREATE POLICY "Usuários podem fazer upload de vídeos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated'
);

-- Usuários podem ver vídeos de cursos que têm acesso
CREATE POLICY "Usuários podem ver vídeos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated'
);

-- Autores podem deletar vídeos de seus cursos
CREATE POLICY "Autores podem deletar vídeos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'videos' AND
  auth.uid() IN (
    SELECT c.author_id 
    FROM courses c 
    JOIN videos v ON c.id = v.course_id 
    WHERE v.video_url LIKE '%' || name || '%'
  )
);

-- ============================================
-- POLÍTICAS PARA BUCKET: thumbnails
-- ============================================
-- Usuários autenticados podem fazer upload de thumbnails
CREATE POLICY "Usuários podem fazer upload de thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thumbnails' AND
  auth.role() = 'authenticated'
);

-- Todos podem ver thumbnails (bucket público)
CREATE POLICY "Todos podem ver thumbnails"
ON storage.objects FOR SELECT
USING (bucket_id = 'thumbnails');

-- Autores podem deletar thumbnails de seus cursos
CREATE POLICY "Autores podem deletar thumbnails"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'thumbnails' AND
  auth.uid() IN (
    SELECT c.author_id 
    FROM courses c 
    WHERE c.thumbnail_url LIKE '%' || name || '%'
  )
);

-- ============================================
-- POLÍTICAS PARA BUCKET: avatars
-- ============================================
-- Usuários podem fazer upload de seus próprios avatares
CREATE POLICY "Usuários podem fazer upload de avatares"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Todos podem ver avatares (bucket público)
CREATE POLICY "Todos podem ver avatares"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Usuários podem deletar seus próprios avatares
CREATE POLICY "Usuários podem deletar seus avatares"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Usuários podem atualizar seus próprios avatares
CREATE POLICY "Usuários podem atualizar seus avatares"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- FUNÇÃO AUXILIAR PARA VERIFICAR PROPRIEDADE
-- ============================================
CREATE OR REPLACE FUNCTION public.is_course_owner(course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM courses
    WHERE id = course_id AND author_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;