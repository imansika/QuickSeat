import { useState } from 'react';
import { X, Hash, Users, MapPin, Clock, Calendar, Save } from 'lucide-react';
import { registerBus } from '../../services/bus.service';

interface BusRegistrationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const sriLankanCities = [
  'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo',
  'Trincomalee', 'Batticaloa', 'Anuradhapura', 'Polonnaruwa',
  'Nuwara Eliya', 'Matara', 'Kurunegala', 'Ratnapura', 'Badulla',
];

export function BusRegistrationModal({ onClose, onSuccess }: BusRegistrationModalProps) {
  const [formData, setFormData] = useState({
    busNumber: '', routeNumber: '', origin: '', destination: '',
    seatCapacity: '', layoutType: '2x2', departureTime: '',
    operatingDays: 'daily', ratePerKm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const set = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.busNumber.trim()) e.busNumber = 'Bus number is required';
    if (!formData.routeNumber.trim()) e.routeNumber = 'Route number is required';
    if (!formData.origin) e.origin = 'Origin is required';
    if (!formData.destination) e.destination = 'Destination is required';
    if (!formData.seatCapacity || parseInt(formData.seatCapacity) < 1) e.seatCapacity = 'Valid seat capacity is required';
    if (!formData.layoutType) e.layoutType = 'Layout type is required';
    if (!formData.departureTime) e.departureTime = 'Departure time is required';
    if (!formData.ratePerKm || parseFloat(formData.ratePerKm) < 1) e.ratePerKm = 'Valid rate per km is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await registerBus(formData);
      alert(`Bus ${formData.busNumber} registered successfully!`);
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      alert(`Failed to register bus: ${msg || 'Please try again'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] transition-all ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200'
    }`;

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 bg-[#264b8d] rounded" />
      <h3 className="text-xl font-bold text-slate-900">{children}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Register New Bus</h2>
            <p className="text-slate-600 text-sm mt-1">Add a new bus with route and schedule information</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {/* Bus Details */}
          <div className="mb-8">
            <SectionTitle>Bus Details</SectionTitle>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Hash className="w-4 h-4 text-[#264b8d]" /> Bus Number
                </label>
                <input type="text" value={formData.busNumber} onChange={(e) => set('busNumber', e.target.value)}
                  placeholder="e.g., EL-2456" className={inputCls('busNumber')} />
                {errors.busNumber && <p className="text-red-600 text-sm mt-1">{errors.busNumber}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Hash className="w-4 h-4 text-[#264b8d]" /> Route Number
                </label>
                <input type="text" value={formData.routeNumber} onChange={(e) => set('routeNumber', e.target.value)}
                  placeholder="e.g., 138, 245" className={inputCls('routeNumber')} />
                {errors.routeNumber && <p className="text-red-600 text-sm mt-1">{errors.routeNumber}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Users className="w-4 h-4 text-[#264b8d]" /> Seat Capacity
                </label>
                <input type="number" value={formData.seatCapacity} onChange={(e) => set('seatCapacity', e.target.value)}
                  placeholder="e.g., 40" min="1" className={inputCls('seatCapacity')} />
                {errors.seatCapacity && <p className="text-red-600 text-sm mt-1">{errors.seatCapacity}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  Layout Type
                </label>
                <select value={formData.layoutType} onChange={(e) => set('layoutType', e.target.value)}
                  className={`${inputCls('layoutType')} bg-white`}>
                  <option value="2x2">2x2</option>
                  <option value="1x3">1x3</option>
                  <option value="1x2">1x2</option>
                  <option value="3x1">3x1</option>
                </select>
                {errors.layoutType && <p className="text-red-600 text-sm mt-1">{errors.layoutType}</p>}
              </div>
            </div>
          </div>

          {/* Route Information */}
          <div className="mb-8">
            <SectionTitle>Route Information</SectionTitle>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 text-[#264b8d]" /> Origin
                </label>
                <select value={formData.origin} onChange={(e) => set('origin', e.target.value)}
                  className={`${inputCls('origin')} bg-white`}>
                  <option value="">Select origin city</option>
                  {sriLankanCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.origin && <p className="text-red-600 text-sm mt-1">{errors.origin}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="w-4 h-4 text-[#264b8d]" /> Destination
                </label>
                <select value={formData.destination} onChange={(e) => set('destination', e.target.value)}
                  className={`${inputCls('destination')} bg-white`}>
                  <option value="">Select destination city</option>
                  {sriLankanCities.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.destination && <p className="text-red-600 text-sm mt-1">{errors.destination}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Clock className="w-4 h-4 text-[#264b8d]" /> Departure Time
                </label>
                <input type="time" value={formData.departureTime} onChange={(e) => set('departureTime', e.target.value)}
                  className={inputCls('departureTime')} />
                {errors.departureTime && <p className="text-red-600 text-sm mt-1">{errors.departureTime}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <span className="text-[#264b8d] font-bold">Rs.</span> Rate per 1km
                </label>
                <input type="number" value={formData.ratePerKm} onChange={(e) => set('ratePerKm', e.target.value)}
                  placeholder="e.g., 12" min="1" step="0.5" className={inputCls('ratePerKm')} />
                {errors.ratePerKm && <p className="text-red-600 text-sm mt-1">{errors.ratePerKm}</p>}
              </div>
            </div>
          </div>

          {/* Operating Schedule */}
          <div className="mb-8">
            <SectionTitle>Operating Schedule</SectionTitle>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
              <Calendar className="w-4 h-4 text-[#264b8d]" /> Operating Days
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              {(['daily', 'weekdays', 'weekends'] as const).map((day) => (
                <button key={day} type="button" onClick={() => set('operatingDays', day)}
                  className={`p-4 rounded-xl border-2 font-semibold transition-all capitalize ${
                    formData.operatingDays === day
                      ? 'border-[#264b8d] bg-[#264b8d]/10 text-[#264b8d]'
                      : 'border-slate-200 text-slate-700 hover:border-[#264b8d]/50'
                  }`}
                >
                  {day}
                  <p className="text-xs font-normal mt-1 text-slate-600">
                    {day === 'daily' ? 'All days of the week' : day === 'weekdays' ? 'Monday to Friday' : 'Saturday & Sunday'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button type="button" onClick={onClose}
              className="flex-1 px-6 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#264b8d] text-white rounded-xl font-semibold hover:bg-[#1e3a6d] hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <Save className="w-5 h-5" />
              {isSubmitting ? 'Registering...' : 'Register Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}