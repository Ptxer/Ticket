import { useSession } from "next-auth/react";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { IBM_Plex_Sans_Thai } from "next/font/google";

const inter = IBM_Plex_Sans_Thai({
  subsets: ["latin"],
  weight: "400",

});

export default function Taskbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const currentRoute = router.pathname;

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  return (
    <main className={inter.className}>
          <div className="flex justify-between">
      <div>
        <h3 className="text-3xl py-3 ml-10">
          {session?.user?.name || "Guest"} ได้เข้าสู่ระบบ
        </h3>
      </div>
      <div className="justify-center content-center space-x-4 mr-10 ">
        <Button
          id="dashboard"
          className={`${
            currentRoute === "/dashboard" ? "bg-blue-400 text-white" : ""
          } transition-colors`}
          onClick={() => router.push("/homepage")}
        >
          หนัาหลัก
        </Button>
        <Button
          id="medicine"
          className={`${
            currentRoute === "/medicine" ? "bg-blue-400 text-white" : ""
          } transition-colors`}
          onClick={() => router.push("/medicine")}
        >
          คลังยา
        </Button>
        <Button
          id="history"
          className={`${
            currentRoute === "/history" ? "bg-blue-400 text-white" : ""
          } transition-colors`}
          onClick={() => router.push("/dashboard")}
        >
          แดชบอร์ด
        </Button>
      </div>
    </div>
    </main>
  );
}