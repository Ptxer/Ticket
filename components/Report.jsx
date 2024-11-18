import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Bar,
  PieChart,
  Pie,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { MantineProvider } from "@mantine/core";

const timeOptions = [
  { value: "day", label: "วัน" },
  { value: "month", label: "เดือน" },
  { value: "year", label: "ปี" },
];

const chartConfig = {
  ticket_count: {
    label: "Ticket",
    color: "#1f78ff",
  },
};

const pieChartConfig = {
  ปวดหัวเป็นไข้: {
    label: "ปวดหัวเป็นไข้",
    color: "#4c41c5",
  },
  ปวดท้อง: {
    label: "ปวดท้อง",
    color: "#9c30b8",
  },
  ท้องเสีย: {
    label: "ท้องเสีย",
    color: "#d017a1",
  },
  ปวดรอบเดือน: {
    label: "ปวดรอบเดือน",
    color: "#f31285",
  },
  เป็นหวัด: {
    label: "เป็นหวัด",
    color: "#ff3667",
  },
  ปวดฟัน: {
    label: "ปวดฟัน",
    color: "#ff5d49",
  },
  เป็นแผล: {
    label: "เป็นแผล",
    color: "#ff832b",
  },
  เป็นลม: {
    label: "เป็นลม",
    color: "#77ff7a",
  },
  ตาเจ็บ: {
    label: "ตาเจ็บ",
    color: "#c9bf00",
  },
  ผื่นคัน: {
    label: "ผื่นคัน",
    color: "#00abff",
  },
  นอนพัก: {
    label: "นอนพัก",
    color: "#0089ff",
  },
  อื่นๆ: {
    label: "อื่นๆ",
    color: "#8e5bff",
  },
};

const monthNamesThai = [
  "ม.ค",
  "ก.พ",
  "มี.ค",
  "เม.ย",
  "พ.ค",
  "มิ.ย",
  "ก.ค",
  "ส.ค",
  "ก.ย",
  "ต.ค",
  "พ.ย",
  "ธ.ค",
];

const dayNamesThai = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];

function Report() {
  const [totalToday, setTotalToday] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalYear, setTotalYear] = useState(0);
  const [totalChartToday, setTotalChartToday] = useState(0);
  const [totalChartWeek, setTotalChartWeek] = useState(0);
  const [totalChartMonth, setTotalChartMonth] = useState(0);
  const [totalChartYear, setTotalChartYear] = useState(0);
  const [symptomStats, setSymptomStats] = useState([]);
  const [pillStats, setPillStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [timePeriodChart, setTimePeriodChart] = useState("day");
  const [timePeriodPieChart, setTimePeriodPieChart] = useState("day");
  const today = new Date();
  const currentMonth = monthNamesThai[today.getMonth()];
  const currentYear = today.getFullYear() + 543;
  const [topPills, setTopPills] = useState([]);
  const [currentMonths, setCurrentMonth] = useState("");
  const [currentYears, setCurrentYear] = useState("");

  useEffect(() => {
    // กำหนดเดือนและปีปัจจุบัน
    const today = new Date();
    setCurrentMonth(today.toLocaleString("th-TH", { month: "long" }));
    setCurrentYear(today.getFullYear());

    // ดึงข้อมูลจาก API
    const fetchPillStats = async () => {
      try {
        const response = await fetch("/api/report");
        if (response.ok) {
          const data = await response.json();
          setPillStats(data.pillStats || []); // ใช้ pillStats จาก backend
        } else {
          console.error("Failed to fetch pill stats");
        }
      } catch (error) {
        console.error("Error fetching pill stats:", error);
      }
    };

    fetchPillStats();
  }, []);

  const fetchPieChart = async (timePeriod) => {
    setLoading(true);
    try {
      const res = await fetch("/api/report/pieChart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timePeriod }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      const processedData = data.data.map((stat) => ({
        name: stat.symptom_name,
        value: stat.symptom_count,
        fill:
          pieChartConfig[stat.symptom_name]?.color ||
          "hsl(var(--chart-default))",
      }));
      setPieChartData(processedData);
    } catch (err) {
      console.error("Error fetching pie chart data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchChart = async (timePeriod) => {
    setLoading(true);
    try {
      const res = await fetch("/api/report/ticketChart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ timePeriod }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log(`Ticket Data for ${timePeriod}:`, data);

      let processedData;
      if (timePeriod === "day") {
        processedData = Array.from({ length: 24 }, (_, i) => {
          const row = data.data.find((r) => r.hour === i);
          return {
            hour: `${i}:00`,
            ticket_count: row ? row.ticket_count : 0,
          };
        });
      } else if (timePeriod === "month") {
        processedData = Array.from({ length: 12 }, (_, i) => {
          const row = data.data.find((r) => r.month === i + 1);
          return {
            month: monthNamesThai[i],
            ticket_count: row ? row.ticket_count : 0,
          };
        });
      } else if (timePeriod === "year") {
        const currentYear = new Date().getFullYear();
        processedData = Array.from({ length: 6 }, (_, i) => {
          const year = currentYear - 5 + i;
          const row = data.data.find((r) => r.year === year);
          return {
            year: `${year}`,
            ticket_count: row ? row.ticket_count : 0,
          };
        });
      }

      setChartData(processedData);
      if (timePeriod === "day") {
        setTotalChartWeek(data.totalWeek);
      } else if (timePeriod === "month") {
        setTotalChartMonth(data.totalMonth);
      } else if (timePeriod === "year") {
        setTotalChartYear(data.totalYear);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart("day");
    fetchPieChart("day");
  }, []);

  const handleTimeChangeChart = (selectedOption) => {
    console.log("Selected time period for chart:", selectedOption);
    setTimePeriodChart(selectedOption.value);
    fetchChart(selectedOption.value);
  };

  const handleTimeChangePieChart = (selectedOption) => {
    console.log("Selected time period for pie chart:", selectedOption);
    setTimePeriodPieChart(selectedOption.value);
    fetchPieChart(selectedOption.value);
  };

  const customTooltip = ({ payload, label }) => {
    if (payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="label bg-white p-2 input-border ">{`${label} ผู้ป่วย ${payload[0].value} คน`}</p>
        </div>
      );
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      console.log("Fetched data:", data);

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
      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay())
      );
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const totalTodayTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfDay && ticketDate <= endOfDay;
        }).length || 0;

      const totalWeekTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfWeek && ticketDate <= endOfDay;
        }).length || 0;

      const totalMonthTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfMonth && ticketDate <= endOfDay;
        }).length || 0;

      const totalYearTickets =
        data.patientRecords?.filter((ticket) => {
          const ticketDate = new Date(ticket.datetime);
          return ticketDate >= startOfYear && ticketDate <= endOfDay;
        }).length || 0;

      setTotalToday(totalTodayTickets);
      setTotalWeek(totalWeekTickets);
      setTotalMonth(totalMonthTickets);
      setTotalYear(totalYearTickets);
      setSymptomStats(data.symptomStats || []);
      setPillStats(data.pillStats || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const todayChart = new Date();
  const currentDayChart = todayChart.getDate();
  const currentMonthChart = monthNamesThai[todayChart.getMonth()];
  const currentDayOfWeekChart = dayNamesThai[todayChart.getDay()];
  const currentYearChart = todayChart.getFullYear();
  const lastFiveYearsChart = currentYearChart - 5;

  const currentYearThai = currentYearChart + 543;
  const lastFiveYearsChartThai = currentYearThai - 5;


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


  return (
    <MantineProvider>
      <div className="bg-gray-100">
        <div className="flex flex-wrap gap-4 justify-center py-4 bg-gray-100">
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-full sm:w-1/4 md:w-1/6 lg:w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายวัน
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalToday
              )}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-full sm:w-1/4 md:w-1/6 lg:w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายสัปดาห์
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalWeek
              )}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-full sm:w-1/4 md:w-1/6 lg:w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายเดือน
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalMonth
              )}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg flex flex-col justify-center items-center w-full sm:w-1/4 md:w-1/6 lg:w-1/12 h-full py-2">
            <h3 className="text-xl whitespace-nowrap text-center">
              ผู้ใช้รายปี
            </h3>
            <div className="text-2xl mt-4">
              {error ? (
                <span className="text-red-500">{error}</span>
              ) : (
                totalYear
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap w-full mx-4 gap-4 py-6 bg-gray-100 justify-center pr-10">
          <div className="bg-white w-full sm:w-2/3 md:w-1/2 lg:w-1/3 flex flex-col items-center display-border shadow-inner drop-shadow-md px-4 py-4">
            <div className="flex justify-end w-full">
              <Select
                defaultValue={timeOptions[0]}
                className="text-gray-500 text-sm mb-4"
                options={timeOptions}
                placeholder="เลือกช่วงเวลา"
                noOptionsMessage={() => "no results found"}
                onChange={handleTimeChangeChart}
              />
            </div>
            <Card className="h-full w-full flex flex-col">
              <CardHeader>
                <CardTitle>
                  <div className="flex gap-2 font-medium leading-none">
                    {timePeriodChart === "day" &&
                      `วัน${currentDayOfWeekChart}ที่ ${currentDayChart} ${currentMonthChart} ${currentYearThai}`}
                    {timePeriodChart === "month" &&
                      `รายงานผู้ป่วยระหว่าง ${monthNamesThai[0]} ถึง ${monthNamesThai[11]}`}
                    {timePeriodChart === "year" &&
                      `รายงานผู้ป่วย ภายในระยะเวลา 5 ปีนี้ ${lastFiveYearsChartThai} - ${currentYearThai}`}
                  </div>
                </CardTitle>
                <CardDescription>January - June 2024</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ChartContainer config={chartConfig}>
                  <BarChart
                    width={378}
                    height={213}
                    accessibilityLayer
                    data={chartData}
                  >
                    <CartesianGrid vertical={true} horizontal={false} />
                    <XAxis
                      dataKey={
                        timePeriodChart === "day"
                          ? "hour"
                          : timePeriodChart === "month"
                            ? "month"
                            : "year"
                      }
                      tickLine={true}
                      axisLine={true}
                      tickMargin={8}
                      tickFormatter={(value) =>
                        timePeriodChart === "day" ? `${value}` : value
                      } // Adjusted here
                    />

                    <YAxis
                      tickLine={true}
                      axisLine={true}
                      tickFormatter={(value) => Math.round(value)}
                      allowDecimals={false}
                    />
                    <ChartTooltip cursor={false} content={customTooltip} />
                    <Bar dataKey="ticket_count" fill="#1f78ff" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-3 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                  {timePeriodChart === "day" &&
                    "รายงานมีผู้ป่วยเข้ามาใช้งานในเวลา 24 ชั่วโมง"}
                  {timePeriodChart === "month" &&
                    "รายงานผู้ป่วยเข้ามาใช้งานภายใน 12 เดือนนี้"}
                  {timePeriodChart === "year" &&
                    "รายงานผู้ป่วย ภายในระยะเวลา 5 ปีนี้"}
                </div>
              </CardFooter>
            </Card>
          </div>
          <div className="bg-white w-full sm:w-2/3 md:w-1/2 lg:w-1/3 flex flex-col items-center display-border shadow-inner drop-shadow-md px-4 py-4">
            <div className="flex justify-end w-full">
              <Select
                defaultValue={timeOptions[0]}
                className="text-gray-500 text-sm mb-4"
                options={timeOptions}
                placeholder="เลือกช่วงเวลา"
                noOptionsMessage={() => "no results found"}
                onChange={handleTimeChangePieChart}
              />
            </div>
            <Card className="h-full w-full flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>รายงานอาการผู้ป่วย</CardTitle>
                <CardDescription></CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <ChartContainer
                  config={pieChartConfig}
                  className="mx-auto aspect-square max-h-[400px]" // Increased max height
                >
                  <PieChart width={50} height={50}>
                    {" "}
                    // Increased width and height
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      label
                      nameKey="name"
                      outerRadius={100} // Adjusted outer radius
                    />
                    <ChartLegend
                      content={<ChartLegendContent nameKey="name" />}
                      className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                    />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col items-center items-start mt-10">
          <div className="w-full max-w-xl bg-white shadow-md table-rounded">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between table-rounded">
              <h3 className="text-xl font-semibold">ยาที่จ่ายในเดือน</h3>
              <h3 className="text-xl whitespace-nowrap text-center">
                {currentMonth} {currentYear}
              </h3>
            </div>
            <table className="border-collapse border mx-auto w-full max-w-7xl">

              <thead>
                <tr className="border bg-gray-200">
                  <th className="border px-4 py-2">ไอดียา</th>
                  <th className="border px-4 py-2">ชื่อยา</th>
                  <th className="border px-4 py-2">โดส</th>
                  <th className="border px-4 py-2">ครั้ง</th>
                </tr>
              </thead>
              <tbody>
                {pillStats.map((pill) => (
                  <tr key={pill.pillstock_id} className="border">
                    <td className="border px-4 py-2">{pill.pillstock_id}</td>
                    <td className="border px-4 py-2">{pill.pill_name}</td>
                    <td className="border px-4 py-2">{pill.dose}</td>
                    <td className="border px-4 py-2">{pill.count}</td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>






      </div>
    </MantineProvider >
  );
}

export default Report;
