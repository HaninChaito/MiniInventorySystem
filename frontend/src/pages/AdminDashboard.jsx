import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchStats } from '../features/stats/statsSlice'; // Make sure this path is correct

// Import the necessary components from the charting library
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from 'recharts';

// Import the CSS for styling
import './AdminDashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();

  // Get all stats data from the Redux store in one go
  const {
    totalValue,
    averagePrice,
    priceRange,
    categoryCounts,
    outOfStock,
    topExpensive,
    recentProducts,
    status,
    error,
  } = useSelector((state) => state.stats);

  // The efficient useEffect hook to fetch data only when needed
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchStats());
    }
  }, [status, dispatch]);

  // --- Step 1: Handle the loading and failed states first ---
  // This is a "guard clause" for your entire component.
  if (status === 'loading') {
    return <p style={{ textAlign: 'center', fontSize: '1.5rem', marginTop: '50px' }}>Loading Dashboard...</p>;
  }

  if (status === 'failed') {
    return <p style={{ color: 'red', textAlign: 'center', fontSize: '1.2rem', marginTop: '50px' }}>Error: {error}</p>;
  }

  // --- Step 2: Render the main dashboard structure ---
  // The content inside will only be shown if the status is 'succeeded' or 'idle'.
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Admin Analytics Dashboard</h1>

      {/* --- Step 3: The Wrapper Fix --- */}
      {/* Only render the data-dependent parts if the status is 'succeeded' */}
      {status === 'succeeded' && (
        <>
          <div className="summary-cards">
            {/* It is now safe to call .toFixed() and access .min/.max */}
            <div className="card">💰 Total Inventory Value: <strong>${totalValue.toFixed(2)}</strong></div>
            <div className="card">📉 Average Product Price: <strong>${averagePrice.toFixed(2)}</strong></div>
            <div className="card">📊 Price Range: <strong>${priceRange.min} - ${priceRange.max}</strong></div>
          </div>

          <div className="charts">
            <div className="chart-box">
              <h3>🧺 Product Count per Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryCounts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip cursor={{fill: 'rgba(122, 50, 145, 0.1)'}} />
                  <Bar dataKey="count" fill="#7a3291" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-box">
              <h3>💸 Top 5 Most Expensive Products</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topExpensive} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 12}} />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="price" fill="#da7b93" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lists-grid">
            <section className="card-section">
              <h3>❌ Out of Stock Products</h3>
              {outOfStock.length === 0 ? (
                <p>All products are in stock 🎉</p>
              ) : (
                <div className="card-grid">
                  {outOfStock.map((p) => (
                    <div className="product-card-small" key={p.id}>
                      <h4>{p.name}</h4>
                      <p>Category: {p.category}</p>
                      <p>Price: ${Number(p.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="card-section">
              <h3>🆕 Recently Added Products</h3>
              {recentProducts.length === 0 ? (
                <p>No new products added recently.</p>
              ) : (
                
                <div className="card-grid">
                   
                  {recentProducts.map((p) => (
                    <div className="product-card-small" key={p.id}>
                      <h4>{p.name}</h4>
                      <p>Price: ${Number(p.price).toFixed(2)}</p>
                      <p>Added on: {new Date(p.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;