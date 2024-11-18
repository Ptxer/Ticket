"use client";
import "./globals.css";
import { AuthProvider } from "./provider";
import { Toaster } from "@/components/ui/toaster";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = IBM_Plex_Sans_Thai({
  subsets: ["latin"],
  weight: "400",
});

export default function RootLayout({ children }) {
  return (
    <html>
      <body className={`${inter.className} bg-wave`}>
        <main>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </Suspense>
        </main>
      </body>
    </html>
  );
}
