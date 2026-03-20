// src/components/Footer.js
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        {/* Brand */}
        <div className="footer-brand">
          {/* 📷 LOGO FOOTER: Thay text bằng <img src="/images/logo-white.png" alt="Logo" style={{height:36}} /> */}
          <h2 className="footer-logo">Fashion<span>Store</span></h2>
          <p>Thời trang chất lượng, phong cách đẳng cấp. Mua sắm dễ dàng – giao hàng nhanh chóng.</p>
          <div className="footer-socials">
            {/* 📷 ICON MXH: Các icon mạng xã hội */}
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Youtube size={20} /></a>
          </div>
        </div>

        {/* Links */}
        <div className="footer-links">
          <h4>Sản Phẩm</h4>
          <Link to="/products?category=ao-nam">Áo Nam</Link>
          <Link to="/products?category=quan-nam">Quần Nam</Link>
          <Link to="/products?category=ao-nu">Áo Nữ</Link>
          <Link to="/products?category=vay-dam">Váy Đầm</Link>
          <Link to="/products?category=phu-kien">Phụ Kiện</Link>
        </div>

        <div className="footer-links">
          <h4>Hỗ Trợ</h4>
          <a href="#">Chính sách đổi trả</a>
          <a href="#">Hướng dẫn mua hàng</a>
          <a href="#">Chính sách vận chuyển</a>
          <a href="#">Câu hỏi thường gặp</a>
          <a href="#">Liên hệ</a>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h4>Liên Hệ</h4>
          <p><Phone size={14} /> 1800 1234 (Miễn phí)</p>
          <p><Mail size={14} /> support@fashionstore.vn</p>
          <p><MapPin size={14} /> 123 Lê Lợi, Q1, TP.HCM</p>
          <div className="footer-payment">
            <h4 style={{ marginTop: 16, marginBottom: 8 }}>Thanh Toán</h4>
            {/* 📷 ẢNH THANH TOÁN: Logo VISA, Mastercard, Momo, ZaloPay (40x25px mỗi cái) */}
            <div className="payment-icons">
              <span>VISA</span><span>MasterCard</span><span>MoMo</span><span>COD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>© 2025 FashionStore. Tất cả quyền được bảo lưu.</p>
          {/* 📷 ẢNH: Logo Bộ Công Thương (nếu có đăng ký) */}
        </div>
      </div>
    </footer>
  );
}