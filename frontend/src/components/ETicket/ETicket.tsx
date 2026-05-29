import { useState } from "react";

interface TicketData {
  ticketNumber: string;
  passengerName: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seat: string;
  price: string;
  busNumber: string;
  routeNumber: string;
}

const BusIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="19" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17" cy="19" r="1.5" fill="currentColor" stroke="none" />
    <path d="M7 5V3M17 5V3" />
  </svg>
);

const LocationPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

const SeatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M6 3v10M18 3v10" />
    <path d="M5 13h14a1 1 0 011 1v3H4v-3a1 1 0 011-1z" />
    <path d="M4 17v3M20 17v3" />
  </svg>
);

const DollarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
);

const HashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M4 9h16M4 15h16M10 3l-1 18M15 3l-1 18" />
  </svg>
);

const RouteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <circle cx="6" cy="19" r="2" /><circle cx="18" cy="5" r="2" />
    <path d="M12 19H7.83M6 17V7l6-2 6-2v10.17" />
  </svg>
);

const QRCode = ({ dark = "#1e3a8a" }: { dark?: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="30" height="30" fill="none" stroke={dark} strokeWidth="4" />
    <rect x="12" y="12" width="16" height="16" fill={dark} />
    <rect x="65" y="5" width="30" height="30" fill="none" stroke={dark} strokeWidth="4" />
    <rect x="72" y="12" width="16" height="16" fill={dark} />
    <rect x="5" y="65" width="30" height="30" fill="none" stroke={dark} strokeWidth="4" />
    <rect x="12" y="72" width="16" height="16" fill={dark} />
    {[
      [44,5],[50,5],[56,5],[44,11],[56,11],[44,17],[50,17],[44,23],[50,23],[56,23],
      [44,29],[56,29],[44,35],[50,35],[5,44],[11,44],[17,44],[23,44],[29,44],[35,44],
      [44,44],[50,44],[56,44],[62,44],[68,44],[74,44],[80,44],[86,44],[92,44],
      [5,50],[17,50],[29,50],[44,50],[56,50],[68,50],[80,50],[92,50],
      [5,56],[11,56],[23,56],[35,56],[44,56],[50,56],[62,56],[74,56],[86,56],
      [44,62],[56,62],[68,62],[80,62],[44,68],[50,68],[62,68],[74,68],[86,68],[92,68],
      [44,74],[56,74],[68,74],[80,74],[44,80],[50,80],[62,80],[74,80],[86,80],
      [44,86],[56,86],[68,86],[80,86],[92,86],[44,92],[50,92],[62,92],[74,92],[86,92],
    ].map(([x, y], i) => (
      <rect key={i} x={x} y={y} width="5" height="5" fill={dark} />
    ))}
  </svg>
);

const defaultTicket: TicketData = {
  ticketNumber: "QS-2024-001234",
  passengerName: "John Doe",
  from: "New York City",
  to: "Boston",
  date: "Jun 15, 2024",
  time: "10:30 AM",
  seat: "12A",
  price: "$45.99",
  busNumber: "QB-4TO-2024",
  routeNumber: "RT-2450",
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  dark?: boolean;
}

const InfoCard = ({ icon, label, value, dark = false }: InfoCardProps) => (
  <div className={`rounded-2xl p-4 border ${dark
    ? "bg-blue-800 border-blue-700 text-white"
    : "bg-blue-50 border-blue-100 text-blue-900"
  }`}>
    <div className={`flex items-center gap-1.5 mb-1.5 ${dark ? "text-blue-300" : "text-blue-500"}`}>
      {icon}
      <span className="text-xs font-bold tracking-widest uppercase">{label}</span>
    </div>
    <p className={`font-extrabold text-xl leading-tight ${dark ? "text-white" : "text-blue-900"}`}>{value}</p>
  </div>
);

export default function BusTicket() {
  const [ticket] = useState<TicketData>(defaultTicket);

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-5">
      <div className="w-full max-w-sm">

        {/* ── TICKET CARD ── */}
        <div className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-200 border border-blue-100">

          {/* ── BLUE HEADER ── */}
          <div className="bg-blue-800 px-6 pt-7 pb-6">

            {/* Brand row */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-white text-3xl font-black tracking-tight">QuickSeat</h1>
                <p className="text-blue-300 text-xs mt-0.5 tracking-widest font-medium">
                  ELECTRONIC BUS TICKET
                </p>
              </div>
              <div className="bg-white bg-opacity-15 rounded-2xl p-3 text-white">
                <BusIcon className="w-7 h-7" />
              </div>
            </div>

            {/* Ticket number pill */}
            <div className="inline-flex items-center bg-blue-900 bg-opacity-60 rounded-full px-3 py-1 mb-5 border border-blue-600">
              <span className="text-blue-300 text-xs font-bold tracking-widest">#{ticket.ticketNumber}</span>
            </div>

            {/* Passenger */}
            <div className="mb-6">
              <p className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-1">Passenger Name</p>
              <p className="text-white text-2xl font-black">{ticket.passengerName}</p>
            </div>

            {/* Route row */}
            <div className="flex items-center gap-3">
              {/* From */}
              <div className="flex-1 bg-white bg-opacity-10 rounded-2xl px-4 py-3 border border-white border-opacity-15">
                <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-1">From</p>
                <div className="flex items-center gap-1 text-white font-bold text-sm">
                  <span className="text-blue-300"><LocationPinIcon /></span>
                  {ticket.from}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-0.5 text-blue-400 flex-shrink-0">
                <div className="w-px h-3 bg-blue-600" />
                <BusIcon className="w-4 h-4" />
                <div className="w-px h-3 bg-blue-600" />
              </div>

              {/* To */}
              <div className="flex-1 bg-white bg-opacity-10 rounded-2xl px-4 py-3 border border-white border-opacity-15">
                <p className="text-blue-300 text-xs font-bold tracking-widest uppercase mb-1">To</p>
                <div className="flex items-center gap-1 text-white font-bold text-sm">
                  <span className="text-blue-300"><LocationPinIcon /></span>
                  {ticket.to}
                </div>
              </div>
            </div>
          </div>

          {/* ── WHITE BODY ── */}
          <div className="bg-white px-6 pt-6 pb-5">

            {/* Info grid — alternating blue/white cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <InfoCard icon={<CalendarIcon />} label="Date" value={ticket.date} dark />
              <InfoCard icon={<ClockIcon />} label="Time" value={ticket.time} />
              <InfoCard icon={<SeatIcon />} label="Seat" value={ticket.seat} />
              <InfoCard icon={<DollarIcon />} label="Price" value={ticket.price} dark />
            </div>

            {/* Bus & Route row */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                  <HashIcon />
                  <span className="text-xs font-bold tracking-widest uppercase">Bus No.</span>
                </div>
                <p className="text-blue-900 font-extrabold text-base">{ticket.busNumber}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3">
                <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                  <RouteIcon />
                  <span className="text-xs font-bold tracking-widest uppercase">Route</span>
                </div>
                <p className="text-blue-900 font-extrabold text-base">{ticket.routeNumber}</p>
              </div>
            </div>

            {/* Tear line */}
            <div className="relative flex items-center -mx-6 my-5">
              <div className="w-6 h-12 bg-blue-50 rounded-r-full flex-shrink-0" />
              <div className="flex-1 border-t-2 border-dashed border-blue-200 mx-2" />
              <div className="w-6 h-12 bg-blue-50 rounded-l-full flex-shrink-0" />
            </div>

            {/* QR section */}
            <div className="flex items-center gap-4">
              {/* QR box */}
              <div className="flex-shrink-0 w-28 h-28 rounded-2xl border-2 border-blue-100 bg-white p-2 shadow-sm">
                <QRCode dark="#1e3a8a" />
              </div>

              {/* Right info */}
              <div className="flex-1 flex flex-col gap-2">
                <p className="text-blue-800 text-xs font-bold tracking-widest uppercase">Scan to Verify</p>
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-emerald-700 text-xs font-bold tracking-wide">VALID</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Valid for one journey only. Not transferable.
                </p>
              </div>
            </div>
          </div>

          {/* ── BLUE FOOTER ── */}
          <div className="bg-blue-800 px-6 py-4">
            <p className="text-blue-300 text-xs text-center leading-relaxed">
              Present this e-ticket at the counter or scan QR on boarding.
            </p>
          </div>

        </div>

        {/* Drop shadow accent */}
        <div className="mt-2 mx-8 h-3 rounded-b-3xl bg-blue-300 opacity-30 blur-sm" />
      </div>
    </div>
  );
}