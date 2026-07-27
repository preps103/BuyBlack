import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "BuyBlack Marketplace",
  description:
    "Discover, share, and support exceptional Black-owned businesses, creators, and brands.",
  applicationName: "BuyBlack",
  icons: {
    icon: [
      {
        url: "/buyblack-favicon-20260726.png",
        type: "image/png",
        sizes: "64x64",
      },
    ],
    shortcut: "/buyblack-favicon-20260726.png",
    apple: [
      {
        url: "/buyblack-favicon-20260726.png",
        type: "image/png",
        sizes: "64x64",
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
