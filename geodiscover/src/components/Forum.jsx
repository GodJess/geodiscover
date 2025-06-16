import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';
import Header from './Header';
import './Topic.css'

const Forum = () => {
  const [topics, setTopics] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('');
  const [newTopicImage, setNewTopicImage] = useState('');
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [newComment, setNewComment] = useState('');
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
        const [topicsRes, usersRes, commentsRes] = await Promise.all([
          axios.get('http://localhost:3000/topics'),
          axios.get('http://127.0.0.1:8000/getUser/'),
          axios.get('http://localhost:3000/comments')
        ]);
        setTopics(topicsRes.data.sort((a, b) => new Date(b.created) - new Date(a.created)));
        setUsers(usersRes.data);
        setComments(commentsRes.data);
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

  // Получение комментариев для темы
  const getTopicComments = (topicId) => {
    return comments.filter(comment => comment.topicId.toString() === topicId.toString());
  };

  // Увеличение счетчика просмотров при раскрытии темы
  const handleExpandTopic = async (topicId) => {
    try {
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        const updatedTopic = { ...topic, views: (topic.views || 0) + 1 };
        await axios.put(`http://localhost:3000/topics/${topicId}`, updatedTopic);
        setTopics(topics.map(t => t.id === topicId ? updatedTopic : t));
      }
      
      if (expandedTopic === topicId) {
        setExpandedTopic(null);
      } else {
        setExpandedTopic(topicId);
      }
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
        id: `${Date.now()}`,
        title: newTopicTitle,
        content: newTopicContent,
        imageUrl: newTopicImage,
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
      setNewTopicImage('');
      setShowNewTopicForm(false);
      setCurrentPage(1);
      
      alert('Тема успешно создана!');
    } catch (error) {
      console.error('Ошибка при создании темы:', error);
      alert('Не удалось создать тему');
    }
  };

  // Добавление комментария
  const addComment = async (topicId) => {
    if (!isAuthenticated) {
      alert('Для комментирования необходимо авторизоваться!');
      return;
    }

    if (!newComment.trim()) {
      alert('Комментарий не может быть пустым!');
      return;
    }

    try {
      const newCommentObj = {
        id: Date.now(),
        topicId: topicId,
        userId: currentUser.id,
        text: newComment,
        created: new Date().toLocaleString('ru-RU')
      };

      await axios.post('http://localhost:3000/comments', newCommentObj);
      setComments([...comments, newCommentObj]);
      
      // Обновляем счетчик комментариев в теме
      const topic = topics.find(t => t.id === topicId);
      if (topic) {
        const updatedTopic = { ...topic, comments: (topic.comments || 0) + 1 };
        await axios.put(`http://localhost:3000/topics/${topicId}`, updatedTopic);
        setTopics(topics.map(t => t.id === topicId ? updatedTopic : t));
      }
      
      setNewComment('');
    } catch (error) {
      console.error('Ошибка при добавлении комментария:', error);
      alert('Не удалось добавить комментарий');
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
        // Удаляем все комментарии к теме
        const commentsToDelete = comments.filter(c => c.topicId === topicId);
        await Promise.all(commentsToDelete.map(c => 
          axios.delete(`http://localhost:3000/comments/${c.id}`)
        ));
        setComments(comments.filter(c => c.topicId !== topicId));
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
    
    <div className="forum-content">
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
            placeholder="Ссылка на изображение (URL)"
            value={newTopicImage}
            onChange={(e) => setNewTopicImage(e.target.value)}
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
            const topicComments = getTopicComments(topic.id);
            
            return (
              <div className={`topic ${expandedTopic === topic.id ? 'expanded' : ''}`} key={topic.id}>
                <div className="topic-content">
                  <div className="topic-author-info">
                    {author && (
                      <div className="author-avatar-container">
                        <img src={author.avatar} alt="Аватар" className="author-avatar" />
                        <span className="author-name">{author.name}</span>
                      </div>
                    )}
                    <span className="topic-date">{topic.created}</span>
                  </div>
                  
                  <div className="topic-main">
                    <h3 className="topic-title">{topic.title}</h3>
                    <p className="topic-text">{topic.content}</p>
                    
                    {topic.imageUrl && (
                      <div className="topic-image-container">
                        <img src={topic.imageUrl} alt="Изображение к теме" className="topic-image" />
                      </div>
                    )}
                    
                    <div className="topic-tags">
                      {topic.tags && topic.tags.length > 0 && (
                        topic.tags.map(tag => (
                          <span key={tag} className="topic-tag">#{tag}</span>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="topic-actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleExpandTopic(topic.id)}
                    >
                      <i className="far fa-comment"></i> {topic.comments || 0}
                    </button>
                    <span className="action-btn view-count">
                      <i className="far fa-eye"></i> {topic.views || 0}
                    </span>
                    {isAuthenticated && currentUser && currentUser.id === topic.authorId && (
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => deleteTopic(topic.id, topic.authorId)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    )}
                  </div>
                </div>
                
                {expandedTopic === topic.id && (
                  <div className="topic-comments-section">
                    <div className="comments-list">
                      {topicComments.length > 0 ? (
                        topicComments.map(comment => {
                          const commentAuthor = getUserById(comment.userId);
                          return (
                            <div className="comment" key={comment.id}>
                              {commentAuthor && (
                                <div className="comment-author">
                                  <img src={commentAuthor.avatar} alt="Аватар" className="comment-avatar" />
                                  <span className="comment-author-name">{commentAuthor.name}</span>
                                </div>
                              )}
                              <div className="comment-content">
                                <p className="comment-text">{comment.text}</p>
                                <span className="comment-date">{comment.created}</span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="no-comments">Пока нет комментариев</div>
                      )}
                    </div>
                    
                    {isAuthenticated && (
                      <div className="add-comment-form">
                        <textarea
                          placeholder="Напишите комментарий..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <button 
                          className="send-comment-btn"
                          onClick={() => addComment(topic.id)}
                        >
                          Отправить
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-topics">Пока нет тем для обсуждения</div>
        )}
      </div>
      
      {renderPagination()}
    </div>
  </div>
);
};

export default Forum;