import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import "@/components/ui/thinkingLoader/globals.css"; // Import loader CSS directly here - REMOVED
// import "../components/ui/thinkingLoader/globals.css"; // Use relative path import instead - REMOVED

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Tariel AI Studio Clone",
  description: "Visual clone of Google AI Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-brand-dark text-brand-text-light`}>
        {children}
      </body>
    </html>
  );
}
