import { useState } from 'react';
import { Bus as BusIcon, ArrowLeft, LogOut, CreditCard, Lock, CheckCircle, User, ChevronDown, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type PaymentMethod = 'visa' | 'mastercard' | 'amex';

export function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, signOut } = useAuth();
  
  // Get booking data from navigation state
  const bookingData = location.state?.bookingData;
  const bus = bookingData?.bus;
  const searchData = bookingData?.searchData;
  const price = bookingData?.price || 0;
  const duration = bookingData?.duration;
  const selectedSeat = bookingData?.selectedSeat;

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('visa');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });
  const [processing, setProcessing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false);
      // Navigate to confirmation page with booking details
      navigate('/booking-confirmation', {
        state: {
          confirmationData: {
            bus,
            searchData,
            selectedSeat,
            paymentMethod: selectedMethod,
            totalAmount,
          }
        }
      });
    }, 2000);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  const totalAmount = price + 50;

  if (!bookingData || !bus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No booking data found</p>
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
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/passenger')}
                className="flex items-center gap-2 text-slate-600 hover:text-[#264b8d] transition-colors font-medium"
                disabled={processing}
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
            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 rounded-xl transition-colors"
                disabled={processing}
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
          {/* Large background container */}
          <div className="bg-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="grid lg:grid-cols-3 gap-6">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6 border border-slate-200">
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="w-5 h-5 text-[#dfae6b]" />
                  <h2 className="text-2xl font-bold text-slate-900">Secure Payment</h2>
                </div>

                {/* Payment Method Selection */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
                  <button
                    onClick={() => setSelectedMethod('visa')}
                    className={`p-4 md:p-6 rounded-xl border-2 transition-all ${
                      selectedMethod === 'visa'
                        ? 'border-[#dfae6b] bg-[#dfae6b]/10 shadow-md'
                        : 'border-slate-200 hover:border-[#dfae6b]/50'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                      selectedMethod === 'visa' ? 'text-[#dfae6b]' : 'text-slate-600'
                    }`} />
                    <p className={`font-semibold text-center text-sm md:text-base ${
                      selectedMethod === 'visa' ? 'text-[#dfae6b]' : 'text-slate-700'
                    }`}>Visa</p>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('mastercard')}
                    className={`p-4 md:p-6 rounded-xl border-2 transition-all ${
                      selectedMethod === 'mastercard'
                        ? 'border-[#dfae6b] bg-[#dfae6b]/10 shadow-md'
                        : 'border-slate-200 hover:border-[#dfae6b]/50'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                      selectedMethod === 'mastercard' ? 'text-[#dfae6b]' : 'text-slate-600'
                    }`} />
                    <p className={`font-semibold text-center text-xs md:text-base ${
                      selectedMethod === 'mastercard' ? 'text-[#dfae6b]' : 'text-slate-700'
                    }`}>Mastercard</p>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('amex')}
                    className={`p-4 md:p-6 rounded-xl border-2 transition-all ${
                      selectedMethod === 'amex'
                        ? 'border-[#dfae6b] bg-[#dfae6b]/10 shadow-md'
                        : 'border-slate-200 hover:border-[#dfae6b]/50'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 ${
                      selectedMethod === 'amex' ? 'text-[#dfae6b]' : 'text-slate-600'
                    }`} />
                    <p className={`font-semibold text-center text-xs md:text-base ${
                      selectedMethod === 'amex' ? 'text-[#dfae6b]' : 'text-slate-700'
                    }`}>Amex</p>
                  </button>
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePayment}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#264b8d] focus:border-[#264b8d] outline-none transition-all"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#264b8d] focus:border-[#264b8d] outline-none transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#264b8d] focus:border-[#264b8d] outline-none transition-all"
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#264b8d] focus:border-[#264b8d] outline-none transition-all"
                          placeholder="123"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={processing}
                      className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
                        processing
                          ? 'bg-slate-400 cursor-not-allowed text-white'
                          : 'bg-[#264b8d] text-white hover:bg-[#1e3a6d] hover:shadow-xl'
                      }`}
                    >
                      {processing ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing Payment...
                        </span>
                      ) : (
                        `Pay Rs. ${totalAmount}`
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 border border-slate-200">
                <h3 className="font-bold text-xl mb-6 text-slate-900">Order Summary</h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Route</p>
                    <p className="font-semibold text-slate-900">{bus.routeNumber}</p>
                    <p className="text-sm text-slate-700">{bus.busNumber}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-600 mb-1">Journey</p>
                    <p className="font-semibold text-slate-900">
                      {searchData?.origin} → {searchData?.destination}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-600 mb-1">Date</p>
                    <p className="font-semibold text-slate-900">{searchData?.date || 'N/A'}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-600 mb-1">Time</p>
                    <p className="font-semibold text-slate-900">{bus.departureTime} - {bus.arrivalTime}</p>
                    {duration && <p className="text-sm text-slate-600 mt-1">Duration: {duration}</p>}
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm text-slate-600 mb-1">Seat Number</p>
                    <p className="font-semibold text-[#264b8d] text-2xl">{selectedSeat}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-700">Ticket Price</span>
                      <span className="font-semibold text-slate-900">Rs. {price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Service Fee</span>
                      <span className="font-semibold text-slate-900">Rs. 50</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-700">Taxes</span>
                      <span className="font-semibold text-slate-900">Rs. 0</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t-2 border-slate-300">
                      <span className="font-bold text-lg text-slate-900">Total Amount</span>
                      <span className="font-bold text-2xl text-[#264b8d]">Rs. {totalAmount}</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <div className="bg-[#dfae6b]/10 border border-[#dfae6b] rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#dfae6b] flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-slate-800">
                          <p className="font-semibold mb-1">100% Secure Payment</p>
                          <p>Your transaction is protected with bank-level encryption</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-8">
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
