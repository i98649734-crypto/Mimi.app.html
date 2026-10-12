/* =====================================================================
   УТИЛИТЫ И НЕДОСТАЮЩИЕ ФУНКЦИИ
   ===================================================================== */

// === Приветствие в зависимости от времени суток ===
function timeOfDayGreeting(){
  const hour = new Date().getHours();
  if (hour < 6) return { text: 'Добрую ночь', emoji: '🌙' };
  if (hour < 12) return { text: 'Доброе утро', emoji: '🌅' };
  if (hour < 17) return { text: 'Добрый день', emoji: '☀️' };
  if (hour < 21) return { text: 'Добрый вечер', emoji: '🌆' };
  return { text: 'Добрую ночь', emoji: '🌙' };
}

// === Мотивирующие советы (ротируются по дате) ===
const MOTIVATIONAL_TIPS = [
  '💡 Маленький шаг каждый день — и через месяц ты не узнаешь сам себя',
  '🎯 Начни с одного предмета, потом добавь второй — так проще',
  '🔥 Серия в 5 дней — это уже привычка, а привычка — это сила',
  '⚡ Ошибки — это сигналы, где нужна работа. Не смущайся ими',
  '📚 За каждым правильным ответом стоит понимание. Ты его точно найдёшь',
  '✨ Сегодня ты лучше, чем вчера — просто потому что ты здесь',
  '🚀 Экзамен — это финиш, а ты сейчас на тренировке. Веди себя как чемпион',
  '💪 Не знаешь? Попробуй. Не получилось? Почитай разбор. Разобрался? Молодец!',
];

// === Экранирование HTML ===
function escapeHtml(text){
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(c){ return map[c]; });
}

// === Экранирование для атрибутов ===
function escapeAttr(text){
  return escapeHtml(text).replace(/"/g, '&quot;');
}

// === Рендер математических формул KaTeX ===
function renderMath(container){
  if (typeof renderMathInElement !== 'function') return;
  try {
    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false }
      ],
      throwOnError: false
    });
  } catch (e) {
    console.log('KaTeX render error:', e);
  }
}

// === Анимация заполнения полос (XP, прогресс) ===
function animateFillsIn(container, selector){
  selector = selector || '.xp-fill, .subject-fill';
  const fills = container.querySelectorAll(selector);
  fills.forEach(function(fill){
    const target = parseFloat(fill.dataset.target) || 0;
    let current = 0;
    const interval = setInterval(function(){
      current += (target - current) * 0.15;
      if (current > target - 0.5) { current = target; clearInterval(interval); }
      fill.style.width = current + '%';
    }, 16);
  });
}

// === Анимация счётчиков ===
function animateCountUps(container){
  const counters = container.querySelectorAll('.count-up');
  counters.forEach(function(el){
    const target = parseInt(el.dataset.target, 10) || 0;
    const prefix = el.dataset.prefix || '';
    const empty = el.dataset.empty || '';
    const duration = 800;
    const steps = 30;
    const stepDuration = duration / steps;
    let current = 0;
    let step = 0;
    const increment = target / steps;
    
    const timer = setInterval(function(){
      step++;
      current = Math.round(increment * step);
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = target === 0 ? empty : (prefix + current);
    }, stepDuration);
  });
}

// === Tilt эффект при наведении (3D наклон карточек) ===
function attachTilt(container, selector){
  if (typeof Tilt !== 'undefined') {
    const els = container.querySelectorAll(selector);
    els.forEach(function(el){ new Tilt(el, { scale: 1.02, maxTilt: 15 }); });
    return;
  }
  // Fallback без библиотеки
  const els = container.querySelectorAll(selector);
  els.forEach(function(el){
    el.addEventListener('mousemove', function(e){
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const xPercent = (x / rect.width) - 0.5;
      const yPercent = (y / rect.height) - 0.5;
      el.style.transform = 'perspective(1000px) rotateY(' + (xPercent * 5) + 'deg) rotateX(' + (yPercent * -5) + 'deg)';
    });
    el.addEventListener('mouseleave', function(){
      el.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
    });
  });
}

// === МЕНЕДЖЕР ТЕМ ===
const ThemeManager = {
  current: { theme: 'dark', accent: 'emerald' },
  
  set: function(theme, accent){
    this.current.theme = theme;
    this.current.accent = accent;
    this.apply(theme, accent);
    // Сохраняем в localStorage
    localStorage.setItem('ai-tutor-theme', theme);
    localStorage.setItem('ai-tutor-accent', accent);
    // Отправляем на backend
    Api.post('/api/settings/theme', { theme: theme, accent: accent }).catch(function(){});
  },
  
  apply: function(theme, accent){
    const html = document.documentElement;
    html.dataset.theme = theme || 'dark';
    html.dataset.accent = accent || 'emerald';
  },
  
  load: function(){
    const savedTheme = localStorage.getItem('ai-tutor-theme') || 'dark';
    const savedAccent = localStorage.getItem('ai-tutor-accent') || 'emerald';
    this.apply(savedTheme, savedAccent);
    this.current = { theme: savedTheme, accent: savedAccent };
  }
};

// === МЕНЕДЖЕР ЗВУКА ===
const SoundManager = {
  enabled: true,
  sounds: {},
  
  init: function(){
    this.enabled = localStorage.getItem('ai-tutor-sound') !== 'false';
  },
  
  play: function(name){
    if (!this.enabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (name === 'correct') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (name === 'incorrect') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 400;
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (name === 'levelup') {
        const freqs = [523.25, 659.25, 783.99];
        freqs.forEach(function(freq, i){
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.2);
          osc.start(audioCtx.currentTime + i * 0.1);
          osc.stop(audioCtx.currentTime + i * 0.1 + 0.2);
        });
      }
    } catch (e) {
      console.log('Web Audio not supported');
    }
  },
  
  setEnabled: function(enabled){
    this.enabled = enabled;
    localStorage.setItem('ai-tutor-sound', enabled ? 'true' : 'false');
  }
};

// === МОДУЛЬ ОНБОРДИНГА ===
const Onboarding = {
  steps: [
    {
      icon: '👋',
      title: 'Добро пожаловать в AI Tutor Pro!',
      text: 'Это твой личный ИИ-репетитор. Он поможет тебе готовиться к экзаменам 🚀'
    },
    {
      icon: '📚',
      title: 'Выбирай предметы',
      text: 'В разделе «Обучение» есть все 11 предметов. Начни с самого слабого — система адаптируется под тебя'
    },
    {
      icon: '⚡',
      title: 'Решай быстрые квизы',
      text: 'Переменка — это 5, 10 или 15 вопросов вперемешку. Отлично для разминки и повышения уровня'
    },
    {
      icon: '🏆',
      title: 'Соревнись и поднимайся',
      text: 'XP, уровни, стрики, таблица лидеров — вся геймификация здесь. Ты сможешь! 💪'
    }
  ],
  
  currentStep: 0,
  
  start: function(){
    this.currentStep = 0;
    this.show();
  },
  
  show: function(){
    const step = this.steps[this.currentStep];
    if (!step) {
      this.finish();
      return;
    }
    const overlay = document.getElementById('onboarding-overlay');
    if (!overlay) return;
    document.getElementById('ob-icon').textContent = step.icon;
    document.getElementById('ob-title').textContent = step.title;
    document.getElementById('ob-text').textContent = step.text;
    
    const dotsContainer = document.getElementById('ob-dots');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < this.steps.length; i++) {
      const dot = document.createElement('span');
      dot.className = i === this.currentStep ? 'active' : '';
      dotsContainer.appendChild(dot);
    }
    
    overlay.classList.add('show');
  },
  
  next: function(){
    this.currentStep++;
    if (this.currentStep < this.steps.length) {
      this.show();
    } else {
      this.finish();
    }
  },
  
  finish: function(){
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) overlay.classList.remove('show');
  }
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function(){
  ThemeManager.load();
  SoundManager.init();
});
