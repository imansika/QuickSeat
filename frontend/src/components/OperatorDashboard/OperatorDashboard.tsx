import { useState, useEffect } from 'react';
import { Bus, Plus, UserPlus, Edit3, Calendar, TrendingUp, History, LogOut, BarChart3, Users, Clock, MapPin, X, Hash, Save, ChevronDown, User, Settings, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { registerBus, getOperatorBuses, deleteBus } from '../../services/bus.service';
import { useAuth } from '../../contexts/AuthContext';

interface OperatorDashboardProps {
  onLogout: () => void;
  onUpdateBus: (busData?: any) => void;
}

export function OperatorDashboard({
  onLogout,
  onUpdateBus
}: OperatorDashboardProps) {
  const { currentUser, userProfile } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'availability' | 'revenue' | 'history'>('dashboard');
  const [showBusModal, setShowBusModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [registeredBuses, setRegisteredBuses] = useState<any[]>([]);
  const [isLoadingBuses, setIsLoadingBuses] = useState(true);
  
  // Availability states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBus, setSelectedBus] = useState('');
  const [availability, setAvailability] = useState<any[]>([
    { id: '1', busNumber: 'EL-2456', route: 'Colombo → Kandy', date: '2026-01-25', status: 'available' },
    { id: '2', busNumber: 'ST-1823', route: 'Galle → Colombo', date: '2026-01-25', status: 'available' },
    { id: '3', busNumber: 'NE-3421', route: 'Colombo → Jaffna', date: '2026-01-25', status: 'unavailable' },
    { id: '4', busNumber: 'HC-5632', route: 'Kandy → Nuwara Eliya', date: '2026-01-25', status: 'available' },
  ]);
  
  const [formData, setFormData] = useState({
    busNumber: '',
    routeNumber: '',
    origin: '',
    destination: '',
    seatCapacity: '',
    departureTime: '',
    arrivalTime: '',
    operatingDays: 'daily',
    ratePerKm: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Availability toggle function
  const toggleAvailability = (id: string) => {
    setAvailability(prev => prev.map(bus => 
      bus.id === id 
        ? { ...bus, status: bus.status === 'available' ? 'unavailable' : 'available' }
        : bus
    ));
  };

  const handleSaveAvailability = () => {
    console.log('Saving availability:', availability);
    alert('Availability changes saved successfully!');
  };

  // Fetch buses when component mounts
  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setIsLoadingBuses(true);
      console.log('Fetching operator buses...');
      const response = await getOperatorBuses();
      console.log('Buses fetched successfully:', response);
      setRegisteredBuses(response.data || []);
    } catch (error: any) {
      console.error('Failed to fetch buses:', error);
      alert(`Failed to load buses: ${error.message || 'Please try again'}`);
    } finally {
      setIsLoadingBuses(false);
    }
  };

  const sriLankanCities = [
    'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 
    'Trincomalee', 'Batticaloa', 'Anuradhapura', 'Polonnaruwa',
    'Nuwara Eliya', 'Matara', 'Kurunegala', 'Ratnapura', 'Badulla'
  ];

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.busNumber.trim()) newErrors.busNumber = 'Bus number is required';
    if (!formData.routeNumber.trim()) newErrors.routeNumber = 'Route number is required';
    if (!formData.origin) newErrors.origin = 'Origin is required';
    if (!formData.destination) newErrors.destination = 'Destination is required';
    if (!formData.seatCapacity || parseInt(formData.seatCapacity) < 1) {
      newErrors.seatCapacity = 'Valid seat capacity is required';
    }
    if (!formData.departureTime) newErrors.departureTime = 'Departure time is required';
    if (!formData.arrivalTime) newErrors.arrivalTime = 'Arrival time is required';
    if (!formData.ratePerKm || parseFloat(formData.ratePerKm) < 1) {
      newErrors.ratePerKm = 'Valid rate per km is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        console.log('Registering bus with data:', formData);
        await registerBus(formData);
        console.log('Bus registered successfully');
        alert(`Bus ${formData.busNumber} registered successfully!\n\nRoute Number: ${formData.routeNumber}\nRoute: ${formData.origin} → ${formData.destination}\nSeats: ${formData.seatCapacity}\nSchedule: ${formData.operatingDays}\nDeparture: ${formData.departureTime}\nRate: Rs. ${formData.ratePerKm}/km`);
        setFormData({
          busNumber: '',
          routeNumber: '',
          origin: '',
          destination: '',
          seatCapacity: '',
          departureTime: '',
          arrivalTime: '',
          operatingDays: 'daily',
          ratePerKm: '',
        });
        setShowBusModal(false);
        // Reload buses list
        fetchBuses();
      } catch (error: any) {
        console.error('Bus registration error:', error);
        alert(`Failed to register bus: ${error.message || 'Please try again'}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Mock statistics
  const stats = [
    { label: 'Total Buses', value: registeredBuses.length.toString(), icon: Bus },
    { label: 'Active Routes', value: '12', icon: BarChart3 },
    { label: 'Today\'s Bookings', value: '156', icon: Users },
    { label: 'Monthly Revenue', value: 'Rs. 2.4M', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="flex">
      {/* Left Sidebar - Quick Actions */}
      <div className="w-96 bg-gradient-to-br from-[#264b8d] via-[#1e3a6d] to-[#264b8d] shadow-2xl sticky top-0 h-screen overflow-y-auto">
        <div className="p-8">
          <div className="mb-10 pb-6 border-b border-white/30">
            <h2 className="text-2xl font-bold text-white tracking-wide">Operator Portal</h2>
            <p className="text-white/80 text-sm mt-1">Manage your fleet</p>
          </div>

          <nav className="space-y-3">
            <button
              onClick={() => {
                setActiveView('dashboard');
                setShowBusModal(true);
              }}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all group shadow-md hover:shadow-xl ${
                activeView === 'dashboard' ? 'bg-white text-[#264b8d]' : 'text-white hover:bg-white hover:text-[#264b8d]'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-colors ${
                activeView === 'dashboard' ? 'bg-[#264b8d]/10' : 'bg-white/20 group-hover:bg-[#264b8d]/10'
              }`}>
                <Plus className={`w-6 h-6 ${
                  activeView === 'dashboard' ? 'text-[#264b8d]' : 'text-white group-hover:text-[#264b8d]'
                }`} />
              </div>
              <div>
                <p className="font-bold text-base">Register Bus</p>
                <p className="text-sm opacity-80 group-hover:opacity-60">Add new bus</p>
              </div>
            </button>

            <button
              onClick={() => {}}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all group shadow-md hover:shadow-xl ${
                false ? 'bg-white text-[#264b8d]' : 'text-white hover:bg-white hover:text-[#264b8d]'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white/20 group-hover:bg-[#264b8d]/10 transition-colors">
                <UserPlus className="w-6 h-6 text-white group-hover:text-[#264b8d]" />
              </div>
              <div>
                <p className="font-bold text-base">Register Operators</p>
                <p className="text-sm opacity-80 group-hover:opacity-60">Add new operators</p>
              </div>
            </button>

            <button
              onClick={() => setActiveView('availability')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all group shadow-md hover:shadow-xl ${
                activeView === 'availability' ? 'bg-white text-[#264b8d]' : 'text-white hover:bg-white hover:text-[#264b8d]'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-colors ${
                activeView === 'availability' ? 'bg-[#264b8d]/10' : 'bg-white/20 group-hover:bg-[#264b8d]/10'
              }`}>
                <Calendar className={`w-6 h-6 ${
                  activeView === 'availability' ? 'text-[#264b8d]' : 'text-white group-hover:text-[#264b8d]'
                }`} />
              </div>
              <div>
                <p className="font-bold text-base">Availability</p>
                <p className="text-sm opacity-80 group-hover:opacity-60">Manage schedule</p>
              </div>
            </button>

            <button
              onClick={() => setActiveView('revenue')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all group shadow-md hover:shadow-xl ${
                activeView === 'revenue' ? 'bg-white text-[#264b8d]' : 'text-white hover:bg-white hover:text-[#264b8d]'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-colors ${
                activeView === 'revenue' ? 'bg-[#264b8d]/10' : 'bg-white/20 group-hover:bg-[#264b8d]/10'
              }`}>
                <TrendingUp className={`w-6 h-6 ${
                  activeView === 'revenue' ? 'text-[#264b8d]' : 'text-white group-hover:text-[#264b8d]'
                }`} />
              </div>
              <div>
                <p className="font-bold text-base">Revenue</p>
                <p className="text-sm opacity-80 group-hover:opacity-60">View reports</p>
              </div>
            </button>

            <button
              onClick={() => setActiveView('history')}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left transition-all group shadow-md hover:shadow-xl ${
                activeView === 'history' ? 'bg-white text-[#264b8d]' : 'text-white hover:bg-white hover:text-[#264b8d]'
              }`}
            >
              <div className={`p-2.5 rounded-xl transition-colors ${
                activeView === 'history' ? 'bg-[#264b8d]/10' : 'bg-white/20 group-hover:bg-[#3d5fa3]/10'
              }`}>
                <History className={`w-6 h-6 ${
                  activeView === 'history' ? 'text-[#264b8d]' : 'text-white group-hover:text-[#3d5fa3]'
                }`} />
              </div>
              <div>
                <p className="font-bold text-base">Trip History</p>
                <p className="text-sm opacity-80 group-hover:opacity-60">Past trips</p>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Navigation */}
        <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
          <div className="w-full px-6 lg:px-10">
            <div className="flex justify-between items-center h-24">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] p-3 rounded-xl shadow-md">
                  <Bus className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-3xl font-bold text-[#264b8d]">QuickSeat</span>
                </div>
              </div>
              
              {/* User Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {userProfile?.fullName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'O'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-semibold text-slate-900">
                      {userProfile?.fullName || currentUser?.displayName || 'Operator'}
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
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900">{userProfile?.fullName || 'Operator'}</p>
                      <p className="text-xs text-slate-500">{userProfile?.role?.toUpperCase() || 'OPERATOR'}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        // Profile functionality
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-5 h-5 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">My Profile</span>
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
            </div>
          </div>
        </nav>

        <div className="w-full px-6 lg:px-10 py-12">
          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <>
              {/* Header */}
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Operator Dashboard</h1>
                <p className="text-lg text-slate-600">Welcome back! Manage your buses and track performance</p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-14">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-slate-100 rounded-3xl shadow-md border-2 border-slate-200 p-8 hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-base text-slate-600 mb-2 font-medium">{stat.label}</p>
                        <p className="text-4xl font-bold text-slate-900">{stat.value}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-600 shadow-lg">
                        <stat.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Registered Buses List */}
              <div className="mb-14">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-12 bg-gradient-to-b from-[#264b8d] to-[#1e3a6d] rounded-full"></div>
                    <h2 className="text-2xl font-bold text-slate-900">Registered Buses</h2>
                  </div>
                  <button
                    onClick={() => setShowBusModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] text-white rounded-2xl font-bold hover:shadow-2xl hover:shadow-blue-500/50 transition-all text-lg hover:scale-105"
                  >
                    <Plus className="w-6 h-6" />
                    Add New Bus
                  </button>
                </div>

                {isLoadingBuses ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#264b8d] mx-auto mb-4"></div>
                      <p className="text-slate-600">Loading buses...</p>
                    </div>
                  </div>
                ) : registeredBuses.length === 0 ? (
                  <div className="bg-white rounded-3xl shadow-md border-2 border-slate-100 p-12 text-center">
                    <Bus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No buses registered yet</h3>
                    <p className="text-slate-600 mb-6">Get started by adding your first bus</p>
                    <button
                      onClick={() => setShowBusModal(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#264b8d] to-[#1e3a6d] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add Your First Bus
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {registeredBuses.map((bus) => (
                    <div
                      key={bus.id}
                      className="bg-white rounded-3xl shadow-md border-2 border-slate-100 p-8 hover:shadow-xl transition-all group hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 flex items-center justify-center">
                            <Bus className="w-12 h-12 text-slate-600" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-slate-900">{bus.busNumber}</h3>
                            {bus.routeNumber && (
                              <p className="text-sm text-[#264b8d] font-semibold mb-1">
                                Route {bus.routeNumber}
                              </p>
                            )}
                            <p className="text-base text-slate-600 flex items-center gap-2">
                              <MapPin className="w-5 h-5" />
                              {bus.origin} → {bus.destination}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onUpdateBus(bus)}
                            className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                            title="Update Bus"
                          >
                            <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to delete bus ${bus.busNumber}?`)) {
                            try {
                              await deleteBus(bus._id);
                              alert('Bus deleted successfully');
                              fetchBuses();
                            } catch (error: any) {
                              alert(`Failed to delete bus: ${error.message || 'Please try again'}`);
                            }
                          }
                        }}
                        className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-md"
                        title="Delete Bus"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-200">
                    <div>
                      <p className="text-sm text-slate-500 mb-2 font-medium">Seats</p>
                      <p className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                        <Users className="w-5 h-5 text-slate-600" />
                        {bus.seatCapacity}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-2 font-medium">Departure</p>
                      <p className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-slate-600" />
                        {bus.departureTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-2 font-medium">Operating</p>
                      <p className="font-bold text-slate-900 capitalize text-lg">{bus.operatingDays}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
            </>
          )}

          {/* Availability View */}
          {activeView === 'availability' && (
            <div className="min-h-[calc(100vh-12rem)] bg-gradient-to-br from-[#264b8d]/5 via-slate-50 to-[#dfae6b]/5 -m-12 p-12">
              <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10">
                  <h1 className="text-3xl font-bold text-slate-900 mb-3">Bus Availability Management</h1>
                  <p className="text-lg text-slate-600">Manage and update bus availability status</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Filter by Bus
                      </label>
                      <select
                        value={selectedBus}
                        onChange={(e) => setSelectedBus(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] focus:border-transparent transition-all bg-white"
                      >
                        <option value="">All Buses</option>
                        <option value="EL-2456">EL-2456</option>
                        <option value="ST-1823">ST-1823</option>
                        <option value="NE-3421">NE-3421</option>
                        <option value="HC-5632">HC-5632</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Availability List */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Bus Availability Status</h2>
                    
                    <div className="space-y-4">
                      {availability
                        .filter(bus => !selectedBus || bus.busNumber === selectedBus)
                        .map((bus) => (
                          <div
                            key={bus.id}
                            className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border-2 border-slate-200 hover:shadow-md transition-all"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <Bus className="w-6 h-6 text-[#264b8d]" />
                                <h3 className="text-xl font-bold text-slate-900">{bus.busNumber}</h3>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                                  bus.status === 'available' 
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {bus.status === 'available' ? (
                                    <span className="flex items-center gap-1.5">
                                      <CheckCircle className="w-4 h-4" />
                                      Available
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5">
                                      <XCircle className="w-4 h-4" />
                                      Unavailable
                                    </span>
                                  )}
                                </span>
                              </div>
                              <p className="text-slate-600 ml-10">{bus.route}</p>
                              <p className="text-sm text-slate-500 ml-10">Date: {bus.date}</p>
                            </div>
                            <button
                              onClick={() => toggleAvailability(bus.id)}
                              className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg border-2 ${
                                bus.status === 'available'
                                  ? 'bg-white text-rose-600 border-rose-600 hover:bg-rose-50'
                                  : 'bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-50'
                              }`}
                            >
                              Mark as {bus.status === 'available' ? 'Unavailable' : 'Available'}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
                    <button
                      onClick={handleSaveAvailability}
                      className="flex items-center gap-3 px-8 py-4 bg-[#264b8d] text-white rounded-xl font-bold hover:bg-[#1e3a6d] transition-all shadow-lg hover:shadow-xl"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue View */}
          {activeView === 'revenue' && (
            <div>
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Revenue Reports</h1>
                <p className="text-lg text-slate-600">View and analyze revenue data</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xl text-slate-600">Revenue reports coming soon...</p>
              </div>
            </div>
          )}

          {/* Trip History View */}
          {activeView === 'history' && (
            <div>
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Trip History</h1>
                <p className="text-lg text-slate-600">View past trips and bookings</p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xl text-slate-600">Trip history coming soon...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Footer - Full Width */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-16 border-t border-slate-800 mt-12">
          <div className="w-full px-6 lg:px-10">
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

      {/* Bus Registration Modal */}
      {showBusModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Register New Bus</h2>
                <p className="text-slate-600 text-sm mt-1">Add a new bus with route and schedule information</p>
              </div>
              <button
                onClick={() => setShowBusModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Bus Details Section */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-[#264b8d] rounded"></div>
                  <h3 className="text-xl font-bold text-slate-900">Bus Details</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Bus Number */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Hash className="w-4 h-4 text-[#264b8d]" />
                      Bus Number
                    </label>
                    <input
                      type="text"
                      value={formData.busNumber}
                      onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                      placeholder="e.g., EL-2456"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all ${
                        errors.busNumber ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                    {errors.busNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.busNumber}</p>
                    )}
                  </div>

                  {/* Route Number */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Hash className="w-4 h-4 text-[#264b8d]" />
                      Route Number
                    </label>
                    <input
                      type="text"
                      value={formData.routeNumber}
                      onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
                      placeholder="e.g., 138, 245"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all ${
                        errors.routeNumber ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                    {errors.routeNumber && (
                      <p className="text-red-600 text-sm mt-1">{errors.routeNumber}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {/* Seat Capacity */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Users className="w-4 h-4 text-[#264b8d]" />
                      Seat Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.seatCapacity}
                      onChange={(e) => setFormData({ ...formData, seatCapacity: e.target.value })}
                      placeholder="e.g., 40"
                      min="1"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all ${
                        errors.seatCapacity ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                    {errors.seatCapacity && (
                      <p className="text-red-600 text-sm mt-1">{errors.seatCapacity}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-[#264b8d] rounded"></div>
                  <h3 className="text-xl font-bold text-slate-900">Route Information</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Origin */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <MapPin className="w-4 h-4 text-[#264b8d]" />
                      Origin
                    </label>
                    <select
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all ${
                        errors.origin ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Select origin city</option>
                      {sriLankanCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.origin && (
                      <p className="text-red-600 text-sm mt-1">{errors.origin}</p>
                    )}
                  </div>

                  {/* Destination */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <MapPin className="w-4 h-4 text-[#264b8d]" />
                      Destination
                    </label>
                    <select
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all ${
                        errors.destination ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Select destination city</option>
                      {sriLankanCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.destination && (
                      <p className="text-red-600 text-sm mt-1">{errors.destination}</p>
                    )}
                  </div>

                  {/* Departure Time */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Clock className="w-4 h-4 text-[#264b8d]" />
                      Departure Time
                    </label>
                    <input
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all ${
                        errors.departureTime ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                    {errors.departureTime && (
                      <p className="text-red-600 text-sm mt-1">{errors.departureTime}</p>
                    )}
                  </div>

                  {/* Arrival Time */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Clock className="w-4 h-4 text-[#264b8d]" />
                      Arrival Time
                    </label>
                    <input
                      type="time"
                      value={formData.arrivalTime}
                      onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all ${
                        errors.arrivalTime ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                    {errors.arrivalTime && (
                      <p className="text-red-600 text-sm mt-1">{errors.arrivalTime}</p>
                    )}
                  </div>

                  {/* Rate per 1km */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <span className="text-[#264b8d]">Rs.</span>
                      Rate per 1km
                    </label>
                    <input
                      type="number"
                      value={formData.ratePerKm}
                      onChange={(e) => setFormData({ ...formData, ratePerKm: e.target.value })}
                      placeholder="e.g., 12"
                      min="1"
                      step="0.5"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all ${
                        errors.ratePerKm ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                    {errors.ratePerKm && (
                      <p className="text-red-600 text-sm mt-1">{errors.ratePerKm}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-[#264b8d] rounded"></div>
                  <h3 className="text-xl font-bold text-slate-900">Operating Schedule</h3>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                    <Calendar className="w-4 h-4 text-[#264b8d]" />
                    Operating Days
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, operatingDays: 'daily' })}
                      className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                        formData.operatingDays === 'daily'
                          ? 'border-[#264b8d] bg-[#264b8d]/10 text-[#264b8d]'
                          : 'border-slate-200 text-slate-700 hover:border-[#264b8d]/50'
                      }`}
                    >
                      Daily
                      <p className="text-xs font-normal mt-1 text-slate-600">All days of the week</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, operatingDays: 'weekdays' })}
                      className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                        formData.operatingDays === 'weekdays'
                          ? 'border-[#264b8d] bg-[#264b8d]/10 text-[#264b8d]'
                          : 'border-slate-200 text-slate-700 hover:border-[#264b8d]/50'
                      }`}
                    >
                      Weekdays
                      <p className="text-xs font-normal mt-1 text-slate-600">Monday to Friday</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, operatingDays: 'weekends' })}
                      className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                        formData.operatingDays === 'weekends'
                          ? 'border-[#264b8d] bg-[#264b8d]/10 text-[#264b8d]'
                          : 'border-slate-200 text-slate-700 hover:border-[#264b8d]/50'
                      }`}
                    >
                      Weekends
                      <p className="text-xs font-normal mt-1 text-slate-600">Saturday & Sunday</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowBusModal(false)}
                  className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#264b8d] text-white rounded-xl font-semibold hover:bg-[#1e3a6d] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {isSubmitting ? 'Registering...' : 'Register Bus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
