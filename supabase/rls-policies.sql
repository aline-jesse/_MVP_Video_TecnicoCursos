-- Políticas de segurança RLS (Row Level Security) para o Supabase
-- Este arquivo deve ser executado no SQL Editor do Supabase

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela users
-- Usuários só podem ver e editar seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON users FOR UPDATE 
USING (auth.uid() = id);

-- Políticas para tabela courses
-- Todos podem ver cursos
CREATE POLICY "Qualquer pessoa pode ver cursos" 
ON courses FOR SELECT 
USING (true);

-- Apenas autores podem editar seus cursos
CREATE POLICY "Autores podem editar seus cursos" 
ON courses FOR UPDATE 
USING (auth.uid() = author_id);

-- Apenas autores podem excluir seus cursos
CREATE POLICY "Autores podem excluir seus cursos" 
ON courses FOR DELETE 
USING (auth.uid() = author_id);

-- Usuários autenticados podem criar cursos
CREATE POLICY "Usuários autenticados podem criar cursos" 
ON courses FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para tabela videos
-- Todos podem ver vídeos
CREATE POLICY "Qualquer pessoa pode ver vídeos" 
ON videos FOR SELECT 
USING (true);

-- Apenas autores dos cursos podem gerenciar vídeos
CREATE POLICY "Autores podem gerenciar vídeos de seus cursos" 
ON videos FOR ALL 
USING (
  auth.uid() IN (
    SELECT author_id FROM courses WHERE id = videos.course_id
  )
);

-- Políticas para tabela user_progress
-- Usuários só podem ver e editar seu próprio progresso
CREATE POLICY "Usuários podem ver seu próprio progresso" 
ON user_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio progresso" 
ON user_progress FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio progresso" 
ON user_progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Função para verificar se o usuário é administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para administradores (acesso total)
CREATE POLICY "Administradores têm acesso total a users" 
ON users FOR ALL 
USING (is_admin());

CREATE POLICY "Administradores têm acesso total a courses" 
ON courses FOR ALL 
USING (is_admin());

CREATE POLICY "Administradores têm acesso total a videos" 
ON videos FOR ALL 
USING (is_admin());

CREATE POLICY "Administradores têm acesso total a user_progress" 
ON user_progress FOR ALL 
USING (is_admin());