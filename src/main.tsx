import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('ShorePay: main.tsx is executing');
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.setAttribute('data-loaded', 'true');
}

if ((import.meta as any).env?.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
