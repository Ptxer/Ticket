"use client"
import { Inter } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "../provider";

const inter = Inter({ subsets: ["latin"] });

export default function LoginLayout({children}) {
    return (
        <section className={inter.className}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </section>
    )
}

