import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';


function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="projects/:projectId" element={<ProjectDetail/>} />
        <Route path="/friends" element={<div>Friends Page</div>} />
        <Route path="/contact" element={<div>Contact Page</div>} />
      </Routes>
    </Router>
  );
}

export default App;
