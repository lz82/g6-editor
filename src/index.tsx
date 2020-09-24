import React from 'react';
import ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Home from './pages/home';
import 'normalize.css/normalize.css';
import './styles/index.less';

ReactDOM.render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      <Home />
    </DndProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
