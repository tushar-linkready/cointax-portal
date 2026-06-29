import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cointax Portal - CA Firm Management",
  description:
    "The modern client portal for CA & CS firms in India. Manage tasks, clients, and compliance — all in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
