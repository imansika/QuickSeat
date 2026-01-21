import React, { useState } from 'react';
import { Eye, EyeOff, Bus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SignInProps {
  onSignUp: () => void;
}

export function SignIn({ onSignUp }: SignInProps) {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithFacebook, userProfile, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    try {
      setLoading(true);
      await signIn(email, password);
      // Wait a bit for userProfile to load, then redirect based on role
      setTimeout(() => {
        const dashboardRoute = userProfile?.role === 'operator' ? '/operator' : '/dashboard';
        navigate(dashboardRoute);
      }, 500);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setLocalError('');
      clearError();
      await signInWithGoogle();
      setTimeout(() => {
        const dashboardRoute = userProfile?.role === 'operator' ? '/operator' : '/dashboard';
        navigate(dashboardRoute);
      }, 500);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);
      setLocalError('');
      clearError();
      await signInWithFacebook();
      setTimeout(() => {
        const dashboardRoute = userProfile?.role === 'operator' ? '/operator' : '/dashboard';
        navigate(dashboardRoute);
      }, 500);
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in with Facebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        {/* Left Side - Creative Design Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#264b8d] to-[#1e3a6d] flex-col items-center justify-center p-8 xl:p-12 relative overflow-hidden">
          {/* Content */}
          <div className="relative z-10 text-center max-w-md">
            {/* Journey Illustration */}
            <div className="flex justify-center mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-[#dfae6b] blur-2xl opacity-30 rounded-full"></div>
                <div className="relative bg-white/20 backdrop-blur-sm p-6 rounded-2xl border-2 border-white/30">
                  <Bus className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Welcome Back to Your
              <span className="block text-[#dfae6b] mt-2">Perfect Journey</span>
            </h1>

            <p className="text-white/90 text-lg mb-12 leading-relaxed">
              Experience seamless bus travel with real-time bookings, smart seat selection, and instant e-tickets.
            </p>

            {/* Stats Cards */}
            <div className="space-y-3 mb-10">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#dfae6b]/20 rounded-xl flex-shrink-0">
                    <svg className="w-6 h-6 text-[#dfae6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">Happy Travelers</p>
                    <p className="text-white/70 text-xs">50K+ Across Sri Lanka</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#dfae6b]/20 rounded-xl flex-shrink-0">
                    <svg className="w-6 h-6 text-[#dfae6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-sm">Routes Available</p>
                    <p className="text-white/70 text-xs">200+ Reliable coverage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="pt-8 border-t border-white/20">
              <p className="text-[#dfae6b] text-sm font-semibold mb-3">Why QuickSeat?</p>
              <div className="flex gap-2 text-white/80 text-xs justify-center flex-wrap">
                <span className="bg-white/10 px-3 py-1 rounded-full">Instant Confirmation</span>
                <span className="bg-white/10 px-3 py-1 rounded-full">Secure Payment</span>
                <span className="bg-white/10 px-3 py-1 rounded-full">24/7 Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Sign In Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            {/* Logo and Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-[#264b8d] p-2 rounded-lg">
                  <Bus className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-2xl font-bold text-[#264b8d]">QuickSeat</span>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-600">Sign in to continue your journey</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {(localError || error) && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {localError || error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-900">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] focus:border-transparent transition"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-900">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#264b8d] focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" strokeWidth={1.5} /> : <Eye className="w-5 h-5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-[#264b8d]" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <a href="#" className="text-sm font-medium text-[#264b8d] hover:underline">
                  Forgot password?
                </a>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#264b8d] hover:bg-[#1e3a6d] text-white font-semibold py-3 rounded-xl transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={handleFacebookSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50 text-slate-700 bg-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
                <span>Facebook</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-slate-600 mt-6">
              Don't have an account?{' '}
              <button onClick={onSignUp} className="font-semibold text-[#264b8d] hover:underline">
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
