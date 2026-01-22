import { useState } from 'react';
import { Bus, MapPin, Calendar, Clock, Download, LogOut, Ticket as TicketIcon, Navigation, User, ChevronDown, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Booking {
  id: string;
  bookingId: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  operator: string;
  busNumber: string;
  seat: string;
  price: number;
  status: 'completed' | 'upcoming' | 'cancelled';
  bookingDate: string;
}

export function MyBookings() {
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock booking data
  const bookings: Booking[] = [
    {
      id: '1',
      bookingId: 'QS8K3LM9P2',
      origin: 'Colombo',
      destination: 'Kandy',
      date: '2026-01-22', // Today
      departureTime: '08:00 AM',
      arrivalTime: '11:30 AM',
      operator: 'Express Lanka',
      busNumber: 'EL-2456',
      seat: 'A12',
      price: 1200,
      status: 'upcoming',
      bookingDate: '2026-01-17'
    },
    {
      id: '2',
      bookingId: 'QS5T7NK4W8',
      origin: 'Galle',
      destination: 'Colombo',
      date: '2026-01-25',
      departureTime: '02:00 PM',
      arrivalTime: '04:30 PM',
      operator: 'Southern Transport',
      busNumber: 'ST-1823',
      seat: 'B08',
      price: 950,
      status: 'upcoming',
      bookingDate: '2026-01-15'
    },
    {
      id: '3',
      bookingId: 'QS2R9HV6X1',
      origin: 'Colombo',
      destination: 'Jaffna',
      date: '2026-01-10',
      departureTime: '06:00 AM',
      arrivalTime: '01:00 PM',
      operator: 'Northern Express',
      busNumber: 'NE-3421',
      seat: 'C15',
      price: 2500,
      status: 'completed',
      bookingDate: '2026-01-08'
    },
    {
      id: '4',
      bookingId: 'QS7M4BP3K9',
      origin: 'Kandy',
      destination: 'Nuwara Eliya',
      date: '2026-01-05',
      departureTime: '10:00 AM',
      arrivalTime: '12:30 PM',
      operator: 'Hill Country Travels',
      busNumber: 'HC-5632',
      seat: 'D22',
      price: 800,
      status: 'completed',
      bookingDate: '2026-01-03'
    },
  ];

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'completed');

  const handleDownloadTicket = (bookingId: string) => {
    alert(`Downloading ticket for booking ${bookingId}`);
  };

  const handleTrackBus = (booking: Booking) => {
    alert(`Opening live tracking for ${booking.busNumber}\nRoute: ${booking.origin} → ${booking.destination}\nDeparture: ${booking.departureTime}`);
    // In real implementation, this would open a map view with real-time bus location
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  const isToday = (dateString: string): boolean => {
    const today = new Date('2026-01-22'); // Current date
    const bookingDate = new Date(dateString);
    return today.toDateString() === bookingDate.toDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const isTodaysTrip = isToday(booking.date) && booking.status === 'upcoming';

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TicketIcon className="w-5 h-5" />
            <span className="font-mono font-semibold text-sm">{booking.bookingId}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </div>
            {isTodaysTrip && (
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-300">
                Today
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          {/* Route */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[#264b8d] mt-1" />
                <div>
                  <p className="text-sm text-slate-600 mb-1">From</p>
                  <p className="text-xl font-bold text-slate-900">{booking.origin}</p>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-1 bg-[#dfae6b] rounded"></div>
            </div>
            <div className="flex-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-[#264b8d] mt-1" />
                <div>
                  <p className="text-sm text-slate-600 mb-1">To</p>
                  <p className="text-xl font-bold text-slate-900">{booking.destination}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4 border-b border-slate-200 mb-4">
            <div>
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 mb-1">Date</p>
                  <p className="font-semibold text-slate-900 text-sm">
                    {new Date(booking.date).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 mb-1">Departure</p>
                  <p className="font-semibold text-slate-900 text-sm">{booking.departureTime}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 mb-1">Arrival</p>
                  <p className="font-semibold text-slate-900 text-sm">{booking.arrivalTime}</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-2">
                <Bus className="w-4 h-4 text-slate-600 mt-0.5" />
                <div>
                  <p className="text-xs text-slate-600 mb-1">Seat</p>
                  <p className="font-bold text-[#264b8d] text-lg">{booking.seat}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-slate-600">{booking.operator}</p>
              <p className="text-xs text-slate-500">{booking.busNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Total Paid</p>
              <p className="font-bold text-[#264b8d] text-2xl">Rs. {booking.price}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {/* Track Bus Button (Only for Today's Trips) */}
            {isTodaysTrip && (
              <button
                onClick={() => handleTrackBus(booking)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#dfae6b] to-[#c99a5a] text-white rounded-xl font-semibold hover:from-[#c99a5a] hover:to-[#b8894a] transition-all shadow-md hover:shadow-lg"
              >
                <Navigation className="w-5 h-5" />
                <span>Track Bus (Live)</span>
              </button>
            )}
            
            {/* Book Again Button (Only for Past Trips) */}
            {booking.status === 'completed' && (
              <button
                onClick={() => navigate('/passenger')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#dfae6b] to-[#c99a5a] text-white rounded-xl font-semibold hover:from-[#c99a5a] hover:to-[#b8894a] transition-all shadow-md hover:shadow-lg"
              >
                <Bus className="w-5 h-5" />
                <span>Book Again</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/passenger')}
                className="flex items-center gap-2 px-4 py-2 text-[#264b8d] hover:bg-[#264b8d]/5 rounded-xl transition-colors font-medium"
              >
                ← Back
              </button>
              <div className="w-px h-8 bg-slate-200"></div>
              <div className="flex items-center gap-3">
                <div className="bg-[#264b8d] p-2.5 rounded-xl">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-[#264b8d]">QuickSeat</span>
              </div>
            </div>
            
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl transition-colors"
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#264b8d]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div className="text-left hidden sm:block">
                  <p className="font-semibold text-slate-900 text-sm">
                    {userProfile?.fullName || 'Passenger'}
                  </p>
                  <p className="text-xs text-slate-600">Passenger</p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-600 transition-transform ${showProfileMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/passenger');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900">View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/passenger');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <Bus className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900">Search Buses</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900">Settings</span>
                  </button>
                  <div className="border-t border-slate-200 my-2"></div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-red-50 transition-colors text-red-600"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full px-6 lg:px-10 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-lg text-slate-600">View and manage your bus ticket bookings</p>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-10 bg-gradient-to-b from-[#264b8d] to-[#1e3a6d] rounded-full"></div>
              <h2 className="text-3xl font-bold text-slate-900">Upcoming Trips</h2>
              <span className="px-4 py-1.5 bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] text-white rounded-full text-sm font-semibold shadow-md">
                {upcomingBookings.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-10 bg-gradient-to-b from-slate-400 to-slate-500 rounded-full"></div>
              <h2 className="text-3xl font-bold text-slate-900">Past Trips</h2>
              <span className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-full text-sm font-semibold shadow-md">
                {pastBookings.length}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {pastBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {bookings.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TicketIcon className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Bookings Yet</h3>
            <p className="text-slate-600 mb-6">Start your journey by booking your first ticket</p>
            <button
              onClick={() => navigate('/passenger')}
              className="px-6 py-3 bg-[#264b8d] text-white rounded-xl font-semibold hover:bg-[#1e3a6d] transition-all"
            >
              Book a Ticket
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-16 mt-16 border-t border-slate-700">
        <div className="w-full px-6 lg:px-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] p-2.5 rounded-xl shadow-lg">
                  <Bus className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">QuickSeat</span>
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
