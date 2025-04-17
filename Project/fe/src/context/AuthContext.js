import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khởi tạo từ localStorage khi component mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Hàm gọi API và lấy token Bearer, lưu vào localStorage
  const login = async (email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: email, password })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login failed');
      }
      
      const data = await response.json();
      // data.access_token chứa token từ API, data.is_admin chứa flag admin, có thể thêm các thông tin người dùng khác nếu có
      const newUser = { email, isAdmin: data.is_admin };
      setUser(newUser);
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('user', JSON.stringify(newUser));
      navigate('/');
    } catch (error) {
      console.error('Login Error:', error);
      // Xử lý lỗi ở đây, ví dụ hiển thị thông báo cho người dùng
      alert(error.message);
    }
  };

  // Hàm đăng ký tương tự, tùy chỉnh URL nếu cần
  const register = async (email, password) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: email, password, email, full_name: email, phone: '0000000000' })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Register failed');
      }

      // Sau khi đăng ký thành công, có thể tự động đăng nhập
      await login(email, password);
    } catch (error) {
      console.error('Register Error:', error);
      alert(error.message);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
