import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../services/api';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      getMe().then(res => {
        loginUser(token, res.data);
        navigate('/');
      }).catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, []);

  return <div style={{textAlign:'center', marginTop:100}}>Đang đăng nhập...</div>;
}