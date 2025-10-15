
/**
 * SPRINT 36 - DOMAIN VALIDATION
 * Automatic DNS verification for custom domains
 */

interface DNSRecord {
  type: 'CNAME' | 'TXT' | 'A';
  name: string;
  value: string;
}

interface DomainValidationResult {
  isValid: boolean;
  records: {
    found: DNSRecord[];
    missing: DNSRecord[];
  };
  errors?: string[];
}

/**
 * Validate custom domain DNS configuration
 */
export async function validateCustomDomain(
  domain: string,
  organizationId: string
): Promise<DomainValidationResult> {
  try {
    // Required DNS records
    const requiredRecords: DNSRecord[] = [
      {
        type: 'CNAME',
        name: domain,
        value: 'treinx.abacusai.app',
      },
      {
        type: 'TXT',
        name: `_treinx-verification.${domain}`,
        value: `treinx-org-${organizationId}`,
      },
    ];

    const foundRecords: DNSRecord[] = [];
    const missingRecords: DNSRecord[] = [];
    const errors: string[] = [];

    // Check each required record
    for (const record of requiredRecords) {
      const isFound = await checkDNSRecord(record);
      
      if (isFound) {
        foundRecords.push(record);
      } else {
        missingRecords.push(record);
      }
    }

    const isValid = missingRecords.length === 0;

    if (!isValid) {
      errors.push(
        `Registros DNS faltando: ${missingRecords.map(r => `${r.type} ${r.name}`).join(', ')}`
      );
    }

    return {
      isValid,
      records: {
        found: foundRecords,
        missing: missingRecords,
      },
      errors: errors.length > 0 ? errors : undefined,
    };

  } catch (error) {
    console.error('Domain validation error:', error);
    return {
      isValid: false,
      records: {
        found: [],
        missing: [],
      },
      errors: [error instanceof Error ? error.message : 'Erro ao validar domínio'],
    };
  }
}

/**
 * Check if a specific DNS record exists
 */
async function checkDNSRecord(record: DNSRecord): Promise<boolean> {
  try {
    // In production, use DNS lookup library (e.g., dns.promises from Node.js)
    // or external DNS API like Google DNS, Cloudflare DNS, etc.
    
    // For now, simulate DNS check
    console.log(`Checking DNS record: ${record.type} ${record.name} -> ${record.value}`);
    
    // In production:
    // const dns = require('dns').promises;
    // const records = await dns.resolve(record.name, record.type);
    // return records.includes(record.value);
    
    // Mock: return true for development
    // In production, replace with actual DNS lookup
    return false; // Set to false to require actual DNS configuration

  } catch (error) {
    console.error(`DNS check failed for ${record.name}:`, error);
    return false;
  }
}

/**
 * Get DNS instructions for custom domain setup
 */
export function getDNSInstructions(
  domain: string,
  organizationId: string
): {
  records: DNSRecord[];
  instructions: string[];
} {
  const records: DNSRecord[] = [
    {
      type: 'CNAME',
      name: domain,
      value: 'treinx.abacusai.app',
    },
    {
      type: 'TXT',
      name: `_treinx-verification.${domain}`,
      value: `treinx-org-${organizationId}`,
    },
  ];

  const instructions = [
    '1. Acesse o painel de controle do seu provedor de domínio (GoDaddy, HostGator, Registro.br, etc.)',
    '2. Navegue até a seção de gerenciamento de DNS',
    '3. Adicione os registros DNS listados abaixo:',
    '',
    `   CNAME: ${domain} → treinx.abacusai.app`,
    `   TXT: _treinx-verification.${domain} → treinx-org-${organizationId}`,
    '',
    '4. Aguarde a propagação DNS (pode levar até 48 horas, geralmente 15-30 minutos)',
    '5. Clique em "Verificar Domínio" para validar a configuração',
    '',
    '⚠️ Importante: Remova qualquer registro A ou CNAME existente para este domínio antes de adicionar os novos.',
  ];

  return {
    records,
    instructions,
  };
}

/**
 * Schedule automatic domain verification
 */
export async function scheduleDomainVerification(
  domain: string,
  organizationId: string
): Promise<void> {
  // In production, use a job queue (Bull, BullMQ, etc.) to periodically check
  // domain verification status
  
  console.log(`Scheduled verification for domain: ${domain}`);
  
  // Example with a simple retry mechanism:
  // const maxRetries = 48; // Check every hour for 48 hours
  // for (let i = 0; i < maxRetries; i++) {
  //   await new Promise(resolve => setTimeout(resolve, 3600000)); // 1 hour
  //   const result = await validateCustomDomain(domain, organizationId);
  //   if (result.isValid) {
  //     await updateDomainStatus(organizationId, 'verified');
  //     break;
  //   }
  // }
}

/**
 * Check SSL certificate status
 */
export async function checkSSLCertificate(domain: string): Promise<{
  isValid: boolean;
  issuer?: string;
  expiresAt?: Date;
  error?: string;
}> {
  try {
    // In production, check SSL certificate using tls.connect or external API
    console.log(`Checking SSL for domain: ${domain}`);
    
    // Mock response
    return {
      isValid: false,
      error: 'SSL certificate not configured. Will be auto-provisioned after DNS verification.',
    };

  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Erro ao verificar SSL',
    };
  }
}
