import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import '../styles/App.css';

const Topic = () => {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
    
    const fetchData = async () => {
      try {
        const [topicRes, usersRes, commentsRes] = await Promise.all([
          axios.get(`http://localhost:3000/topics/${id}`),
          axios.get('http://localhost:3000/users'),
          axios.get(`http://localhost:3000/comments?topicId=${id}`)
        ]);
        
        setTopic(topicRes.data);
        setUsers(usersRes.data);
        setComments(commentsRes.data);
        
        // Увеличиваем счетчик просмотров
        await axios.patch(`http://localhost:3000/topics/${id}`, {
          views: topicRes.data.views + 1
        });
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    
    fetchData();
  }, [id]);

  const getUserById = (userId) => users.find(user => user.id === userId);

  const addComment = async () => {
    if (!isAuthenticated) {
      alert('Для добавления комментария необходимо авторизоваться!');
      return;
    }

    if (!newComment.trim()) {
      alert('Комментарий не может быть пустым!');
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const comment = {
        id: Date.now(),
        topicId: parseInt(id),
        userId: user.id,
        text: newComment,
        created: new Date().toLocaleString()
      };

      await axios.post('http://localhost:3000/comments', comment);
      setComments([...comments, comment]);
      setNewComment('');
      
      // Обновляем счетчик комментариев в теме
      await axios.patch(`http://localhost:3000/topics/${id}`, {
        comments: comments.length + 1
      });
      
      setTopic({
        ...topic,
        comments: comments.length + 1
      });
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
    }
  };

  if (!topic) return <div>Загрузка...</div>;

  return (
    <div className="topic-page">
      <Header />
      
      <div className="topic-container">
        <div className="topic-header">
          <h1>{topic.title}</h1>
          <div className="topic-meta">
            <span><i className="far fa-eye"></i> {topic.views}</span>
            <span><i className="far fa-comment"></i> {topic.comments}</span>
            <span><i className="far fa-clock"></i> {topic.created}</span>
          </div>
        </div>
        
        <div className="topic-content">
          <p>{topic.content}</p>
        </div>
        
        <div className="topic-author">
          {getUserById(topic.authorId) && (
            <>
              <img 
                src={getUserById(topic.authorId).avatar} 
                alt="Аватар автора" 
                className="author-avatar" 
              />
              <span>{getUserById(topic.authorId).name}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="comments-section">
        <h2>Комментарии ({comments.length})</h2>
        
        {isAuthenticated && (
          <div className="add-comment">
            <textarea
              placeholder="Ваш комментарий..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button onClick={addComment}>Отправить</button>
          </div>
        )}
        
        <div className="comments-list">
          {comments.map(comment => {
            const user = getUserById(comment.userId);
            return (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  {user && (
                    <>
                      <img src={user.avatar} alt="Аватар" className="comment-avatar" />
                      <span className="comment-author">{user.name}</span>
                    </>
                  )}
                  <span className="comment-date">{comment.created}</span>
                </div>
                <div className="comment-text">{comment.text}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <Link to="/forum" className="back-link">
        <i className="fas fa-arrow-left"></i> Вернуться к списку тем
      </Link>
    </div>
  );
};

export default Topic;