import { useState } from 'react';
import { Bus, MapPin, Calendar, Clock, Search, LogOut, User, History, TrendingUp, ArrowRight, Sparkles, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export interface SearchData {
  origin: string;
  destination: string;
  date: string;
  time: string;
}

interface PassengerDashboardProps {
  onSearch: (data: SearchData) => void;
  onLogout: () => void;
  onViewProfile: () => void;
  onViewBookings: () => void;
}

export function PassengerDashboard({ onSearch, onLogout, onViewProfile, onViewBookings }: PassengerDashboardProps) {
  const { currentUser, userProfile } = useAuth();
  const [searchData, setSearchData] = useState<SearchData>({
    origin: '',
    destination: '',
    date: '',
    time: '',
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchData.origin && searchData.destination && searchData.date && searchData.time) {
      onSearch(searchData);
    }
  };

  const popularRoutes = [
    { from: 'Colombo', to: 'Kandy', price: 'Rs. 450', duration: '3h 30m', gradient: 'from-[#264b8d] to-[#264b8d]' },
    { from: 'Colombo', to: 'Galle', price: 'Rs. 350', duration: '2h 45m', gradient: 'from-[#3d5fa3] to-[#3d5fa3]' },
    { from: 'Kandy', to: 'Nuwara Eliya', price: 'Rs. 280', duration: '2h 15m', gradient: 'from-[#1e3a6d] to-[#1e3a6d]' },
    { from: 'Colombo', to: 'Jaffna', price: 'Rs. 1200', duration: '8h 30m', gradient: 'from-[#264b8d] to-[#264b8d]' },
  ];

  const recentSearches = [
    { from: 'Colombo', to: 'Trincomalee', date: 'Jan 15, 2026' },
    { from: 'Negombo', to: 'Anuradhapura', date: 'Jan 10, 2026' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-[#264b8d] p-2.5 rounded-xl group-hover:shadow-lg transition-shadow">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-[#264b8d]">
                QuickSeat
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onViewBookings}
                className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-[#264b8d] font-medium transition-colors rounded-xl hover:bg-slate-100"
              >
                <History className="w-5 h-5" />
                <span className="hidden sm:inline">My Bookings</span>
              </button>
              
              {/* User Profile Dropdown */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {userProfile?.fullName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">
                      {userProfile?.fullName || currentUser?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {currentUser?.email}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onViewProfile();
                      }}w-full
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-5 h-5 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onViewBookings();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <History className="w-5 h-5 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">My Bookings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Settings functionality
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-5 h-5 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Settings</span>
                    </button>
                    <div className="border-t border-slate-100 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={onViewProfile}
                className="flex md:hidden items-center gap-2 px-4 py-2 text-slate-700 hover:text-[#264b8d] font-medium transition-colors rounded-xl hover:bg-slate-100"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="flex md:hidden items-center gap-2 px-4 py-2 text-slate-700 hover:text-red-600 font-medium transition-colors rounded-xl hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Search */}
      <div className="relative overflow-hidden bg-slate-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=80)',
          }}
        >
          {/* Dark Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full mb-6">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-base font-medium text-white">
                Welcome back, {userProfile?.fullName?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || 'User'}!
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Where would you like to go?
            </h1>
            <p className="text-xl md:text-2xl text-white/90">Find and book the perfect bus for your journey</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-10 border-2 border-white/50">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {/* Origin */}
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3">From</label>
                <div className={`flex items-center border-2 rounded-xl transition-all ${
                  focusedField === 'origin' 
                    ? 'border-[#264b8d] shadow-lg' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <MapPin className={`ml-4 w-6 h-6 transition-colors ${
                    focusedField === 'origin' ? 'text-[#264b8d]' : 'text-slate-400'
                  }`} />
                  <input
                    type="text"
                    value={searchData.origin}
                    onChange={(e) => setSearchData({ ...searchData, origin: e.target.value })}
                    onFocus={() => setFocusedField('origin')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-3 pr-4 py-4 bg-transparent outline-none text-slate-900 text-base"
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3">To</label>
                <div className={`flex items-center border-2 rounded-xl transition-all ${
                  focusedField === 'destination' 
                    ? 'border-[#264b8d] shadow-lg' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <MapPin className={`ml-4 w-6 h-6 transition-colors ${
                    focusedField === 'destination' ? 'text-[#264b8d]' : 'text-slate-400'
                  }`} />
                  <input
                    type="text"
                    value={searchData.destination}
                    onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                    onFocus={() => setFocusedField('destination')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-3 pr-4 py-4 bg-transparent outline-none text-slate-900 text-base"
                    placeholder="Enter city"
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3">Date</label>
                <div className={`flex items-center border-2 rounded-xl transition-all ${
                  focusedField === 'date' 
                    ? 'border-[#264b8d] shadow-lg' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <Calendar className={`ml-4 w-6 h-6 transition-colors ${
                    focusedField === 'date' ? 'text-[#264b8d]' : 'text-slate-400'
                  }`} />
                  <input
                    type="date"
                    value={searchData.date}
                    onChange={(e) => setSearchData({ ...searchData, date: e.target.value })}
                    onFocus={() => setFocusedField('date')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-3 pr-4 py-4 bg-transparent outline-none text-slate-900 text-base"
                    required
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-base font-semibold text-slate-700 mb-3">Time</label>
                <div className={`flex items-center border-2 rounded-xl transition-all ${
                  focusedField === 'time' 
                    ? 'border-[#264b8d] shadow-lg' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}>
                  <Clock className={`ml-4 w-6 h-6 transition-colors ${
                    focusedField === 'time' ? 'text-[#264b8d]' : 'text-slate-400'
                  }`} />
                  <input
                    type="time"
                    value={searchData.time}
                    onChange={(e) => setSearchData({ ...searchData, time: e.target.value })}
                    onFocus={() => setFocusedField('time')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-3 pr-4 py-4 bg-transparent outline-none text-slate-900 text-base"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="group w-full py-5 bg-gradient-to-r from-[#264b8d] via-[#1e3a6d] to-[#264b8d] text-white rounded-xl font-semibold text-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.02]"
            >
              <Search className="w-6 h-6" />
              Search Buses
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>

      {/* Popular Routes */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-b from-transparent via-blue-50/40 to-transparent">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">Popular Routes</h2>
            <p className="text-xl text-slate-600">Quick access to frequently searched destinations</p>
          </div>
          <TrendingUp className="w-10 h-10 text-[#264b8d]" />
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {popularRoutes.map((route, index) => (
            <button
              key={index}
              onClick={() => setSearchData({ ...searchData, origin: route.from, destination: route.to })}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 text-left border-2 border-slate-100 overflow-hidden transform hover:-translate-y-3"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${route.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              {/* Content */}
              <div className="relative p-8">
                {/* Price Badge */}
                <div className="flex justify-end mb-6">
                  <div className={`px-5 py-3 bg-gradient-to-r ${route.gradient} text-white rounded-full text-base font-bold shadow-lg`}>
                    {route.price}
                  </div>
                </div>
                
                {/* Route Info */}
                <div className="space-y-5 mb-8">
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${route.gradient} shadow-md`}></div>
                    <p className="font-bold text-xl text-slate-900 group-hover:text-white transition-colors">{route.from}</p>
                  </div>
                  
                  {/* Animated Connecting Line */}
                  <div className="flex items-center gap-4 pl-2">
                    <div className="flex flex-col gap-1.5">
                      <div className="w-0.5 h-4 bg-slate-300 group-hover:bg-white/50 transition-colors"></div>
                      <div className="w-0.5 h-4 bg-slate-300 group-hover:bg-white/50 transition-colors"></div>
                      <div className="w-0.5 h-4 bg-slate-300 group-hover:bg-white/50 transition-colors"></div>
                    </div>
                    <Bus className="w-6 h-6 text-slate-400 group-hover:text-white transition-all group-hover:translate-y-3 duration-500" />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-4 rounded-full border-3 border-slate-400 group-hover:border-white transition-colors"></div>
                    <p className="font-bold text-xl text-slate-900 group-hover:text-white transition-colors">{route.to}</p>
                  </div>
                </div>
                
                {/* Duration & Arrow */}
                <div className="flex items-center justify-between pt-5 border-t-2 border-slate-200 group-hover:border-white/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-500 group-hover:text-white/90 transition-colors" />
                    <span className="text-base font-medium text-slate-600 group-hover:text-white/90 transition-colors">{route.duration}</span>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-white group-hover:translate-x-2 transition-all duration-300" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Recent Searches</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => setSearchData({ ...searchData, origin: search.from, destination: search.to })}
                className="flex items-center justify-between p-6 bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-md hover:shadow-xl transition-all border-2 border-slate-100 hover:border-[#264b8d] group hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] rounded-xl shadow-md">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">
                      {search.from} → {search.to}
                    </p>
                    <p className="text-sm text-slate-600">{search.date}</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#264b8d] group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-16 mt-8 border-t border-slate-800">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#264b8d] p-2 rounded-xl">
                  <Bus className="w-6 h-6 text-white" />
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
