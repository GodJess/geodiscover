import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faMapMarkedAlt, 
  faLandmark, 
  faTree, 
  faCoffee, 
  faRoute, 
  faLayerGroup,
  faPlus,
  faEye,
  faComment,
  faClock,
  faEnvelope,
  faCalendarAlt,
  faCamera
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faVk, faFacebookF } from '@fortawesome/free-brands-svg-icons';

library.add(
  faMapMarkedAlt,
  faLandmark,
  faTree,
  faCoffee,
  faRoute,
  faLayerGroup,
  faPlus,
  faEye,
  faComment,
  faClock,
  faGoogle,
  faVk,
  faFacebookF,
  faEnvelope,
  faCalendarAlt,
  faCamera
);

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);