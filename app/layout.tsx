import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { getSessionFromCookies } from "@/lib/auth";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Complihub | Compliance Portal",
  description: "Compliance management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionFromCookies();

  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${manrope.variable} ${inter.variable} antialiased bg-[#f7fafc] text-[#283439]`}
      >
        {session ? (
          <div className="flex">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 mt-16 p-8">
                {children}
              </main>
            </div>
          </div>
        ) : (
          <>
            <Navbar />
            {children}
          </>
        )}
      </body>
    </html>
  );
}