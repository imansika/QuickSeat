import { useEffect, useMemo, useState, useCallback } from 'react';
import { X, User, Wifi, Snowflake } from 'lucide-react';
import type { Bus } from '../../types/bus';
import { createBooking, getBookedSeats } from '../../services/booking.service';
import { preparePayherePayment } from '../../services/payment.service';

type SeatStatus = 'available' | 'selected' | 'booked';

interface Seat {
  number: string;
  status: SeatStatus;
  type: 'window' | 'aisle' | 'middle';
  position: 'left' | 'right' | 'center';
  rowIndex: number;
  seatIndex: number;
}

interface SearchData {
  date?: string;
  fullName?: string;
  origin?: string;
  destination?: string;
  time?: string;
}

interface SeatSelectionModalProps {
  bus: Bus;
  searchData: SearchData;
  price: number;
  duration: string;
  boardingTime?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SeatSelectionModal({ 
  bus, 
  searchData, 
  price, 
  duration, 
  boardingTime,
  isOpen, 
  onClose 
}: SeatSelectionModalProps) {
  const getLayoutConfig = (layoutType: Bus['layoutType']) => {
    switch (layoutType) {
      case '1x2':
        return { leftCount: 1, rightCount: 2, hasAisle: true };
      case '1x3':
        return { leftCount: 1, rightCount: 3, hasAisle: false };
      case '3x1':
        return { leftCount: 3, rightCount: 1, hasAisle: false };
      case '2x1':
        return { leftCount: 2, rightCount: 1, hasAisle: true };
      case '2x2':
      default:
        return { leftCount: 2, rightCount: 2, hasAisle: true };
    }
  };

  const buildRowSizes = (capacity: number, totalPerRow: number, extraLastRowSeat: boolean) => {
    const sizes: number[] = [];
    const maxLastRow = extraLastRowSeat ? totalPerRow + 1 : totalPerRow;
    let remaining = capacity;

    while (remaining > 0) {
      if (remaining <= maxLastRow) {
        sizes.push(remaining);
        break;
      }

      sizes.push(totalPerRow);
      remaining -= totalPerRow;
    }

    return sizes;
  };

  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [seatsError, setSeatsError] = useState('');

  const createSeats = useCallback(() => {
    const seats: Seat[] = [];
    const bookedSeatSet = new Set(bookedSeats.map((seat) => seat.toUpperCase()));
    const { leftCount, rightCount, hasAisle } = getLayoutConfig(bus.layoutType);
    const totalPerRow = leftCount + rightCount;
    const extraLastRowSeat = hasAisle && ['2x2', '1x2', '2x1'].includes(bus.layoutType);
    const rowSizes = buildRowSizes(bus.seatCapacity, totalPerRow, extraLastRowSeat);

    rowSizes.forEach((rowSize, rowIndex) => {
      const rowLabel = String.fromCharCode(65 + rowIndex);
      const hasCenterSeat = hasAisle && rowSize === totalPerRow + 1;

      for (let slotIndex = 0; slotIndex < rowSize; slotIndex += 1) {
        const seatNumber = `${rowLabel}${slotIndex + 1}`;
        const isBooked = bookedSeatSet.has(seatNumber.toUpperCase());
        const isCenterSeat = hasCenterSeat && slotIndex === leftCount;

        let position: 'left' | 'right' | 'center' = 'left';
        if (isCenterSeat) position = 'center';
        else if (slotIndex >= leftCount + (hasCenterSeat ? 1 : 0)) position = 'right';

        let seatIndex = 1;
        if (position === 'left') seatIndex = slotIndex + 1;
        else if (position === 'right') seatIndex = slotIndex - leftCount - (hasCenterSeat ? 1 : 0) + 1;

        let type: 'window' | 'aisle' | 'middle';
        if (position === 'center') {
          type = 'aisle';
        } else if (position === 'left') {
          if (seatIndex === 1) type = 'window';
          else if (seatIndex === leftCount) type = 'aisle';
          else type = 'middle';
        } else {
          if (seatIndex === rightCount) type = 'window';
          else if (seatIndex === 1) type = 'aisle';
          else type = 'middle';
        }

        seats.push({
          number: seatNumber,
          status: isBooked ? 'booked' : 'available',
          type,
          position,
          rowIndex,
          seatIndex,
        });
      }
    });

    return seats;
  }, [bus.layoutType, bus.seatCapacity, bookedSeats]);

  const [seats, setSeats] = useState<Seat[]>(createSeats());
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    setSeats(createSeats());
    setSelectedSeats([]);
  }, [bus._id, bus.seatCapacity, bus.layoutType, isOpen, bookedSeats, createSeats]);

  useEffect(() => {
    const loadBookedSeats = async () => {
      if (!isOpen) return;
      if (!bus?.busNumber || !searchData?.date) {
        setBookedSeats([]);
        setSeatsError('');
        return;
      }

      try {
        setSeatsError('');
        const response = await getBookedSeats(bus.busNumber, searchData.date);
        setBookedSeats(response.data || []);
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        setSeatsError(msg || 'Failed to load booked seats');
        setBookedSeats([]);
      }
    };

    loadBookedSeats();
  }, [bus.busNumber, isOpen, searchData?.date]);

  const handleSeatClick = (seatNumber: string) => {
    const seat = seats.find(s => s.number === seatNumber);
    if (!seat || seat.status === 'booked') return;

    const isSelected = seat.status === 'selected';
    setSeats(seats.map(s => ({
      ...s,
      status: s.number === seatNumber
        ? (isSelected ? 'available' : 'selected')
        : s.status,
    })));

    setSelectedSeats(prev =>
      isSelected
        ? prev.filter((seatId) => seatId !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) return;
    if (!searchData?.date) {
      setBookingError('Please select a journey date before booking');
      return;
    }

    try {
      setIsBooking(true);
      setBookingError('');

      const bookingResponse = await createBooking({
        busNumber: bus.busNumber,
        origin: searchData.origin || bus.origin,
        destination: searchData.destination || bus.destination,
        time: boardingTime || searchData.time || bus.departureTime,
        seats: selectedSeats,
        journeyDate: searchData.date,
        totalAmount: price * selectedSeats.length,
      });

      const booking = bookingResponse.data;
      const [firstName, ...lastNameParts] = (searchData?.fullName || 'Passenger').split(' ');
      const lastName = lastNameParts.join(' ') || 'User';

      const paymentResponse = await preparePayherePayment({
        bookingId: booking.bookingId,
        firstName,
        lastName,
      });

      const data = paymentResponse.data;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.paymentUrl;

      Object.entries(data).forEach(([key, value]) => {
        if (key === 'paymentUrl') return;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = String(value ?? '');
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setBookingError(msg || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  const getSeatColor = (status: SeatStatus) => {
    switch (status) {
      case 'available':
        return 'bg-white hover:bg-[#264b8d]/5 hover:border-[#264b8d] cursor-pointer hover:scale-105 hover:shadow-md';
      case 'selected':
        return 'bg-[#264b8d] border-[#264b8d] text-white cursor-pointer scale-105 shadow-lg';
      case 'booked':
        return 'bg-slate-300 border-slate-400 cursor-not-allowed text-slate-500';
    }
  };

  const rows = useMemo(() => {
    const { leftCount, rightCount, hasAisle } = getLayoutConfig(bus.layoutType);
    const totalPerRow = leftCount + rightCount;
    const extraLastRowSeat = hasAisle && ['2x2', '1x2', '2x1'].includes(bus.layoutType);
    const rowSizes = buildRowSizes(bus.seatCapacity, totalPerRow, extraLastRowSeat);
    const rowCount = rowSizes.length;
    const mapped = Array.from({ length: rowCount }, (_, rowIndex) => ({
      label: String.fromCharCode(65 + rowIndex),
      left: Array.from({ length: leftCount }, () => null as Seat | null),
      right: Array.from({ length: rightCount }, () => null as Seat | null),
      center: null as Seat | null,
      hasAisle,
    }));

    seats.forEach((seat) => {
      const rowIndex = seat.rowIndex;
      const seatIndex = seat.seatIndex;

      if (Number.isNaN(seatIndex) || rowIndex < 0 || rowIndex >= mapped.length) {
        return;
      }

      if (seat.position === 'center') {
        mapped[rowIndex].center = seat;
      } else if (seat.position === 'left') {
        if (seatIndex >= 1 && seatIndex <= leftCount) {
          mapped[rowIndex].left[seatIndex - 1] = seat;
        }
      } else {
        if (seatIndex >= 1 && seatIndex <= rightCount) {
          mapped[rowIndex].right[seatIndex - 1] = seat;
        }
      }
    });

    return mapped;
  }, [bus.layoutType, bus.seatCapacity, seats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] p-6 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Select Your Seat</h2>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <span>{bus.routeNumber} - {bus.busNumber}</span>
              <span>•</span>
              <span>{searchData?.origin} → {searchData?.destination}</span>
              <span>•</span>
              <span>{bus.departureTime} - {bus.arrivalTime}</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 p-6">
            {/* Seat Map */}
            <div className="lg:col-span-2">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                {/* Legend */}
                <div className="flex flex-wrap gap-6 mb-6 pb-4 border-b border-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white rounded-lg border-2 border-slate-300 shadow-sm"></div>
                    <span className="text-sm font-medium text-slate-700">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#264b8d] rounded-lg shadow-md"></div>
                    <span className="text-sm font-medium text-slate-700">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-slate-300 rounded-lg border-2 border-slate-400"></div>
                    <span className="text-sm font-medium text-slate-700">Booked</span>
                  </div>
                </div>

                {seatsError && (
                  <div className="mb-4 text-sm text-red-600">{seatsError}</div>
                )}

                {/* Driver Section - Single Unit */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8"></div>
                  <div className="flex gap-2">
                    {rows[0]?.left.map((_, index) => (
                      <div key={`driver-left-${index}`} className="w-14 h-14"></div>
                    ))}
                  </div>

                  {rows[0]?.hasAisle && <div className="w-12"></div>}

                  <div className="flex items-center gap-2 px-6 py-3 bg-slate-300 border-2 border-slate-400 rounded-lg">
                    <User className="w-6 h-6 text-slate-700" />
                    <span className="text-slate-700 font-semibold">Driver</span>
                  </div>
                </div>

                {/* Seats Layout */}
                <div className="space-y-3">
                  {rows.map((row) => (
                    <div key={row.label} className={`flex items-center ${row.hasAisle ? 'gap-3' : 'gap-1'}`}>
                      <div className="w-8 text-center font-bold text-[#264b8d]">
                        {row.label}
                      </div>

                      <div className="flex gap-2">
                        {row.left.map((seat, index) => (
                          seat ? (
                            <button
                              key={seat.number}
                              onClick={() => handleSeatClick(seat.number)}
                              disabled={seat.status === 'booked'}
                              className={`w-14 h-14 rounded-lg border-2 font-bold text-sm transition-all duration-200 ${getSeatColor(
                                seat.status
                              )}`}
                              title={seat.number}
                            >
                              {seat.number.slice(-1)}
                            </button>
                          ) : (
                            <div key={`left-empty-${row.label}-${index}`} className="w-14 h-14"></div>
                          )
                        ))}
                      </div>

                      {row.hasAisle && (
                        <div className="w-12 text-center">
                          {row.center ? (() => {
                            const centerSeat = row.center;
                            if (!centerSeat) return null;
                            return (
                              <button
                                key={centerSeat.number}
                                onClick={() => handleSeatClick(centerSeat.number)}
                                disabled={centerSeat.status === 'booked'}
                                className={`w-14 h-14 rounded-lg border-2 font-bold text-sm transition-all duration-200 ${getSeatColor(
                                  centerSeat.status
                                )}`}
                                title={centerSeat.number}
                              >
                                {centerSeat.number.slice(-1)}
                              </button>
                            );
                          })() : (
                            <div className="border-l-2 border-dashed border-slate-300 h-8 mx-auto"></div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        {row.right.map((seat, index) => (
                          seat ? (
                            <button
                              key={seat.number}
                              onClick={() => handleSeatClick(seat.number)}
                              disabled={seat.status === 'booked'}
                              className={`w-14 h-14 rounded-lg border-2 font-bold text-sm transition-all duration-200 ${getSeatColor(
                                seat.status
                              )}`}
                              title={seat.number}
                            >
                              {seat.number.slice(-1)}
                            </button>
                          ) : (
                            <div key={`right-empty-${row.label}-${index}`} className="w-14 h-14"></div>
                          )
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 sticky top-4">
                <h3 className="font-bold text-xl mb-4 text-slate-900">Booking Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Route</p>
                    <p className="font-semibold text-slate-900">{bus.routeNumber}</p>
                    <p className="text-sm text-slate-700">{bus.busNumber}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Journey</p>
                    <p className="font-semibold text-slate-900">
                      {searchData?.origin} → {searchData?.destination}
                    </p>
                    <p className="text-sm text-slate-600 mt-2">Duration: {duration || 'N/A'}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Time</p>
                    <p className="font-semibold text-slate-900">{bus.departureTime} - {bus.arrivalTime}</p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <p className="text-sm text-slate-600 mb-1">Amenities</p>
                    <div className="flex gap-2 mt-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
                        <Wifi className="w-3 h-3" />
                        WiFi
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded text-xs text-blue-700">
                        <Snowflake className="w-3 h-3" />
                        AC
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#264b8d]/10 to-[#1e3a6d]/10 rounded-lg p-4 border-2 border-[#264b8d]/30">
                    <p className="text-sm text-slate-600 mb-2">Selected Seats</p>
                    {selectedSeats.length > 0 ? (
                      <div>
                        <p className="font-bold text-[#264b8d] text-2xl">{selectedSeats.length}</p>
                        <p className="text-xs text-slate-600 mt-1">{selectedSeats.join(', ')}</p>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">No seats selected</p>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Seat Price</span>
                      <span className="font-semibold text-slate-900">Rs. {price} x {selectedSeats.length || 1}</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t-2 border-slate-300">
                      <span className="font-bold text-lg text-slate-900">Total</span>
                      <span className="font-bold text-2xl text-[#264b8d]">Rs. {price * (selectedSeats.length || 1)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={selectedSeats.length === 0 || isBooking}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedSeats.length > 0 && !isBooking
                      ? 'bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] text-white hover:shadow-xl transform hover:scale-[1.02]'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isBooking ? 'Redirecting to PayHere...' : 'Pay with PayHere'}
                </button>

                {selectedSeats.length === 0 && !bookingError && (
                  <p className="text-sm text-center text-slate-500 mt-3">
                    Please select seats to continue
                  </p>
                )}

                {bookingError && (
                  <p className="text-sm text-center text-red-600 mt-3">
                    {bookingError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
