import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { useToast } from "@/hooks/use-toast";


function Navbar({ session }) {

    const { toast } = useToast();

    const handleSignOut = async (e) => {
        e.preventDefault();
        toast({
            variant: "destructive",
            title: 'Logging out...',
            description: 'You are being signed out.',
            duration: 5000,
        });

        await signOut({ redirect: true, callbackUrl: '/' });
    };

    return (
        <nav className="">
            <div className="bg-blue-900 text-white drop-shadow-lg">
                <div className="flex justify-between items-center p-1">
                    <div className="flex items-center hover:text-5xl">
                        <img src="/utcc_logo.png" width={49} className="mr-2 hover:scale-110 transition-transform duration-300" />
                        <div className="text-4xl ">
                            <Link href="/" className="flex hover:scale-110 transition-transform duration-300">
                                UTCC Infirmary
                            </Link>
                        </div>
                    </div>
                    <ul className="flex space-x-4 ml-auto mx-10">
                        {!session ? (
                            <li><Link href="/Login" className="text-2xl px-2 py-2 no-underline hover:underline">Login</Link></li>
                        ) : (
                            <li>
                                <Button
                                variant="destructive"
                                    onClick={handleSignOut}
                                     
                                    className=" ">
                                    Logout
                                </Button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
