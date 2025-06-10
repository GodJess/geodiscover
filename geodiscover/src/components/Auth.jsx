import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';
import './Auth.css'

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
        const response = await axios.post('http://127.0.0.1:8000/login/', {
          email: formData.email,
          password: formData.password
        });
        
        const user = response.data;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userId', user.id);
        navigate('/profile');
      } else {
        // Логика регистрации
        const response = await axios.post('http://127.0.0.1:8000/register/', {
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        if(response.data != null){
          const user = response.data;

          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('userId', user.id);
          navigate('/profile');
        }

      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.response?.data?.error || 'Произошла ошибка. Пожалуйста, попробуйте снова.');
    }
  };

  const switchForm = (e, isLoginForm) => {
    e.preventDefault();
    setIsLogin(isLoginForm);
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="auth-container">
      <div className="logo">
        <i className="fas fa-map-marked-alt"></i>
        <span>GeoDiscover</span>
      </div>
      
      {isLogin ? (
        <div className="auth-form" id="loginForm">
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
            
            <button type="submit" className="btn btn-primary">Войти</button>
          </form>
          
          <div className="switch-form">
            Нет аккаунта?{' '}
            <button 
              type="button" 
              className="link-btn" 
              onClick={(e) => switchForm(e, false)}
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
      ) : (
        <div className="register-form">
          <h1 className="register-form__title">Создать аккаунт</h1>
          <form className="register-form__content" onSubmit={handleSubmit}>
            <div className="register-form__field">
              <label className="register-form__label" htmlFor="regName">Имя</label>
              <input
                className="register-form__input"
                type="text"
                id="regName"
                name="name"
                placeholder="Ваше имя"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="register-form__field">
              <label className="register-form__label" htmlFor="regEmail">Email</label>
              <input
                className="register-form__input"
                type="email"
                id="regEmail"
                name="email"
                placeholder="Ваш email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            
            <div className="register-form__field">
              <label className="register-form__label" htmlFor="regPassword">Пароль</label>
              <input
                className="register-form__input"
                type="password"
                id="regPassword"
                name="password"
                placeholder="Придумайте пароль"
                required
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            
            <button type="submit" className="btn btn-primary">
              Зарегистрироваться
            </button>
          </form>
          
          <div className="register-form__footer">
            Уже есть аккаунт?{' '}
            <button
              type="button"
              className="register-form__switch"
              onClick={(e) => switchForm(e, true)}
            >
              Войти
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auth;