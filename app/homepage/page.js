"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import DashboardComponent from "@/components/Dashboard";

function Dashboard() {
  const { data: session, status } = useSession();
  return (
    <main>
      <Navbar session={session} />
      <DashboardComponent />
    </main>
  );
}

export default Dashboard;