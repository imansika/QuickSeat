import { useState } from 'react';
import { Bus as BusIcon, ArrowLeft, LogOut, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type SeatStatus = 'available' | 'selected' | 'booked';

interface Seat {
  number: string;
  status: SeatStatus;
  type: 'window' | 'aisle' | 'middle';
}

export function SeatSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  
  // Get bus data from navigation state
  const busData = location.state?.bus;
  const searchData = location.state?.searchData;
  const price = location.state?.price;
  const duration = location.state?.duration;

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
      // Navigate to payment page or show confirmation
      alert(`Proceeding to payment for seat ${selectedSeat}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
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

  if (!busData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No bus selected</p>
          <button
            onClick={() => navigate('/passenger')}
            className="px-6 py-3 bg-[#264b8d] text-white rounded-xl hover:bg-[#1e3a6d]"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/passenger')}
                className="flex items-center gap-2 text-slate-600 hover:text-[#264b8d] transition-colors font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-[#264b8d] p-2.5 rounded-xl">
                  <BusIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#264b8d]">QuickSeat</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-red-600 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Route Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Your Seat</h2>
              <p className="text-slate-600">
                {busData.routeNumber} - {busData.busNumber} | {busData.departureTime} - {busData.arrivalTime}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {searchData?.origin} → {searchData?.destination}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#264b8d]">Rs. {price}</p>
              <p className="text-sm text-slate-600">per seat</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
              {/* Legend */}
              <div className="flex flex-wrap gap-6 mb-8 pb-6 border-b border-slate-200">
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

              {/* Driver Section - Right side at the front */}
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

                {/* Driver on Right Side */}
                <div className="flex gap-2">
                  <div className="w-14 h-14 bg-slate-300 border-2 border-slate-400 rounded-lg flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-700" />
                  </div>
                  <div className="flex items-center px-4 py-2 bg-slate-300 border-2 border-slate-400 rounded-lg">
                    <span className="text-slate-700 font-semibold text-sm">Driver</span>
                  </div>
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
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-slate-200">
              <h3 className="font-bold text-xl mb-6 text-slate-900">Booking Summary</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Route</p>
                  <p className="font-semibold text-slate-900">{busData.routeNumber}</p>
                  <p className="text-sm text-slate-700">{busData.busNumber}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-600 mb-1">From → To</p>
                  <p className="font-semibold text-slate-900">
                    {searchData?.origin} → {searchData?.destination}
                  </p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-600 mb-1">Departure</p>
                  <p className="font-semibold text-slate-900">{busData.departureTime}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-600 mb-1">Arrival</p>
                  <p className="font-semibold text-slate-900">{busData.arrivalTime}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-600 mb-1">Duration</p>
                  <p className="font-semibold text-slate-900">{duration || 'N/A'}</p>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-600 mb-1">Selected Seat</p>
                  {selectedSeat ? (
                    <p className="font-semibold text-[#264b8d] text-lg">{selectedSeat}</p>
                  ) : (
                    <p className="text-slate-400 italic">No seat selected</p>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Seat Price</span>
                    <span className="font-semibold text-slate-900">Rs. {price}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Service Fee</span>
                    <span className="font-semibold text-slate-900">Rs. 50</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="font-bold text-lg text-slate-900">Total</span>
                    <span className="font-bold text-2xl text-[#264b8d]">Rs. {price + 50}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                disabled={!selectedSeat}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  selectedSeat
                    ? 'bg-[#264b8d] text-white hover:bg-[#1e3a6d] hover:shadow-xl'
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

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#264b8d] p-2 rounded-xl">
                  <BusIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">QuickSeat</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Making bus travel simple, comfortable and accessible for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-slate-400">
                <li>support@quickseat.com</li>
                <li>1-800-QUICKSEAT</li>
                <li>Available 24/7</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-slate-400">
                © 2026 QuickSeat. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Twitter</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Facebook</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Instagram</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">LinkedIn</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
