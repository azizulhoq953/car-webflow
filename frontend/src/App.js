
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './pages/Signup';
import Signing from './pages/Signing';
// import Profile from './pages/Profile';
import Index from './pages/Index';
import Admin from './pages/Admin';
import CreateForum from './pages/CreateForum';


const App = () => {

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/signing" element={<Signing />} />
        <Route path="/create-forum" element={<CreateForum />} />
      </Routes>
    </Router>
  );
};

export default App;
