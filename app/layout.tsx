import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MULENET | Financial Crime Intelligence",
  description: "AI-powered mule account detection, AML intelligence, and investigation platform."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
