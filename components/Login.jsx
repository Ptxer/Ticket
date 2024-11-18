"use client";
import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
    const { toast } = useToast();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') {
            setLoading(true);
            return;
        }

        setLoading(false);

        if (session) {
            router.push("/homepage");
        }
    }, [session, status, router]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res.error) {
                toast({
                    variant: "destructive",
                    title: 'เกิดข้อผิดพลาด',
                    description: 'อีเมล หรือ รหัสผ่านไม่ถูก',
                    duration: 2000,
                });
                return;
            }

            toast({
                variant: "success",
                title: 'กำลังเข้าสู่ระบบ',
                duration: 2000,
            });

            router.push("/homepage");

        } catch (error) {
            console.log("Error during sign-in:", error);
            setError("An error occurred during sign-in");
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700">
            <div className="flex items-center justify-center">
              <svg
                aria-hidden="true"
                className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
            </div>
          </div>
        );
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-custom">
            <div className="bg-white px-16 py-8  shadow-md mb-8 form-border">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="flex items-center justify-center w-80">
                            <div className="text-center">
                                <h3 className="text-3xl font-mono">
                                    Login
                                </h3>
                            </div>
                        </div>
                        <div className="w-full ">
                            <label className="block text-gray-700 font-mono">
                                Email
                            </label>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 input-border pl-4"
                                placeholder="อีเมล์"
                            />
                        </div>
                        <div className="w-full">
                            <label className="block text-gray-700 font-mono">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full p-2 border border-gray-300 input-border pl-4"
                                placeholder="พาสเวิร์ด"
                            />
                        </div>
                        <div className="flex justify-center">
                            <Button type="submit" className="bg-blue-800">Login</Button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
                </form>
            </div>
        </main>
    );
}