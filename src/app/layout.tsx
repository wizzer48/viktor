import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { FloatActions } from "@/components/ui/FloatActions";
import { Providers } from './providers';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Viktor | Mühendislik Tabanlı Sistem Entegrasyonu",
    template: "%s | Viktor Systems"
  },
  description: "Uçtan uca KNX otomasyon, ağ altyapısı ve zayıf akım çözümleri. Mühendislik tabanlı profesyonel sistem entegratörü.",
  keywords: ["KNX", "Otomasyon", "Akıllı Bina", "Network", "Zayıf Akım", "Sistem Entegrasyonu", "Bina Yönetim Sistemleri"],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://viktor.com.tr",
    title: "Viktor | Mühendislik Tabanlı Sistem Entegrasyonu",
    description: "Profesyonel KNX ve Zayıf Akım Çözümleri",
    siteName: "Viktor Systems"
  },
  twitter: {
    card: "summary_large_image",
    title: "Viktor Systems",
    description: "Mühendislik Tabanlı Sistem Entegrasyonu"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col overflow-x-hidden",
          inter.variable,
          jetbrainsMono.variable
        )}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <Footer />
          <GoogleAnalytics />
          <FloatActions />
        </Providers>
      </body>
    </html>
  );
}
