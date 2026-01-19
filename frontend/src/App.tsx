import { useState } from 'react'
import { LandingPage, SignUp, SignIn } from './components'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'signin' | 'signup' | 'operator'>('landing');

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
