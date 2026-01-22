import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { LandingPage, SignUp, SignIn, OperatorDashboard, UpdateAvailability } from './components'
import { PassengerDashboard } from './components/PassengerDashboard/PassengerDashboard'
import { SeatSelection } from './components/SeatSelection/SeatSelection'
import { Payment } from './components/Payment'
import { BookingConfirmation } from './components/BookingConfirmation'
import { MyBookings } from './components/MyBookings'
import { UserProfile } from './components/UserProfile'
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
    navigate('/profile');
  };

  const handleViewBookings = () => {
    navigate('/my-bookings');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleOperatorLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleUpdateBus = (busData?: any) => {
    console.log('Update Bus:', busData);
    // TODO: Implement bus update view
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
              onUpdateBus={handleUpdateBus}
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

      {/* Alias route for passenger dashboard */}
      <Route 
        path="/passenger" 
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

      {/* Seat Selection - Protected Route */}
      <Route 
        path="/select-seat" 
        element={
          currentUser ? (
            <SeatSelection />
          ) : (
            <Navigate to="/signin" replace />
          )
        } 
      />

      {/* Payment - Protected Route */}
      <Route 
        path="/payment" 
        element={
          currentUser ? (
            <Payment />
          ) : (
            <Navigate to="/signin" replace />
          )
        } 
      />

      {/* Booking Confirmation - Protected Route */}
      <Route 
        path="/booking-confirmation" 
        element={
          currentUser ? (
            <BookingConfirmation />
          ) : (
            <Navigate to="/signin" replace />
          )
        } 
      />

      {/* My Bookings - Protected Route */}
      <Route 
        path="/my-bookings" 
        element={
          currentUser ? (
            <MyBookings />
          ) : (
            <Navigate to="/signin" replace />
          )
        } 
      />

      {/* User Profile - Protected Route */}
      <Route 
        path="/profile" 
        element={
          currentUser ? (
            <UserProfile />
          ) : (
            <Navigate to="/signin" replace />
          )
        } 
      />

      {/* Update Availability - Protected Route for Operators */}
      <Route 
        path="/update-availability" 
        element={
          currentUser && userProfile?.role === 'operator' ? (
            <UpdateAvailability />
          ) : currentUser ? (
            <Navigate to="/dashboard" replace />
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
