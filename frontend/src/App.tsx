import { useState } from 'react'
import { LandingPage } from './components'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'signin' | 'signup' | 'operator'>('landing');

  const handleSignIn = () => {
    setCurrentView('signin');
    console.log('Navigate to Sign In');
    // TODO: Implement sign in navigation
  };

  const handleSignUp = () => {
    setCurrentView('signup');
    console.log('Navigate to Sign Up');
    // TODO: Implement sign up navigation
  };

  const handleOperatorLogin = () => {
    setCurrentView('operator');
    console.log('Navigate to Operator Login');
    // TODO: Implement operator login navigation
  };

  return (
    <LandingPage 
      onSignIn={handleSignIn}
      onSignUp={handleSignUp}
      onOperatorLogin={handleOperatorLogin}
    />
  )
}

export default App
