import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      await login(response.data.accessToken);
      toast.success('Welcome back!');
      const from = location.state?.from || '/';
      navigate(from);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to login');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background ambient glows */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, var(--primary-color) 0%, transparent 70%)', opacity: 0.15, filter: 'blur(60px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, var(--secondary-color) 0%, transparent 70%)', opacity: 0.15, filter: 'blur(60px)', zIndex: 0 }} />

      <div className="glass-panel auth-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', zIndex: 1, border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', marginBottom: '16px', boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)' }}>
            <LogIn size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.95rem' }}>Sign in to continue to your dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ position: 'relative' }}>
            <Mail size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: focusedInput === 'email' ? 'var(--primary-color)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
            <input 
              type="email" 
              className="input-field" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              style={{ paddingLeft: '48px', height: '52px', border: focusedInput === 'email' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', boxShadow: focusedInput === 'email' ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none', transition: 'all 0.2s' }}
              required 
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={20} style={{ position: 'absolute', left: '16px', top: '16px', color: focusedInput === 'password' ? 'var(--primary-color)' : 'var(--text-muted)', transition: 'color 0.2s' }} />
            <input 
              type="password" 
              className="input-field" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              style={{ paddingLeft: '48px', height: '52px', border: focusedInput === 'password' ? '1px solid var(--primary-color)' : '1px solid var(--border-color)', boxShadow: focusedInput === 'password' ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none', transition: 'all 0.2s' }}
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '0.75rem', height: '52px', fontSize: '1.05rem', fontWeight: 600, background: 'linear-gradient(to right, var(--primary-color), #818cf8)', border: 'none', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)', transition: 'all 0.3s' }}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-muted" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" state={{ from: location.state?.from }} style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'none', marginLeft: '4px' }}>Create one here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
