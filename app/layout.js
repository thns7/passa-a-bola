import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Passa a Bola - Futebol Feminino",
  description: "Tudo sobre futebol feminino: partidas ao vivo, notícias e comunidade",
  manifest: "/manifest.json",
  themeColor: "#4F46E5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR"> 
      <head>
        
        <meta name="google-adsense-account" content="ca-pub-6447246104244403" />
        
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Passa a Bola" />
        <meta name="theme-color" content="#4F46E5" />
        
        
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  );
}