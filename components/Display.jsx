import { useEffect, useState } from 'react';

function Display() {
  const [activeCount, setActiveCount] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();

      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);


      const activeTodayTickets = data.filter(ticket => {
        const ticketDate = new Date(ticket.datetime);
        return ticket.status.toString().startsWith('1') && ticketDate >= startOfDay && ticketDate <= endOfDay;
      });

      const totalTodayTickets = data.filter(ticket => {
        const ticketDate = new Date(ticket.datetime);
        return ticketDate >= startOfDay && ticketDate <= endOfDay;
      });

      const totalMonthTickets = data.filter(ticket => {
        return new Date(ticket.datetime) >= startOfMonth;
      });

      setActiveCount(activeTodayTickets.length);
      setTotalToday(totalTodayTickets.length);
      setTotalMonth(totalMonthTickets.length);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
    const interval = setInterval(fetchData, 5000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="flex justify-center bg-gray-100">
      <div className="flex space-x-4 gap-6">
        <div className="bg-white py-5 my-4 shadow-md display-border p-8 pb-2 w-full flex flex-col items-center ">
          <div className="flex-1 text-center">
            <h3 className="text-xl whitespace-nowrap">รอการจ่ายยา</h3>
            <div className="text-4xl mt-2">
              {error ? <span className="text-red-500">{error}</span> : activeCount}
            </div>
          </div>
        </div>
        <div className="bg-white my-4 py-5 shadow-md display-border p-8 pb-2 w-full flex flex-col items-center">
          <div className="flex-1 text-center">
            <h3 className="text-xl whitespace-nowrap">ผู้ป่วยวันนี้</h3>
          </div>
          <div className="text-4xl mt-2">
            {error ? <span className="text-red-500">{error}</span> : totalToday}
          </div>
        </div>
        <div className="bg-white my-4 py-5 shadow-md display-border p-8 pb-2 w-full flex flex-col items-center">
          <div className="flex-1 text-center">
            <h3 className="text-xl whitespace-nowrap">ผู้ป่วยในเดือนนี้</h3>
          </div>
          <div className="text-4xl mt-2">
            {error ? <span className="text-red-500">{error}</span> : totalMonth}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Display;