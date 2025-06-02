import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [avatar, setAvatar] = useState('');
  const [userStats, setUserStats] = useState({
    routesCount: 0,
    topicsCount: 0,
    commentsCount: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/auth');
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      
      try {
        // Получаем статистику пользователя
        const [routesRes, topicsRes, commentsRes, allTopicsRes, allCommentsRes] = await Promise.all([
          axios.get(`http://localhost:3000/routes?userId=${parsedUser.id}`),
          axios.get(`http://localhost:3000/topics?authorId=${parsedUser.id}`),
          axios.get(`http://localhost:3000/comments?userId=${parsedUser.id}`),
          axios.get('http://localhost:3000/topics'),
          axios.get('http://localhost:3000/comments')
        ]);

        // Статистика
        setUserStats({
          routesCount: routesRes.data.length,
          topicsCount: topicsRes.data.length,
          commentsCount: commentsRes.data.length
        });

        // Последняя активность
        const activities = [];
        
        // Добавляем последний созданный маршрут
        if (routesRes.data.length > 0) {
          const latestRoute = routesRes.data.sort((a, b) => 
            new Date(b.created) - new Date(a.created))[0];
          activities.push({
            type: 'route',
            text: `Создал маршрут "${latestRoute.name}"`,
            date: latestRoute.created
          });
        }

        // Добавляем последнюю созданную тему
        if (topicsRes.data.length > 0) {
          const latestTopic = topicsRes.data.sort((a, b) => 
            new Date(b.created) - new Date(a.created))[0];
          activities.push({
            type: 'topic',
            text: `Опубликовал тему "${latestTopic.title}"`,
            date: latestTopic.created
          });
        }

        // Добавляем последний комментарий
        if (commentsRes.data.length > 0) {
          const latestComment = commentsRes.data.sort((a, b) => 
            new Date(b.created) - new Date(a.created))[0];
          
          // Находим тему, к которой относится комментарий
          const relatedTopic = allTopicsRes.data.find(t => t.id === latestComment.topicId);
          const topicTitle = relatedTopic ? relatedTopic.title : 'неизвестной теме';
          
          activities.push({
            type: 'comment',
            text: `Добавил комментарий в теме "${topicTitle}"`,
            date: latestComment.created
          });
        }

        // Сортируем всю активность по дате
        setRecentActivity(
          activities.sort((a, b) => new Date(b.date) - new Date(a.date))
        );

      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result;
        setAvatar(newAvatar);
        updateAvatar(newAvatar);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateAvatar = async (newAvatar) => {
    try {
      const updatedUser = { ...user, avatar: newAvatar };
      await axios.put(`http://localhost:3000/users/${user.id}`, updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  if (isLoading) return <div className="loading">Загрузка данных...</div>;
  if (!user) return <div>Пользователь не найден</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Личный кабинет</h1>
        <button onClick={handleLogout} className="logout-btn">Выйти</button>
      </div>
      
      <div className="profile-info">
        <div className="avatar-section">
          <img 
            src={avatar || user.avatar || 'https://via.placeholder.com/150'} 
            alt="Аватар" 
            className="avatar"
          />
          <label htmlFor="avatar-upload" className="avatar-upload-label">
            <i className="fas fa-camera"></i> Изменить фото
          </label>
          <input 
            id="avatar-upload" 
            type="file" 
            accept="image/*" 
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="user-details">
          <h2>{user.name}</h2>
          <p><i className="fas fa-envelope"></i> {user.email}</p>
          <p><i className="fas fa-calendar-alt"></i> Участник с {formatDate(user.joined)}</p>
        </div>
      </div>
      
      <div className="user-stats">
        <div className="stat-card">
          <h3>Созданные маршруты</h3>
          <p>{userStats.routesCount}</p>
        </div>
        <div className="stat-card">
          <h3>Темы на форуме</h3>
          <p>{userStats.topicsCount}</p>
        </div>
        <div className="stat-card">
          <h3>Комментарии</h3>
          <p>{userStats.commentsCount}</p>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>Последняя активность</h3>
        {recentActivity.length > 0 ? (
          <ul>
            {recentActivity.map((activity, index) => (
              <li key={index}>
                {activity.text} - {formatDate(activity.date)}
              </li>
            ))}
          </ul>
        ) : (
          <p>Активность не найдена</p>
        )}
      </div>
    </div>
  );
};

export default UserProfile;