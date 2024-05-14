import React, { useContext } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import { useAuth } from './contexts/authContext';
import Login from './components/auth/login/Login';

const App = () => {
  const {currentUser} = useAuth();
  console.log(currentUser)

  return (
    <>
      {currentUser ? <Dashboard /> : <Login/> }
    </>
  )
}

export default App;
