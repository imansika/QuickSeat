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

const BusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
    <circle cx="7" cy="19" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17" cy="19" r="1.5" fill="currentColor" stroke="none" />
    <path d="M7 5V3M17 5V3" />
    <path d="M2 14h1M21 14h1" />
  </svg>
);

const LocationPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
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

const QRCode = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Top-left finder pattern */}
    <rect x="5" y="5" width="30" height="30" fill="none" stroke="#1e3a8a" strokeWidth="4" />
    <rect x="12" y="12" width="16" height="16" fill="#1e3a8a" />
    {/* Top-right finder pattern */}
    <rect x="65" y="5" width="30" height="30" fill="none" stroke="#1e3a8a" strokeWidth="4" />
    <rect x="72" y="12" width="16" height="16" fill="#1e3a8a" />
    {/* Bottom-left finder pattern */}
    <rect x="5" y="65" width="30" height="30" fill="none" stroke="#1e3a8a" strokeWidth="4" />
    <rect x="12" y="72" width="16" height="16" fill="#1e3a8a" />
    {/* Data modules */}
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
      <rect key={i} x={x} y={y} width="5" height="5" fill="#1e3a8a" />
    ))}
  </svg>
);

const defaultTicket: TicketData = {
  ticketNumber: "QS-2024-001234",
  passengerName: "John Doe",
  from: "New York City",
  to: "Boston",
  date: "2024-06-15",
  time: "10:30 AM",
  seat: "12A",
  price: "$45.99",
  busNumber: "QB-4TO-2024",
  routeNumber: "RT-2450",
};

export default function BusTicket() {
  const [ticket] = useState<TicketData>(defaultTicket);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl">
        {/* Ticket Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">

          {/* Header */}
          <div className="bg-blue-800 px-8 py-5 flex items-center justify-between">
            <div>
              <h1 className="text-white text-3xl font-bold tracking-tight">QuickSeat</h1>
              <p className="text-blue-200 text-sm mt-0.5 font-medium tracking-wide">
                Electronic Bus Ticket #{ticket.ticketNumber}
              </p>
            </div>
            <div className="text-white opacity-80">
              <BusIcon />
            </div>
          </div>

          {/* Body */}
          <div className="flex divide-x divide-slate-200">

            {/* Left: Route Info */}
            <div className="flex-shrink-0 w-56 px-8 py-8 flex flex-col justify-center gap-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-blue-800 uppercase mb-1">
                  Passenger Name
                </p>
                <p className="text-2xl font-bold text-slate-800">{ticket.passengerName}</p>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs font-bold tracking-widest text-blue-800 uppercase mb-1">From</p>
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-base">
                    <span className="text-blue-700"><LocationPinIcon /></span>
                    {ticket.from}
                  </div>
                </div>

                {/* Route arrow */}
                <div className="flex items-center gap-2 pl-1">
                  <div className="h-px flex-1 bg-blue-200" />
                  <span className="text-blue-600"><BusIcon /></span>
                  <div className="h-px flex-1 bg-blue-200" />
                </div>

                <div>
                  <p className="text-xs font-bold tracking-widest text-blue-800 uppercase mb-1">To</p>
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-base">
                    <span className="text-blue-700"><LocationPinIcon /></span>
                    {ticket.to}
                  </div>
                </div>
              </div>
            </div>

            {/* Center: Trip Details */}
            <div className="flex-1 px-8 py-8 flex flex-col justify-between gap-4">
              {/* Top row: Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-blue-700 mb-2">
                    <CalendarIcon />
                    <span className="text-xs font-bold tracking-widest uppercase">Date</span>
                  </div>
                  <p className="text-slate-800 font-bold text-lg">{ticket.date}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-blue-700 mb-2">
                    <ClockIcon />
                    <span className="text-xs font-bold tracking-widest uppercase">Time</span>
                  </div>
                  <p className="text-slate-800 font-bold text-lg">{ticket.time}</p>
                </div>
              </div>

              {/* Bottom row: Seat & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-blue-700 mb-2">
                    <SeatIcon />
                    <span className="text-xs font-bold tracking-widest uppercase">Seat</span>
                  </div>
                  <p className="text-slate-800 font-bold text-lg">{ticket.seat}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-blue-700 mb-2">
                    <DollarIcon />
                    <span className="text-xs font-bold tracking-widest uppercase">Price</span>
                  </div>
                  <p className="text-slate-800 font-bold text-lg">{ticket.price}</p>
                </div>
              </div>

              {/* Bus & Route */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <p className="text-xs font-bold tracking-widest text-blue-800 uppercase mb-1">Bus Number</p>
                  <p className="text-slate-800 font-extrabold text-lg">{ticket.busNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-widest text-blue-800 uppercase mb-1">Route Number</p>
                  <p className="text-slate-800 font-extrabold text-lg">{ticket.routeNumber}</p>
                </div>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="flex-shrink-0 w-48 px-6 py-8 flex flex-col items-center justify-center gap-3">
              <p className="text-xs font-bold tracking-widest text-blue-800 uppercase">Scan to Verify</p>
              <div className="w-32 h-32 border-2 border-blue-200 rounded-xl p-2 bg-white">
                <QRCode />
              </div>
              <p className="text-xs text-slate-500 font-medium text-center">Valid for one journey</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}