import { hydrateRoot } from 'react-dom/client';
import { App } from './main';
import './styles.css';

hydrateRoot(document.getElementById('root')!, <App />);
