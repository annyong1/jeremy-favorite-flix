import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import { MainView } from './components/main-view/main-view';
import Container from 'react-bootstrap/Container';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Container>
    <MainView />
  </Container>
);


