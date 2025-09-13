import React from 'react';
import { HashRouter, Routes, Route, Navigate  } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Navbar from './components/Navbar';

// --- IMPORT BOTH ROUTE GUARDS ---
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute'; // <-- Import the new one

function App() {
  return (
    <HashRouter>
      <Navbar />
      <main className="main-content" style={{padding: '1rem'}}>
        <Routes>
          {/* --- 1. Public Routes (Everyone can see) --- */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* --- 2. Authenticated Routes (Any logged-in user can see) --- */}
          <Route element={<PrivateRoute />}>
            <Route path="/products" element={<ProductsPage />} />
            {/* If you had a /profile page, it would go here too */}
          </Route>
          
          {/* --- 3. Admin-Only Routes (Only users in the 'Admins' group can see) --- */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminProductsPage />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>
          
          {/* --- 4. Fallback Route --- */}
          <Route 
            path="/" 
            element={localStorage.getItem('accessToken') ? <Navigate to="/products" replace /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </main>
    </HashRouter>
  );
}

export default App;