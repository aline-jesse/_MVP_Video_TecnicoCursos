
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Client } = pg;

const colors = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', cyan: '\x1b[36m',
};

const log = (message, color = 'reset') => console.log(`${colors[color]}${message}${colors.reset}`);

const tables = [
    {
        name: 'users',
        schema: `
            CREATE TABLE IF NOT EXISTS public.users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255),
                avatar_url TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                metadata JSONB DEFAULT '{}'::jsonb
            );
        `
    },
    {
        name: 'projects',
        schema: `
            CREATE TABLE IF NOT EXISTS public.projects (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'draft',
                settings JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    },
    {
        name: 'slides',
        schema: `
            CREATE TABLE IF NOT EXISTS public.slides (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
                order_index INTEGER NOT NULL,
                title VARCHAR(500),
                content TEXT,
                duration INTEGER DEFAULT 5,
                background_color VARCHAR(50),
                background_image TEXT,
                avatar_config JSONB DEFAULT '{}'::jsonb,
                audio_config JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    },
    {
        name: 'render_jobs',
        schema: `
            CREATE TABLE IF NOT EXISTS public.render_jobs (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
                status VARCHAR(50) DEFAULT 'pending',
                progress INTEGER DEFAULT 0,
                output_url TEXT,
                error_message TEXT,
                render_settings JSONB DEFAULT '{}'::jsonb,
                started_at TIMESTAMPTZ,
                completed_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    },
    {
        name: 'analytics_events',
        schema: `
            CREATE TABLE IF NOT EXISTS public.analytics_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
                event_type VARCHAR(100) NOT NULL,
                event_data JSONB DEFAULT '{}'::jsonb,
                session_id VARCHAR(255),
                ip_address VARCHAR(50),
                user_agent TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    },
    {
        name: 'nr_courses',
        schema: `
            CREATE TABLE IF NOT EXISTS public.nr_courses (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                course_code VARCHAR(10) NOT NULL UNIQUE,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                thumbnail_url TEXT,
                duration INTEGER,
                modules_count INTEGER DEFAULT 0,
                status VARCHAR(50) DEFAULT 'active',
                metadata JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    },
    {
        name: 'nr_modules',
        schema: `
            CREATE TABLE IF NOT EXISTS public.nr_modules (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                course_id UUID REFERENCES public.nr_courses(id) ON DELETE CASCADE,
                order_index INTEGER NOT NULL,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                thumbnail_url TEXT,
                video_url TEXT,
                duration INTEGER,
                content JSONB DEFAULT '{}'::jsonb,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `
    }
];

const indicesAndTriggers = `
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_slides_project_id ON public.slides(project_id);
    CREATE INDEX IF NOT EXISTS idx_render_jobs_project_id ON public.render_jobs(project_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON public.analytics_events(user_id);
    CREATE INDEX IF NOT EXISTS idx_nr_modules_course_id ON public.nr_modules(course_id);

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS '
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    ' language 'plpgsql';

    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_slides_updated_at BEFORE UPDATE ON public.slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_nr_courses_updated_at BEFORE UPDATE ON public.nr_courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    CREATE TRIGGER update_nr_modules_updated_at BEFORE UPDATE ON public.nr_modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;


async function createTablesProgrammatically() {
    log('🚀 Iniciando criação programática de tabelas...', 'cyan');
    const dbUrl = process.env.DIRECT_DATABASE_URL;
    if (!dbUrl) {
        log('❌ Erro: DIRECT_DATABASE_URL não definida.', 'red');
        process.exit(1);
    }

    const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        log('✅ Conectado ao banco de dados.', 'green');

        for (const table of tables) {
            try {
                log(`Creating table: ${table.name}...`, 'yellow');
                await client.query(table.schema);
                log(`✅ Tabela ${table.name} criada com sucesso.`, 'green');
            } catch (e) {
                log(`❌ Erro ao criar tabela ${table.name}: ${e.message}`, 'red');
                throw e; // Abort on first error
            }
        }
        
        log('Creating indices and triggers...', 'yellow');
        await client.query(indicesAndTriggers);
        log('✅ Índices e triggers criados com sucesso.', 'green');

        log('🎉 Estrutura de tabelas criada com sucesso!', 'cyan');
    } catch (error) {
        log(`❌ Falha crítica: ${error.message}`, 'red');
        process.exit(1);
    } finally {
        await client.end();
        log('🔌 Conexão com o banco de dados fechada.', 'green');
    }
}

createTablesProgrammatically();
