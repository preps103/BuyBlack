import type { Metadata } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "BuyBlack Marketplace",
  description:
    "Discover, share, and support exceptional Black-owned businesses, creators, and brands.",
  applicationName: "BuyBlack",
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
