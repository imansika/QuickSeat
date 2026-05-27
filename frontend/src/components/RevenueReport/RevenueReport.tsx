import { useMemo, useState } from "react";
import { Calendar } from "lucide-react";

interface DailyReportRow {
  busNumber: string;
  passengerCount: number;
  revenue: number;
  date: string;
}

interface MonthlyReportRow {
  date: string;
  busNumber: string;
  revenue: number;
}

const mockDailyData: DailyReportRow[] = [
  {
    busNumber: "AB-9876",
    passengerCount: 42,
    revenue: 12600,
    date: "2026-05-26",
  },
  {
    busNumber: "CD-2234",
    passengerCount: 36,
    revenue: 10800,
    date: "2026-05-26",
  },
  {
    busNumber: "EL-4567",
    passengerCount: 28,
    revenue: 8400,
    date: "2026-05-26",
  },
  {
    busNumber: "AB-9876",
    passengerCount: 30,
    revenue: 9000,
    date: "2026-05-27",
  },
  {
    busNumber: "CD-2234",
    passengerCount: 25,
    revenue: 7500,
    date: "2026-05-27",
  },
];

const mockMonthlyData: MonthlyReportRow[] = [
  { date: "2026-05-01", busNumber: "AB-9876", revenue: 8200 },
  { date: "2026-05-01", busNumber: "CD-2234", revenue: 7600 },
  { date: "2026-05-02", busNumber: "AB-9876", revenue: 9400 },
  { date: "2026-05-02", busNumber: "EL-4567", revenue: 6100 },
  { date: "2026-05-03", busNumber: "CD-2234", revenue: 8300 },
  { date: "2026-06-01", busNumber: "AB-9876", revenue: 9000 },
];

export function RevenueReport() {
  const [reportType, setReportType] = useState<"daily" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const dailyRows = useMemo(() => {
    if (!selectedDate) return [];
    return mockDailyData.filter((row) => row.date === selectedDate);
  }, [selectedDate]);

  const dailyTotal = useMemo(() => {
    return dailyRows.reduce((sum, row) => sum + row.revenue, 0);
  }, [dailyRows]);

  const monthlyRows = useMemo(() => {
    if (!selectedMonth) return [];
    return mockMonthlyData.filter((row) => row.date.startsWith(selectedMonth));
  }, [selectedMonth]);

  const monthlyTotal = useMemo(() => {
    return monthlyRows.reduce((sum, row) => sum + row.revenue, 0);
  }, [monthlyRows]);

  const downloadReport = () => {
    const isDaily = reportType === "daily";
    const rows = isDaily ? dailyRows : monthlyRows;

    if (rows.length === 0) return;

    const header = isDaily
      ? ["Bus Number", "Passenger Count", "Revenue (LKR)"]
      : ["Date", "Bus Number", "Revenue (LKR)"];

    const dataLines = rows.map((row) => {
      if (isDaily) {
        const dailyRow = row as DailyReportRow;
        return [dailyRow.busNumber, dailyRow.passengerCount, dailyRow.revenue];
      }

      const monthlyRow = row as MonthlyReportRow;
      return [monthlyRow.date, monthlyRow.busNumber, monthlyRow.revenue];
    });

    const totalLine = isDaily
      ? ["Total", "", dailyTotal]
      : ["Total", "", monthlyTotal];

    const csvContent = [header, ...dataLines, totalLine]
      .map((line) => line.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = isDaily
      ? `daily-report-${selectedDate || "selected-date"}.csv`
      : `monthly-report-${selectedMonth || "selected-month"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-3">
          Revenue Reports
        </h1>
        <p className="text-lg text-slate-600">View and analyze revenue data</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm text-slate-500 font-medium">Report Type</p>
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setReportType("daily")}
                className={`px-5 py-2 rounded-xl font-semibold border-2 transition-all ${
                  reportType === "daily"
                    ? "bg-[#264b8d] text-white border-[#264b8d]"
                    : "border-slate-200 text-slate-700 hover:border-[#264b8d]/50"
                }`}
              >
                Daily Report
              </button>
              <button
                type="button"
                onClick={() => setReportType("monthly")}
                className={`px-5 py-2 rounded-xl font-semibold border-2 transition-all ${
                  reportType === "monthly"
                    ? "bg-[#264b8d] text-white border-[#264b8d]"
                    : "border-slate-200 text-slate-700 hover:border-[#264b8d]/50"
                }`}
              >
                Monthly Report
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {reportType === "daily" ? (
              <div className="w-full lg:w-72">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 text-[#264b8d]" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d]"
                />
              </div>
            ) : (
              <div className="w-full lg:w-72">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 text-[#264b8d]" />
                  Select Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d]"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {reportType === "daily" ? (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Daily Revenue</h2>
            <button
              type="button"
              onClick={downloadReport}
              disabled={dailyRows.length === 0}
              className="h-[52px] px-6 rounded-xl font-semibold border-2 border-[#264b8d] text-[#264b8d] hover:bg-[#264b8d] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download Report
            </button>
          </div>
          <div className="p-8">
            {selectedDate && dailyRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-sm text-slate-500 border-b border-slate-200">
                      <th className="py-3 font-semibold">Bus Number</th>
                      <th className="py-3 font-semibold">Passenger Count</th>
                      <th className="py-3 font-semibold">Revenue (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {dailyRows.map((row, index) => (
                      <tr
                        key={`${row.busNumber}-${index}`}
                        className="border-b border-slate-100"
                      >
                        <td className="py-4 font-semibold text-slate-900">
                          {row.busNumber}
                        </td>
                        <td className="py-4">{row.passengerCount}</td>
                        <td className="py-4">{row.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td className="py-4 font-semibold text-slate-900">
                        Total
                      </td>
                      <td className="py-4"></td>
                      <td className="py-4 font-semibold text-slate-900">
                        {dailyTotal.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-slate-500">
                Select a date to view the daily report.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Monthly Revenue
            </h2>
            <button
              type="button"
              onClick={downloadReport}
              disabled={monthlyRows.length === 0}
              className="h-[52px] px-6 rounded-xl font-semibold border-2 border-[#264b8d] text-[#264b8d] hover:bg-[#264b8d] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download Report
            </button>
          </div>
          <div className="p-8">
            {selectedMonth && monthlyRows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="text-sm text-slate-500 border-b border-slate-200">
                      <th className="py-3 font-semibold">Date</th>
                      <th className="py-3 font-semibold">Bus Number</th>
                      <th className="py-3 font-semibold">Revenue (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {monthlyRows.map((row, index) => (
                      <tr
                        key={`${row.date}-${row.busNumber}-${index}`}
                        className="border-b border-slate-100"
                      >
                        <td className="py-4 font-semibold text-slate-900">
                          {row.date}
                        </td>
                        <td className="py-4">{row.busNumber}</td>
                        <td className="py-4">{row.revenue.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <td className="py-4 font-semibold text-slate-900">
                        Total
                      </td>
                      <td className="py-4"></td>
                      <td className="py-4 font-semibold text-slate-900">
                        {monthlyTotal.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-slate-500">
                Select a month to view the monthly report.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
