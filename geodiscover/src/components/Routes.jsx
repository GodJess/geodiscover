import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/App.css';
import Header from './Header';
import { useNavigate } from 'react-router-dom';

const RoutesPage = () => {
  const [routes, setRoutes] = useState([]);
  const [places, setPlaces] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeDistance, setRouteDistance] = useState('');
  const [routeDuration, setRouteDuration] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesRes, placesRes] = await Promise.all([
          axios.get('http://localhost:3000/routes'),
          axios.get('http://localhost:3000/places')
        ]);
        setRoutes(routesRes.data);
        setPlaces(placesRes.data);
        
        // Проверяем авторизацию пользователя
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };
    
    fetchData();
  }, []);

  const getRouteCoordinates = (route) => {
    return route.places.map(placeId => {
      const place = places.find(p => p.id === placeId);
      return place ? place.coords : null;
    }).filter(Boolean);
  };

  const getIcon = (type) => {
    const icons = {
      attraction: 'landmark',
      park: 'tree',
      cafe: 'coffee'
    };
    return icons[type] || 'map-marker-alt';
  };

  const getColor = (type) => {
    const colors = {
      attraction: '#e63946',
      park: '#2a9d8f',
      cafe: '#457b9d'
    };
    return colors[type] || '#6c757d';
  };

  const handlePlaceClick = (placeId) => {
    if (!isCreatingRoute) return;
    
    setSelectedPlaces(prev => {
      if (prev.includes(placeId)) {
        return prev.filter(id => id !== placeId);
      } else {
        return [...prev, placeId];
      }
    });
  };

  const handleCreateRoute = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setIsCreatingRoute(true);
    setSelectedPlaces([]);
    setRouteName('');
    setRouteDistance('');
    setRouteDuration('');
  };

  const handleSaveRoute = async () => {
    if (!routeName || selectedPlaces.length === 0) {
      alert('Пожалуйста, укажите название маршрута и выберите хотя бы одно место');
      return;
    }

    try {
      const newRoute = {
        name: routeName,
        places: selectedPlaces,
        distance: routeDistance || 'Не указано',
        duration: routeDuration || 'Не указано',
        created: new Date().toISOString().split('T')[0],
        userId: user.id
      };

      const response = await axios.post('http://localhost:3000/routes', newRoute);
      setRoutes([...routes, response.data]);
      setIsCreatingRoute(false);
      setSelectedRoute(response.data);
    } catch (error) {
      console.error('Ошибка при создании маршрута:', error);
    }
  };

  const handleCancelCreate = () => {
    setIsCreatingRoute(false);
    setSelectedPlaces([]);
  };

  return (
    <div>
      <Header />
      <div className="routes-container">
        <h1>Маршруты по Петербургу</h1>

        {isCreatingRoute && (
          <div className="route-form">
            <h2>Создание нового маршрута</h2>
            <div className="form-group">
              <label>Название маршрута:</label>
              <input 
                type="text" 
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="Введите название"
              />
            </div>
            <div className="form-group">
              <label>Расстояние (км):</label>
              <input 
                type="text" 
                value={routeDistance}
                onChange={(e) => setRouteDistance(e.target.value)}
                placeholder="Пример: 3.5"
              />
            </div>
            <div className="form-group">
              <label>Длительность:</label>
              <input 
                type="text" 
                value={routeDuration}
                onChange={(e) => setRouteDuration(e.target.value)}
                placeholder="Пример: 2 часа"
              />
            </div>
            <p>Выберите места на карте (кликните по маркеру):</p>
            <p>Выбрано мест: {selectedPlaces.length}</p>
            <div className="form-actions">
              <button onClick={handleSaveRoute} className="save-btn">
                Сохранить маршрут
              </button>
              <button onClick={handleCancelCreate} className="cancel-btn">
                Отмена
              </button>
            </div>
          </div>
        )}

        <div className="routes-list">
          {routes.map(route => (
            <div 
              key={route.id} 
              className={`route-card ${selectedRoute?.id === route.id ? 'active' : ''}`}
              onClick={() => setSelectedRoute(route)}
            >
              <h3>{route.name}</h3>
              <p>Расстояние: {route.distance}</p>
              <p>Длительность: {route.duration}</p>
              <p>Создан: {route.created}</p>
            </div>
          ))}
        </div>

        <div className="map-wrapper">
          <MapContainer 
            center={[59.93428, 30.3351]} 
            zoom={13} 
            style={{ height: '500px', width: '100%', borderRadius: '10px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {places.map(place => (
              <Marker 
                key={place.id}
                position={place.coords}
                eventHandlers={{
                  click: () => handlePlaceClick(place.id)
                }}
                icon={L.divIcon({
                  html: `<i class="fas fa-${getIcon(place.type)}" 
                         style="color: ${selectedPlaces.includes(place.id) ? '#ff00ff' : getColor(place.type)}; 
                         font-size: 24px;"></i>`,
                  iconSize: [30, 30],
                  className: 'custom-icon'
                })}
              >
                <Popup>
                  <b>{place.name}</b><br />
                  {place.description}
                </Popup>
              </Marker>
            ))}
            
            {selectedRoute && !isCreatingRoute && (
              <Polyline 
                positions={getRouteCoordinates(selectedRoute)} 
                color="#4361ee"
                weight={5}
                opacity={0.7}
              />
            )}

            {isCreatingRoute && selectedPlaces.length > 1 && (
              <Polyline 
                positions={selectedPlaces.map(id => {
                  const place = places.find(p => p.id === id);
                  return place ? place.coords : null;
                }).filter(Boolean)}
                color="#ff00ff"
                weight={5}
                opacity={0.7}
                dashArray="5, 5"
              />
            )}
          </MapContainer>
        </div>

        <button 
          onClick={handleCreateRoute} 
          className="create-route-btn"
          disabled={isCreatingRoute}
        >
          <i className="fas fa-plus"></i> Создать новый маршрут
        </button>
      </div>
    </div>
  );
};

export default RoutesPage;