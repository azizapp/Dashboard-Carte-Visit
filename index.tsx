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

// Enregistrement du Service Worker pour activer la fonctionnalité PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Utilisation d'un chemin relatif pour sw.js
    const swUrl = 'sw.js';

    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker enregistré avec succès, périmètre :', registration.scope);
      })
      .catch(error => {
        console.warn('Échec de l\'enregistrement du Service Worker :', error.message || error);
      });
  });
}

// Ajout du bouton d'installation PWA
let deferredPrompt: any;

window.addEventListener('beforeinstallprompt', (e) => {
  // Empêcher l'apparition de la fenêtre d'installation automatique
  e.preventDefault();
  // Sauvegarder l'événement pour une utilisation ultérieure
  deferredPrompt = e;

  // Afficher le bouton d'installation personnalisé
  showInstallButton();
});

function showInstallButton() {
  const existingButton = document.getElementById('pwa-install-button');
  if (existingButton) return;

  const installButton = document.createElement('button');
  installButton.id = 'pwa-install-button';
  installButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    <span>Installer l'application</span>
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
      // Afficher la fenêtre d'installation
      deferredPrompt.prompt();
      // Attendre le choix de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Réponse de l'utilisateur à l'invite d'installation : ${outcome}`);
      // Supprimer le bouton après l'installation
      installButton.remove();
      deferredPrompt = null;
    }
  });

  document.body.appendChild(installButton);
}