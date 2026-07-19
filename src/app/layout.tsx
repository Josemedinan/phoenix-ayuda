import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PHOENIX Seismo — Venezuela earthquake monitor",
  description:
    "A Venezuela-focused, real-time earthquake monitor with public USGS event data and local browser alerts.",
  applicationName: "PHOENIX Seismo",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
