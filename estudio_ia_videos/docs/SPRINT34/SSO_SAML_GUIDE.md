
# SSO/SAML INTEGRATION GUIDE
## Sprint 34 - Enterprise Authentication

### Visão Geral

O sistema agora suporta autenticação enterprise via:
- **SAML 2.0** (Okta, Azure AD, OneLogin, etc.)
- **OAuth 2.0 / OpenID Connect** (Google Workspace, Azure AD, Okta)

### Supported Providers

#### 1. Okta

**Configuração:**
1. Acesse Okta Admin Console
2. Crie nova aplicação (OIDC - Web Application)
3. Configure Redirect URIs:
   - Sign-in: `https://treinx.abacusai.app/api/auth/sso/okta/callback`
   - Sign-out: `https://treinx.abacusai.app`

**Variáveis de Ambiente:**
```bash
OKTA_DOMAIN=your-domain.okta.com
OKTA_CLIENT_ID=0oa1234567890abcdef
OKTA_CLIENT_SECRET=your_client_secret
```

#### 2. Azure AD / Microsoft 365

**Configuração:**
1. Azure Portal > Azure Active Directory > App registrations
2. New registration
3. Configure Redirect URI: `https://treinx.abacusai.app/api/auth/sso/azure/callback`
4. Certificates & secrets > New client secret

**Variáveis de Ambiente:**
```bash
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
```

#### 3. Google Workspace

**Configuração:**
1. Google Cloud Console > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Authorized redirect URIs: `https://treinx.abacusai.app/api/auth/sso/google/callback`

**Variáveis de Ambiente:**
```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### SAML 2.0 Setup

#### Service Provider (SP) Metadata

URL: `https://treinx.abacusai.app/api/auth/saml/metadata`

**Entity ID:**
```
estudio-ia-videos
```

**Assertion Consumer Service (ACS) URL:**
```
https://treinx.abacusai.app/api/auth/saml/callback
```

**NameID Format:**
```
urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress
```

#### Identity Provider (IdP) Configuration

**Required Attributes:**
- `email` (required)
- `firstName` (optional)
- `lastName` (optional)
- `name` (optional)

**Example IdP Metadata:**
```xml
<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata"
                     entityID="https://your-idp.com">
  <md:IDPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
                            Location="https://your-idp.com/saml/sso"/>
  </md:IDPSSODescriptor>
</md:EntityDescriptor>
```

### User Flow

1. **Login Initiation**
   - User clicks "Login with SSO"
   - User selects provider (Okta, Azure, Google)
   - Redirect to provider's login page

2. **Authentication**
   - User enters credentials at provider
   - Provider validates and creates session

3. **Callback**
   - Provider redirects to `/api/auth/sso/{provider}/callback`
   - Application validates response
   - Creates user session

4. **User Provisioning**
   - If user doesn't exist, creates new user
   - Maps attributes from provider
   - Assigns default role

### Role Mapping

Map provider groups/roles to application roles:

```typescript
// lib/auth/role-mapper.ts
export function mapProviderRole(providerRole: string): Role {
  const roleMap: Record<string, Role> = {
    'Admin': 'admin',
    'Editor': 'editor',
    'Viewer': 'viewer',
    'SuperAdmin': 'superadmin',
  };
  
  return roleMap[providerRole] || 'viewer';
}
```

### Security Best Practices

#### 1. State Parameter Validation
Always validate state parameter to prevent CSRF:
```typescript
const state = generateRandomString();
// Store in session
// Validate on callback
```

#### 2. Token Validation
Validate ID tokens:
- Signature (using provider's public key)
- Issuer (`iss` claim)
- Audience (`aud` claim)
- Expiration (`exp` claim)

#### 3. Secure Storage
- Never store tokens in localStorage
- Use httpOnly cookies
- Implement token refresh

#### 4. Audit Logging
Log all SSO events:
```typescript
await auditLog.log({
  action: 'auth.sso_login',
  userId: user.id,
  userEmail: user.email,
  details: { provider: 'okta' },
  success: true,
});
```

### Testing

#### Test SSO Flow
```bash
# Development
curl -v https://treinx.abacusai.app/api/auth/sso/okta
```

#### Mock Provider (Development)
For local testing without real provider:
```typescript
// lib/auth/mock-sso.ts
export async function mockSSOLogin(email: string) {
  return {
    email,
    name: 'Test User',
    picture: null,
  };
}
```

### Troubleshooting

#### Common Issues

**1. "Invalid state parameter"**
- Check cookie settings (httpOnly, secure, sameSite)
- Verify state is being stored correctly

**2. "User info fetch failed"**
- Check access token validity
- Verify user info endpoint URL
- Check network/firewall settings

**3. "SAML response validation failed"**
- Verify IdP certificate
- Check clock sync between servers
- Validate XML signature

#### Debug Mode
Enable SSO debug logging:
```bash
DEBUG=sso:* npm run dev
```

### Multi-tenancy Support

Support multiple organizations with different SSO providers:

```typescript
// lib/auth/tenant-sso.ts
interface TenantSSO {
  tenantId: string;
  provider: 'okta' | 'azure' | 'google';
  config: {
    clientId: string;
    clientSecret: string;
    domain?: string;
    tenantId?: string;
  };
}

export async function getTenantSSO(domain: string): Promise<TenantSSO | null> {
  // Look up tenant by email domain
  return db.tenantSSO.findUnique({
    where: { domain },
  });
}
```

### Compliance

#### SOC 2
- Audit all authentication events
- Implement MFA enforcement
- Log IP addresses and user agents

#### GDPR
- Consent for data collection
- Right to be forgotten
- Data portability

#### HIPAA
- Encrypted data at rest and in transit
- Access logging
- Session timeout (15 minutes)

### Migration Guide

#### Migrating Existing Users to SSO

```typescript
// scripts/migrate-to-sso.ts
async function migrateUsersToSSO() {
  const users = await db.user.findMany({
    where: {
      email: { endsWith: '@company.com' },
    },
  });
  
  for (const user of users) {
    await db.account.create({
      data: {
        userId: user.id,
        type: 'oauth',
        provider: 'okta',
        providerAccountId: user.email,
      },
    });
    
    console.log(`Migrated ${user.email} to SSO`);
  }
}
```

### Cost Comparison

| Provider | Cost | Users | Features |
|----------|------|-------|----------|
| Okta | $2/user/month | Unlimited | SAML, OIDC, MFA |
| Azure AD | $6/user/month | Unlimited | SAML, OIDC, Conditional Access |
| Google Workspace | Included | Included | OIDC only |
| Auth0 | $23/month | 7,000 MAU | SAML, OIDC, Social |

### Support

For SSO setup assistance:
- Documentation: https://treinx.abacusai.app/docs/sso
- Support: support@treinx.abacusai.app
- Enterprise: enterprise@treinx.abacusai.app
