import "./globals.css";

export const metadata = {
  title: "Passa a Bola - Futebol Feminino",
  description: "Tudo sobre futebol feminino: partidas ao vivo, notícias e comunidade",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#5E2E8C",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="google-adsense-account" content="ca-pub-6447246104244403" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Passa a Bola" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-poppins" style={{ margin: 0, padding: 0, fontFamily: "'Poppins', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}