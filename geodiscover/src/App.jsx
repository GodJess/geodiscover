import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home.jsx';
import Auth from './components/Auth.jsx';
import Forum from './components/Forum.jsx';
import Library from './components/Library.jsx';
import Map from './components/Map.jsx';
import RoutesPage from './components/Routes.jsx';
import UserProfile from './components/UserProfile.jsx';
import './styles/App.css';
import Topic from './components/Topic.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/library" element={<Library />} />
        <Route path="/map" element={<Map />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/topic/:id" element={<Topic />} />
      </Routes>
    </Router>
  );
}

export default App;