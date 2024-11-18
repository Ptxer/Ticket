"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
import Taskbar from "@/components/Taskbar";
import Display from "@/components/Display";
import { useToast } from "@/hooks/use-toast";

export default function DashboardComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevTicketsRef = useRef([]);

  const [currentActiveTodayPage, setCurrentActiveTodayPage] = useState(1);
  const [currentFinishedPage, setCurrentFinishedPage] = useState(1);
  const itemsPerPage = 10;

  const handleTicket = async (ticket) => {
    if (!ticket || !ticket.patientrecord_id) {
      console.error("Invalid ticket data:", ticket);
      return;
    }

    const query = new URLSearchParams({
      patientrecord_id: ticket.patientrecord_id,
      patient_name: ticket.patient_name || "Unknown",
      patient_id: ticket.patient_id || "Unknown",
      datetime: ticket.datetime || new Date().toISOString(),
      symptoms: ticket.symptom_names || "No symptoms recorded",
      other_symptom: ticket.other_symptom || "No other symptoms",
    }).toString();

    const url = `/ticket/${ticket.patientrecord_id}?${query}`;

    router.push(url);
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await res.json();
      setTickets(data);

      // Check for new tickets
      const prevTickets = prevTicketsRef.current;
      if (prevTickets.length > 0 && data.length > prevTickets.length) {
        const newTickets = data.filter(
          (ticket) =>
            !prevTickets.some(
              (prevTicket) =>
                prevTicket.patientrecord_id === ticket.patientrecord_id
            )
        );
        newTickets.forEach((ticket) => {
          toast({
            variant: "success",
            title: "มีผู้ป่วยใหม่",
            description: `ชื่อ ${ticket.patient_name}`,
            duration: 2000,
          });
        });
      }
      prevTicketsRef.current = data;
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patientrecord_id) => {
    try {
      const res = await fetch(`/api/ticket/${patientrecord_id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      setTickets((prevTickets) =>
        prevTickets.filter(
          (ticket) => ticket.patientrecord_id !== patientrecord_id
        )
      );
    } catch (error) {
      console.error("Error deleting ticket:", error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);

    return () => clearInterval(interval);
  }, [session, status, router]);

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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!tickets || tickets.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        No tickets found.
      </div>
    );
  }

  const today = new Date();
  const startOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0,
    0
  );
  const endOfDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  );

  const sortedTickets = tickets.sort(
    (a, b) => new Date(b.datetime) - new Date(a.datetime)
  );

  const todayTickets = sortedTickets.filter((ticket) => {
    const ticketDate = new Date(ticket.datetime);
    return ticketDate >= startOfDay && ticketDate <= endOfDay;
  });

  const activeTickets = todayTickets.filter((ticket) => ticket.status === 1);
  const finishedTickets = todayTickets.filter((ticket) => ticket.status !== 1);

  // Pagination Logic for Active Today
  const totalActiveTodayPages = Math.ceil(activeTickets.length / itemsPerPage);
  const indexActiveTodayLast = currentActiveTodayPage * itemsPerPage;
  const indexActiveTodayFirst = indexActiveTodayLast - itemsPerPage;
  const currentActiveTodayTickets = activeTickets.slice(
    indexActiveTodayFirst,
    indexActiveTodayLast
  );

  // Pagination Logic for Finished Tickets
  const totalFinishedPages = Math.ceil(finishedTickets.length / itemsPerPage);
  const indexFinishedLast = currentFinishedPage * itemsPerPage;
  const indexFinishedFirst = indexFinishedLast - itemsPerPage;
  const currentFinishedTickets = finishedTickets.slice(
    indexFinishedFirst,
    indexFinishedLast
  );

  const handleActiveTodayPageChange = (pageNumber) => {
    setCurrentActiveTodayPage(pageNumber);
  };

  const handleFinishedPageChange = (pageNumber) => {
    setCurrentFinishedPage(pageNumber);
  };

  const formatDate = (datetime) => {
    const date = new Date(datetime);
    const dateString = date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const timeString = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateString}\nเวลา ${timeString}`;
  };
  return (
    <div>
      <div>
        <Taskbar />
        <Display />
        <div className="flex flex-col items-center bg-gray-100 text-center overflow-y-auto min-h-screen p-4">
          <div className="bg-white w-full max-w-4xl rounded shadow-md mt-4">
            <div className="bg-blue-900 text-white text-lg font-semibold p-4 rounded-t-md">
              รายชื่อผู้ป่วยรอจ่ายยา
            </div>
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-center">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="py-2 px-4 border-b text-center">
                    รหัสนักศึกษา
                  </th>
                  <th className="py-2 px-4 border-b text-center">บทบาท</th>
                  <th className="py-2 px-4 border-b text-center">
                    วันที่และเวลา
                  </th>
                  <th className="py-2 px-4 border-b text-center">ดำเนินการ</th>
                </tr>
              </thead>
              {console.log(currentActiveTodayTickets)}
              <tbody>
                {currentActiveTodayTickets.length > 0 ? (
                  currentActiveTodayTickets.map((ticket) => (
                    <tr
                      key={ticket.patientrecord_id}
                      className="border bg-blue-100 cursor-pointer transition-transform transform hover:scale-105 hover:shadow-lg"
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
                            สั่งยา
                          </td>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] display-border">
                          <DialogHeader>
                            <DialogTitle>Patient Ticket</DialogTitle>
                            <DialogDescription>
                              Status: Active
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-2 py-1">
                            <h3 className="ml-10">
                              ชื่อ: {ticket.patient_name}
                            </h3>
                            <h3 className="ml-10">
                              รหัสนักศึกษา: {ticket.patient_id}
                            </h3>
                            <h3 className="ml-10">
                              เวลาเช็คอิน:{" "}
                              {new Date(ticket.datetime).toLocaleString()}
                            </h3>
                            <br />
                            <h3 className="ml-10">อาการของผู้ป่วย</h3>
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
                              <p className="ml-10">ไม่มีอาการที่บันทึกไว้</p>
                            )}
                            {ticket.other_symptoms && (
                              <div className="ml-10 mt-2">
                                <h3>อาการอื่นๆ:</h3>
                                <div className="space-y-2">
                                  {ticket.other_symptoms
                                    .split(",")
                                    .map((symptom, index) => (
                                      <p key={index}>{symptom.trim()}</p>
                                    ))}
                                </div>
                              </div>
                            )}

                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                ปิด
                              </Button>
                            </DialogClose>
                            <Button
                              type="button"
                              onClick={() => handleTicket(ticket)}
                            >
                              สั่งยา
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <td
                        className="py-2 px-4 border-b text-red-500 cursor-pointer hover:text-red-700 transition-colors text-center"
                        onClick={() => handleDelete(ticket.patientrecord_id)}
                      >
                        ลบ
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      ไม่มีผู้ป่วยที่บันทึกไว้ในขณะนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {totalActiveTodayPages > 1 && (
              <div className="flex justify-center my-2">
                {Array.from({ length: totalActiveTodayPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handleActiveTodayPageChange(index + 1)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentActiveTodayPage === index + 1
                        ? "bg-blue-500 text-white hover:bg-blue-700"
                        : "bg-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white w-full max-w-4xl rounded shadow-md mt-4 ">
            <div className="bg-green-900 text-white text-lg font-semibold p-4 rounded-t-md">
              รายชื่อผู้ป่วยจ่ายยาเเล้ว
            </div>
            <table className="min-w-full bg-white opacity-50">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-center">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="py-2 px-4 border-b text-center">
                    รหัสนักศึกษา
                  </th>
                  <th className="py-2 px-4 border-b text-center">บทบาท</th>
                  <th className="py-2 px-4 border-b text-center">
                    วันที่และเวลา
                  </th>
                  <th className="py-2 px-4 border-b text-center">ดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {currentFinishedTickets.length > 0 ? (
                  currentFinishedTickets.map((ticket) => (
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
                      <Dialog className="">
                        <DialogTrigger asChild>
                          <td className="py-2 px-4 border-b text-blue-700 cursor-pointer text-center">
                            ดูข้อมูล
                          </td>
                        </DialogTrigger>
                        <DialogContent className="w-full">
                          <DialogHeader>
                            <DialogTitle>Patient Ticket</DialogTitle>
                            <DialogDescription>
                              Status: Finished
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-1">
                            <div>
                              <h3 className="ml-10 text-lg">ชื่อ-นามสกุล</h3>
                              <div className="ml-16">{ticket.patient_name}</div>
                            </div>
                            <div>
                              <h3 className="ml-10 text-lg">รหัสนักศึกษา</h3>
                              <div className="ml-16">{ticket.patient_id}</div>
                            </div>
                            <div>
                              <h3 className="ml-10 text-lg">เวลาเช็คอิน</h3>
                              <div className="ml-16">
                                {formatDate(ticket.datetime)}
                              </div>
                            </div>
                            <br />
                            <h3 className="ml-10 text-lg">อาการของผู้ป่วย</h3>
                            {ticket.symptom_names ? (
                              <div className="ml-10 space-y-2 text-lg">
                                <p className="ml-10">
                                  {ticket.symptom_names
                                    .split(",")
                                    .map((symptom) => symptom.trim())
                                    .join(", ")}
                                </p>
                              </div>
                            ) : (
                              <p className="ml-10 text-lg">
                                ไม่มีอาการที่บันทึกไว้
                              </p>
                            )}
                            {ticket.other_symptoms && (
                              <div className="ml-10 mt-2">
                                <h3>อาการอื่นๆ:</h3>
                                <div className="space-y-2">
                                  {ticket.other_symptoms
                                    .split(",")
                                    .map((symptom, index) => (
                                      <p key={index}>{symptom.trim()}</p>
                                    ))}
                                </div>
                              </div>
                            )}

                            {ticket.pill_quantities && (
                              <div className="mt-2">
                                <div className="space-y-2 bg-gray-200">
                                  <table className="border-collapse border mx-auto w-full max-w-4xl">
                                    <thead>
                                      <h3 className="text-xl font-semibold border bg-gray-200">
                                        บันทึกยา
                                      </h3>
                                      <tr className="border bg-gray-200">
                                        <th className="border px-4 py-2">
                                          Lot Id
                                        </th>
                                        <th className="border px-4 py-2">
                                          Pill Name
                                        </th>
                                        <th className="border px-4 py-2">
                                          Quantity
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ticket.pill_quantities
                                        .split(",")
                                        .map((quantity, index) => (
                                          <tr key={index}>
                                            <td className="border px-4 py-2">
                                              {ticket.pillstock_ids
                                                ? ticket.pillstock_ids.split(
                                                    ","
                                                  )[index]
                                                : "Unknown"}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {ticket.pill_names
                                                ? ticket.pill_names.split(",")[
                                                    index
                                                  ]
                                                : "Unknown"}
                                            </td>
                                            <td className="border px-4 py-2">
                                              {quantity.trim()}{" "}
                                              {ticket.unit_type}
                                            </td>
                                          </tr>
                                        ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" variant="secondary">
                                ปิด
                              </Button>
                            </DialogClose>
                            <Button
                              type="button"
                              onClick={() => handleTicket(ticket)}
                            >
                              ดูข้อมูล
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      ไม่มีผู้ป่วยที่บันทึกไว้ในขณะนี้
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalFinishedPages > 1 && (
              <div className="flex justify-center my-2">
                {Array.from({ length: totalFinishedPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => handleFinishedPageChange(index + 1)}
                    className={`mx-1 px-3 py-1 rounded ${
                      currentFinishedPage === index + 1
                        ? "bg-blue-500 text-white hover:bg-blue-700"
                        : "bg-gray-300 hover:bg-gray-500"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
