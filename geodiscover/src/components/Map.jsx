import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import '../styles/App.css';
import Header from './Header';

// Импорт иконок для маркеров
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Компонент для обработки событий карты
const MapEvents = ({ addPlace, isAuthenticated }) => {
  useMapEvents({
    dblclick(e) {
      if (isAuthenticated) {
        const name = prompt('Введите название места:');
        if (name) {
          const type = prompt('Выберите тип места (attraction/park/cafe):');
          if (['attraction', 'park', 'cafe'].includes(type)) {
            const description = prompt('Введите описание места:');
            if (description) {
              addPlace({
                coords: [e.latlng.lat, e.latlng.lng],
                name,
                type,
                description
              });
            }
          } else {
            alert('Неверный тип места! Допустимые значения: attraction, park, cafe');
          }
        }
      } else {
        alert('Для добавления мест необходимо авторизоваться!');
      }
    }
  });
  return null;
};

// Создание кастомных иконок
const createCustomIcon = (type) => {
  const colors = {
    attraction: '#e63946',
    park: '#2a9d8f',
    cafe: '#457b9d'
  };
  
  const icons = {
    attraction: 'landmark',
    park: 'tree',
    cafe: 'coffee'
  };
  
  const iconClass = icons[type] || 'map-marker-alt';
  const color = colors[type] || '#6c757d';
  
  return L.divIcon({
    html: `<i class="fas fa-${iconClass}" style="color: ${color}; font-size: 24px;"></i>`,
    iconSize: [30, 30],
    className: 'custom-icon'
  });
};

const Map = () => {
  const [places, setPlaces] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [routeMode, setRouteMode] = useState(false);
  const [routePoints, setRoutePoints] = useState([]);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const user = localStorage.getItem('user');
    setIsAuthenticated(!!user);
  }, []);

  // Инициализация иконок
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl,
      iconUrl: iconUrl,
      shadowUrl: shadowUrl,
    });
  }, []);

  // Загрузка мест
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await axios.get('http://localhost:3000/places');
        setPlaces(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке мест:', error);
      }
    };
    fetchPlaces();
  }, []);

  // Добавление нового места
  const addPlace = async (place) => {
    try {
      const newPlace = {
        ...place,
        id: Date.now()
      };
      
      // Добавляем в базу данных
      await axios.post('http://localhost:3000/places', newPlace);
      
      // Обновляем состояние
      setPlaces([...places, newPlace]);
      
      alert(`Место "${newPlace.name}" успешно добавлено!`);
    } catch (error) {
      console.error('Ошибка при добавлении места:', error);
      alert('Не удалось добавить место');
    }
  };

  // Обработчик клика по маркеру в режиме построения маршрута
  const handleMarkerClick = (place) => {
    if (routeMode) {
      setRoutePoints([...routePoints, place.coords]);
      if (routePoints.length >= 1) {
        alert(`Маршрут построен от (${routePoints[0]}) до (${place.coords})`);
        setRouteMode(false);
        setRoutePoints([]);
      }
    }
  };

  // Фильтрация мест
  const filteredPlaces = filter === 'all' ? places : places.filter(place => place.type === filter);

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      <div className='MapBlocks'>
        <Header />
      </div>
      <div className='MapBlocksMain'>
        <MapContainer 
          center={[59.93428, 30.3351]} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Обработчик событий карты */}
          <MapEvents addPlace={addPlace} isAuthenticated={isAuthenticated} />
          
          {/* Отображение мест */}
          {filteredPlaces.map(place => (
            <Marker 
              key={place.id}
              position={place.coords}
              icon={createCustomIcon(place.type)}
              eventHandlers={{
                click: () => handleMarkerClick(place)
              }}
            >
              <Popup>
                <b>{place.name}</b><br />
                {place.description}
                {isAuthenticated && (
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => deletePlace(place.id)}>Удалить</button>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
          
          {/* Отображение маршрута (если есть точки) */}
          {routePoints.length > 0 && (
            <Polyline 
              positions={routePoints} 
              color="blue"
              dashArray="5, 5"
            />
          )}
        </MapContainer>
        
        {/* Панель управления */}
        <div className="map-controls">
          <button className="control-btn" onClick={() => setFilter('all')}>
            <i className="fas fa-layer-group"></i> Все места
          </button>
          <button className="control-btn" onClick={() => setFilter('attraction')}>
            <i className="fas fa-landmark"></i> Достопримечательности
          </button>
          <button className="control-btn" onClick={() => setFilter('park')}>
            <i className="fas fa-tree"></i> Парки
          </button>
          <button className="control-btn" onClick={() => setFilter('cafe')}>
            <i className="fas fa-coffee"></i> Кафе
          </button>
          <button 
            className={`control-btn ${routeMode ? 'active' : ''}`}
            onClick={() => {
              setRouteMode(!routeMode);
              setRoutePoints([]);
            }}
          >
            <i className="fas fa-route"></i> 
            {routeMode ? 'Отменить построение' : 'Построить маршрут'}
          </button>
          {routeMode && (
            <div className="route-instruction">
              Кликните на две точки для построения маршрута
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Map;