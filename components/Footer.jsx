"use client";

import React from 'react';
import { useSession } from "next-auth/react";

function Footer() {

  return (
    <footer className="w-full bg-blue-800 py-4 ">
      <div className="container mx-auto text-center">
        <p className="text-sm text-white">
          © {new Date().getFullYear()} UTCC Infirmary. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
