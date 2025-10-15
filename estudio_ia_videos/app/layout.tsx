
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './styles/mobile-first.css';
import Providers from './components/providers';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/theme/theme-provider';
import { InteractiveTutorial } from './components/tutorial/tutorial-simple';
import { EmergencyErrorBoundary } from './lib/advanced-analytics-emergency';
import PWAInstallPrompt from './components/pwa/pwa-install-prompt';

import ProductionProvider from './components/providers/production-provider';
import GlobalButtonFix from './components/ui/button-fix-global';
import { AuthProvider } from '@/hooks/use-auth';

// Import do sistema de correções melhorado
import './lib/emergency-fixes-improved';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Estúdio IA de Vídeos',
  description: 'Crie vídeos profissionais com inteligência artificial para treinamentos em segurança do trabalho',
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <EmergencyErrorBoundary>
          <ThemeProvider
            defaultTheme="light"
          >
            <Providers>
              <ProductionProvider>
                <AuthProvider>
                  <div className="relative">
                    {children}
                    <PWAInstallPrompt />
                    <InteractiveTutorial />
                    <GlobalButtonFix />
                  </div>
                </AuthProvider>
              </ProductionProvider>
            </Providers>
          </ThemeProvider>
        </EmergencyErrorBoundary>
        <Toaster />
      </body>
    </html>
  );
}
