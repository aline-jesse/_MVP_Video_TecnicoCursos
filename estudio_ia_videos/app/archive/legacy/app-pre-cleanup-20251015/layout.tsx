
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import '../styles/mobile-first.css'
import Providers from '../components/providers'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '../components/theme/theme-provider'
import { InteractiveTutorial } from '../components/tutorial/tutorial-simple'
import { EmergencyErrorBoundary } from '../lib/advanced-analytics-emergency'
import PWAInstallPrompt from '../components/pwa/pwa-install-prompt'
import PWAEnhanced from '../components/pwa/pwa-enhanced'
import ProductionProvider from '../components/providers/production-provider'
import GlobalButtonFix from '../components/ui/button-fix-global'
import TabsHandlersFix from '../components/ui/tabs-handlers-fix'
import { AdvancedErrorBoundary, OfflineIndicator } from '../lib/error-handling'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Estúdio IA de Vídeos',
  description: 'Crie vídeos profissionais com inteligência artificial para treinamentos em segurança do trabalho',
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <AdvancedErrorBoundary>
          <EmergencyErrorBoundary>
            <ProductionProvider>
              <ThemeProvider defaultTheme="system" storageKey="estudio-theme">
                {/* Indicador de Status Offline */}
                <OfflineIndicator />
                
                <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-300">
                  <Providers>
                    {children}
                    
                    {/* Tutorial Interativo */}
                    <InteractiveTutorial />
                    
                    {/* PWA Aprimorado */}
                    <PWAEnhanced />
                    
                    {/* Fix Global para Botões */}
                    <GlobalButtonFix />
                    
                    {/* Fix para Tabs Inativas - TEMPORARIAMENTE DESABILITADO DEVIDO A LOOP INFINITO */}\
                    {/* <TabsHandlersFix /> */}\
                    
                    <Toaster />
                  </Providers>
                </div>
              </ThemeProvider>
            </ProductionProvider>
          </EmergencyErrorBoundary>
        </AdvancedErrorBoundary>
        
        {/* Fabric.js CDN - Sprint 43 */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  )
}
