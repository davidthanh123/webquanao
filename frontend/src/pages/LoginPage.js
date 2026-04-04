// src/pages/LoginPage.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      loginUser(res.data.token, res.data.user);
      toast.success(`Chào mừng ${res.data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className="lx-wrap">
      {/* LEFT PANEL */}
      <div className="lx-left">
        <div className="lx-brand">
          <p className="lx-brand-name">Fashion<br />Store</p>
          <p className="lx-brand-sub">Haute Couture Collection</p>
        </div>
        <div className="lx-quote">
          <p className="lx-quote-text">"Style is a way to say who you are without having to speak."</p>
          <div className="lx-quote-line"></div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lx-right">
        <div className="lx-form-wrap">
          <div className="lx-ornament">
            <div className="lx-ornament-line"></div>
            <div className="lx-ornament-diamond"></div>
            <div className="lx-ornament-line"></div>
          </div>

          <h2 className="lx-heading">Đăng Nhập</h2>
          <p className="lx-sub">Chào mừng trở lại</p>

          <form onSubmit={handleSubmit}>
            <div className="lx-field">
              <label className="lx-label">Email</label>
              <input
                className="lx-input"
                type="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="lx-field">
              <label className="lx-label">Mật khẩu</label>
              <input
                className="lx-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div className="lx-forgot">
              <a href="#">Quên mật khẩu?</a>
            </div>
            <button type="submit" className="lx-btn-primary" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
            </button>
          </form>

          <div className="lx-divider">
            <div className="lx-divider-line"></div>
            <span className="lx-divider-text">Hoặc</span>
            <div className="lx-divider-line"></div>
          </div>

          <div className="lx-social-row">
            <a
              href="https://webquanao-production.up.railway.app/api/auth/google"
              className="lx-btn-social lx-btn-google"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987z"/>
                <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21z"/>
                <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.24 5.35l4.037-3.082z"/>
              </svg>
              Google
            </a>
            <a
              href="https://webquanao-production.up.railway.app/api/auth/facebook"
              className="lx-btn-social lx-btn-facebook"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>

          <p className="lx-switch">
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}