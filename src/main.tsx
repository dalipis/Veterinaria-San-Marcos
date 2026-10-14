import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../assets/css/style.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);