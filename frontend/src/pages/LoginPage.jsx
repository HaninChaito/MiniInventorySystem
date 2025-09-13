import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, selectAuthStatus, selectAuthError, selectIsAuthenticated } from '../features/auth/authSlice';
import './LoginPage.css';
function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get data from the Redux store
  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (authStatus !== 'loading') {
      dispatch(login({ email, password }));
    }
  };

  // Effect to redirect the user if they are successfully authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products'); // Or to a dashboard, e.g., navigate(-1) to go back
    }
  }, [isAuthenticated, navigate]);

  return (
   <div className="login-container">
  <h2>Login</h2>
  <form onSubmit={handleSubmit}>
    <div>
      <label htmlFor="email">Email:</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>
    <div>
      <label htmlFor="password">Password:</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>
    
    {authStatus === 'loading' && <p>Logging in...</p>}
    {authStatus === 'failed' && <p className="error-msg">{authError}</p>}
    
    <button type="submit" disabled={authStatus === 'loading'}>
      {authStatus === 'loading' ? 'Please wait...' : 'Login'}
    </button>
  </form>
  <p>
    Don't have an account? <Link to="/signup">Sign Up</Link>
  </p>
</div>

  );
}

export default LoginPage;