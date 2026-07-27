import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "BuyBlack Marketplace",
  description:
    "Discover, share, and support exceptional Black-owned businesses, creators, and brands.",
  applicationName: "BuyBlack",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon-20260727.ico",
        type: "image/x-icon",
        sizes: "any",
      },
      {
        url: "/favicon-32x32-20260727.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon-16x16-20260727.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    shortcut: "/favicon-20260727.ico",
    apple: [
      {
        url: "/apple-touch-icon-20260727.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
