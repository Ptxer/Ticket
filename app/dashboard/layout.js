"use client";
import "../globals.css";
import { AuthProvider } from "../provider";
import IdleTimer from "../IdleTimeout";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Suspense } from "react";

const inter = IBM_Plex_Sans_Thai({
  subsets: ["latin"],
  weight: "400",
});

export default function HistoryLayout({ children }) {
  return (
    <section className={inter.className}>
      <Suspense fallback="Loading...">
        <AuthProvider>
          <IdleTimer />
          {children}
        </AuthProvider>
      </Suspense>
    </section>
  );
}
