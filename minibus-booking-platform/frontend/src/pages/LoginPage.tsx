// minibus-booking-platform/frontend/src/pages/LoginPage.tsx
import React, { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './AuthPages.css'; // Shared CSS

const LoginPage: React.FC = () => {
  // Assuming login is via username and password as per typical setup
  // If email is used for login, change 'username' state and field to 'email'
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { login, user: authUser } = useAuth(); // Get login function and user from context
  const navigate = useNavigate();
  const location = useLocation();

  // Determine where to redirect after login
  // If there's a 'from' location in state (e.g., redirected from a protected route), use it
  // Otherwise, default to homepage or a user-specific dashboard
  const from = location.state?.from?.pathname || '/'; 
  // If admin logs in via this page, redirect to admin dashboard
  const redirectTo = authUser?.role === 'admin' ? '/admin/dashboard' : from;


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Both username and password are required.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ username, password }); // Use username for login
      // Check role after login to redirect appropriately
      // Note: authUser might not be updated immediately after login call completes
      // It's better to rely on the role from the user object returned by the login promise if possible,
      // or handle redirection within a useEffect that listens to isAuthenticated changes.
      // For simplicity here, we'll navigate based on the 'from' logic or a default.
      // The AdminProtectedRoute will handle admin role checks for admin routes.
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Redirect if already logged in
  // This is commented out because AdminProtectedRoute handles redirection for admin areas.
  // For general user areas, you might want to redirect from /login if already authenticated.
  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate(redirectTo, { replace: true });
  //   }
  // }, [isAuthenticated, navigate, redirectTo]);


  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        <h2>Login to Your Account</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label> {/* Changed from Email to Username */}
            <input
              type="text" // Changed from email to text
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p className="auth-link">
          Admin? <Link to="/admin/login">Admin Login</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
