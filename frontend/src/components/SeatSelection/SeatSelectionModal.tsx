import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, User, Wifi, Snowflake } from 'lucide-react';
import type { Bus } from '../../types/bus';

type SeatStatus = 'available' | 'selected' | 'booked';

interface Seat {
  number: string;
  status: SeatStatus;
  type: 'window' | 'aisle' | 'middle';
}

interface SeatSelectionModalProps {
  bus: Bus;
  searchData: any;
  price: number;
  duration: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SeatSelectionModal({ 
  bus, 
  searchData, 
  price, 
  duration, 
  isOpen, 
  onClose 
}: SeatSelectionModalProps) {
  const navigate = useNavigate();
  
  // Create seat layout (10 rows x 4 seats per row)
  const createSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const bookedSeats = ['A3', 'A4', 'B2', 'C1', 'D3', 'E2', 'F4', 'G1']; // Mock booked seats
    
    for (let row = 1; row <= 10; row++) {
      const rowLabel = String.fromCharCode(64 + row); // A, B, C, etc.
      
      for (let col = 1; col <= 4; col++) {
        const seatNumber = `${rowLabel}${col}`;
        const isBooked = bookedSeats.includes(seatNumber);
        
        let type: 'window' | 'aisle' | 'middle';
        if (col === 1 || col === 4) type = 'window';
        else if (col === 2) type = 'aisle';
        else type = 'middle';
        
        seats.push({
          number: seatNumber,
          status: isBooked ? 'booked' : 'available',
          type,
        });
      }
    }
    
    return seats;
  };

  const [seats, setSeats] = useState<Seat[]>(createSeats());
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const handleSeatClick = (seatNumber: string) => {
    const seat = seats.find(s => s.number === seatNumber);
    if (!seat || seat.status === 'booked') return;

    setSeats(seats.map(s => ({
      ...s,
      status: s.number === seatNumber ? 'selected' : s.status === 'selected' ? 'available' : s.status,
    })));

    setSelectedSeat(seatNumber);
  };

  const handleContinue = () => {
    if (selectedSeat) {
      // Navigate to payment page with booking data
      navigate('/payment', {
        state: {
          bookingData: {
            bus,
            searchData,
            price,
            duration,
            selectedSeat,
          }
        }
      });
      onClose();
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

  // Group seats by row
  const rows = [];
  for (let i = 0; i < seats.length; i += 4) {
    rows.push(seats.slice(i, i + 4));
  }

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

                {/* Driver Section - Single Unit */}
                <div className="flex items-center gap-3 mb-6">
                  {/* Row Label Space */}
                  <div className="w-8"></div>
                  
                  {/* Left Seats Space */}
                  <div className="flex gap-2">
                    <div className="w-14 h-14"></div>
                    <div className="w-14 h-14"></div>
                  </div>

                  {/* Aisle */}
                  <div className="w-12"></div>

                  {/* Driver Section - Combined as ONE unit */}
                  <div className="flex items-center gap-2 px-6 py-3 bg-slate-300 border-2 border-slate-400 rounded-lg">
                    <User className="w-6 h-6 text-slate-700" />
                    <span className="text-slate-700 font-semibold">Driver</span>
                  </div>
                </div>

                {/* Seats Layout */}
                <div className="space-y-3">
                  {rows.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-3">
                      {/* Row Label */}
                      <div className="w-8 text-center font-bold text-[#264b8d]">
                        {String.fromCharCode(65 + rowIndex)}
                      </div>

                      {/* Left Seats */}
                      <div className="flex gap-2">
                        {row.slice(0, 2).map((seat) => (
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
                        ))}
                      </div>

                      {/* Aisle */}
                      <div className="w-12 text-center">
                        <div className="border-l-2 border-dashed border-slate-300 h-8 mx-auto"></div>
                      </div>

                      {/* Right Seats */}
                      <div className="flex gap-2">
                        {row.slice(2, 4).map((seat) => (
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
                    <p className="text-sm text-slate-600 mb-2">Selected Seat</p>
                    {selectedSeat ? (
                      <p className="font-bold text-[#264b8d] text-2xl">{selectedSeat}</p>
                    ) : (
                      <p className="text-slate-400 italic">No seat selected</p>
                    )}
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Seat Price</span>
                      <span className="font-semibold text-slate-900">Rs. {price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-slate-600">Service Fee</span>
                      <span className="font-semibold text-slate-900">Rs. 50</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t-2 border-slate-300">
                      <span className="font-bold text-lg text-slate-900">Total</span>
                      <span className="font-bold text-2xl text-[#264b8d]">Rs. {price + 50}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!selectedSeat}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedSeat
                      ? 'bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] text-white hover:shadow-xl transform hover:scale-[1.02]'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Continue to Payment
                </button>

                {!selectedSeat && (
                  <p className="text-sm text-center text-slate-500 mt-3">
                    Please select a seat to continue
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
