
/**
 * 🏢 API de Provedores SSO Empresariais
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Mock data para demonstração
    const mockProviders = [
      {
        id: 'azure-ad',
        name: 'Microsoft Azure AD',
        type: 'oidc',
        domain: 'empresa.onmicrosoft.com',
        status: 'active',
        lastTest: '2025-08-30T10:30:00Z',
        users: 234,
        configuration: {
          clientId: 'xxxx-xxxx-xxxx-xxxx',
          discoveryUrl: 'https://login.microsoftonline.com/tenant-id/v2.0/.well-known/openid_configuration'
        },
        mapping: {
          emailAttribute: 'email',
          nameAttribute: 'name',
          groupsAttribute: 'groups',
          roleAttribute: 'roles'
        },
        createdAt: '2025-08-15T09:00:00Z',
        updatedAt: '2025-08-30T10:30:00Z'
      },
      {
        id: 'google-workspace',
        name: 'Google Workspace',
        type: 'oauth',
        domain: 'empresa.com',
        status: 'active',
        lastTest: '2025-08-29T15:20:00Z',
        users: 156,
        configuration: {
          clientId: 'xxxx-xxxx.apps.googleusercontent.com',
          clientSecret: '****hidden****'
        },
        mapping: {
          emailAttribute: 'email',
          nameAttribute: 'name',
          groupsAttribute: 'groups'
        },
        createdAt: '2025-08-18T14:30:00Z',
        updatedAt: '2025-08-29T15:20:00Z'
      },
      {
        id: 'okta-saml',
        name: 'Okta SAML',
        type: 'saml',
        domain: 'empresa.okta.com',
        status: 'testing',
        lastTest: null,
        users: 0,
        configuration: {
          entityId: 'http://www.okta.com/exk1234567890',
          ssoUrl: 'https://empresa.okta.com/app/estudio-ia/exk1234567890/sso/saml',
          certificateUrl: 'https://empresa.okta.com/app/estudio-ia/certificate'
        },
        mapping: {
          emailAttribute: 'email',
          nameAttribute: 'displayName',
          groupsAttribute: 'groups',
          roleAttribute: 'role'
        },
        createdAt: '2025-08-28T11:45:00Z',
        updatedAt: '2025-08-28T11:45:00Z'
      }
    ];

    return NextResponse.json(mockProviders);

  } catch (error) {
    console.error('Erro ao buscar provedores SSO:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const providerData = await request.json();
    
    const newProvider = {
      id: `sso_${Date.now()}`,
      name: providerData.name,
      type: providerData.type,
      domain: providerData.domain,
      status: 'testing',
      lastTest: null,
      users: 0,
      configuration: providerData.configuration,
      mapping: providerData.mapping,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log(`🏢 Novo provedor SSO criado: ${newProvider.name}`);
    return NextResponse.json(newProvider);

  } catch (error) {
    console.error('Erro ao criar provedor SSO:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
