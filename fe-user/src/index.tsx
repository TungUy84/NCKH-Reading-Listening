import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Gắn React vào element root của ứng dụng
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  // StrictMode giúp phát hiện lỗi tiềm ẩn trong quá trình phát triển
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
