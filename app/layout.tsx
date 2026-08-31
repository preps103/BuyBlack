import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://buyblack.goodos.app"),
  title: "BuyBlack Directory",
  description:
    "Discover curator-reviewed Black-owned businesses across the United States.",
  applicationName: "BuyBlack",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "BuyBlack Directory",
    description:
      "Discover curator-reviewed Black-owned businesses across the United States.",
    url: "https://buyblack.goodos.app",
    siteName: "BuyBlack Directory",
    type: "website",
    images: [
      {
        url: "/og-directory.png",
        width: 1728,
        height: 910,
        alt: "BuyBlack Directory — Curated Black-owned businesses",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BuyBlack Directory",
    description:
      "Discover curator-reviewed Black-owned businesses across the United States.",
    images: ["/og-directory.png"],
  },
  icons: {
    icon: [
      {
        url: "/favicon-20260729.ico",
        type: "image/x-icon",
        sizes: "any",
      },
      {
        url: "/favicon-32x32-20260729.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicon-16x16-20260729.png",
        type: "image/png",
        sizes: "16x16",
      },
    ],
    shortcut: "/favicon-20260729.ico",
    apple: [
      {
        url: "/apple-touch-icon-20260729.png",
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
