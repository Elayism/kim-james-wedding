import type { Metadata, Viewport } from "next";
import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import AppLoader from "@/components/AppLoader";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#FDF8F0",
};

export const metadata: Metadata = {
  title: "Kimberlyn & James | March 8, 2027",
  description: "Join us in celebrating our wedding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${playfair.variable} ${cormorant.variable}`}>
        <AppLoader>{children}</AppLoader>
      </body>
    </html>
  );
}
