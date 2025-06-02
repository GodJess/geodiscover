import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css'


const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Логика входа
        const response = await axios.get('http://localhost:3000/users');
        const user = response.data.find(u => u.email === formData.email && u.password === formData.password);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userId', user.id);
          navigate('/profile');
        } else {
          alert('Неверные учетные данные');
        }
      } else {
        // Логика регистрации
        const newUser = {
          ...formData,
          id: Date.now(),
          avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 50)}.jpg`,
          joined: new Date().toISOString().split('T')[0]
        };
        await axios.post('http://localhost:3000/users', newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        navigate('/profile');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <div className="auth-container">
      <div className="logo">
        <i className="fas fa-map-marked-alt"></i>
        <span>GeoDiscover</span>
      </div>
      
      {isLogin ? (
        <div id="loginForm">
          <h1>Вход в аккаунт</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="loginEmail">Email</label>
              <input 
                type="email" 
                id="loginEmail" 
                name="email"
                placeholder="Ваш email" 
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="loginPassword">Пароль</label>
              <input 
                type="password" 
                id="loginPassword" 
                name="password"
                placeholder="Ваш пароль" 
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <button type="submit" className="btn">Войти</button>
          </form>
          
          <div className="switch-form">
            Нет аккаунта? <a href="#" onClick={() => setIsLogin(false)}>Зарегистрироваться</a>
          </div>
        </div>
      ) : (
        <div id="registerForm">
          <h1>Создать аккаунт</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="regName">Имя</label>
              <input 
                type="text" 
                id="regName" 
                name="name"
                placeholder="Ваше имя" 
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="regEmail">Email</label>
              <input 
                type="email" 
                id="regEmail" 
                name="email"
                placeholder="Ваш email" 
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="regPassword">Пароль</label>
              <input 
                type="password" 
                id="regPassword" 
                name="password"
                placeholder="Придумайте пароль" 
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <button type="submit" className="btn">Зарегистрироваться</button>
          </form>
          
          <div className="switch-form">
            Уже есть аккаунт? <a href="#" onClick={() => setIsLogin(true)}>Войти</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;