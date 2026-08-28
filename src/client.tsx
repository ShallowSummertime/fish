import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from './main';
import './styles.css';
import './creatures.css';

const root = document.getElementById('root')!;
if (root.hasChildNodes()) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
