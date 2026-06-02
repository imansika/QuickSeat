import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getDailyReport, getMonthlyReport } from "../../services/report.service";

interface DailyReportRow {
  busNumber: string;
  passengerCount: number;
  revenue: number;
}

interface MonthlyReportRow {
  date: string;
  busNumber: string;
  revenue: number;
}

export function RevenueReport() {
  const [reportType, setReportType] = useState<"daily" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedBusNumber, setSelectedBusNumber] = useState<string>("");

  const [dailyRows, setDailyRows] = useState<DailyReportRow[]>([]);
  const [monthlyRows, setMonthlyRows] = useState<MonthlyReportRow[]>([]);
  const [dailyTotal, setDailyTotal] = useState<number>(0);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDaily = async () => {
      if (!selectedDate) {
        setDailyRows([]);
        setDailyTotal(0);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const resp = await getDailyReport(selectedDate, selectedBusNumber || undefined);
        setDailyRows(resp.data || []);
        setDailyTotal(Number(resp.totalRevenue || 0));
      } catch (err: unknown) {
        const msg = (err as any)?.message || String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDaily();
  }, [selectedDate, selectedBusNumber]);

  useEffect(() => {
    const fetchMonthly = async () => {
      if (!selectedMonth) {
        setMonthlyRows([]);
        setMonthlyTotal(0);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const resp = await getMonthlyReport(selectedMonth);
        setMonthlyRows(resp.data || []);
        setMonthlyTotal(Number(resp.totalRevenue || 0));
      } catch (err: unknown) {
        const msg = (err as any)?.message || String(err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthly();
  }, [selectedMonth]);

  const downloadReport = () => {
    const isDaily = reportType === "daily";
    const rows = isDaily ? dailyRows : monthlyRows;

    if (rows.length === 0) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const reportTitle = isDaily
      ? `Daily Revenue Report - ${selectedDate}`
      : `Monthly Revenue Report - ${selectedMonth}`;
    const subtitle = isDaily && selectedBusNumber
      ? `Bus Number: ${selectedBusNumber}`
      : isDaily
        ? "All buses"
        : "";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(reportTitle, 40, 44);

    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(subtitle, 40, 66);
    }

    const tableHead = isDaily
      ? [["Bus Number", "Passenger Count", "Revenue (LKR)"]]
      : [["Date", "Bus Number", "Revenue (LKR)"]];

    const tableBody = rows.map((row) => {
      if (isDaily) {
        const dailyRow = row as DailyReportRow;
        return [
          dailyRow.busNumber,
          String(dailyRow.passengerCount),
          dailyRow.revenue.toLocaleString(),
        ];
      }

      const monthlyRow = row as MonthlyReportRow;
      return [
        monthlyRow.date,
        monthlyRow.busNumber,
        monthlyRow.revenue.toLocaleString(),
      ];
    });

    autoTable(doc, {
      startY: subtitle ? 84 : 72,
      head: tableHead,
      body: [
        ...tableBody,
        [
          "Total",
          "",
          (isDaily ? dailyTotal : monthlyTotal).toLocaleString(),
        ],
      ],
      styles: {
        font: "helvetica",
        fontSize: 10,
        cellPadding: 8,
      },
      headStyles: {
        fillColor: [38, 75, 141],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [51, 65, 85],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didDrawCell: (data) => {
        const isTotalRow = data.section === "body" && data.row.index === tableBody.length;
        if (!isTotalRow) return;

        doc.setFont("helvetica", "bold");
      },
    });

    const fileName = isDaily
      ? `daily-revenue-report-${selectedDate}${selectedBusNumber ? `-${selectedBusNumber}` : ""}.pdf`
      : `monthly-revenue-report-${selectedMonth}.pdf`;

    doc.save(fileName);
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
              <>
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

                <div className="w-full lg:w-72">
                  <label className="text-sm font-semibold text-slate-700 mb-2">Bus Number</label>
                  <input
                    type="text"
                    placeholder="e.g. AB-9876"
                    value={selectedBusNumber}
                    onChange={(e) => setSelectedBusNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d]"
                  />
                </div>
              </>
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

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {reportType === "daily" ? (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-200 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Daily Revenue</h2>
            <button
              type="button"
              onClick={downloadReport}
              disabled={dailyRows.length === 0 || loading}
              className="h-[52px] px-6 rounded-xl font-semibold border-2 border-[#264b8d] text-[#264b8d] hover:bg-[#264b8d] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Download PDF"}
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
              disabled={monthlyRows.length === 0 || loading}
              className="h-[52px] px-6 rounded-xl font-semibold border-2 border-[#264b8d] text-[#264b8d] hover:bg-[#264b8d] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Download PDF"}
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
