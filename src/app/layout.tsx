import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import Providers from "@/components/Providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WMS Pro - Sistema de Gestión de Bodegas",
  description: "Sistema Avanzado de Gestión de Bodegas y Producción",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <div className={styles.container}>
            <Sidebar />
            <main className={styles.mainContent}>
              <div className={styles.header}>
                <h1>WMS Pro</h1>
              </div>
              <div className={styles.scrollArea}>
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
