const fetch = require('node-fetch');
require('dotenv').config();

console.log('🗄️ Testando Storage Supabase...');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', SUPABASE_URL ? '✅ OK' : '❌ MISSING');
console.log('KEY:', SERVICE_KEY ? '✅ OK' : '❌ MISSING');

async function testStorage() {
    try {
        const url = `${SUPABASE_URL}/storage/v1/bucket`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${SERVICE_KEY}`,
                'apikey': SERVICE_KEY
            }
        });
        
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Buckets existentes:', data);
        
        if (Array.isArray(data)) {
            console.log(`✅ ${data.length} buckets encontrados`);
            data.forEach(bucket => console.log(`   • ${bucket.name}`));
        }
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
    }
}

testStorage();