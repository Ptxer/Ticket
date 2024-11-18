"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const options = [
  { value: 1, label: "ปวดหัวเป็นไข้" },
  { value: 2, label: "ปวดท้อง" },
  { value: 3, label: "ท้องเสีย" },
  { value: 4, label: "ปวดรอบเดือน" },
  { value: 5, label: "เป็นหวัด" },
  { value: 6, label: "ปวดฟัน" },
  { value: 7, label: "เป็นแผล" },
  { value: 8, label: "เป็นลม" },
  { value: 9, label: "ตาเจ็บ" },
  { value: 10, label: "ผื่นคัน" },
  { value: 11, label: "นอนพัก" },
  { value: 12, label: "อื่นๆ" },
];

export default function PatientForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    setLoading(false);

    if (session) {
      router.push("/homepage");
    }
  }, [session, status, router]);

  const [isMounted, setIsMounted] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [otherSymptom, setOtherSymptom] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const handleSymptomChange = (selectedOptions) => {
    setSelectedSymptoms(selectedOptions.map((option) => option.value));
  };

  const handleRoleChange = (event) => {
    const selectedRole = event.target.value;
    setRole(selectedRole);
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const symptomLabels = {
      1: "ปวดหัวเป็นไข้",
      2: "ปวดท้อง",
      3: "ท้องเสีย",
      4: "ปวดรอบเดือน",
      5: "เป็นหวัด",
      6: "ปวดฟัน",
      7: "เป็นแผล",
      8: "เป็นลม",
      9: "ตาเจ็บ",
      10: "ผื่นคัน",
      11: "นอนพัก",
      12: "อื่นๆ",
    };

    const sortedSymptoms = selectedSymptoms.sort((a, b) => a - b);
    const selectedSymptomLabels = sortedSymptoms
      .map((id) => symptomLabels[id] || "Unknown")
      .join(", ");

    const confirmMessage = `
            ยืนยันข้อมูล:
            ชื่อ-นามสกุล: ${studentName}
            รหัสนักศึกษา: ${studentId}
            สถานะ: ${role}
            อาการ: ${selectedSymptomLabels}
            ${selectedSymptoms.includes(12) ? `หมายเหต: ${otherSymptom}` : ""}
        `;

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    const formData = {
      student_id: studentId,
      student_name: studentName,
      role: role,
      symptom_ids: selectedSymptoms,
      other_symptom: selectedSymptoms.includes(12) ? otherSymptom : "",
    };

    try {
      const response = await fetch("/api/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        if (role === "บุคคลภายนอก") {
          toast({
            variant: "success",
            title: "ได้รับข้อมูลแล้ว",
            description: `ชื่อ-นามสกุล ${studentName} 
                            ตำแหน่ง ${role} 
                            อาการ ${selectedSymptomLabels} ${
              selectedSymptoms.includes(12) ? ` ${otherSymptom}` : ""
            }`,
            duration: 2000,
          });
        } else {
          toast({
            variant: "success",
            title: "ได้รับข้อมูลแล้ว",
            description: `รหัสนักศึกษา ${studentId} 
                            ชื่อ-นามสกุล ${studentName} 
                            ตำแหน่ง ${role} 
                            อาการ ${selectedSymptomLabels} ${
              selectedSymptoms.includes(12) ? ` ${otherSymptom}` : ""
            }`,
            duration: 2000,
          });
        }
        location.reload();
      } else {
        console.log("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white border border-gray-100 rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-800 dark:hover:bg-gray-700 ">
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

  if (!isMounted) return null;

  return (
    <div>
      <div className="flex justify-center items-center min-h-screen bg-custom">
        <div className="bg-zinc-100 shadow-md p-8 max-w-lg w-full mb-20 form-border ">
          <div className="text-center text-2xl font-bold mb-6 text-gray-700">
            <h1>แบบฟอร์มนักศึกษาที่มาใช้ห้องพยาบาล</h1>
          </div>
          <form  onSubmit={onSubmit} className="mx-8 mt-8 mb-2">
            <div className="mb-4">
              <label className="block text-gray-700 text-center  font-bold text-lg">
                ชื่อ-นามสกุล
              </label>
              <input
                type="text"
                id="student_name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="mt-1 block w-full p-2 border border-black input-border pl-4"
                placeholder="ชื่อ-นามสกุล"
                style={{ borderColor: "black" }}
              />
            </div>
            <div className="flex gap-1 my-5">
              <div>
                <input
                  type="radio"
                  id="student"
                  name="role"
                  value="นักศึกษา"
                  onChange={handleRoleChange}
                />
                <label htmlFor="student"> นักศึกษา</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="staff"
                  name="role"
                  value="บุคลากร"
                  onChange={handleRoleChange}
                />
                <label htmlFor="staff"> บุคลากรมหาลัย</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="outsider"
                  name="role"
                  value="บุคคลภายนอก"
                  onChange={handleRoleChange}
                />
                <label htmlFor="outsider"> บุคคลภายนอก</label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-center font-bold text-lg">
                เลขนักศึกษา
              </label>
              <input
                type="text"
                id="student_id"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-1 block w-full p-2 border border-black input-border pl-4"
                placeholder="เลขนักศึกษา"
                style={{ borderColor: "black" }}
              />
            </div>
            <div className="flex w-full flex-col gap-1 ">
              <label className="block  text-center font-bold text-lg">
                อาการ
              </label>
              <Select
                options={options}
                isMulti
                value={options.filter((option) =>
                  selectedSymptoms.includes(option.value)
                )}
                onChange={(selectedOptions) =>
                  setSelectedSymptoms(
                    selectedOptions.map((option) => option.value)
                  )
                }
              />
              {selectedSymptoms.includes(12) && (
                <div className="mt-4">
                  <label className="block text-gray-700 font-bold text-lg">
                    โปรดระบุอาการอื่นๆ
                  </label>
                  <input
                    type="text"
                    value={otherSymptom}
                    onChange={(e) => setOtherSymptom(e.target.value)}
                    className="mt-1 block w-full p-2 border border-black input-border pl-4"
                    placeholder="ระบุอาการอื่นๆ"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <Button className="bg-blue-700 hover:bg-blue-400" type="submit">
                ยืนยัน
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
