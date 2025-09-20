import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import About from './pages/About';
import RagAnalysis from './pages/RagAnalysis';
import Login from './components/Login';
import Signup from './components/Signup';
import DocumentUpload from './components/DocumentUpload';
import Navbar from './components/Navbar';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to document upload if already logged in)
const PublicRoute = ({ children }) => {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser ? <Navigate to="/document-upload" replace /> : children;
};

function App() {
  return (
    <Router>
      <Navbar/>
      <br /><br /><br />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Authentication Routes - redirect if already logged in */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />

        {/* Protected Routes - require authentication */}
        <Route 
          path="/document-upload" 
          element={
            <ProtectedRoute>
              <DocumentUpload />
            </ProtectedRoute>
          } 
        />

        {/* Existing Routes with Navbar */}
        <Route 
          path="/about" 
          element={
            <>
              <Navbar />
              <About />
            </>
          } 
        />

        {/* Analysis Route - Protected */}
        <Route 
          path="/analysis/*" 
          element={
            <ProtectedRoute>
              <Navbar />
              <RagAnalysis />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
