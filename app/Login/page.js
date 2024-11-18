"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";

import LoginForm from "@/components/Login";
import Footer from "@/components/Footer";

export default function() {

  return (
    <main>
      <Navbar />
      <LoginForm />
    </main>
  );
};


