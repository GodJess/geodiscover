import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';
import Header from './Header';

const Forum = () => {
  const [topics, setTopics] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('');
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const topicsPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    const fetchData = async () => {
      try {
        const [topicsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:3000/topics'),
          axios.get('http://localhost:3000/users')
        ]);
        setTopics(topicsRes.data.sort((a, b) => new Date(b.created) - new Date(a.created)));
        setUsers(usersRes.data);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    
    fetchData();
  }, []);

  const getUserById = (id) => users.find(user => user.id.toString() === id.toString());

  // Пагинация
  const indexOfLastTopic = currentPage * topicsPerPage;
  const indexOfFirstTopic = indexOfLastTopic - topicsPerPage;
  const currentTopics = topics.slice(indexOfFirstTopic, indexOfLastTopic);
  const totalPages = Math.ceil(topics.length / topicsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Увеличение счетчика просмотров при переходе на тему
  const handleTopicClick = async (topicId) => {
    try {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        const updatedTopic = { ...topic, views: (topic.views || 0) + 1 };
        await axios.put(`http://localhost:3000/topics/${topicId}`, updatedTopic);
        setTopics(topics.map(t => t.id === topicId ? updatedTopic : t));
      }
      navigate(`/topic/${topicId}`);
    } catch (error) {
      console.error('Ошибка при обновлении просмотров:', error);
    }
  };

  // Создание новой темы
  const createNewTopic = async () => {
    if (!isAuthenticated) {
      alert('Для создания темы необходимо авторизоваться!');
      return;
    }

    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      alert('Заполните все обязательные поля!');
      return;
    }

    try {
      const tagsArray = newTopicTags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const newTopic = {
        id: Date.now(),
        title: newTopicTitle,
        content: newTopicContent,
        authorId: currentUser.id,
        views: 0,
        comments: 0,
        created: new Date().toLocaleDateString('ru-RU'),
        tags: tagsArray
      };

      await axios.post('http://localhost:3000/topics', newTopic);
      setTopics([newTopic, ...topics]);
      setNewTopicTitle('');
      setNewTopicContent('');
      setNewTopicTags('');
      setShowNewTopicForm(false);
      setCurrentPage(1);
      
      alert('Тема успешно создана!');
    } catch (error) {
      console.error('Ошибка при создании темы:', error);
      alert('Не удалось создать тему');
    }
  };

  // Удаление темы
  const deleteTopic = async (topicId, authorId) => {
    if (!isAuthenticated || currentUser.id !== authorId) {
      alert('Вы можете удалять только свои темы!');
      return;
    }

    if (window.confirm('Вы уверены, что хотите удалить эту тему?')) {
      try {
        await axios.delete(`http://localhost:3000/topics/${topicId}`);
        setTopics(topics.filter(topic => topic.id !== topicId));
        alert('Тема успешно удалена');
      } catch (error) {
        console.error('Ошибка при удалении темы:', error);
        alert('Не удалось удалить тему');
      }
    }
  };

  // Рендер пагинации
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        {currentPage > 1 && (
          <button 
            className="page-link" 
            onClick={() => paginate(currentPage - 1)}
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        )}

        {pageNumbers.map(number => (
          <button
            key={number}
            className={`page-link ${currentPage === number ? 'active' : ''}`}
            onClick={() => paginate(number)}
          >
            {number}
          </button>
        ))}

        {currentPage < totalPages && (
          <button 
            className="page-link" 
            onClick={() => paginate(currentPage + 1)}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="forum-container">
      <Header />
      
      <div className="forum-header">
        <h1>Форум путешественников</h1>
        {isAuthenticated && (
          <button 
            className="new-topic-btn"
            onClick={() => setShowNewTopicForm(!showNewTopicForm)}
          >
            <i className="fas fa-plus"></i> Новая тема
          </button>
        )}
      </div>

      {showNewTopicForm && (
        <div className="new-topic-form">
          <h3>Создание новой темы</h3>
          <input
            type="text"
            placeholder="Заголовок темы*"
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Содержание темы*"
            value={newTopicContent}
            onChange={(e) => setNewTopicContent(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Теги (через запятую)"
            value={newTopicTags}
            onChange={(e) => setNewTopicTags(e.target.value)}
          />
          <div className="form-buttons">
            <button onClick={createNewTopic}>Создать тему</button>
            <button onClick={() => setShowNewTopicForm(false)}>Отмена</button>
          </div>
        </div>
      )}
      
      <div className="topics-list">
        {currentTopics.length > 0 ? (
          currentTopics.map(topic => {
            const author = getUserById(topic.authorId);
            return (
              <div className="topic" key={topic.id}>
                <div className="topic-header">
                  <h3 
                    className="topic-title"
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    {topic.title}
                  </h3>
                  <div className="topic-meta">
                    <span><i className="far fa-eye"></i> {topic.views || 0}</span>
                    <span><i className="far fa-comment"></i> {topic.comments || 0}</span>
                    <span><i className="far fa-clock"></i> {topic.created}</span>
                  </div>
                </div>
                <p className="topic-excerpt">{topic.content}</p>
                <div className="topic-footer">
                  {author && (
                    <div className="topic-author">
                      <img src={author.avatar} alt="Аватар" className="author-avatar" />
                      <span>{author.name}</span>
                    </div>
                  )}
                  <div className="topic-tags">
                    {topic.tags && topic.tags.length > 0 ? (
                      topic.tags.map(tag => (
                        <span key={tag} className="topic-tag">#{tag}</span>
                      ))
                    ) : (
                      <span className="no-tags">Нет тегов</span>
                    )}
                  </div>
                  {isAuthenticated && currentUser && currentUser.id === topic.authorId && (
                    <button 
                      className="delete-topic-btn"
                      onClick={() => deleteTopic(topic.id, topic.authorId)}
                    >
                      <i className="fas fa-trash"></i> Удалить
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-topics">Пока нет тем для обсуждения</div>
        )}
      </div>
      
      {renderPagination()}
    </div>
  );
};

export default Forum;