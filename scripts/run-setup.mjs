
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const colors = {
    reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
    yellow: '\x1b[33m', cyan: '\x1b[36m', magenta: '\x1b[35m',
};

const log = (message, color = 'reset') => console.log(`${colors[color]}${message}${colors.reset}`);

const phases = [
    'setup-tables.sql',
    'setup-indices-and-triggers.sql',
    'database-rls-policies.sql'
];

async function runSetup() {
    log('🚀 Iniciando orquestrador de configuração do banco de dados...', 'magenta');
    
    for (const phaseFile of phases) {
        log(`\n▶️  Executando fase: ${phaseFile}`, 'cyan');
        const command = `node scripts/setup-database.mjs ${phaseFile}`;
        
        try {
            const { stdout, stderr } = await execAsync(command);
            
            if (stdout) log(stdout, 'reset');
            if (stderr) {
                // Apenas mostrar stderr se não for um erro fatal
                if (stderr.includes('Falha crítica')) {
                    log(stderr, 'red');
                    throw new Error(`Fase ${phaseFile} falhou.`);
                } else {
                    log(stderr, 'yellow');
                }
            }
            log(`✅ Fase ${phaseFile} concluída com sucesso.`, 'green');
        } catch (error) {
            log(`❌ Erro fatal ao executar a fase ${phaseFile}. Abortando.`, 'red');
            console.error(error);
            process.exit(1);
        }
    }
    
    log('\n🎉🎉🎉 Configuração completa do banco de dados finalizada com sucesso! 🎉🎉🎉', 'magenta');
}

runSetup();
