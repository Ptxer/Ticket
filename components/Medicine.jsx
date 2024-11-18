import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Taskbar from "@/components/Taskbar";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function MedicineComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pillStock, setPillStock] = useState([]);
  const [error, setError] = useState(null);
  const [PillList, setPillList] = useState("");
  const [pillName, setPillName] = useState("");
  const [dose, setDose] = useState("");
  const [typeName, setTypeName] = useState("");
  const [expireDate, setExpireDate] = useState("");
  const [total, setTotal] = useState("");
  const [unit, setUnit] = useState("");
  const [types, setTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedPillList, setSelectedPillList] = useState(null);
  const [selectedPill, setSelectedPill] = useState(null);
  const [expandedPillId, setExpandedPillId] = useState(null);
  const [selectedPillId, setSelectedPillId] = useState(null);



  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (!session) {
      router.push("/");
      return;
    }

    fetchPillList();
    fetchData();
  }, [session, status, router]);

  useEffect(() => {
    fetchTypes();
    fetchUnits();
  }, []);

  const toggleExpand = (pillId) => {
    setExpandedPillId((prev) => (prev === pillId ? null : pillId));
  };

  const fetchPillList = async () => {
    try {
      const response = await fetch("/api/medicine/pill", { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPillList(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch("/api/medicine", { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPillStock(data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    }

  };

  const fetchTypes = async () => {
    try {
      const response = await fetch("/api/medicine_type", { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTypes(data);
    } catch (err) {
      console.error("Error fetching types:", err);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch("/api/unit_type", { method: "GET" });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setUnits(data);
    } catch (err) {
      console.error("Error fetching units:", err);
    }

  };

  const handleSave = async () => {
    const formPill = {
      pillName,
      dose,
      typeName,
      expireDate,
      total,
      unit,
      status: 1
    };

    try {
      const response = await fetch("/api/save_stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formPill),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data saved successfully:", data);
      // Refetch data to update UI
      fetchData();
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const handleSaveChanges = async () => {
    // ส่งค่าที่เลือกจาก dropdown เป็น type_id แทนที่จะเป็น type_name
    const response = await fetch('/api/save_medicine', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pillName,
        dose,
        typeName: typeName,  // ส่ง type_id (ไม่ใช่ชื่อประเภทยา)
        unit,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Pill added successfully', data);
      // รีเฟรชข้อมูล
      fetchPillList();
    } else {
      console.error('Error adding pill:', data.error);
    }
  };


  const handleRemove = async (pillstock_id) => {
    try {
      const response = await fetch(`/api/medicine/${pillstock_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ total: 0 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setPillStock(
        pillStock.filter((item) => item.pillstock_id !== pillstock_id)
      );
    } catch (err) {
      console.error("Error removing data:", err);
    }
    fetchData();
    fetchPillList();
    fetchTypes();
    fetchUnits();
  };

  const handleAddPillList = async () => {
    const formPillList = {
      pillName,
      dose,
      typeName,
      unit: unitType,
      status: 1

    };

    console.log("Sending data to server:", formPillList);
    try {
      const response = await fetch('/api/medicine/pill/submit_pilllist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formPillList),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data added successfully:", data);
      fetchPillList();
    } catch (err) {
      console.error("Error adding data:", err);
    }
  };

  const handleEditClick = (pill) => {
    setSelectedPill(pill);
    setPillName(pill.pill_name);
    setDose(pill.dose);
    setTypeName(pill.type_name);
    setExpireDate(
      pill.expire ? new Date(pill.expire).toISOString().split("T")[0] : ""
    );
    setTotal(pill.total);
    setUnit(pill.unit_type);
  };

  const handleEditPill = async () => {
    const formPill = {
      pillName,
      dose,
      typeName,
      expireDate,
      total: parseInt(total, 10),
      unit,
    };

    console.log("Sending data to server:", formPill);
    console.log("Request URL:", `/api/medicine/${selectedPill.pillstock_id}`);

    try {
      const response = await fetch(
        `/api/medicine/${selectedPill.pillstock_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formPill),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data updated successfully:", data);
      // Refetch data to update UI
      fetchData();
    } catch (err) {
      console.error("Error updating data:", err);
    }
    fetchData();
    fetchPillList();
    fetchTypes();
    fetchUnits();
  };

  const handleUpdatePillList = async () => {
    const selectedUnit = units.find((unitItem) => unitItem.unit_type === unit); // หา unit_id จาก unit_type ที่เลือก
    const unitId = selectedUnit ? selectedUnit.unit_id : null;

    if (!unitId) {
      console.error('Unit ID not found');
      return;
    }

    const formPillList = {
      pillName,
      dose,
      typeName,
      unitId,
    };

    console.log("Sending an update to server:", formPillList);
    try {
      const response = await fetch(
        `/api/medicine/pill/${selectedPillList.pill_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formPillList),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Data updated successfully:", data);
      fetchPillList(); // Refetch pill list to update UI
    } catch (err) {
      console.error("Error updating data:", err);
    }
  };
  useEffect(() => {
    fetchPillList();
  }, []);



  const handleRemovePillList = async (pill_id) => {
    try {
      // ส่ง PUT request ไปยัง backend เพื่ออัพเดต status เป็น 0
      const response = await fetch(`/api/medicine/pill/${pill_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: 0 }),  // ส่ง status = 0 เพื่อทำการลบ
      });

      // เช็คว่า request สำเร็จหรือไม่
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // กรอง pillStock โดยลบรายการที่มี status = 0 ออก
      setPillStock((prevPillStock) =>
        prevPillStock.filter((item) => item.pill_id !== pill_id || item.status !== 0)
      );
    } catch (err) {
      console.error("Error removing data:", err);
    }
    fetchData();
    fetchPillList();
    fetchTypes();
    fetchUnits();
  };



  if (status === "loading") {
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
      </div>);
  }

  if (!session) {
    return null;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">Error: {error}</div>;
  }

  const filteredPillStock = pillStock.filter((item) => item.total > 0);
  const emptyRows = Math.max(0, 10 - filteredPillStock.length);

  const handleEditPillList = (item) => {
    setSelectedPillList(item);
    setPillName(item.pill_name);
    setDose(item.dose);
    setTypeName(item.type_name);
    setUnit(item.unit_type);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar session={session} />
      <Taskbar />
      <main className="flex-1 p-5">
        <div className="flex justify-center items-start mt-10">
          <div className="w-full max-w-6xl bg-white shadow-md table-rounded">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between table-rounded">
              <h1 className="text-xl font-semibold">รายชื่อยาในระบบ</h1>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-cyan-400 text-white rounded">
                    Add Pill
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Pill</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new pill below and save your
                      changes.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Pill Name
                      </Label>
                      <Input
                        id="name"
                        value={pillName}
                        onChange={(e) => setPillName(e.target.value)}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dose" className="text-right">
                        Dose
                      </Label>
                      <Input
                        id="dose"
                        value={dose}
                        onChange={(e) => setDose(e.target.value)}
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="typeName" className="text-right">
                        Type Name
                      </Label>
                      <select
                        id="typeName"
                        value={typeName}
                        onChange={(e) => setTypeName(e.target.value)}
                        className="col-span-3 border rounded px-2 py-1"
                      >
                        <option value="">Select Type</option>
                        {types.map((type) => (
                          <option key={type.type_id} value={type.type_id}>
                            {type.type_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="unit" className="text-right">
                        Unit
                      </Label>
                      <select
                        id="unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="col-span-3 border rounded px-2 py-1"
                      >
                        <option value="">Select Unit</option>
                        {units.map((unitItem) => (
                          <option
                            key={unitItem.unit_id}
                            value={unitItem.unit_type}
                          >
                            {unitItem.unit_type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="button" onClick={handleSaveChanges}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>


            </div>
            <table className="border-collapse border mx-auto w-full max-w-7xl">
              <thead>
                <tr className="border bg-gray-200">
                  <th className="border px-4 py-2">Pill Id</th>
                  <th className="border px-4 py-2">Pill Name</th>
                  <th className="border px-4 py-2">Dose</th>
                  <th className="border px-4 py-2">Type Name</th>
                  <th className="border px-4 py-2">Unit Type</th>
                  <th className="border px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>

                {Array.isArray(PillList) && PillList.filter((pill) => pill.status !== 0).length > 0 ? (
                  PillList.filter((pill) => pill.status !== 0)
                    .sort((a, b) => b.status - a.status)
                    .map((pill, index) => (


                      <React.Fragment key={`${pill.pill_id}-${index}`}>
                        <tr
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={(e) => {
                            // ป้องกันไม่ให้ toggleExpand ทำงานเมื่อคลิกที่ปุ่มภายใน Dialog
                            if (!e.target.closest('.dialog') && !e.target.closest('button') && !e.target.closest('input') && !e.target.closest('select')) {
                              toggleExpand(pill.pill_id);
                              setSelectedPillId(pill.pill_id);  // Set the selected pill ID
                            }
                          }}
                        >
                          <td className="border px-4 py-2">{pill.pill_id}</td>
                          <td className="border px-4 py-2">{pill.pill_name}</td>
                          <td className="border px-4 py-2">{pill.dose}</td>
                          <td className="border px-4 py-2">{pill.type_name}</td>
                          <td className="border px-4 py-2">{pill.unit_type}</td>
                          <td className="border px-4 py-2">

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  className="bg-yellow-400 text-white rounded"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent toggleExpand from triggering
                                    handleEditPillList(pill);
                                  }}
                                >
                                  Edit
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                  <DialogTitle>Edit Pill</DialogTitle>
                                  <DialogDescription>
                                    Edit the details of the pill below and save your changes.
                                  </DialogDescription>
                                </DialogHeader>
                                <Input
                                  id="pillName"
                                  value={pillName}
                                  onChange={(e) => {
                                    e.stopPropagation();  // Prevent toggleExpand from triggering
                                    setPillName(e.target.value);
                                  }} // Update pillName
                                  className="col-span-3"
                                />
                                <Input
                                  id="dose"
                                  value={dose}
                                  onChange={(e) => {
                                    e.stopPropagation();  // Prevent toggleExpand from triggering
                                    setDose(e.target.value);
                                  }} // Update dose
                                  className="col-span-3"
                                />

                                <select
                                  id="typeName"
                                  value={typeName}
                                  onChange={(e) => {
                                    e.stopPropagation();  // Prevent toggleExpand from triggering
                                    setTypeName(e.target.value);
                                  }} // Update typeName
                                  className="col-span-3 border rounded px-2 py-1"
                                >
                                  <option value="">Select Type</option>
                                  {types.map((type) => (
                                    <option key={type.type_id} value={type.type_name}>
                                      {type.type_name}
                                    </option>
                                  ))}
                                </select>

                                <select
                                  id="unit"
                                  value={unit}
                                  onChange={(e) => {
                                    e.stopPropagation();  // Prevent toggleExpand from triggering
                                    setUnit(e.target.value);
                                  }} // Update unit
                                  className="col-span-3 border rounded px-2 py-1"
                                >
                                  <option value="">Select Unit</option>
                                  {units.map((unitItem) => (
                                    <option key={unitItem.unit_id} value={unitItem.unit_type}>
                                      {unitItem.unit_type}
                                    </option>
                                  ))}
                                </select>

                                <DialogFooter className="mt-4">
                                  <Button
                                    className="px-3 py-2 bg-red-600 text-white rounded"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent toggleExpand from triggering
                                      handleRemovePillList(pill.pill_id);
                                    }}
                                  >
                                    Remove
                                  </Button>

                                  <Button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent toggleExpand from triggering
                                      handleUpdatePillList();
                                    }}
                                  >
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>


                        {expandedPillId === pill.pill_id && selectedPillId === pill.pill_id && (
                          <tr className="bg-gray-50">
                            <td colSpan="6" className="border px-4 py-2">
                              <div className="flex justify-center items-start mt-3">
                                <div className="w-full max-w-6xl bg-white shadow-md table-rounded">
                                  <div className="bg-blue-800 text-white p-4 flex items-center justify-between table-rounded">
                                    <h1 className="text-xl font-semibold">รายการยาในคลัง</h1>

                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <Button className="bg-cyan-400 text-white rounded">
                                          Add Stock
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>Add New Stock</DialogTitle>
                                          <DialogDescription>
                                            Medicine stock details
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">

                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <label htmlFor="pillName" className="text-right">
                                              Pill Name
                                            </label>
                                            <select
                                              id="pillName"
                                              value={pillName}
                                              onChange={(e) => setPillName(e.target.value)}
                                              className="col-span-3 border rounded px-2 py-1"
                                            >
                                              <option value="">Select Pill Name</option>
                                              {PillList?.map((pill) => (
                                                <option key={pill.pill_id} value={pill.pill_name}>
                                                  {pill.pill_name}
                                                </option>
                                              ))}
                                            </select>
                                          </div>


                                          <div className="grid grid-cols-4 items-center gap-4">
                                            <Label htmlFor="total" className="text-right">
                                              Total
                                            </Label>
                                            <Input
                                              id="total"
                                              type="number"
                                              value={total}
                                              onChange={(e) => setTotal(e.target.value)}
                                              className="col-span-3"
                                            />
                                          </div>
                                          <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                            <Label htmlFor="expire" className="text-right">
                                              Expire Date
                                            </Label>
                                            <Input
                                              type="date"
                                              id="expire"
                                              value={expireDate}
                                              onChange={(e) => setExpireDate(e.target.value)}
                                              className="col-span-3 border rounded px-2 py-1"
                                            />
                                          </div>
                                        </div>
                                        <DialogFooter className="mt-4">
                                          <Button type="button" onClick={handleSave}>
                                            Save Changes
                                          </Button>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                  </div>

                                  <table className="border-collapse border mx-auto w-full max-w-7xl">
                                    <thead>
                                      <tr className="border bg-gray-200">
                                        <th className="border px-4 py-2">Lot Id</th>
                                        <th className="border px-4 py-2">Pill Name</th>
                                        <th className="border px-4 py-2">Dose</th>
                                        <th className="border px-4 py-2">Type Name</th>
                                        <th className="border px-4 py-2">Expire Date</th>
                                        <th className="border px-4 py-2">Total</th>
                                        <th className="border px-4 py-2">Unit Type</th>
                                        <th className="border px-4 py-2">Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredPillStock.filter((item) => item.pill_id === selectedPillId).length > 0 ? (
                                        filteredPillStock.filter((item) => item.pill_id === selectedPillId).map((item) => (
                                          <tr
                                            key={item.pillstock_id}
                                            className={`border ${Number(item.total) <= 100
                                              ? "bg-red-500 text-red-500"
                                              : "bg-blue-100 text-black"
                                              }`}
                                          >
                                            <td className="border px-4 py-2">{item.pillstock_id}</td>
                                            <td className="border px-4 py-2">{item.pill_name}</td>
                                            <td className="border px-4 py-2">{item.dose}</td>
                                            <td className="border px-4 py-2">{item.type_name}</td>
                                            <td className="border px-4 py-2">
                                              {item.expire
                                                ? new Date(item.expire).toLocaleDateString()
                                                : "N/A"}
                                            </td>
                                            <td className="border px-4 py-2">{item.total}</td>
                                            <td className="border px-4 py-2">{item.unit_type}</td>
                                            <td className="border px-4 py-2 flex justify-center">
                                              <Dialog>
                                                <DialogTrigger asChild>
                                                  <Button
                                                    className="bg-yellow-400 text-white rounded"
                                                    onClick={() => handleEditClick(item)}
                                                  >
                                                    Edit Stock
                                                  </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[425px]">
                                                  <DialogHeader>
                                                    <DialogTitle>Edit Stock Pill</DialogTitle>
                                                    <DialogDescription>
                                                      Edit the details of the Stock Pill below and save your
                                                      changes.
                                                    </DialogDescription>
                                                  </DialogHeader>

                                                  <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                      <Label htmlFor="name" className="text-right">
                                                        Pill Name
                                                      </Label>
                                                      <span id="name" className="col-span-3">
                                                        {pillName}
                                                      </span>
                                                    </div>

                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                      <Label htmlFor="dose" className="text-right">
                                                        Dose
                                                      </Label>
                                                      <span id="dose" className="col-span-3">
                                                        {dose}
                                                      </span>
                                                    </div>

                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                      <Label htmlFor="typeName" className="text-right">
                                                        Type Name
                                                      </Label>
                                                      <span id="typeName" className="col-span-3">
                                                        {typeName} {/* หรือจะใช้การจับค่าจาก type_id ก็ได้ */}
                                                      </span>
                                                    </div>

                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                      <Label htmlFor="unit" className="text-right">
                                                        Unit
                                                      </Label>
                                                      <span id="unit" className="col-span-3">
                                                        {unit} {/* หรือจะใช้ unit_id ก็ได้ */}
                                                      </span>
                                                    </div>

                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                      <Label htmlFor="total" className="text-right">
                                                        Total
                                                      </Label>
                                                      <Input
                                                        id="total"
                                                        type="number"
                                                        value={total}
                                                        onChange={(e) => setTotal(e.target.value)}
                                                        className="col-span-3"
                                                      />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4 mt-4">
                                                      <Label htmlFor="expire" className="text-right">
                                                        Expire Date
                                                      </Label>
                                                      <Input
                                                        type="date"
                                                        id="expire"
                                                        value={expireDate}
                                                        onChange={(e) => setExpireDate(e.target.value)}
                                                        className="col-span-3 border rounded px-2 py-1"
                                                      />
                                                    </div>
                                                  </div>


                                                  <DialogFooter className="mt-4">
                                                    <Button
                                                      className="px-3 py-2 bg-red-600 text-white rounded"
                                                      onClick={() => handleRemove(item.pillstock_id)}
                                                    >
                                                      Remove
                                                    </Button>
                                                    <Button type="button" onClick={handleEditPill}>
                                                      Save Changes
                                                    </Button>
                                                  </DialogFooter>
                                                </DialogContent>
                                              </Dialog>
                                            </td>
                                          </tr>
                                        ))
                                      ) : (
                                        <tr>
                                          <td colSpan="8" className="text-center py-4">
                                            <div className="flex justify-center items-center h-full">
                                              currently no pill in stock
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                      {Array.from({ length: emptyRows }).map((_, index) => (
                                        <tr key={index}>
                                          <td colSpan="8" className="border px-4 py-2">
                                            &nbsp;
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>


                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <div className="flex justify-center items-center h-full">
                        currently no pill in stock
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </main >
    </div >
  );
}
