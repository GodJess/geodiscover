import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import '../styles/App.css'
import Header from './Header';

const Library = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('http://localhost:3000/articles');
        setArticles(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке статей:', error);
      }
    };
    
    fetchArticles();
  }, []);

  const visitsOptions = {
    series: [{
      name: 'Посещения',
      data: [30, 40, 35, 50, 49, 60, 70, 91, 125, 110, 95, 130]
    }],
    chart: {
      height: 350,
      type: 'line',
      zoom: { enabled: false },
      toolbar: { show: false }
    },
    colors: ['#4361ee'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    title: {
      text: 'Посещаемость статей по месяцам',
      align: 'left',
      style: { fontSize: '16px', fontWeight: '600' }
    },
    grid: {
      row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 }
    },
    xaxis: {
      categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    },
    tooltip: {
      y: { formatter: (val) => `${val} тыс. посещений` }
    }
  };

  const categoriesOptions = {
    series: [44, 55, 41, 17, 15],
    chart: { type: 'donut', height: 350 },
    colors: ['#4361ee', '#4895ef', '#4cc9f0', '#3f37c9', '#560bad'],
    labels: ['История', 'Архитектура', 'Музеи', 'Парки', 'Кафе'],
    title: {
      text: 'Популярные категории статей',
      align: 'left',
      style: { fontSize: '16px', fontWeight: '600' }
    },
    responsive: [{
      breakpoint: 480,
      options: { chart: { width: 200 }, legend: { position: 'bottom' } }
    }],
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Всего просмотров',
              color: '#333',
              formatter: (w) => `${w.globals.seriesTotals.reduce((a, b) => a + b, 0)}k`
            }
          }
        }
      }
    }
  };

  return (
    <div className="library-container">
        < Header />
      <h1>Библиотека знаний</h1>
      
      <div className="stats-section">
        <h2>Статистика посещений</h2>
        <div className="chart-container">
          <Chart options={visitsOptions} series={visitsOptions.series} type="line" height={350} />
        </div>
        <div className="chart-container">
          <Chart options={categoriesOptions} series={categoriesOptions.series} type="donut" height={350} />
        </div>
      </div>
      
      <div className="articles-grid">
        {articles.map(article => (
          <div className="article-card" key={article.id}>
            <div className="article-img">
              <img src={article.image} alt={article.title} />
            </div>
            <div className="article-content">
              <h3>{article.title}</h3>
              <p>{article.content}</p>
              <a href="https://traveller-eu.ru/sankt-peterburg" className="read-more">Читать далее →</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;