
import fs from 'fs/promises';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const { Client } = pg;

// Cores para o console
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function setupDatabase() {
    const fileArg = process.argv[2];
    const phaseLabel = fileArg ? `fase: ${fileArg}` : 'todas as fases';
    log(`🚀 Iniciando configuração do banco de dados Supabase (${phaseLabel})...`, 'cyan');

    const dbUrl = process.env.DIRECT_DATABASE_URL;
    if (!dbUrl) {
        log('❌ Erro: A variável de ambiente DIRECT_DATABASE_URL não está definida.', 'red');
        log('   Verifique seu arquivo .env na raiz do projeto.', 'yellow');
        process.exit(1);
    }

    const client = new Client({
        connectionString: dbUrl,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        await client.connect();
        log('✅ Conectado ao banco de dados com sucesso!', 'green');

    const sqlFiles = fileArg ? [fileArg] : ['setup-tables.sql', 'setup-indices-and-triggers.sql', 'database-rls-policies.sql'];

        for (const fileName of sqlFiles) {
            const filePath = path.resolve(process.cwd(), fileName);
            try {
                log(`📄 Lendo o arquivo: ${fileName}`, 'yellow');
                const sqlContent = await fs.readFile(filePath, 'utf8');

                const shouldSplit = fileName === 'setup-tables.sql';
                log(`⚡ Executando SQL de ${fileName}${shouldSplit ? ' sequencialmente' : ''}...`, 'yellow');

                if (shouldSplit) {
                    const commands = sqlContent.split(';').filter(cmd => cmd.trim().length > 0);

                    for (const command of commands) {
                        try {
                            await client.query(command);
                        } catch (e) {
                            if (e.message.includes('already exists') || e.message.includes('duplicate key')) {
                                log(`   - Comando ignorado (já existe): ${command.substring(0, 60)}...`, 'yellow');
                            } else {
                                log(`❌ Erro no comando: ${command.substring(0, 60)}...`, 'red');
                                throw e;
                            }
                        }
                    }
                } else {
                    await client.query(sqlContent);
                }

                log(`✅ SQL de ${fileName} executado com sucesso.`, 'green');

            } catch (error) {
                // Ignorar erros "already exists" para tornar o script idempotente
                if (error.message.includes('already exists') || error.message.includes('duplicate key')) {
                    log(`⚠️  Aviso: Partes de ${fileName} já foram aplicadas (ignorado).`, 'yellow');
                } else {
                    throw new Error(`Erro ao processar ${fileName}: ${error.message}`);
                }
            }
        }

        log('🎉 Configuração do banco de dados concluída com sucesso!', 'cyan');

    } catch (error) {
        log(`❌ Falha crítica durante a configuração: ${error.message}`, 'red');
        process.exit(1);
    } finally {
        await client.end();
        log('🔌 Conexão com o banco de dados fechada.', 'green');
    }
}

setupDatabase();
