#!/usr/bin/env node

/**
 * 🎤 TESTE DE INTEGRAÇÃO TTS
 * Validação dos serviços de Text-to-Speech
 * - Azure Speech Services
 * - ElevenLabs API
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

// Configurações
const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Cores para output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(50)}`);
    console.log(`🎤 ${title}`);
    console.log(`${'='.repeat(50)}${colors.reset}\n`);
}

function logTest(name, status, details = '') {
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
    log(`${icon} ${name}`, color);
    if (details) {
        log(`   ${details}`, 'reset');
    }
}

async function testAzureSpeechServices() {
    logSection('AZURE SPEECH SERVICES');
    
    try {
        // Verificar credenciais
        if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
            logTest('Credenciais Azure', 'fail', 'AZURE_SPEECH_KEY ou AZURE_SPEECH_REGION não encontrados');
            return false;
        }
        logTest('Credenciais Azure', 'pass', `Região: ${AZURE_SPEECH_REGION}`);
        
        // Testar endpoint de token
        const tokenUrl = `https://${AZURE_SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
        
        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': AZURE_SPEECH_KEY,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        
        if (!tokenResponse.ok) {
            logTest('Token Azure', 'fail', `HTTP ${tokenResponse.status}: ${tokenResponse.statusText}`);
            return false;
        }
        
        const token = await tokenResponse.text();
        logTest('Token Azure', 'pass', 'Token obtido com sucesso');
        
        // Testar síntese de voz (pequeno texto)
        const ssml = `
        <speak version='1.0' xml:lang='pt-BR'>
            <voice xml:lang='pt-BR' xml:gender='Female' name='pt-BR-FranciscaNeural'>
                Teste de integração do Azure Speech Services.
            </voice>
        </speak>`;
        
        const synthesizeUrl = `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
        
        const synthesizeResponse = await fetch(synthesizeUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/ssml+xml',
                'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3'
            },
            body: ssml
        });
        
        if (!synthesizeResponse.ok) {
            logTest('Síntese Azure', 'fail', `HTTP ${synthesizeResponse.status}: ${synthesizeResponse.statusText}`);
            return false;
        }
        
        const audioBuffer = await synthesizeResponse.arrayBuffer();
        logTest('Síntese Azure', 'pass', `Áudio gerado: ${audioBuffer.byteLength} bytes`);
        
        // Salvar arquivo de teste (opcional)
        const testDir = path.join(process.cwd(), 'test-output');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        const audioPath = path.join(testDir, 'azure-test.mp3');
        fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
        logTest('Arquivo de teste', 'pass', `Salvo em: ${audioPath}`);
        
        return true;
        
    } catch (error) {
        logTest('Azure Speech Services', 'fail', error.message);
        return false;
    }
}

async function testElevenLabsAPI() {
    logSection('ELEVENLABS API');
    
    try {
        // Verificar credenciais
        if (!ELEVENLABS_API_KEY) {
            logTest('Credenciais ElevenLabs', 'fail', 'ELEVENLABS_API_KEY não encontrada');
            return false;
        }
        logTest('Credenciais ElevenLabs', 'pass', 'API Key configurada');
        
        // Testar endpoint de vozes
        const voicesUrl = 'https://api.elevenlabs.io/v1/voices';
        
        const voicesResponse = await fetch(voicesUrl, {
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            }
        });
        
        if (!voicesResponse.ok) {
            logTest('Listar vozes', 'fail', `HTTP ${voicesResponse.status}: ${voicesResponse.statusText}`);
            return false;
        }
        
        const voicesData = await voicesResponse.json();
        logTest('Listar vozes', 'pass', `${voicesData.voices.length} vozes disponíveis`);
        
        // Encontrar uma voz em português ou usar a primeira disponível
        const portugueseVoice = voicesData.voices.find(v => 
            v.name.toLowerCase().includes('portuguese') || 
            v.name.toLowerCase().includes('brasil')
        );
        const selectedVoice = portugueseVoice || voicesData.voices[0];
        
        if (!selectedVoice) {
            logTest('Selecionar voz', 'fail', 'Nenhuma voz disponível');
            return false;
        }
        
        logTest('Selecionar voz', 'pass', `Usando: ${selectedVoice.name}`);
        
        // Testar síntese de voz
        const textToSpeechUrl = `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.voice_id}`;
        
        const ttsResponse = await fetch(textToSpeechUrl, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: 'Teste de integração do ElevenLabs API.',
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });
        
        if (!ttsResponse.ok) {
            logTest('Síntese ElevenLabs', 'fail', `HTTP ${ttsResponse.status}: ${ttsResponse.statusText}`);
            return false;
        }
        
        const audioBuffer = await ttsResponse.arrayBuffer();
        logTest('Síntese ElevenLabs', 'pass', `Áudio gerado: ${audioBuffer.byteLength} bytes`);
        
        // Salvar arquivo de teste (opcional)
        const testDir = path.join(process.cwd(), 'test-output');
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
        
        const audioPath = path.join(testDir, 'elevenlabs-test.mp3');
        fs.writeFileSync(audioPath, Buffer.from(audioBuffer));
        logTest('Arquivo de teste', 'pass', `Salvo em: ${audioPath}`);
        
        return true;
        
    } catch (error) {
        logTest('ElevenLabs API', 'fail', error.message);
        return false;
    }
}

async function testTTSIntegration() {
    log('🎤 INICIANDO TESTES DE INTEGRAÇÃO TTS', 'bold');
    log('Validação dos serviços de Text-to-Speech\n', 'cyan');
    
    let azureResult = false;
    let elevenLabsResult = false;
    
    try {
        azureResult = await testAzureSpeechServices();
        elevenLabsResult = await testElevenLabsAPI();
        
        // Relatório final
        logSection('RELATÓRIO FINAL TTS');
        
        if (azureResult && elevenLabsResult) {
            log('🎉 TODOS OS SERVIÇOS TTS FUNCIONANDO!', 'green');
            log('✅ Azure Speech Services: OK', 'green');
            log('✅ ElevenLabs API: OK', 'green');
            log('🚀 Sistema TTS pronto para produção', 'green');
        } else {
            log('⚠️ ALGUNS SERVIÇOS TTS COM PROBLEMAS', 'yellow');
            log(`${azureResult ? '✅' : '❌'} Azure Speech Services: ${azureResult ? 'OK' : 'FALHOU'}`, azureResult ? 'green' : 'red');
            log(`${elevenLabsResult ? '✅' : '❌'} ElevenLabs API: ${elevenLabsResult ? 'OK' : 'FALHOU'}`, elevenLabsResult ? 'green' : 'red');
            log('🔧 Verifique as credenciais e configurações', 'yellow');
        }
        
        console.log('='.repeat(50));
        
        // Retornar código de saída apropriado
        process.exit((azureResult && elevenLabsResult) ? 0 : 1);
        
    } catch (error) {
        log(`\n❌ ERRO CRÍTICO: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Executar testes se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    testTTSIntegration();
}

export { testTTSIntegration, testAzureSpeechServices, testElevenLabsAPI };