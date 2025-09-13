import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signup, confirmSignup, selectAuthStatus, selectAuthError } from '../features/auth/authSlice';

function SignUpPage() {
  // State for the sign-up form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State for the confirmation form
  const [code, setCode] = useState('');
  const [isConfirmationStep, setConfirmationStep] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authStatus = useSelector(selectAuthStatus);
  const authError = useSelector(selectAuthError);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (authStatus === 'loading') return;

    // We use .unwrap() to be able to catch the promise rejection here
    const resultAction = await dispatch(signup({ email, password }));
    if (signup.fulfilled.match(resultAction)) {
      setConfirmationStep(true);
    }
    // If it rejects, the error will be set in the Redux state and displayed
  };

  const handleConfirmation = async (e) => {
    e.preventDefault();
    if (authStatus === 'loading') return;
    
    const resultAction = await dispatch(confirmSignup({ email, code }));
    if (confirmSignup.fulfilled.match(resultAction)) {
      alert('Account confirmed successfully! Please log in.');
      navigate('/login');
    }
  };

  if (isConfirmationStep) {
    return (
      <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Confirm Your Account</h2>
        <p>A confirmation code has been sent to <strong>{email}</strong>. Please check your inbox.</p>
        <form onSubmit={handleConfirmation}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="code">Confirmation Code:</label>
            <input
              id="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
          {authStatus === 'failed' && <p style={{ color: 'red' }}>{authError}</p>}
          <button 
            type="submit" 
            disabled={authStatus === 'loading'}
            style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {authStatus === 'loading' ? 'Confirming...' : 'Confirm Account'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Create an Account</h2>
      <form onSubmit={handleSignUp}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="password">Password (min. 8 characters):</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="8"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {authStatus === 'failed' && <p style={{ color: 'red' }}>{authError}</p>}
        <button 
          type="submit" 
          disabled={authStatus === 'loading'}
          style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {authStatus === 'loading' ? 'Creating...' : 'Sign Up'}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '1rem' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}

export default SignUpPage;