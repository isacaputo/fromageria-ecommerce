// Next.js
import type { Metadata } from 'next';
import { Josefin_Sans } from 'next/font/google';

// Clerk Authentication
import {
  ClerkProvider,
  // SignInButton,
  // SignedIn,
  // SignedOut,
  // UserButton
} from '@clerk/nextjs';

// Global CSS
import './globals.css';

// Components
import ThemeProviderWrapper from '@/components/shared/theme-provider';

// Fonts
const josefinSans = Josefin_Sans({
  variable: '--font-josefin',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
});

// Metadata
export const metadata: Metadata = {
  title: 'Fromageria Tesilli',
  description:
    'Fromageria Tesilli oferece queijos artesanais de qualidade, feitos com ingredientes selecionados e sabores únicos.',
};

// Toast
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

// Providers
import ModalProvider from '@/providers/modal-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${josefinSans.variable} antialiased`}>
          <ThemeProviderWrapper>
            <ModalProvider>
              {children}
            </ModalProvider>
            <Toaster />
            <SonnerToaster position='bottom-left' />
          </ThemeProviderWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}
