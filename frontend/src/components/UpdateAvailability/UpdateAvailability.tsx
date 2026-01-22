
import { useState } from 'react';
import { Bus, LogOut, Calendar, CheckCircle, XCircle, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface BusAvailability {
  id: string;
  busNumber: string;
  route: string;
  date: string;
  status: 'available' | 'unavailable';
}

export function UpdateAvailability() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedBus, setSelectedBus] = useState('');

  // Mock bus data
  const buses = [
    { id: '1', busNumber: 'EL-2456', route: 'Colombo → Kandy' },
    { id: '2', busNumber: 'ST-1823', route: 'Galle → Colombo' },
    { id: '3', busNumber: 'NE-3421', route: 'Colombo → Jaffna' },
    { id: '4', busNumber: 'HC-5632', route: 'Kandy → Nuwara Eliya' },
  ];

  // Mock availability data
  const [availability, setAvailability] = useState<BusAvailability[]>([
    { id: '1', busNumber: 'EL-2456', route: 'Colombo → Kandy', date: '2026-01-25', status: 'available' },
    { id: '2', busNumber: 'ST-1823', route: 'Galle → Colombo', date: '2026-01-25', status: 'available' },
    { id: '3', busNumber: 'NE-3421', route: 'Colombo → Jaffna', date: '2026-01-25', status: 'unavailable' },
    { id: '4', busNumber: 'HC-5632', route: 'Kandy → Nuwara Eliya', date: '2026-01-25', status: 'available' },
  ]);

  const toggleAvailability = (id: string) => {
    setAvailability(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'available' ? 'unavailable' : 'available' }
          : item
      )
    );
  };

  const handleSave = () => {
    alert('Availability updated successfully!');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/signin');
  };

  const filteredAvailability = selectedBus
    ? availability.filter(item => item.id === selectedBus)
    : availability;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-[#264b8d] p-2.5 rounded-xl">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-[#264b8d]">QuickSeat</span>
                <p className="text-xs text-slate-600 font-medium">Operator Portal</p>
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

      {/* Large Gradient Background Container */}
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-[#264b8d]/5 via-slate-50 to-[#dfae6b]/5 py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/operator')}
            className="text-[#264b8d] hover:text-[#1e3a6d] font-semibold mb-2 flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage Bus Availability</h1>
          <p className="text-slate-600">Update bus availability for specific dates</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Calendar className="w-4 h-4 text-[#264b8d]" />
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dfae6b]"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Bus className="w-4 h-4 text-[#264b8d]" />
                Filter by Bus (Optional)
              </label>
              <select
                value={selectedBus}
                onChange={(e) => setSelectedBus(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dfae6b]"
              >
                <option value="">All Buses</option>
                {buses.map(bus => (
                  <option key={bus.id} value={bus.id}>{bus.busNumber} - {bus.route}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Availability List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#264b8d] rounded"></div>
              <h2 className="text-xl font-bold text-slate-900">Bus Availability</h2>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-3 bg-[#264b8d] text-white rounded-xl font-semibold hover:bg-[#1e3a6d] hover:shadow-lg transition-all"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>

          <div className="space-y-4">
            {filteredAvailability.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-[#264b8d]/10 flex items-center justify-center">
                    <Bus className="w-7 h-7 text-[#264b8d]" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-lg">{item.busNumber}</p>
                    <p className="text-slate-600">{item.route}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(item.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
                    item.status === 'available'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {item.status === 'available' ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Available
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5" />
                        Unavailable
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => toggleAvailability(item.id)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      item.status === 'available'
                        ? 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                    }`}
                  >
                    {item.status === 'available' ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Availability Management Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Mark buses as unavailable for maintenance, holidays, or other reasons</li>
            <li>• Changes take effect immediately after saving</li>
            <li>• Passengers won't be able to book unavailable buses for selected dates</li>
            <li>• You can bulk update availability for multiple dates using the date picker</li>
          </ul>
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
