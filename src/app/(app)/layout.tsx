import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rantify",
  description: "Anonymous feedback platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
    </div>
  );
}
