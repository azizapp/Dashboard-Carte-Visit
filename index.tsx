import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to load application.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// تسجيل Service Worker لتمكين ميزة PWA
// تم تحسين المنطق لمنع محاولات التسجيل عبر النطاقات المختلفة التي تسبب أخطاء CORS
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
  window.addEventListener('load', () => {
    // استخدام مسار نسبي صارم لضمان توافق المنشأ
    const swUrl = './sw.js';
    
    // محاولة التسجيل فقط إذا كان النطاق الحالي هو المسموح به (تجنب التحميل من ai.studio في غير محله)
    navigator.serviceWorker.register(swUrl, { scope: './' })
      .then(registration => {
        console.log('Service Worker successfully registered with scope:', registration.scope);
      })
      .catch(error => {
        // تسجيل تحذير فقط لضمان عدم توقف التطبيق في حال فشل تسجيل PWA
        console.warn('Service Worker registration skipped or failed:', error.message);
      });
  });
}