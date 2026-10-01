import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lizardfy | Candles for your moment",
  description:
    "Made to feel like they were always yours. Create a custom candle with Lizardfy.",
  icons: { icon: "/logoImg.svg" },
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
