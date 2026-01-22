import { useState } from 'react';
import { Bus as BusIcon, CheckCircle, Download, LogOut, User, ChevronDown, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function BookingConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Get booking data from navigation state
  const confirmationData = location.state?.confirmationData;
  
  if (!confirmationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No booking confirmation found</p>
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

  const userEmail = userProfile?.email || "passenger@example.com";

  const handleDownload = () => {
    alert('E-ticket downloaded successfully!');
  };

  const handleNewBooking = () => {
    navigate('/passenger');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-[#264b8d] p-2.5 rounded-xl">
                <BusIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#264b8d]">QuickSeat</span>
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
                      navigate('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900">View Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/my-bookings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50 transition-colors"
                  >
                    <BusIcon className="w-5 h-5 text-slate-600" />
                    <span className="text-slate-900">My Bookings</span>
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

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Large gradient background container */}
          <div className="bg-gradient-to-br from-[#264b8d]/5 via-[#dfae6b]/5 to-[#264b8d]/5 rounded-3xl p-6 md:p-10 shadow-lg">
            <div className="max-w-4xl mx-auto">
              {/* Success Message */}
              <div className="bg-gradient-to-br from-[#dfae6b]/10 to-[#dfae6b]/20 border-2 border-[#dfae6b] rounded-2xl p-12 mb-8 text-center shadow-lg">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-[#dfae6b]/20 rounded-full flex items-center justify-center shadow-md">
                <CheckCircle className="w-14 h-14 text-[#dfae6b]" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Booking Confirmed!</h1>
            <p className="text-lg text-slate-700">Your seat has been successfully booked</p>
            
          </div>

          {/* E-Ticket Notification */}
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#dfae6b]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-[#dfae6b]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">E-Ticket Sent Successfully</h3>
                <p className="text-slate-600 leading-relaxed">
                  Your e-ticket has been sent to{' '}
                  <span className="font-semibold text-[#264b8d]">{userEmail}</span>
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Please check your inbox and spam folder. You can also download your ticket below.
                </p>
              </div>
            </div>
          </div>

          

          

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-[#264b8d] text-white rounded-xl font-semibold text-lg hover:bg-[#1e3a6d] hover:shadow-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download E-Ticket
            </button>

            <button
              onClick={handleNewBooking}
              className="px-6 py-4 bg-white border-2 border-[#264b8d] text-[#264b8d] rounded-xl font-semibold hover:bg-[#264b8d]/5 transition-all"
            >
              Book Another Ticket
            </button>
          </div>

          {/* Contact Support */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 mb-2">Need help with your booking?</p>
            <a href="#" className="text-[#264b8d] hover:underline font-semibold">
              Contact Customer Support
            </a>
          </div>
        </div>
        </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
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
