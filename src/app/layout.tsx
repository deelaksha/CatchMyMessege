import Image from "next/image";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catch My Messege",
  description: "Ctach And Have Fun With Your Messege",
  icons: {
    icon: "/mylogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navbar with Logo */}
        <header className="flex items-center justify-between p-4 bg-gray-800">
          <div className="flex items-center space-x-2">
            <Image src="/mylogo.png" alt="Logo" width={40} height={40} />
            <h1 className="text-white text-xl">My Website</h1>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}
