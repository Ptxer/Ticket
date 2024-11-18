"use client";

import Test from "@/components/Test";
import React from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import HistoryComponent from "@/components/History";

function History() {
  const { data: session } = useSession();
  return (
    <main>
      <Navbar session={session} />
      <HistoryComponent />
    </main>
  );
}

export default History;