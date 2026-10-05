import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const navRegister = () => {
    navigate('/register');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await authService.login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-text">Welcome back</h2>

        {error && (
          <div className="mb-4 text-sm text-danger bg-danger/10 border border-danger/30 px-3 py-2 rounded">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            className="w-full p-3 rounded bg-surface-2 border border-border text-text placeholder-muted focus:outline-none focus:border-accent"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full p-3 rounded bg-surface-2 border border-border text-text placeholder-muted focus:outline-none focus:border-accent"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full p-3 bg-accent text-bg rounded-full text-base font-semibold hover:bg-accent-hover transition-colors"
          >
            Login
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          Don't have an account?{' '}
          <button type="button" className="text-accent hover:underline" onClick={navRegister}>
            Register
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
