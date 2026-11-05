import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATC Workspace | Shelter Indonesia",
  description: "Satu ruang kerja untuk Accounting, Tax, dan Compliance Shelter Indonesia.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
