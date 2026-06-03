import { useState, useEffect } from "react";
import { Calendar, Download, TrendingUp, Bus, ChevronRight, AlertCircle } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getDailyReport, getMonthlyReport } from "../../services/report.service";

// Load Figtree from Google Fonts
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap";
if (!document.head.querySelector("[href*='Figtree']")) document.head.appendChild(fontLink);

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
        setError((err as any)?.message || String(err));
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
        setError((err as any)?.message || String(err));
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
      ? `Daily Revenue Report — ${selectedDate}`
      : `Monthly Revenue Report — ${selectedMonth}`;
    const subtitle =
      isDaily && selectedBusNumber ? `Bus Number: ${selectedBusNumber}` : isDaily ? "All buses" : "";

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
        const r = row as DailyReportRow;
        return [r.busNumber, String(r.passengerCount), r.revenue.toLocaleString()];
      }
      const r = row as MonthlyReportRow;
      return [r.date, r.busNumber, r.revenue.toLocaleString()];
    });

    autoTable(doc, {
      startY: subtitle ? 84 : 72,
      head: tableHead,
      body: [...tableBody, ["Total", "", (isDaily ? dailyTotal : monthlyTotal).toLocaleString()]],
      styles: { font: "helvetica", fontSize: 10, cellPadding: 8 },
      headStyles: { fillColor: [38, 75, 141], textColor: [255, 255, 255], fontStyle: "bold" },
      bodyStyles: { textColor: [51, 65, 85] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const fileName = isDaily
      ? `daily-revenue-report-${selectedDate}${selectedBusNumber ? `-${selectedBusNumber}` : ""}.pdf`
      : `monthly-revenue-report-${selectedMonth}.pdf`;

    doc.save(fileName);
  };

  const isDaily = reportType === "daily";
  const rows = isDaily ? dailyRows : monthlyRows;
  const total = isDaily ? dailyTotal : monthlyTotal;
  const hasData = rows.length > 0;
  const hasSelection = isDaily ? !!selectedDate : !!selectedMonth;

  return (
    <div style={{ fontFamily: "'Figtree', 'Nunito', 'system-ui', sans-serif" }} className="min-h-screen bg-[#f0f4fb] p-6 lg:p-10">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 leading-tight">Revenue Reports</h1>
          <p className="text-slate-600 mt-1 text-lg">View and analyze fleet revenue data</p>
        </div>
      </div>

      {/* ── Controls card ──────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">

          {/* Toggle */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Report Type</p>
            <div className="flex items-center bg-slate-100 rounded-2xl p-1 gap-1 w-fit">
              {(["daily", "monthly"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReportType(type)}
                  className={`px-5 py-2.5 rounded-xl text-base font-semibold transition-all duration-200 ${
                    reportType === type
                      ? "bg-[#264b8d] text-white shadow-md shadow-[#264b8d]/25"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {type === "daily" ? "Daily" : "Monthly"}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-14 bg-slate-100 self-end mb-1" />

          {/* Inputs */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {isDaily ? (
              <>
                <div className="flex-1 min-w-0 max-w-xs">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 bg-slate-50 rounded-2xl text-slate-800 text-base font-medium focus:outline-none focus:border-[#264b8d] focus:bg-white transition-all"
                  />
                </div>
                <div className="flex-1 min-w-0 max-w-xs">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    <Bus className="w-3.5 h-3.5" />
                    Bus Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AB-9876  (optional)"
                    value={selectedBusNumber}
                    onChange={(e) => setSelectedBusNumber(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 bg-slate-50 rounded-2xl text-slate-800 text-base font-medium placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#264b8d] focus:bg-white transition-all"
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 min-w-0 max-w-xs">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 bg-slate-50 rounded-2xl text-slate-800 text-base font-medium focus:outline-none focus:border-[#264b8d] focus:bg-white transition-all"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Error banner ───────────────────────────────────────── */}
      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-base text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Main data card ─────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

        {/* Card header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {isDaily ? "Daily" : "Monthly"} Revenue
            </h2>
            {hasData && (
              <p className="text-base text-slate-500 mt-0.5">
                {rows.length} {rows.length === 1 ? "entry" : "entries"} found
              </p>
            )}
          </div>

          {/* Total pill + download */}
          <div className="flex items-center gap-3">
            {hasData && (
              <div className="hidden sm:flex items-center gap-2 bg-[#264b8d]/8 text-[#264b8d] px-4 py-2 rounded-2xl">
                <span className="text-xs font-bold uppercase tracking-wider">Total</span>
                <span className="font-bold text-base">LKR {total.toLocaleString()}</span>
              </div>
            )}
            <button
              type="button"
              onClick={downloadReport}
              disabled={!hasData || loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-base bg-[#264b8d] text-white shadow-md shadow-[#264b8d]/20 hover:bg-[#1e3d78] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Download className="w-4 h-4" />
              {loading ? "Loading…" : "Export PDF"}
            </button>
          </div>
        </div>

        {/* Table / empty state */}
        <div className="p-8">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <div className="w-8 h-8 border-[3px] border-[#264b8d]/20 border-t-[#264b8d] rounded-full animate-spin" />
              <p className="text-slate-500 text-base">Fetching data…</p>
            </div>
          ) : hasData ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {isDaily ? (
                      <>
                        <Th>Bus Number</Th>
                        <Th>Passengers</Th>
                        <Th align="right">Revenue (LKR)</Th>
                      </>
                    ) : (
                      <>
                        <Th>Date</Th>
                        <Th>Bus Number</Th>
                        <Th align="right">Revenue (LKR)</Th>
                      </>
                    )}
                    <th className="w-6" />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      className="group border-t border-slate-50 hover:bg-[#f4f7fd] transition-colors"
                    >
                      {isDaily ? (
                        <>
                          <Td bold>{(row as DailyReportRow).busNumber}</Td>
                          <Td>{(row as DailyReportRow).passengerCount.toLocaleString()}</Td>
                          <Td align="right">{(row as DailyReportRow).revenue.toLocaleString()}</Td>
                        </>
                      ) : (
                        <>
                          <Td bold>{(row as MonthlyReportRow).date}</Td>
                          <Td>{(row as MonthlyReportRow).busNumber}</Td>
                          <Td align="right">{(row as MonthlyReportRow).revenue.toLocaleString()}</Td>
                        </>
                      )}
                      <td className="py-4 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                      </td>
                    </tr>
                  ))}

                  {/* Total row — colSpan covers all leading columns so value aligns under Revenue */}
                  <tr className="border-t-2 border-slate-200 bg-[#f4f7fd]">
                    <td
                      colSpan={isDaily ? 2 : 2}
                      className="py-4 px-2 font-bold text-slate-900 text-base"
                    >
                      Total
                    </td>
                    <td className="py-4 px-2 font-bold text-slate-900 text-sm text-right">
                      {total.toLocaleString()}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState isDaily={isDaily} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Small helper components ─────────────────────────────────── */

function Th({ children, align = "left" }: { children: React.ReactNode; align?: "left" | "right" }) {
  return (
    <th className={`py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider ${align === "right" ? "text-right" : "text-left"}`}>
      {children}
    </th>
  );
}

function Td({ children, bold, align }: { children: React.ReactNode; bold?: boolean; align?: "right" }) {
  return (
    <td className={`py-4 px-2 text-base ${bold ? "font-bold text-slate-900" : "text-slate-700"} ${align === "right" ? "text-right" : ""}`}>
      {children}
    </td>
  );
}

function EmptyState({ isDaily }: { isDaily: boolean }) {
  return (
    <div className="flex flex-col items-center py-16 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-[#264b8d]/8 flex items-center justify-center mb-1">
        <Calendar className="w-6 h-6 text-[#264b8d]/50" />
      </div>
      <p className="text-lg font-bold text-slate-700">No data yet</p>
      <p className="text-base text-slate-500">
        {isDaily ? "Select a date above to load the daily report." : "Select a month above to load the monthly report."}
      </p>
    </div>
  );
}