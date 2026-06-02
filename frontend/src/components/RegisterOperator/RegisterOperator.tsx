import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Calendar, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function RegisterOperator() {
  const navigate = useNavigate();
  const { registerOperator } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerOperator({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      alert(`Operator account created for ${formData.fullName}.`);
      navigate('/operator');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Failed to create operator account.');
    } finally {
      setLoading(false);
    }
  };

  const operatorFields = [
    { label: 'Full Name', field: 'fullName', type: 'text', placeholder: 'John Doe' },
    { label: 'Email Address', field: 'email', type: 'email', placeholder: 'you@example.com' },
    { label: 'Phone Number', field: 'phone', type: 'tel', placeholder: '+94 71 234 5678' },
  ] as const;

  return (
    <div className="w-full px-6 lg:px-10 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/operator')}
            className="text-[#264b8d] hover:text-[#1e3a6d] font-semibold mb-2 flex items-center gap-2"
          >
          </button>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Register Operator</h1>
          <p className="text-slate-600">Create an Account for operator .</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-[#264b8d] rounded"></div>
              <h2 className="text-xl font-bold text-slate-900">Operator Details</h2>
            </div>
            
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {operatorFields.map(({ label, field, type, placeholder }) => (
                <div key={field as string}>
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                    <Calendar className="w-4 h-4 text-[#264b8d]" />
                    {label}
                  </label>
                  <input
                    type={type}
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dfae6b]"
                  />
                </div>
              ))}

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Bus className="w-4 h-4 text-[#264b8d]" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full px-4 pr-11 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dfae6b]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                  <Bus className="w-4 h-4 text-[#264b8d]" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className="w-full px-4 pr-11 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#dfae6b]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-slate-50 px-0 py-0 border-t border-slate-200 pt-6 flex flex-col sm:flex-row sm:justify-end gap-4">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/operator')}
                  className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-[#264b8d] text-white rounded-xl font-semibold hover:bg-[#1e3a6d] hover:shadow-lg transition-all disabled:opacity-60"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saving...' : 'Register Operator'}
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}