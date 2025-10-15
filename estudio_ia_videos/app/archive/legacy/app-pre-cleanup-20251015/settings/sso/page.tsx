
/**
 * SPRINT 36 - SSO SETTINGS PAGE
 */

import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth/auth-config';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { SSOConfigurationPanel } from '@/components/settings/sso-configuration-panel';

export const metadata = {
  title: 'Configurações SSO - Estúdio IA',
  description: 'Configure Single Sign-On empresarial',
};

export default async function SSOSettingsPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.email) {
    redirect('/auth/signin');
  }

  // Get user's current organization
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      organizationMemberships: {
        where: {
          role: { in: ['OWNER', 'ADMIN'] },
        },
        include: {
          organization: true,
        },
        take: 1,
      },
    },
  });

  if (!user?.organizationMemberships?.[0]) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-sm">
              Você precisa ser Proprietário ou Administrador de uma organização para acessar as configurações de SSO.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const organization = user.organizationMemberships[0].organization;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configurações SSO</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure autenticação empresarial para {organization.name}
          </p>
        </div>

        <SSOConfigurationPanel organizationId={organization.id} />
      </div>
    </div>
  );
}
