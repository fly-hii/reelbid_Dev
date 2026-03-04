import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import ProfanityGuard from "@/components/ProfanityGuard";
import ProfanityCheckProvider from "@/components/ProfanityCheckProvider";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

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
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className={inter.className} style={{ minHeight: '100vh' }}>
        <Providers>
          <Navbar />
          <ProfanityGuard />
          <ProfanityCheckProvider />
          <main style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '96px 24px 48px',
            position: 'relative',
            zIndex: 1,
          }}>
            {children}
          </main>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                boxShadow: 'var(--shadow-floating)',
                backdropFilter: 'blur(20px)',
              },
              duration: 3000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
