import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlanDoc | Analítica docente",
  description: "Dashboard interactivo de planes de trabajo docente para el periodo 2026-01.",
  openGraph: {
    title: "PlanDoc | Analítica docente",
    description: "Explora la dedicación, extensión, investigación y docencia del periodo 2026-01.",
    images: [{ url: "/og.png", width: 1792, height: 896, alt: "PlanDoc — Analítica docente 2026-01" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PlanDoc | Analítica docente",
    description: "Dashboard interactivo de planes de trabajo docente.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
