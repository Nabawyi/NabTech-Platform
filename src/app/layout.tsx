import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "NabTech | منصة ناب تك التعليمية",
  description: "المنصة التعليمية الأولى لخدمات التعلم المتقدمة",
};

/**
 * This script runs SYNCHRONOUSLY before React hydrates — no flash of wrong theme.
 * It reads localStorage first (instant), falls back to the html class already set by SSR.
 * After applying the theme it adds .theme-ready to enable CSS transitions.
 */
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var html = document.documentElement;
    if (stored === 'dark') {
      html.classList.add('dark');
    } else if (stored === 'light') {
      html.classList.remove('dark');
    }
    // Enable transitions only after theme is confirmed — prevents FOUC animation
    requestAnimationFrame(function () {
      html.classList.add('theme-ready');
    });
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* MUST be first — applies theme class before any paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
