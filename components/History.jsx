"use client";

import React, { useState, useEffect } from "react";
import Taskbar from "@/components/Taskbar";
import Report from "@/components/Report";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const fetchTickets = async (setTickets, setError) => {
  try {
    const response = await fetch("/api/dashboard");
    const data = await response.json();
    if (response.ok) {
      setTickets(data || []);
    } else {
      setError(data.error || "Failed to fetch tickets");
    }
  } catch (error) {
    setError("Error fetching tickets");
    console.error("Error fetching tickets:", error);
  }
};

export default function HistoryComponent() {
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTickets(setTickets, setError);
  }, []);

  // Filter tickets to show only those with status 0
  const finishedTickets = tickets.filter((ticket) => ticket.status === 0);

  // Filter tickets based on search query
  const filteredTickets = finishedTickets.filter(
    (ticket) =>
      ticket.patient_id.includes(searchQuery) ||
      ticket.patient_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div>
        <Taskbar />
        <Report />
        <div className="min-h-screen bg-gray-100 flex justify-center p-8">
          <div className="w-full max-w-5xl bg-white shadow-md rounded-lg">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between rounded-t-lg">
              <h1 className="text-xl font-semibold">ประวัตินักศึกษา</h1>
              <div className="flex items-center space-x-4">
                <button className="text-white font-semibold hover:underline">
                  ผู้ใช้รายวัน
                </button>
                <button className="text-white font-semibold hover:underline">
                  ผู้ใช้รายสัปดาห์
                </button>
                <button className="text-white font-semibold hover:underline">
                  ผู้ใช้รายเดือน
                </button>

                <input
                  type="text"
                  placeholder="search"
                  className="text-black ml-4 px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {error && <div className="text-red-500">{error}</div>}
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-center">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="py-2 px-4 border-b text-center">
                    รหัสนักศึกษา
                  </th>
                  <th className="py-2 px-4 border-b text-center">สถานะ</th>
                  <th className="py-2 px-4 border-b text-center">
                    วันที่และเวลา
                  </th>
                  <th className="py-2 px-4 border-b text-center">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((ticket) => (
                    <tr
                      key={ticket.patientrecord_id}
                      className="border bg-green-100 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
                    >
                      <td className="py-2 px-4 border-b text-center">
                        {ticket.patient_name}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {ticket.patient_id}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {ticket.role}
                      </td>
                      <td className="py-2 px-4 border-b text-center">
                        {new Date(ticket.datetime).toLocaleString()}
                      </td>
                      <Dialog>
                        <DialogTrigger asChild>
                          <td className="py-2 px-4 border-b text-blue-700 cursor-pointer text-center">
                            ดูข้อมูล
                          </td>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Patient Ticket</DialogTitle>
                            <DialogDescription>
                              Status: Finished
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-2 py-1">
                            <h3 className="ml-10">
                              Name: {ticket.patient_name}
                            </h3>
                            <h3 className="ml-10">
                              Student ID: {ticket.patient_id}
                            </h3>
                            <h3 className="ml-10">
                              Check-in Time:{" "}
                              {new Date(ticket.datetime).toLocaleString()}
                            </h3>
                            <br />
                            <h3 className="ml-10">Patient Symptoms</h3>
                            {ticket.symptom_names ? (
                              <div className="ml-10 space-y-2">
                                {ticket.symptom_names
                                  .split(",")
                                  .map((symptom, index) => (
                                    <p key={index} className="block">
                                      {symptom.trim()}
                                    </p>
                                  ))}
                              </div>
                            ) : (
                              <p className="ml-10">No symptoms recorded</p>
                            )}
                            {ticket.other_symptom && (
                              <div className="ml-10 mt-2">
                                <h3>Other Symptoms:</h3>
                                <p>{ticket.other_symptom}</p>
                              </div>
                            )}
                            {ticket.pill_quantities && (
                              <div className="ml-10 mt-2">
                                <h3>Pill Records:</h3>
                                <div className="space-y-2">
                                  {ticket.pill_quantities
                                    .split(",")
                                    .map((quantity, index) => (
                                      <div key={index} className="block">
                                        <p>
                                          Pill Name:{" "}
                                          {ticket.pill_names
                                            ? ticket.pill_names.split(",")[index]
                                            : "Unknown"}
                                        </p>
                                        <p>
                                          Pill Stock ID:{" "}
                                          {ticket.pillstock_ids
                                            ? ticket.pillstock_ids.split(",")[index]
                                            : "Unknown"}
                                        </p>
                                        <p>Quantity: {quantity.trim()}</p>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                Close
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      No patient listed currently.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}