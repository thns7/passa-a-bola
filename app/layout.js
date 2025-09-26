import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Passa Bola",
  description: "Exemplo com Poppins global",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Meta do Google AdSense */}
        <meta name="google-adsense-account" content="ca-pub-6447246104244403" />
      </head>
      <body className={poppins.className}>
        {children}
      </body>
    </html>
  );
}
