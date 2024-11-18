"use client";
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PatientForm from "@/components/PatientForm";

const HealthForm = () => {
  return (
    <div>
      <Navbar />
      <div className="max-w-full overflow-x-hidden">
        <PatientForm />
      </div>
      <Footer />
    </div>
  );
};

export default HealthForm;
