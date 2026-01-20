import { useState } from 'react'
import { LandingPage, SignUp, SignIn } from './components'
import { PassengerDashboard } from './components/PassengerDashboard/PassengerDashboard'
import { useAuth } from './contexts/AuthContext'
import type { SearchData } from './components/PassengerDashboard/PassengerDashboard'
import './App.css'

function App() {
  const { currentUser, userProfile, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'signin' | 'signup' | 'operator' | 'dashboard' | 'profile' | 'bookings'>('landing');

  const handleSignIn = () => {
    setCurrentView('signin');
  };

  const handleSignUp = () => {
    setCurrentView('signup');
  };

  const handleOperatorLogin = () => {
    setCurrentView('operator');
    console.log('Navigate to Operator Login');
    // TODO: Implement operator login navigation
  };

  const handleSearch = (data: SearchData) => {
    console.log('Search data:', data);
    // TODO: Implement search results view
  };

  const handleViewProfile = () => {
    setCurrentView('profile');
    // TODO: Implement profile view
  };

  const handleViewBookings = () => {
    setCurrentView('bookings');
    // TODO: Implement bookings view
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentView('landing');
  };

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#264b8d] mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if user is authenticated
  if (currentUser) {
    return (
      <PassengerDashboard
        onSearch={handleSearch}
        onLogout={handleLogout}
        onViewProfile={handleViewProfile}
        onViewBookings={handleViewBookings}
      />
    );
  }

  // Render based on current view
  if (currentView === 'signup') {
    return <SignUp onSignIn={handleSignIn} />;
  }

  if (currentView === 'signin') {
    return <SignIn onSignUp={handleSignUp} />;
  }

  return (
    <LandingPage 
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onOperatorLogin={handleOperatorLogin}
    />
  )
}

export default App
