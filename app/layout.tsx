export const metadata = {
  title: 'MVP Video Técnico Cursos',
  description: 'Sistema integrado para criação de vídeos educacionais com IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}
