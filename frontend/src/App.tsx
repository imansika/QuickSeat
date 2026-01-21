import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { LandingPage, SignUp, SignIn, OperatorDashboard } from './components'
import { PassengerDashboard } from './components/PassengerDashboard/PassengerDashboard'
import { useAuth } from './contexts/AuthContext'
import type { SearchData } from './components/PassengerDashboard/PassengerDashboard'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const { currentUser, userProfile, loading, signOut } = useAuth();

  // Helper function to get dashboard route based on user role
  const getDashboardRoute = () => {
    if (!userProfile) return '/dashboard';
    return userProfile.role === 'operator' ? '/operator' : '/dashboard';
  };

  const handleSearch = (data: SearchData) => {
    console.log('Search data:', data);
    // TODO: Implement search results view
  };

  const handleViewProfile = () => {
    console.log('View Profile');
    // TODO: Implement profile view
  };

  const handleViewBookings = () => {
    console.log('View Bookings');
    // TODO: Implement bookings view
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleOperatorLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleBusRegistration = () => {
    console.log('Bus Registration');
    // TODO: Implement bus registration view
  };

  const handleUpdateBus = (busData?: any) => {
    console.log('Update Bus:', busData);
    // TODO: Implement bus update view
  };

  const handleUpdateAvailability = () => {
    console.log('Update Availability');
    // TODO: Implement availability update view
  };

  const handleRevenueReports = () => {
    console.log('Revenue Reports');
    // TODO: Implement revenue reports view
  };

  const handleTripHistory = () => {
    console.log('Trip History');
    // TODO: Implement trip history view
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

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage onSignIn={() => navigate('/signin')} onSignUp={() => navigate('/signup')} onOperatorLogin={() => navigate('/signin')} />} />
      
      {/* Auth Routes */}
      <Route path="/signin" element={<SignIn onSignUp={() => navigate('/signup')} />} />
      <Route path="/signup" element={<SignUp onSignIn={() => navigate('/signin')} />} />
      
      {/* Operator Dashboard - Protected Route for Operators */}
      <Route 
        path="/operator" 
        element={
          currentUser && userProfile?.role === 'operator' ? (
            <OperatorDashboard
              onLogout={handleOperatorLogout}
              onBusRegistration={handleBusRegistration}
              onUpdateBus={handleUpdateBus}
              onUpdateAvailability={handleUpdateAvailability}
              onRevenueReports={handleRevenueReports}
              onTripHistory={handleTripHistory}
            />
          ) : currentUser && userProfile?.role !== 'operator' ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/signin" replace />
          )
        } 
      />
      
      {/* Passenger Dashboard - Protected Route */}
      <Route 
        path="/dashboard" 
        element={
          currentUser ? (
            userProfile?.role === 'operator' ? (
              <Navigate to="/operator" replace />
            ) : (
              <PassengerDashboard
                onSearch={handleSearch}
                onLogout={handleLogout}
                onViewProfile={handleViewProfile}
                onViewBookings={handleViewBookings}
              />
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        } 
      />
      
      {/* Redirect authenticated users from landing to appropriate dashboard */}
      {currentUser && userProfile && (
        <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
      )}
    </Routes>
  );
}

export default App
