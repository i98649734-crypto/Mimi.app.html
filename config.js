// === AI TUTOR PRO CONFIG ===
// Замени API_BASE_URL на адрес своего backend-а

const CONFIG = {
  // При локальной разработке
  API_BASE_URL_DEV: 'http://localhost:8000',
  
  // При боевом деплое на Vercel
  API_BASE_URL_PROD: '',
  
  // Автоопределение
  get API_BASE_URL() {
    return window.location.hostname === 'localhost' 
      ? this.API_BASE_URL_DEV 
      : this.API_BASE_URL_PROD;
  }
};

// Экспорт для использования в index.html
// Замени строку: const API_BASE_URL = 'https://YOUR-API-DOMAIN.example';
// На:          const API_BASE_URL = CONFIG.API_BASE_URL;
