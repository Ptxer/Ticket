"use client"
import "../globals.css";
import { AuthProvider } from "../provider";
import IdleTimer from "../IdleTimeout";

import { IBM_Plex_Sans_Thai } from "next/font/google";

const inter = IBM_Plex_Sans_Thai({
  subsets: ["latin"],
  weight: "400",

});

export default function DashboardLayout({ children }) {
    return (

        <section className={inter.className}>
            <AuthProvider>
            <IdleTimer />
                {children}
            </AuthProvider>
        </section>

    )
}
