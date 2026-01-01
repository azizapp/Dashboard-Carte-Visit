import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
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
// يعمل على localhost (http) والإنتاج (https)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = '/sw.js';

    navigator.serviceWorker.register(swUrl, { scope: '/' })
      .then(registration => {
        console.log('Service Worker successfully registered with scope:', registration.scope);
      })
      .catch(error => {
        console.warn('Service Worker registration failed:', error.message);
      });
  });
}

// إضافة زر التثبيت للـ PWA
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  // منع ظهور نافذة التثبيت التلقائية
  e.preventDefault();
  // حفظ الحدث للاستخدام لاحقاً
  deferredPrompt = e;

  // إظهار زر التثبيت المخصص
  showInstallButton();
});

function showInstallButton() {
  const installButton = document.createElement('button');
  installButton.id = 'pwa-install-button';
  installButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    <span>ثبّت التطبيق</span>
  `;
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 50px;
    cursor: pointer;
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 20px rgba(79, 70, 229, 0.4);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s ease;
  `;

  installButton.addEventListener('mouseenter', () => {
    installButton.style.transform = 'translateY(-2px)';
    installButton.style.boxShadow = '0 6px 25px rgba(79, 70, 229, 0.5)';
  });

  installButton.addEventListener('mouseleave', () => {
    installButton.style.transform = 'translateY(0)';
    installButton.style.boxShadow = '0 4px 20px rgba(79, 70, 229, 0.4)';
  });

  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      // إظهار نافذة التثبيت
      deferredPrompt.prompt();
      // انتظار اختيار المستخدم
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      // إخفاء الزر بعد التثبيت
      installButton.remove();
      deferredPrompt = null;
    }
  });

  document.body.appendChild(installButton);
}