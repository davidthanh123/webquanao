// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'fashionstore_secret_key_2025';

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Không có token, truy cập bị từ chối' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ admin mới có quyền' });
    next();
  });
};

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };