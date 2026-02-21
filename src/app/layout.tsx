import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReelBid | Movie Hero Memorabilia Auctions",
  description: "Bid on iconic shirts, dresses & bikes worn by movie heroes. Tier-based auction platform where your wallet defines your bidding power.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className} style={{ minHeight: '100vh' }}>
        <Providers>
          <Navbar />
          <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '96px 24px 48px' }}>
            {children}
          </main>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '14px',
                fontSize: '0.875rem',
                fontWeight: 500,
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
