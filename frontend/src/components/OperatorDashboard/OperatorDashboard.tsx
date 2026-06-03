import { useState, useEffect, useCallback } from 'react';
import {
  Bus as BusIcon, Plus, UserPlus, TrendingUp, LogOut,
  ChevronDown, User, Settings, Route, AlertCircle,
  CheckCircle, XCircle, Loader, Save, Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getOperatorBuses, deleteBus,
  getWeekdayOperatingBuses, getWeekendOperatingBuses,
} from '../../services/bus.service';
import { getAvailabilityByDate, setAvailability as updateAvailability } from '../../services/availability.service';
import { getMonthlyReport } from '../../services/report.service';
import { useAuth } from '../../contexts/AuthContext';

// ── Sub-pages (imported components) ───────────────────────────────────────────
import { RegisterOperator } from '../RegisterOperator';
import { RevenueReport }    from '../RevenueReport/RevenueReport';
import { TripDetailsView }  from '../TripDetailsView/TripDetailsView';
import { DashboardHome }    from './DashboardHome';
import { BusRegistrationModal } from './BusRegistrationModal';

import type { Bus } from '../../types/bus';

type View = 'dashboard' | 'availability' | 'revenue' | 'register-operator' | 'trip-details';

interface OperatorDashboardProps {
  onLogout: () => void;
  onUpdateBus: (busData?: Bus) => void;
  initialView?: View;
}

export function OperatorDashboard({ onLogout, onUpdateBus, initialView }: OperatorDashboardProps) {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

  const [activeView, setActiveView]         = useState<View>(initialView || 'dashboard');
  const [showBusModal, setShowBusModal]     = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // ── Bus data ────────────────────────────────────────────────────────────────
  const [registeredBuses, setRegisteredBuses] = useState<Bus[]>([]);
  const [isLoadingBuses, setIsLoadingBuses]   = useState(true);

  // ── Revenue ─────────────────────────────────────────────────────────────────
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState(0);
  const [isLoadingRevenue, setIsLoadingRevenue]       = useState(true);

  // ── Availability ────────────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate]         = useState('');
  const [selectedBus, setSelectedBus]           = useState('');
  const [availabilityBuses, setAvailabilityBuses] = useState<Bus[]>([]);
  interface AvailabilityItem {
    id: string; busNumber: string; route: string; date: string; availability: boolean;
  }
  const [availability, setAvailability]             = useState<AvailabilityItem[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isSavingAvailability, setIsSavingAvailability]   = useState(false);
  const [availabilityError, setAvailabilityError]   = useState('');
  const [availabilitySuccess, setAvailabilitySuccess] = useState('');

  // ── Effects ─────────────────────────────────────────────────────────────────
  useEffect(() => { fetchBuses(); }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoadingRevenue(true);
        const month = new Date().toISOString().slice(0, 7);
        const resp  = await getMonthlyReport(month);
        setCurrentMonthRevenue(Number(resp.totalRevenue || 0));
      } catch { setCurrentMonthRevenue(0); }
      finally { setIsLoadingRevenue(false); }
    };
    fetch();
  }, []);

  useEffect(() => { if (initialView) setActiveView(initialView); }, [initialView]);

  // ── Bus helpers ─────────────────────────────────────────────────────────────
  const fetchBuses = async () => {
    try {
      setIsLoadingBuses(true);
      const resp = await getOperatorBuses();
      setRegisteredBuses(resp.data || []);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to load buses: ${msg || 'Please try again'}`);
    } finally { setIsLoadingBuses(false); }
  };

  const handleDeleteBus = async (bus: Bus) => {
    if (!window.confirm(`Are you sure you want to delete bus ${bus.busNumber}?`)) return;
    try {
      await deleteBus(bus._id);
      alert('Bus deleted successfully');
      fetchBuses();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to delete bus: ${msg || 'Please try again'}`);
    }
  };

  // ── Availability helpers ────────────────────────────────────────────────────
  const isWeekendDate = (d: string) => { const day = new Date(`${d}T00:00:00`).getDay(); return day === 0 || day === 6; };

  const filterOperatingBuses = (buses: Bus[], weekend: boolean) => {
    const target = weekend ? 'weekends' : 'weekdays';
    return buses.filter((b) => b.operatingDays === 'daily' || b.operatingDays === target);
  };

  const fetchAvailabilityBuses = useCallback(async (date: string) => {
    try {
      setIsLoadingAvailability(true);
      setAvailabilityError('');
      const weekend = isWeekendDate(date);
      let buses: Bus[] = [];
      try {
        const resp = weekend ? await getWeekendOperatingBuses() : await getWeekdayOperatingBuses();
        buses = resp.data || [];
      } catch {
        const fallback = await getOperatorBuses();
        buses = filterOperatingBuses(fallback.data || [], weekend);
      }
      setAvailabilityBuses(buses);
      if (selectedBus && !buses.some((b: Bus) => b.busNumber === selectedBus)) setSelectedBus('');
      return buses;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setAvailabilityError(msg || 'Failed to fetch availability buses');
      return [];
    }
  }, [selectedBus]);

  const fetchAvailabilityForDate = async (date: string, buses: Bus[]) => {
    try {
      const resp = await getAvailabilityByDate(date);
      const records: { busNumber?: string; availability?: boolean }[] = resp.data || [];
      setAvailability(buses.map((bus: Bus) => {
        const rec = records.find((r) => (r.busNumber || '').toUpperCase() === (bus.busNumber || '').toUpperCase());
        return {
          id: bus._id ?? bus.busNumber, busNumber: bus.busNumber,
          route: `${bus.origin} → ${bus.destination}`, date,
          availability: rec ? rec.availability === true : true,
        };
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setAvailabilityError(msg || 'Failed to fetch availability');
    }
  };

  useEffect(() => {
    if (!selectedDate) { setAvailabilityBuses([]); setAvailability([]); setIsLoadingAvailability(false); return; }
    const load = async () => {
      const buses = await fetchAvailabilityBuses(selectedDate);
      if (buses.length > 0) await fetchAvailabilityForDate(selectedDate, buses);
      else setAvailability([]);
      setIsLoadingAvailability(false);
    };
    load();
  }, [selectedDate, fetchAvailabilityBuses]);

  const toggleAvailability = (busNumber: string) =>
    setAvailability((prev) => prev.map((b) => b.busNumber === busNumber ? { ...b, availability: !b.availability } : b));

  const handleSaveAvailability = async () => {
    if (!selectedDate) { setAvailabilityError('Please select a date first'); return; }
    try {
      setIsSavingAvailability(true);
      setAvailabilityError(''); setAvailabilitySuccess('');
      for (const rec of availability) {
        await updateAvailability({ busNumber: rec.busNumber, date: selectedDate, availability: rec.availability });
      }
      setAvailabilitySuccess('Availability updated successfully!');
      setTimeout(() => setAvailabilitySuccess(''), 3000);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      setAvailabilityError(msg || 'Failed to update availability');
    } finally { setIsSavingAvailability(false); }
  };

  // ── Sidebar nav items ────────────────────────────────────────────────────────
  const navItems: { view: View; icon: React.ElementType; label: string; sub: string; onClick?: () => void }[] = [
    { view: 'dashboard',         icon: Plus,      label: 'Register Bus',       sub: 'Add new bus',       onClick: () => { setActiveView('dashboard'); setShowBusModal(true); } },
    { view: 'register-operator', icon: UserPlus,  label: 'Register Operators', sub: 'Add new operators', onClick: () => { setActiveView('register-operator'); navigate('/operator/register-operator'); } },
    { view: 'trip-details',      icon: Route,     label: 'Trip Details',       sub: 'View trip summary' },
    { view: 'revenue',           icon: TrendingUp, label: 'Revenue',           sub: 'View reports' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="flex">

        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <div className="w-90 bg-gradient-to-br from-[#264b8d] via-[#1e3a6d] to-[#264b8d] shadow-2xl sticky top-0 h-screen overflow-y-auto shrink-0">
          <div className="p-8">
            <div className="mb-10 pb-6 border-b border-white/30">
              <h2 className="text-2xl font-bold text-white tracking-wide">Operator Portal</h2>
              <p className="text-white/70 text-sm mt-1">Manage your fleet</p>
            </div>

            <nav className="space-y-2">
              {navItems.map(({ view, icon: Icon, label, sub, onClick }) => {
                const isActive = activeView === view;
                return (
                  <button
                    key={view}
                    onClick={onClick ?? (() => setActiveView(view))}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all group ${
                      isActive ? 'bg-white text-[#264b8d]' : 'text-white hover:bg-white hover:text-[#264b8d]'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl transition-colors ${
                      isActive ? 'bg-[#264b8d]/10' : 'bg-white/20 group-hover:bg-[#264b8d]/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-[#264b8d]' : 'text-white group-hover:text-[#264b8d]'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-base leading-tight">{label}</p>
                      <p className="text-xs opacity-70 mt-0.5">{sub}</p>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* ── Main area ────────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Topbar */}
          <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
            <div className="w-full px-6 lg:px-10">
              <div className="flex justify-between items-center h-20">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] p-2.5 rounded-xl shadow-md">
                    <BusIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold text-[#264b8d]">QuickSeat</span>
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu((p) => !p)}
                    className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {userProfile?.fullName?.[0]?.toUpperCase() || currentUser?.email?.[0]?.toUpperCase() || 'O'}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-sm font-semibold text-slate-900">{userProfile?.fullName || currentUser?.displayName || 'Operator'}</p>
                      <p className="text-xs text-slate-500">{currentUser?.email}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900">{userProfile?.fullName || 'Operator'}</p>
                        <p className="text-xs text-slate-500">{userProfile?.role?.toUpperCase() || 'OPERATOR'}</p>
                      </div>
                      <button onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                        <User className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">My Profile</span>
                      </button>
                      <button onClick={() => setShowProfileMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors">
                        <Settings className="w-5 h-5 text-slate-600" />
                        <span className="text-sm font-medium text-slate-700">Settings</span>
                      </button>
                      <div className="border-t border-slate-100 mt-2 pt-2">
                        <button onClick={() => { setShowProfileMenu(false); onLogout(); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors">
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

          {/* ── Page content ─────────────────────────────────────────────────── */}
          <div className="w-full px-6 lg:px-10 py-12">

            {activeView === 'dashboard' && (
              <DashboardHome
                registeredBuses={registeredBuses}
                isLoadingBuses={isLoadingBuses}
                currentMonthRevenue={currentMonthRevenue}
                isLoadingRevenue={isLoadingRevenue}
                currentMonthName={currentMonthName}
                onShowBusModal={() => setShowBusModal(true)}
                onUpdateBus={onUpdateBus}
                onDeleteBus={handleDeleteBus}
              />
            )}

            {activeView === 'register-operator' && (
              <div className="min-h-[calc(100vh-12rem)]">
                <RegisterOperator />
              </div>
            )}

            {activeView === 'revenue' && <RevenueReport />}

            {activeView === 'trip-details' && (
              <TripDetailsView buses={registeredBuses} isLoading={isLoadingBuses} />
            )}

            {activeView === 'availability' && (
              <div className="min-h-[calc(100vh-12rem)]">
                {/* Availability section — unchanged from original */}
                <div className="mb-10">
                  <h1 className="text-3xl font-bold text-slate-900 mb-3">Bus Availability Management</h1>
                  <p className="text-lg text-slate-600">Manage and update bus availability status</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Select Date</label>
                      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Filter by Bus</label>
                      <select value={selectedBus} onChange={(e) => setSelectedBus(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all bg-white">
                        <option value="">All Buses</option>
                        {availabilityBuses.map((bus) => (
                          <option key={bus._id ?? bus.busNumber} value={bus.busNumber}>{bus.busNumber}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {availabilityError && (
                  <div className="flex items-center gap-3 p-4 mb-8 bg-red-50 border-2 border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <p className="text-sm font-semibold text-red-900">{availabilityError}</p>
                  </div>
                )}
                {availabilitySuccess && (
                  <div className="flex items-center gap-3 p-4 mb-8 bg-green-50 border-2 border-green-200 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                    <p className="text-sm font-semibold text-green-900">{availabilitySuccess}</p>
                  </div>
                )}

                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Bus Availability Status</h2>
                    <div className="space-y-4">
                      {!selectedDate ? (
                        <div className="flex items-center gap-3 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
                          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-amber-900">Select a date to get started</p>
                            <p className="text-sm text-amber-700">Choose a date to view and update availability</p>
                          </div>
                        </div>
                      ) : isLoadingAvailability ? (
                        <div className="flex items-center justify-center p-12">
                          <Loader className="w-8 h-8 text-[#264b8d] animate-spin" />
                        </div>
                      ) : availability.length === 0 ? (
                        <div className="flex items-center gap-3 p-6 bg-slate-50 border-2 border-slate-200 rounded-xl">
                          <AlertCircle className="w-6 h-6 text-slate-600 shrink-0" />
                          <p className="font-semibold text-slate-900">No buses found for this date</p>
                        </div>
                      ) : (
                        availability
                          .filter((b) => !selectedBus || b.busNumber === selectedBus)
                          .map((bus) => (
                            <div key={bus.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-xl border-2 border-slate-200 hover:shadow-md transition-all">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-2">
                                  <BusIcon className="w-6 h-6 text-[#264b8d]" />
                                  <h3 className="text-xl font-bold text-slate-900">{bus.busNumber}</h3>
                                  <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${bus.availability ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {bus.availability
                                      ? <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />Available</span>
                                      : <span className="flex items-center gap-1.5"><XCircle className="w-4 h-4" />Unavailable</span>}
                                  </span>
                                </div>
                                <p className="text-slate-600 ml-10">{bus.route}</p>
                              </div>
                              <button onClick={() => toggleAvailability(bus.busNumber)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-md border-2 ${
                                  bus.availability ? 'bg-white text-rose-600 border-rose-600 hover:bg-rose-50' : 'bg-white text-emerald-600 border-emerald-600 hover:bg-emerald-50'
                                }`}>
                                Mark as {bus.availability ? 'Unavailable' : 'Available'}
                              </button>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                  <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
                    <button onClick={handleSaveAvailability}
                      disabled={isSavingAvailability || !selectedDate || availability.length === 0}
                      className="flex items-center gap-3 px-8 py-4 bg-[#264b8d] text-white rounded-xl font-bold hover:bg-[#1e3a6d] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                      {isSavingAvailability ? <><Loader className="w-5 h-5 animate-spin" />Saving...</> : <><Save className="w-5 h-5" />Save Changes</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 py-16 border-t border-slate-800 mt-12">
            <div className="w-full px-6 lg:px-10">
              <div className="grid md:grid-cols-4 gap-12 mb-12">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-[#264b8d] p-2 rounded-xl"><BusIcon className="w-6 h-6 text-white" /></div>
                    <span className="text-xl font-bold text-white">QuickSeat</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">Making bus travel simple, comfortable and accessible for everyone.</p>
                </div>
                {[
                  { title: 'Company',  links: ['About Us', 'Careers', 'Press', 'Blog'] },
                  { title: 'Support',  links: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'] },
                  { title: 'Contact',  links: ['support@quickseat.com', '1-800-QUICKSEAT', 'Available 24/7'] },
                ].map(({ title, links }) => (
                  <div key={title}>
                    <h4 className="font-bold text-white mb-4">{title}</h4>
                    <ul className="space-y-3">
                      {links.map((l) => <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-400">© 2026 QuickSeat. All rights reserved.</p>
                <div className="flex items-center gap-6">
                  {['Twitter', 'Facebook', 'Instagram', 'LinkedIn'].map((s) => (
                    <a key={s} href="#" className="text-slate-400 hover:text-white transition-colors">{s}</a>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* ── Bus Registration Modal ────────────────────────────────────────────── */}
      {showBusModal && (
        <BusRegistrationModal
          onClose={() => setShowBusModal(false)}
          onSuccess={fetchBuses}
        />
      )}
    </div>
  );
}