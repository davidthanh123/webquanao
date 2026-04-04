// src/pages/RegisterPage.js
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPages.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Mật khẩu không khớp'); return; }
    if (form.password.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return; }
    setLoading(true);
    try {
      const res = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
      loginUser(res.data.token, res.data.user);
      toast.success('Đăng ký thành công!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'name',            type: 'text',     label: 'Họ và tên',           placeholder: 'Nguyễn Văn A' },
    { key: 'email',           type: 'email',    label: 'Email',               placeholder: 'example@email.com' },
    { key: 'phone',           type: 'tel',      label: 'Số điện thoại',       placeholder: '0901234567', required: false },
    { key: 'password',        type: 'password', label: 'Mật khẩu',            placeholder: 'Tối thiểu 6 ký tự' },
    { key: 'confirmPassword', type: 'password', label: 'Xác nhận mật khẩu',  placeholder: 'Nhập lại mật khẩu' },
  ];

  return (
    <div className="lx-wrap">
      {/* LEFT PANEL */}
      <div className="lx-left">
        <div className="lx-brand">
          <p className="lx-brand-name">Fashion<br />Store</p>
          <p className="lx-brand-sub">Haute Couture Collection</p>
        </div>
        <div className="lx-quote">
          <p className="lx-quote-text">"Fashion is the armor to survive the reality of everyday life."</p>
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

          <h2 className="lx-heading">Tạo Tài Khoản</h2>
          <p className="lx-sub">Tham gia cộng đồng thời trang</p>

          <form onSubmit={handleSubmit}>
            {fields.map(({ key, type, label, placeholder, required = true }) => (
              <div className="lx-field" key={key}>
                <label className="lx-label">{label}</label>
                <input
                  className="lx-input"
                  type={type}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  required={required}
                />
              </div>
            ))}

            <button type="submit" className="lx-btn-primary lx-btn-primary--top" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
            </button>
          </form>

          <p className="lx-switch">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}