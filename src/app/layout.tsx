// Next.js
import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";

// Global CSS
import "./globals.css";
import { ThemeProvider } from "next-themes";

// Fonts
const josefinSans = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

// Metadata
export const metadata: Metadata = {
  title: "Fromageria Tesilli",
  description: "Fromageria Tesilli oferece queijos artesanais de qualidade, feitos com ingredientes selecionados e sabores únicos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }} >
      <body
        className={`${josefinSans.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
