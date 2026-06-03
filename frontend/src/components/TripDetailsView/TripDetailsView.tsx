import { Bus, Calendar, Search, Mail, Phone, MapPin, Clock, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getBusDepartureTimes, getOperatorBuses } from '../../services/bus.service';
import { getTripPassengerDetails } from '../../services/booking.service';
import type { Bus as BusType } from '../../types/bus';

// Load Figtree from Google Fonts (matches Revenue Report page)
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap';
if (!document.head.querySelector("[href*='Figtree']")) document.head.appendChild(fontLink);

interface TripDetailsViewProps {
  buses: BusType[];
  isLoading: boolean;
}

const formatRoute = (bus: BusType) => {
  if (bus.origin && bus.destination) return `${bus.origin} → ${bus.destination}`;
  return 'Route details unavailable';
};

interface PassengerDetailPreview {
  email: string;
  ticketId: string;
  bookedSeats: string[];
  phoneNumber: string;
  origin: string;
  destination: string;
}

export function TripDetailsView({ buses, isLoading }: TripDetailsViewProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBusNumber, setSelectedBusNumber] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [busSearch, setBusSearch] = useState('');
  const [isBusDropdownOpen, setIsBusDropdownOpen] = useState(false);
  const [allBuses, setAllBuses] = useState<BusType[]>(buses);
  const [isLoadingBuses, setIsLoadingBuses] = useState(false);
  const [busLoadError, setBusLoadError] = useState('');
  const [departureTimes, setDepartureTimes] = useState<string[]>([]);
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [timeLoadError, setTimeLoadError] = useState('');
  const [passengerRows, setPassengerRows] = useState<PassengerDetailPreview[]>([]);
  const [isLoadingPassengers, setIsLoadingPassengers] = useState(false);
  const [passengerLoadError, setPassengerLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadBuses = async () => {
      try {
        setIsLoadingBuses(true);
        setBusLoadError('');
        const response = await getOperatorBuses();
        const fetchedBuses = (response.data ?? []) as BusType[];
        if (isMounted) setAllBuses(fetchedBuses);
      } catch (error: unknown) {
        if (!isMounted) return;
        const message = error instanceof Error ? error.message : String(error);
        setBusLoadError(message || 'Failed to load buses');
        setAllBuses(buses);
      } finally {
        if (isMounted) setIsLoadingBuses(false);
      }
    };
    void loadBuses();
    return () => { isMounted = false; };
  }, [buses]);

  const availableBuses = allBuses.filter((bus) => Boolean(bus.busNumber));

  const filteredBuses = useMemo(() => {
    const query = busSearch.trim().toLowerCase();
    if (!query) return availableBuses;
    return availableBuses.filter((bus) => {
      const busNumber = (bus.busNumber || '').toLowerCase();
      const route = formatRoute(bus).toLowerCase();
      const origin = (bus.origin || '').toLowerCase();
      const destination = (bus.destination || '').toLowerCase();
      return busNumber.includes(query) || route.includes(query) || origin.includes(query) || destination.includes(query);
    });
  }, [availableBuses, busSearch]);

  const canShowPassengerTable = Boolean(selectedDate && selectedBusNumber && selectedTime);

  useEffect(() => {
    let isActive = true;
    const loadDepartureTimes = async () => {
      if (!selectedBusNumber) {
        setDepartureTimes([]);
        setSelectedTime('');
        setTimeLoadError('');
        return;
      }
      try {
        setIsLoadingTimes(true);
        setTimeLoadError('');
        setSelectedTime('');
        const response = await getBusDepartureTimes(selectedBusNumber);
        const times = Array.isArray(response.data) ? response.data.filter((t: unknown) => typeof t === 'string') : [];
        if (isActive) setDepartureTimes(times);
      } catch (error: unknown) {
        if (!isActive) return;
        const message = error instanceof Error ? error.message : String(error);
        setTimeLoadError(message || 'Failed to load departure times');
        setDepartureTimes([]);
      } finally {
        if (isActive) setIsLoadingTimes(false);
      }
    };
    void loadDepartureTimes();
    return () => { isActive = false; };
  }, [selectedBusNumber]);

  useEffect(() => {
    let isActive = true;
    const loadPassengerDetails = async () => {
      if (!canShowPassengerTable) {
        setPassengerRows([]);
        setPassengerLoadError('');
        return;
      }
      try {
        setIsLoadingPassengers(true);
        setPassengerLoadError('');
        const response = await getTripPassengerDetails(selectedDate, selectedBusNumber, selectedTime);
        const rows = (response.data ?? []) as PassengerDetailPreview[];
        if (isActive) setPassengerRows(rows);
      } catch (error: unknown) {
        if (!isActive) return;
        const message = error instanceof Error ? error.message : String(error);
        setPassengerLoadError(message || 'Failed to load passenger details');
        setPassengerRows([]);
      } finally {
        if (isActive) setIsLoadingPassengers(false);
      }
    };
    void loadPassengerDetails();
    return () => { isActive = false; };
  }, [canShowPassengerTable, selectedDate, selectedBusNumber, selectedTime]);

  // Shared input class
  const inputCls = "w-full px-4 py-3 border-2 border-slate-200 bg-slate-50 rounded-2xl text-slate-800 text-base font-medium focus:outline-none focus:border-[#264b8d] focus:bg-white transition-all placeholder:text-slate-400 placeholder:font-normal";
  const labelCls = "flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2";

  return (
    <div style={{ fontFamily: "'Figtree', 'Nunito', 'system-ui', sans-serif" }} className="min-h-screen bg-[#f0f4fb] p-6 lg:p-10">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 leading-tight">Trip Details</h1>
        <p className="text-slate-600 mt-1 text-lg">Select a trip to view booked passenger details</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <div className="w-10 h-10 border-[3px] border-[#264b8d]/20 border-t-[#264b8d] rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading trip details…</p>
        </div>
      ) : availableBuses.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#264b8d]/8 flex items-center justify-center mx-auto mb-4">
            <Bus className="w-8 h-8 text-[#264b8d]/40" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-1">No buses registered</h2>
          <p className="text-slate-400 text-sm">Register buses to see trip summaries here.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Filter card ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">


              {/* Divider */}
              <div className="hidden lg:block w-px h-14 bg-slate-100 self-center" />

              {/* Inputs row */}
              <div className="flex flex-col sm:flex-row gap-4 flex-1">

                {/* Date */}
                <div className="flex-1 min-w-0">
                  <label className={labelCls}>
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
                    className={inputCls}
                  />
                </div>

                {/* Bus dropdown */}
                <div className="flex-1 min-w-0">
                  <label className={labelCls}>
                    <Bus className="w-3.5 h-3.5" /> Bus
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBusDropdownOpen((p) => !p)}
                      disabled={isLoadingBuses}
                      className="w-full flex items-center justify-between px-4 py-3 border-2 border-slate-100 bg-slate-50 rounded-2xl text-sm focus:outline-none focus:border-[#264b8d] focus:bg-white transition-all disabled:opacity-60"
                    >
                      <span className={selectedBusNumber ? "text-slate-800 font-semibold text-base" : "text-slate-400 text-base"}>
                        {selectedBusNumber || (isLoadingBuses ? 'Loading buses…' : 'Search and choose a bus')}
                      </span>
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isBusDropdownOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {isBusDropdownOpen && (
                      <div className="absolute z-20 mt-2 w-full rounded-2xl border border-slate-100 bg-white shadow-xl overflow-hidden">
                        <div className="p-3 border-b border-slate-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              autoFocus
                              value={busSearch}
                              onChange={(e) => setBusSearch(e.target.value)}
                              placeholder="Search bus number or route…"
                              className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-100 bg-slate-50 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-[#264b8d] focus:bg-white transition-all"
                            />
                          </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-2">
                          {filteredBuses.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-slate-400">No buses match your search.</div>
                          ) : (
                            filteredBuses.map((bus) => (
                              <button
                                key={bus._id ?? bus.busNumber}
                                type="button"
                                onClick={() => {
                                  setSelectedBusNumber(bus.busNumber);
                                  setSelectedTime('');
                                  setIsBusDropdownOpen(false);
                                  setBusSearch('');
                                }}
                                className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors hover:bg-[#f4f7fd] ${selectedBusNumber === bus.busNumber ? 'bg-[#264b8d]/5' : ''}`}
                              >
                                <div>
                                  <p className="font-bold text-slate-900 text-base">{bus.busNumber}</p>
                                  <p className="text-sm text-slate-500 mt-0.5">{formatRoute(bus)}</p>
                                </div>
                                {selectedBusNumber === bus.busNumber && (
                                  <span className="w-2 h-2 rounded-full bg-[#264b8d]" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {busLoadError && <p className="mt-1.5 text-xs text-rose-500">{busLoadError}</p>}
                </div>

                {/* Time */}
                <div className="flex-1 min-w-0">
                  <label className={labelCls}>
                    <Clock className="w-3.5 h-3.5" /> Departure Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!selectedBusNumber || isLoadingTimes}
                    className={`${inputCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <option value="">{isLoadingTimes ? 'Loading times…' : 'Choose a departure time'}</option>
                    {departureTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {timeLoadError && <p className="mt-1.5 text-xs text-rose-500">{timeLoadError}</p>}
                </div>
              </div>
            </div>

            {/* Selection summary strip */}
            {(selectedDate || selectedBusNumber || selectedTime) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedDate && (
                  <div className="flex items-center gap-1.5 bg-[#264b8d]/10 text-[#264b8d] text-sm font-semibold px-3 py-2 rounded-xl">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedDate}
                  </div>
                )}
                {selectedBusNumber && (
                  <div className="flex items-center gap-1.5 bg-[#264b8d]/10 text-[#264b8d] text-sm font-semibold px-3 py-2 rounded-xl">
                    <Bus className="w-3.5 h-3.5" />
                    {selectedBusNumber}
                  </div>
                )}
                {selectedTime && (
                  <div className="flex items-center gap-1.5 bg-[#264b8d]/10 text-[#264b8d] text-sm font-semibold px-3 py-2 rounded-xl">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedTime}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Passenger Details card ── */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

            {/* Card header */}
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Passenger Details</h2>
                {passengerRows.length > 0 && (
                  <p className="text-base text-slate-500 mt-0.5">
                    {passengerRows.length} {passengerRows.length === 1 ? 'passenger' : 'passengers'} booked
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            {canShowPassengerTable ? (
              isLoadingPassengers ? (
                <div className="flex flex-col items-center py-16 gap-4">
                  <div className="w-8 h-8 border-[3px] border-[#264b8d]/20 border-t-[#264b8d] rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Fetching passenger details…</p>
                </div>
              ) : passengerLoadError ? (
                <div className="flex items-center gap-3 mx-8 my-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
                  {passengerLoadError}
                </div>
              ) : passengerRows.length === 0 ? (
                <div className="flex flex-col items-center py-16 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Bus className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">No passengers found</p>
                  <p className="text-base text-slate-500">No bookings for the selected trip.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket ID</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Seats</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Origin</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passengerRows.map((passenger, i) => (
                        <tr
                          key={passenger.ticketId}
                          className="group border-t border-slate-50 hover:bg-[#f4f7fd] transition-colors"
                        >
                          <td className="px-6 py-4 text-base">
                            <span className="inline-flex items-center gap-2 text-slate-700">
                              <Mail className="w-4 h-4 text-[#264b8d]/60 shrink-0" />
                              {passenger.email}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-base font-bold text-slate-900 whitespace-nowrap">{passenger.ticketId}</td>
                          <td className="px-6 py-4 text-base whitespace-nowrap">
                            <span className="inline-flex flex-wrap gap-1">
                              {passenger.bookedSeats.map((seat) => (
                                <span key={seat} className="bg-[#264b8d]/10 text-[#264b8d] text-sm font-bold px-2.5 py-1 rounded-lg">
                                  {seat}
                                </span>
                              ))}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-base text-slate-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                              {passenger.origin}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-base text-slate-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-[#264b8d]/60 shrink-0" />
                              {passenger.destination}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-base">
                            <span className="inline-flex items-center gap-2 text-slate-700">
                              <Phone className="w-4 h-4 text-[#264b8d]/60 shrink-0" />
                              {passenger.phoneNumber}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#264b8d]/8 flex items-center justify-center mb-1">
                  <Calendar className="w-6 h-6 text-[#264b8d]/50" />
                </div>
                <p className="text-lg font-bold text-slate-700">Select a trip to view passengers</p>
                <p className="text-base text-slate-500 text-center max-w-xs">
                  Choose a date, bus, and departure time above to display passenger details.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}