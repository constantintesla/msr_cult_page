// Глобальная конфигурация (загружается из API)
let appConfig = null;

// Загрузка конфигурации при старте
async function loadConfig() {
    try {
        const response = await fetch('/api/config');
        appConfig = await response.json();
        
        // Обновляем загадку на странице
        updateRiddle();
    } catch (error) {
        console.error('Ошибка загрузки конфигурации:', error);
    }
}

// Обновление текста загадки
function updateRiddle() {
    if (!appConfig) return;
    
    const riddleContainer = document.getElementById('riddle-container');
    if (riddleContainer) {
        // Преобразуем текст с <br> в строки с оформлением
        const raw = appConfig.riddle.text || '';
        const parts = raw.split(/<br\s*\/?>(\s*)/i).filter(Boolean);
        riddleContainer.innerHTML = parts
            .map((line) => `<div class="riddle-line golden-text">${line}</div>`) 
            .join('');
    }
}

// Кодовый замок
let digits = [0, 0, 0, 0];

function changeDigit(index, direction) {
    digits[index] += direction;
    if (digits[index] > 9) digits[index] = 0;
    if (digits[index] < 0) digits[index] = 9;
    
    document.getElementById(`digit-${index}`).textContent = digits[index];
    
    // Звуковой эффект (визуальный)
    const digitElement = document.getElementById(`digit-${index}`);
    digitElement.style.transform = 'scale(1.2)';
    setTimeout(() => {
        digitElement.style.transform = 'scale(1)';
    }, 100);
}

function checkCode() {
    if (!appConfig) return;
    
    const enteredCode = digits.join('');
    const errorElement = document.getElementById('lock-error');
    
    if (enteredCode === appConfig.lock_code) {
        // Правильный код!
        errorElement.textContent = '';
        const lockScreen = document.getElementById('lock-screen');
        const mainContainer = document.getElementById('main-container');
        
        // Анимация открытия
        lockScreen.style.animation = 'fadeOut 1.5s ease-out';
        setTimeout(() => {
            lockScreen.style.display = 'none';
            // Просто показываем контейнер, а fade-in назначается сервером при рендере (см. unlocked)
            mainContainer.style.display = 'block';
        }, 1500);
    } else {
        // Неправильный код
        errorElement.textContent = '⚠ Врата остаются закрытыми ⚠';
        
        // Тряска контейнера
        const container = document.querySelector('.lock-container');
        container.style.animation = 'shake 0.5s, lockGlow 4s ease-in-out infinite';
        setTimeout(() => {
            container.style.animation = 'lockGlow 4s ease-in-out infinite';
            errorElement.textContent = '';
        }, 2000);
    }
}

function checkAnswer() {
    if (!appConfig) return;
    
    const input = document.getElementById('answer');
    const answer = input.value.trim().toLowerCase();
    const errorMessage = document.getElementById('error-message');
    const questContainer = document.querySelector('.quest-container');
    const secretSection = document.getElementById('secret-section');
    
    if (!answer) {
        errorMessage.textContent = 'Пустота ума ведёт к пустоте кошелька...';
        shakeElement(input);
        return;
    }
    
    // Проверяем с конфигурацией из API
    if (appConfig.riddle.answers.map(a => a.toLowerCase()).includes(answer)) {
        // Правильный ответ!
        errorMessage.textContent = '';
        questContainer.style.animation = 'fadeOut 1s ease-out';
        
        setTimeout(() => {
            questContainer.style.display = 'none';
            // Показываем экран DnD банка и карту
            const gate = document.getElementById('pentagram-gate');
            gate.classList.remove('hidden');
            // Карта должна быть видна для DnD — показываем секцию карты
            const secret = document.getElementById('secret-section');
            secret.classList.remove('hidden');
            // Скрываем символ культа и предупреждение на следующих экранах
            const cs = document.querySelector('.cult-symbol');
            const warn = document.querySelector('.warning');
            if (cs) cs.style.display = 'none';
            if (warn) warn.style.display = 'none';
            playRevealSound();
            
            // Инициализируем карту и DnD
            updateCoordinates();
        // Не создавать карту повторно, если уже создана
        setTimeout(() => {
            initTreasureMapWithDnD();
        }, 200);
        }, 1000);
        
    } else {
        // Неправильный ответ
        errorMessage.textContent = 'Неверно... Ты ещё не постиг природу изобилия.';
        shakeElement(input);
        input.value = '';
        
        // Добавляем визуальный эффект ошибки
        document.body.style.animation = 'flashGold 0.5s';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }
}

// Обновление координат на странице
function updateCoordinates() {
    if (!appConfig) return;
    
    const coordsElement = document.getElementById('map-coordinates');
    if (coordsElement) {
        // По умолчанию держим скрытым
        coordsElement.classList.add('hidden');
        coordsElement.innerHTML = `📍 Координаты Храма: <span class="coords-highlight">${appConfig.coordinates.display}</span>`;
    }
}

function shakeElement(element) {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => {
        element.style.animation = '';
    }, 500);
}

function playRevealSound() {
    // Визуальный эффект вспышки при открытии секрета
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.background = 'rgba(218, 165, 32, 0.4)';
    flash.style.zIndex = '9999';
    flash.style.pointerEvents = 'none';
    flash.style.animation = 'flashReveal 1s ease-out';
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.remove();
    }, 1000);
}

// Добавляем возможность отправки формы по нажатию Enter
const answerInputEl = document.getElementById('answer');
if (answerInputEl) {
    answerInputEl.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});
}

// Добавляем дополнительные анимации в CSS через JavaScript
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from { 
            opacity: 1;
            transform: scale(1);
        }
        to { 
            opacity: 0;
            transform: scale(0.9);
        }
    }
    
    @keyframes flashGold {
        0%, 100% { background-color: transparent; }
        50% { background-color: rgba(184, 134, 11, 0.15); }
    }
    
    @keyframes flashReveal {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
`;
document.head.appendChild(style);


// Создаем жуткие образы на фоне
function createHauntingFigures() {
    const container = document.getElementById('haunting-figures');
    
    const figures = [
        // Силуэт человека
        `<svg width="200" height="300" viewBox="0 0 200 300">
            <ellipse cx="100" cy="50" rx="40" ry="50"/>
            <rect x="70" y="100" width="60" height="120" rx="10"/>
            <rect x="40" y="110" width="30" height="80" rx="8" transform="rotate(-20 55 150)"/>
            <rect x="130" y="110" width="30" height="80" rx="8" transform="rotate(20 145 150)"/>
            <rect x="75" y="210" width="20" height="80" rx="5"/>
            <rect x="105" y="210" width="20" height="80" rx="5"/>
        </svg>`,
        
        // Силуэт с вытянутыми руками
        `<svg width="250" height="280" viewBox="0 0 250 280">
            <ellipse cx="125" cy="40" rx="35" ry="45"/>
            <rect x="100" y="85" width="50" height="100" rx="8"/>
            <rect x="30" y="90" width="70" height="15" rx="7" transform="rotate(-10 65 97)"/>
            <rect x="150" y="90" width="70" height="15" rx="7" transform="rotate(10 185 97)"/>
            <rect x="110" y="180" width="15" height="90" rx="7"/>
            <rect x="125" y="180" width="15" height="90" rx="7"/>
        </svg>`,
        
        // Скрюченная фигура
        `<svg width="180" height="220" viewBox="0 0 180 220">
            <ellipse cx="90" cy="80" rx="35" ry="40"/>
            <path d="M 70 120 Q 50 160 60 200" stroke-width="50" fill="none" stroke="#1a0000"/>
            <rect x="45" y="110" width="25" height="60" rx="12" transform="rotate(-30 57 140)"/>
            <rect x="110" y="110" width="25" height="60" rx="12" transform="rotate(30 122 140)"/>
        </svg>`,
        
        // Высокая тонкая фигура
        `<svg width="150" height="350" viewBox="0 0 150 350">
            <ellipse cx="75" cy="45" rx="30" ry="40"/>
            <rect x="60" y="85" width="30" height="180" rx="15"/>
            <rect x="40" y="100" width="20" height="120" rx="10" transform="rotate(-5 50 160)"/>
            <rect x="90" y="100" width="20" height="120" rx="10" transform="rotate(5 100 160)"/>
            <rect x="62" y="260" width="12" height="80" rx="6"/>
            <rect x="76" y="260" width="12" height="80" rx="6"/>
        </svg>`,
        
        // Фигура с опущенной головой
        `<svg width="190" height="260" viewBox="0 0 190 260">
            <ellipse cx="95" cy="70" rx="35" ry="42" transform="rotate(15 95 70)"/>
            <rect x="70" y="100" width="50" height="100" rx="10"/>
            <rect x="50" y="115" width="25" height="70" rx="8"/>
            <rect x="115" y="115" width="25" height="70" rx="8"/>
            <rect x="80" y="195" width="15" height="60" rx="5"/>
            <rect x="95" y="195" width="15" height="60" rx="5"/>
        </svg>`,
        
        // Коленопреклоненная фигура
        `<svg width="200" height="240" viewBox="0 0 200 240">
            <ellipse cx="100" cy="50" rx="32" ry="38"/>
            <rect x="78" y="88" width="44" height="80" rx="10"/>
            <rect x="60" y="100" width="22" height="55" rx="8" transform="rotate(-15 71 127)"/>
            <rect x="118" y="100" width="22" height="55" rx="8" transform="rotate(15 129 127)"/>
            <rect x="75" y="160" width="18" height="70" rx="9" transform="rotate(45 84 195)"/>
            <rect x="107" y="160" width="18" height="70" rx="9" transform="rotate(-45 116 195)"/>
        </svg>`
    ];
    
    // Создаем 12 фигур в разных позициях
    for (let i = 0; i < 12; i++) {
        const figure = document.createElement('div');
        figure.className = 'figure';
        
        const randomFigure = figures[Math.floor(Math.random() * figures.length)];
        figure.innerHTML = randomFigure;
        
        // Случайная позиция
        const positions = [
            { left: '5%', top: '10%' },
            { left: '15%', top: '60%' },
            { left: '85%', top: '20%' },
            { left: '90%', top: '70%' },
            { left: '10%', top: '80%' },
            { left: '75%', top: '45%' },
            { left: '25%', top: '25%' },
            { left: '60%', top: '15%' },
            { left: '40%', top: '75%' },
            { left: '80%', top: '85%' },
            { left: '20%', top: '40%' },
            { left: '50%', top: '5%' }
        ];
        
        const pos = positions[i];
        figure.style.left = pos.left;
        figure.style.top = pos.top;
        
        // Случайная задержка анимации
        figure.style.animationDelay = `${Math.random() * 15}s`;
        
        // Случайная длительность
        figure.style.animationDuration = `${12 + Math.random() * 8}s`;
        
        container.appendChild(figure);
    }
}

// Создаем плавающие логотипы на фоне
function createFloatingLogos() {
    const container = document.getElementById('floating-logos');
    
    const positions = [
        { left: '10%', top: '15%' },
        { left: '85%', top: '25%' },
        { left: '15%', top: '70%' },
        { left: '80%', top: '75%' },
        { left: '50%', top: '10%' },
        { left: '25%', top: '50%' },
        { left: '70%', top: '50%' }
    ];
    
    positions.forEach((pos, index) => {
        const logoDiv = document.createElement('div');
        logoDiv.className = 'floating-logo';
        
        const img = document.createElement('img');
        // Используем статический путь, чтобы точно находился файл
        img.src = 'static/Флаг Чечевуры PDF.png';
        img.alt = 'Символ Руки Гроха';
        
        logoDiv.appendChild(img);
        logoDiv.style.left = pos.left;
        logoDiv.style.top = pos.top;
        logoDiv.style.animationDelay = `${index * 3}s`;
        logoDiv.style.animationDuration = `${18 + Math.random() * 6}s`;
        
        container.appendChild(logoDiv);
    });
}

// Создаем золотые частицы
function createGoldParticles() {
    const container = document.getElementById('gold-particles');
    
    // Создаём 40 золотых частиц
    for (let i = 0; i < 40; i++) {
        const particle = document.createElement('div');
        particle.className = 'gold-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (12 + Math.random() * 8) + 's';
        container.appendChild(particle);
    }
    
    // Создаём 60 мерцающих звёздочек
    for (let i = 0; i < 60; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'gold-sparkle';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.animationDelay = Math.random() * 3 + 's';
        sparkle.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(sparkle);
    }
}

// Инициализация карты с меткой сокровища
function initTreasureMap() {
    if (!appConfig) return;
    
    // Координаты из конфигурации
    const targetLat = appConfig.coordinates.lat;
    const targetLng = appConfig.coordinates.lng;
    
    // Создаем карту
    if (window.__leafletMap) {
        // Карта уже инициализирована — просто обновим размер и вернём ссылку
        setTimeout(() => window.__leafletMap.invalidateSize(), 50);
        return window.__leafletMap;
    }

    const map = L.map('real-map', {
        center: [targetLat, targetLng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
    });
    // Отключаем все виды зума/жестов
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.touchZoom.disable();
    map.boxZoom.disable();
    map.keyboard.disable();
    map.dragging.disable();
    // Сохраняем глобально ссылку на карту для последующего рисования пентаграммы
    window.__leafletMap = map;
    
    // Добавляем слой OpenStreetMap
    try {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);
    } catch (e) {
        console.error('Ошибка загрузки тайлов OSM:', e);
    }
    
    // После показа контейнера убедимся, что карта знает о своих размерах
    setTimeout(() => map.invalidateSize(), 50);
    // На этапе DnD — не показываем храм и круг, оставляем чистую карту

    // Пентаграмма через DnD: точки появятся после размещения всех пар
}

// Утилита: смещение координаты на заданное расстояние и угол (в метрах/градусах)
function offsetLatLng([lat, lng], distanceMeters, bearingDeg) {
    const R = 6378137; // радиус Земли (м)
    const dByR = distanceMeters / R;
    const bearing = (bearingDeg * Math.PI) / 180;
    const lat1 = (lat * Math.PI) / 180;
    const lng1 = (lng * Math.PI) / 180;
    const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(dByR) + Math.cos(lat1) * Math.sin(dByR) * Math.cos(bearing)
    );
    const lng2 = lng1 + Math.atan2(
        Math.sin(bearing) * Math.sin(dByR) * Math.cos(lat1),
        Math.cos(dByR) - Math.sin(lat1) * Math.sin(lat2)
    );
    return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}

// Удалено: setupPentagramInputs — старая логика ввода пар слов

// Удалено: drawPentagramIfReady — старая отрисовка звезды по вводу

// Экран врат: ввод пар слов → когда все 5 вершин подтверждены, активируем кнопку «ОТКРЫТЬ КАРТУ»
// Удалено: setupPentagramGate — не используется

// --- Новая логика: DnD на карте ---
function initTreasureMapWithDnD() {
    // Гарантируем, что секция карты видима
    const secret = document.getElementById('secret-section');
    if (secret) secret.classList.remove('hidden');

    initTreasureMap();
    const mapContainer = document.getElementById('real-map');
    const slotsLayer = document.getElementById('dnd-slots');
    const bank = document.getElementById('dnd-bank');
    const gate = document.getElementById('pentagram-gate');
    if (gate) gate.classList.remove('hidden');
    if (bank) bank.style.display = 'flex';
    // На этапе DnD скрываем заголовок и текст секции "Путь к Храму"
    if (secret) {
        const title = secret.querySelector('h2.revealed-title');
        const desc = secret.querySelector('.map-instruction');
        if (title) title.style.display = 'none';
        if (desc) desc.style.display = 'none';
    }
    // На экране карты также скрываем символ культа и предупреждение
    const cs = document.querySelector('.cult-symbol');
    const warn = document.querySelector('.warning');
    if (cs) cs.style.display = 'none';
    if (warn) warn.style.display = 'none';

    const pgConfig = appConfig.pentagram || { vertices: [], radius_m: 150 };
    const center = [appConfig.coordinates.lat, appConfig.coordinates.lng];
    const radius = pgConfig.radius_m || 150;
    const vertices = Array.isArray(pgConfig.vertices) ? pgConfig.vertices : [];
    if (vertices.length === 0) {
        console.warn('Нет вершин пентаграммы в конфиге');
    }

    // Создаём 5 внешних и 5 внутренних слотов (внутренние — смещены к центру, повернуты на ~36°)
    // Если заданы координаты слотов в конфиге, используем их (5 outer + 5 inner)
    // Всегда рассчитываем позиции слотов относительно контейнера карты по углам пентаграммы,
    // чтобы блоки не зависели от географических координат
    let approxOuter, approxInner;
    const computeSlotsByAngles = () => {
        const container = window.__leafletMap && window.__leafletMap.getContainer ? window.__leafletMap.getContainer() : null;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const outerRadius = Math.min(rect.width, rect.height) * 0.45; // 45% от меньшей стороны
        const innerFactor = (appConfig.pentagram && appConfig.pentagram.inner_radius_factor) ? appConfig.pentagram.inner_radius_factor : 0.38;
        const innerRadius = outerRadius * innerFactor;

        const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        const toPercent = (x, y) => {
            const lx = (x / rect.width) * 100;
            const ty = (y / rect.height) * 100;
            // Держим точки в видимой области контейнера
            return { left: `${clamp(lx, 4, 96)}%`, top: `${clamp(ty, 4, 96)}%` };
        };

        approxOuter = [];
        approxInner = [];
        const haveDnd = Array.isArray(pgConfig.dnd_points) && pgConfig.dnd_points.length >= 10;
        if (haveDnd && window.__leafletMap) {
            // 0..4 внешние, 5..9 внутренние
            const map = window.__leafletMap;
            for (let i = 0; i < 5; i++) {
                const pOuter = pgConfig.dnd_points[i];
                const pInner = pgConfig.dnd_points[i + 5];
                const ptOuter = map.latLngToContainerPoint([pOuter.lat, pOuter.lng]);
                const ptInner = map.latLngToContainerPoint([pInner.lat, pInner.lng]);
                approxOuter.push(toPercent(ptOuter.x, ptOuter.y));
                approxInner.push(toPercent(ptInner.x, ptInner.y));
            }
        } else {
            const defaultAngles = [-90, -18, 54, 126, 198];
            const useDefault = (!vertices || vertices.length < 5) || vertices.every(v => !v || v.angle_deg === undefined || Number(v.angle_deg) === 0);
            for (let i = 0; i < 5; i++) {
                const baseAng = useDefault ? defaultAngles[i] : ((vertices[i] && typeof vertices[i].angle_deg === 'number') ? vertices[i].angle_deg : defaultAngles[i]);
                const angOuter = (baseAng - 90) * Math.PI / 180; // смещение, чтобы -90 был наверху
                const ox = cx + outerRadius * Math.cos(angOuter);
                const oy = cy + outerRadius * Math.sin(angOuter);
                approxOuter.push(toPercent(ox, oy));

                const angInner = ((baseAng + 36) - 90) * Math.PI / 180; // внутренние смещены на 36°
                const ix = cx + innerRadius * Math.cos(angInner);
                const iy = cy + innerRadius * Math.sin(angInner);
                approxInner.push(toPercent(ix, iy));
            }
        }
    };
    computeSlotsByAngles();
    // (approxOuter/approxInner сформированы выше). Если из конфига не удалось, fallback на дефолт.
    if (!approxOuter || approxOuter.length !== 5 || !approxInner || approxInner.length !== 5) {
        approxOuter = [
            { left: '50%', top: '5%' },
            { left: '94%', top: '24%' },
            { left: '84%', top: '93%' },
            { left: '16%', top: '93%' },
            { left: '6%', top: '24%' }
        ];
        approxInner = [
            { left: '50%', top: '28%' },
            { left: '74%', top: '40%' },
            { left: '62%', top: '76%' },
            { left: '38%', top: '76%' },
            { left: '26%', top: '40%' }
        ];
    }

    // Создаём DOM-слоты
    slotsLayer.innerHTML = '';
    // Пары символов: один и тот же знак для внешней/внутренней точки, но разного цвета
    const pairSymbols = ['✦','✪','☸','☬','☯'];
    const outerColors = ['#ff2b2b','#ff3838','#e61e1e','#ff4d4d','#d91c1c'];
    const innerColors = ['#111111','#222222','#000000','#2b2b2b','#1a1a1a'];
    
    // Проверяем тип шифра для показа номеров
    fetch('/api/cipher/type')
        .then(response => response.json())
        .then(data => {
            const showNumbers = data.cipher_type && data.cipher_type !== 'universal';
            createSlotsWithNumbers(showNumbers);
        })
        .catch((error) => {
            console.error('Error fetching cipher type:', error);
            createSlotsWithNumbers(false);
        });
    
    function createSlotsWithNumbers(showNumbers) {
        // Очищаем слоты перед созданием новых
        slotsLayer.innerHTML = '';
        
        for (let i = 0; i < 5; i++) {
            const slot = document.createElement('div');
            slot.className = 'dnd-slot';
            slot.dataset.index = String(i);
            slot.dataset.type = 'outer';
            const pos = approxOuter[i];
            slot.style.left = pos.left;
            slot.style.top = pos.top;
            const btn = document.createElement('button');
            btn.className = 'slot-btn';
            // Показываем номер для не-универсальных шифров, иначе символ
            const displayText = showNumbers ? (i + 1) : pairSymbols[i % pairSymbols.length];
            btn.textContent = displayText;
            btn.style.color = outerColors[i % outerColors.length];
            btn.setAttribute('aria-label', `Вершина ${i+1}`);
            btn.onclick = () => promptWordForSlot(i, 'outer', vertices);
            slot.appendChild(btn);
            slotsLayer.appendChild(slot);
        }
        for (let i = 0; i < 5; i++) {
            const slot = document.createElement('div');
            slot.className = 'dnd-slot';
            slot.dataset.index = String(i);
            slot.dataset.type = 'inner';
            const pos = approxInner[i];
            slot.style.left = pos.left;
            slot.style.top = pos.top;
            const btn = document.createElement('button');
            btn.className = 'slot-btn';
            // Показываем номер для не-универсальных шифров, иначе символ
            const displayText = showNumbers ? (i + 1) : pairSymbols[i % pairSymbols.length];
            btn.textContent = displayText;
            btn.style.color = innerColors[i % innerColors.length];
            btn.setAttribute('aria-label', `Внутренняя вершина ${i+1}`);
            btn.onclick = () => promptWordForSlot(i, 'inner', vertices);
            slot.appendChild(btn);
            slotsLayer.appendChild(slot);
        }
    }

    // Банк слов не используем в кнопочном варианте
    if (bank) bank.style.display = 'none';

    // В кнопочном режиме нет DnD обработчиков

    // Пересчитываем позиции символов при изменении размера карты/экрана
    const reposition = () => {
        computeSlotsByAngles();
        if (approxOuter && approxInner) {
            for (let i = 0; i < 5; i++) {
                const o = document.querySelector(`.dnd-slot[data-index="${i}"][data-type="outer"]`);
                if (o && approxOuter[i]) {
                    o.style.left = approxOuter[i].left;
                    o.style.top = approxOuter[i].top;
                }
                const inn = document.querySelector(`.dnd-slot[data-index="${i}"][data-type="inner"]`);
                if (inn && approxInner[i]) {
                    inn.style.left = approxInner[i].left;
                    inn.style.top = approxInner[i].top;
                }
            }
        }
    };
    window.addEventListener('resize', reposition);
    window.addEventListener('orientationchange', reposition);
    if (window.__leafletMap) {
        window.__leafletMap.on('resize', reposition);
    }
    setTimeout(reposition, 200);
}

function promptWordForSlot(idx, type, vertices) {
    const v = vertices[idx];
    const expected = (type === 'outer') ? (v.words[0] || '') : (v.words[1] || '');
    const val = window.prompt('Введи слово для вершины:');
    if (!val) return;
    if (val.trim().toLowerCase() === expected.toLowerCase()) {
        const slot = document.querySelector(`.dnd-slot[data-index="${idx}"][data-type="${type}"]`);
        if (slot) {
            const btn = slot.querySelector('button');
            if (btn) btn.classList.add('solved');
            slot.classList.add('ok');
        }
        placeVertexAndConnect(idx, vertices, type);
        checkAllVerticesClosed(vertices);
    } else {
        alert('Неверно');
    }
}

// Рисуем вершину (точку) и соединяем по порядку звезды с уже закрытыми
const __placedVerticesOuter = new Set();
const __placedVerticesInner = new Set();
let __finalTransitionTriggered = false;
let __starPolyline = null;
function placeVertexAndConnect(idx, vertices, type) {
    const map = findLeafletMapInstance();
    if (!map) return;
    const center = [appConfig.coordinates.lat, appConfig.coordinates.lng];
    const baseRadius = (appConfig.pentagram && appConfig.pentagram.radius_m) ? appConfig.pentagram.radius_m : 150;
    const innerFactor = (appConfig.pentagram && appConfig.pentagram.inner_radius_factor) ? appConfig.pentagram.inner_radius_factor : 0.38;
    const dnd = (appConfig.pentagram && Array.isArray(appConfig.pentagram.dnd_points) && appConfig.pentagram.dnd_points.length >= 10) ? appConfig.pentagram.dnd_points : null;
    const v = vertices[idx];
    const isOuter = (type === 'outer');
    const useRadius = isOuter ? baseRadius : Math.max(10, Math.floor(baseRadius * innerFactor));
    const defaultAngles = [-90, -18, 54, 126, 198];
    const useDefault = (!vertices || vertices.length < 5) || vertices.every(x => !x || x.angle_deg === undefined || Number(x.angle_deg) === 0);
    let latlng;
    if (dnd) {
        const p = isOuter ? dnd[idx] : dnd[idx + 5];
        latlng = L.latLng(p.lat, p.lng);
    } else {
        const baseAngle = useDefault ? defaultAngles[idx] : (v.angle_deg || 0);
        const angle = baseAngle + (isOuter ? 0 : 36);
        const pt = offsetLatLng(center, useRadius, angle);
        latlng = L.latLng(pt[0], pt[1]);
    }
    L.circleMarker(latlng, { radius: isOuter ? 9 : 8, color: '#000000', fillColor: isOuter ? '#ff2b2b' : '#111111', fillOpacity: 0.95, weight: 3 }).addTo(map);

    if (type === 'outer') {
        __placedVerticesOuter.add(idx);
        // Обновим соединения по порядку звезды (0-2-4-1-3-0), но только для уже закрытых
        const order = [0, 2, 4, 1, 3, 0];
        const available = order.filter((i) => __placedVerticesOuter.has(i));
        if (available.length >= 2) {
            const points = available.map(i => {
                if (dnd) {
                    const p = dnd[i];
                    return L.latLng(p.lat, p.lng);
                } else {
                    const vi = vertices[i];
                    const baseAng = useDefault ? defaultAngles[i] : (vi.angle_deg || 0);
                    const p = offsetLatLng(center, baseRadius, baseAng);
                    return L.latLng(p[0], p[1]);
                }
            });
            if (available.length >= 3) points.push(points[0]);
            if (__starPolyline) {
                __starPolyline.setLatLngs(points);
            } else {
                __starPolyline = L.polyline(points, { color: '#ff1a1a', weight: 4, opacity: 1 }).addTo(map);
            }
        }
            } else {
        __placedVerticesInner.add(idx);
    }
}

function checkAllVerticesClosed(vertices) {
    if (__placedVerticesOuter.size === 5 && __placedVerticesInner.size === 5 && !__finalTransitionTriggered) {
        __finalTransitionTriggered = true;
        // Автоматический переход через 2 секунды с плавным затуханием в золото
        setTimeout(() => {
            fadeToGoldThen(() => {
                window.location.href = '/temple';
            });
        }, 2000);
    }
}

function checkCompletionAndDrawPentagram(vertices) {
    const allOk = Array.from(document.querySelectorAll('.dnd-slot')).every(s => s.classList.contains('ok'));
    if (!allOk) return;
    // Поэтапная анимация: лучи к центру, затем звезда
    const targetLat = appConfig.coordinates.lat;
    const targetLng = appConfig.coordinates.lng;
    const map = findLeafletMapInstance();
    if (!map) return;

    const center = [targetLat, targetLng];
    const radius = (appConfig.pentagram && appConfig.pentagram.radius_m) ? appConfig.pentagram.radius_m : 150;
    const dnd = (appConfig.pentagram && Array.isArray(appConfig.pentagram.dnd_points) && appConfig.pentagram.dnd_points.length >= 10) ? appConfig.pentagram.dnd_points : null;
    let latLngs;
    if (dnd) {
        latLngs = [0,1,2,3,4].map(i => L.latLng(dnd[i].lat, dnd[i].lng));
    } else {
        const defaultAngles = [-90, -18, 54, 126, 198];
        const useDefault = (!vertices || vertices.length < 5) || vertices.every(v => !v || v.angle_deg === undefined || Number(v.angle_deg) === 0);
        const points = vertices.map((v, i) => {
            const ang = useDefault ? defaultAngles[i] : (v.angle_deg || 0);
            return offsetLatLng(center, radius, ang);
        });
        latLngs = points.map(p => L.latLng(p[0], p[1]));
    }
    const order = [0, 2, 4, 1, 3, 0];
    const star = order.map(i => latLngs[i]);

    // 1) Лучи из вершин в центр (медленная анимация)
    const rays = [];
    latLngs.forEach((p) => {
        const r = L.polyline([p, p], { color: '#FFD700', weight: 2, opacity: 0.0 }).addTo(map);
        rays.push(r);
    });
    let rIdx = 0;
    const rayTimer = setInterval(() => {
        if (rIdx >= rays.length) {
            clearInterval(rayTimer);
            // 2) После лучей — звезда, более медленно
            drawStarSlow(map, star, center);
            return;
        }
        const ray = rays[rIdx];
        ray.setStyle({ opacity: 0.9 });
        ray.setLatLngs([latLngs[rIdx], L.latLng(center[0], center[1])]);
        rIdx++;
    }, 600); // медленнее
}

function drawStarSlow(map, star, center) {
    const base = L.polyline(star, { color: '#DAA520', weight: 2, opacity: 0.4 }).addTo(map);
    const segs = [];
    for (let i = 0; i < star.length - 1; i++) {
        const seg = L.polyline([star[i], star[i]], { color: '#FFD700', weight: 4, opacity: 0.0 }).addTo(map);
        segs.push(seg);
    }
    let idx = 0;
    const timer = setInterval(() => {
        if (idx >= segs.length) {
            clearInterval(timer);
            // После завершения анимации ничего не показываем, переход выполнит checkAllVerticesClosed
            return;
        }
        const seg = segs[idx];
        seg.setStyle({ opacity: 0.95 });
        seg.setLatLngs([star[idx], star[idx + 1]]);
        idx++;
    }, 450); // медленнее
}

// Кнопка открытия Храма больше не используется

function drawTempleMarkerAndPopup() {
    const map = findLeafletMapInstance();
    if (!map) return;
    const targetLat = appConfig.coordinates.lat;
    const targetLng = appConfig.coordinates.lng;

    const goldMarkerHtml = `
        <div class="gold-marker-pulse">
            <div class="pulse-ring pulse-ring-1"></div>
            <div class="pulse-ring pulse-ring-2"></div>
            <div class="pulse-ring pulse-ring-3"></div>
            <div class="gold-marker-icon">
                <div class="marker-x-map">
                    <div class="x-line-map line-1-map"></div>
                    <div class="x-line-map line-2-map"></div>
                </div>
                <div class="marker-star-map">✦</div>
            </div>
        </div>
    `;

    const goldIcon = L.divIcon({
        className: 'custom-gold-marker',
        html: goldMarkerHtml,
        iconSize: [80, 80],
        iconAnchor: [40, 40]
    });
    const marker = L.marker([targetLat, targetLng], { icon: goldIcon, title: 'ХРАМ ГРОХА' }).addTo(map);
    // Вместо popup — финальный экран по клику на маркер
    marker.on('click', () => {
        showFinalOverlay();
    });

    // Убираем CTA после появления маркера
    const cta = document.getElementById('center-cta');
    if (cta) cta.remove();
    // Не показываем координаты на экране врат
    const coordsElement = document.getElementById('map-coordinates');
    if (coordsElement) coordsElement.classList.add('hidden');

    // Обеспечим кликабельность маркера: временно отключим клики по слотам
    const slotsLayer = document.getElementById('dnd-slots');
    if (slotsLayer) slotsLayer.style.pointerEvents = 'none';
}

function showFinalOverlay() {
    const photoUrl = appConfig && appConfig.temple && appConfig.temple.photo_url ? appConfig.temple.photo_url : '';
    const photoCaption = appConfig && appConfig.temple && appConfig.temple.photo_caption ? appConfig.temple.photo_caption : '';
    const finalMsg = appConfig && appConfig.temple && appConfig.temple.final_message ? appConfig.temple.final_message : '';
    // Создадим или переиспользуем overlay
    let overlay = document.getElementById('final-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'final-overlay';
        overlay.className = 'final-overlay';
        const box = document.createElement('div');
        box.className = 'final-box';
        box.innerHTML = `
            <div style="color:#B8860B; font-weight:bold; margin-bottom:8px;">✦ ХРАМ ГРОХА ✦</div>
            ${photoUrl ? `<img class=\"final-photo\" src=\"${photoUrl}\" alt=\"Temple Photo\">` : ''}
            ${photoCaption ? `<div class=\"final-caption\">${photoCaption}</div>` : ''}
            ${finalMsg ? `<div class=\"final-message\">${finalMsg}</div>` : ''}
            <button id="final-close-btn" class="final-close-btn">Закрыть</button>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        const closeBtn = overlay.querySelector('#final-close-btn');
        if (closeBtn) closeBtn.onclick = () => overlay.remove();
    }
}

function fadeToGoldThen(cb) {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.inset = '0';
    overlay.style.background = 'rgba(218, 165, 32, 0)';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '40000';
    overlay.style.transition = 'background 1s ease-in';
    document.body.appendChild(overlay);
    // плавно до золотого
    requestAnimationFrame(() => {
        overlay.style.background = 'rgba(218, 165, 32, 0.7)';
    });
    setTimeout(() => {
        try { cb && cb(); } finally {
            // убрать дымку, если нужно оставить финальный — не убираем сразу
            setTimeout(() => overlay.remove(), 400);
        }
    }, 1000);
}

function findLeafletMapInstance() {
    // Получить объект карты Leaflet, созданный в initTreasureMap
    const mapContainer = document.querySelector('#real-map .leaflet-container');
    // Leaflet не хранит ссылку прямо в DOM нативно, поэтому используем хак: сохраняем глобально при создании
    return window.__leafletMap || null;
}

// Запускаем создание образов, логотипов и золотых частиц при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем конфигурацию
    await loadConfig();
    
    // Создаем визуальные эффекты на страницах, где есть контейнеры
    if (document.getElementById('haunting-figures')) {
        createHauntingFigures();
    }
    if (document.getElementById('floating-logos')) {
        createFloatingLogos();
    }
    if (document.getElementById('gold-particles')) {
        createGoldParticles();
    }

    // Отладочные кнопки для переключения экранов
    if (appConfig && appConfig.debug) {
        injectDebugControls();
    }

    // Стартовое состояние: на всякий случай явно показываем контейнеры DnD, если уже прошли загадку
    const gate = document.getElementById('pentagram-gate');
    const bank = document.getElementById('dnd-bank');
    const slots = document.getElementById('dnd-slots');
    if (gate && bank && slots) {
        // Не меняем видимость, но гарантируем, что стили не скрывают по z-index
        bank.style.zIndex = '1500';
        slots.style.zIndex = '1000';
        // Инициализируем DnD и карту только когда нужно (после загадки)
    }

    // Инициализация редактора пентаграммы в админке
    const editor = document.getElementById('editor-map');
    if (editor) {
        initPentagramEditor();
    }
    // После /cipher показываем золотую дымку, затем нормальный поток
    const mainContainer = document.getElementById('main-container');
    if (mainContainer) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.inset = '0';
        overlay.style.background = 'rgba(218, 165, 32, 0.7)';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '40000';
        overlay.style.transition = 'background 0.9s ease-out';
        document.body.appendChild(overlay);
        
        // Плавно убираем дымку, оставляя нормальный поток (замок → коан → врата)
        requestAnimationFrame(() => {
            overlay.style.background = 'rgba(218, 165, 32, 0)';
        });
        setTimeout(() => overlay.remove(), 950);
    }
});

function injectDebugControls() {
    const dbg = document.createElement('div');
    dbg.style.position = 'fixed';
    dbg.style.bottom = '20px';
    dbg.style.right = '20px';
    dbg.style.zIndex = '20000';
    dbg.style.display = 'flex';
    dbg.style.gap = '10px';
    dbg.style.background = 'rgba(0,0,0,0.6)';
    dbg.style.border = '2px solid #B8860B';
    dbg.style.padding = '10px';

    const mkBtn = (label, handler) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.style.cursor = 'pointer';
        b.style.background = 'linear-gradient(135deg, #B8860B 0%, #8B7355 100%)';
        b.style.border = '1px solid #DAA520';
        b.style.color = '#FFD700';
        b.style.padding = '6px 10px';
        b.style.fontFamily = 'Cinzel, serif';
        b.onclick = handler;
        return b;
    };

    const btnLock = mkBtn('Экран замка', () => {
        document.getElementById('lock-screen').style.display = 'flex';
        document.getElementById('main-container').style.display = 'none';
    });
    const btnMain = mkBtn('Главный экран', () => {
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';
        document.getElementById('secret-section').classList.add('hidden');
    });
    const btnSecret = mkBtn('Экран карты', () => {
        document.getElementById('lock-screen').style.display = 'none';
        document.getElementById('main-container').style.display = 'block';
        document.getElementById('secret-section').classList.remove('hidden');
        setTimeout(() => initTreasureMap(), 200);
    });

    dbg.appendChild(btnLock);
    dbg.appendChild(btnMain);
    dbg.appendChild(btnSecret);
    document.body.appendChild(dbg);
}

// --- Pentagram Editor (admin) ---
function initPentagramEditor() {
    const center = [appConfig.coordinates.lat, appConfig.coordinates.lng];
    const map = L.map('editor-map', {
        center,
        zoom: 15,
        zoomControl: true,
        attributionControl: false
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    const outerMarkers = [];
    const innerMarkers = [];
    let mode = 'center';
    const makeDotIcon = (color, number = '') => L.divIcon({ 
        className: '', 
        html: `<div style="position:relative; width:20px;height:20px;border:2px solid #000;border-radius:50%;background:${color}; display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:bold;color:#fff;text-shadow:1px 1px 1px #000;">${number}</div>` 
    });
    let centerMarker = L.marker(center, { draggable: true, icon: L.divIcon({ className:'', html:`<div style="width:16px;height:16px;border:2px solid #B8860B;border-radius:50%;background:rgba(255,215,0,0.4);"></div>` }) }).addTo(map);

    const btnCenter = document.getElementById('btn-editor-center');
    const btnLoad = document.getElementById('btn-editor-load');
    const btnClear = document.getElementById('btn-editor-clear');
    const btnCalc = document.getElementById('btn-editor-calc');
    const btnApply = document.getElementById('btn-editor-apply');

    const setMode = (m) => { mode = m; };
    if (btnCenter) btnCenter.onclick = () => setMode('center');
    // Убрали режимы расстановки, оставляем центр и расчёт
    if (btnClear) btnClear.onclick = () => {
        outerMarkers.forEach(m => map.removeLayer(m));
        innerMarkers.forEach(m => map.removeLayer(m));
        outerMarkers.length = 0;
        innerMarkers.length = 0;
    };
    if (btnLoad) btnLoad.onclick = () => {
        // Загрузить из полей формы в редактор
        btnClear.click();
        const points = [];
        for (let i = 0; i < 10; i++) {
            const latField = document.querySelector(`[name="pg_dnd_lat_${i}"]`);
            const lngField = document.querySelector(`[name="pg_dnd_lng_${i}"]`);
            if (latField && lngField && latField.value && lngField.value) {
                points.push({ lat: parseFloat(latField.value), lng: parseFloat(lngField.value) });
            }
        }
        points.slice(0,5).forEach((p, i) => outerMarkers.push(L.marker(p, { draggable: true, icon: makeDotIcon('#ff2b2b', i+1) }).addTo(map)));
        points.slice(5,10).forEach((p, i) => innerMarkers.push(L.marker(p, { draggable: true, icon: makeDotIcon('#111', i+1) }).addTo(map)));
    };
    if (btnCalc) btnCalc.onclick = () => {
        // Рассчитать точки по текущим углам/радиусу/центру
        const centerLatLng = centerMarker.getLatLng();
        const radius = (appConfig.pentagram && appConfig.pentagram.radius_m) ? appConfig.pentagram.radius_m : 150;
        const innerFactor = (appConfig.pentagram && appConfig.pentagram.inner_radius_factor) ? appConfig.pentagram.inner_radius_factor : 0.38;
        let vertices = (appConfig.pentagram && appConfig.pentagram.vertices) ? appConfig.pentagram.vertices : [];
        // Если углы не заданы, используем стандартные углы пентаграммы
        const defaultAngles = [-90, -18, 54, 126, 198];
        const useDefault = (!vertices || vertices.length < 5) || vertices.every(v => !v || v.angle_deg === undefined || Number(v.angle_deg) === 0);
        if (useDefault) {
            vertices = defaultAngles.map((ang, i) => ({ angle_deg: ang, words: [
                (appConfig.pentagram && appConfig.pentagram.vertices && appConfig.pentagram.vertices[i] && appConfig.pentagram.vertices[i].words && appConfig.pentagram.vertices[i].words[0]) || '',
                (appConfig.pentagram && appConfig.pentagram.vertices && appConfig.pentagram.vertices[i] && appConfig.pentagram.vertices[i].words && appConfig.pentagram.vertices[i].words[1]) || ''
            ] }));
        }
        const toLatLng = (bearingDeg, r) => {
            const pt = offsetLatLng([centerLatLng.lat, centerLatLng.lng], r, bearingDeg);
            return L.latLng(pt[0], pt[1]);
        };
        // Очистим существующие
        btnClear.click();
        for (let i = 0; i < 5; i++) {
            const v = vertices[i];
            const ang = (v && typeof v.angle_deg === 'number') ? v.angle_deg : defaultAngles[i];
            outerMarkers.push(L.marker(toLatLng(ang, radius), { draggable: true, icon: makeDotIcon('#ff2b2b', i+1) }).addTo(map));
            innerMarkers.push(L.marker(toLatLng(ang + 36, radius * innerFactor), { draggable: true, icon: makeDotIcon('#111', i+1) }).addTo(map));
        }
    };
    if (btnApply) btnApply.onclick = () => {
        // Заполняем поля формы dnd_points по маркерам (внешние потом внутренние)
        const points = [];
        outerMarkers.forEach(m => { const p = m.getLatLng(); points.push({lat:p.lat, lng:p.lng}); });
        innerMarkers.forEach(m => { const p = m.getLatLng(); points.push({lat:p.lat, lng:p.lng}); });
        for (let i = 0; i < 10; i++) {
            const p = points[i];
            const latField = document.querySelector(`[name="pg_dnd_lat_${i}"]`);
            const lngField = document.querySelector(`[name="pg_dnd_lng_${i}"]`);
            if (p && latField && lngField) {
                latField.value = p.lat.toFixed(6);
                lngField.value = p.lng.toFixed(6);
            }
            if (!p && latField && lngField) { latField.value=''; lngField.value=''; }
        }
        // Также перенесём центр
        const c = centerMarker.getLatLng();
        const latCenter = document.getElementById('coord_lat');
        const lngCenter = document.getElementById('coord_lng');
        if (latCenter && lngCenter) { latCenter.value = c.lat.toFixed(6); lngCenter.value = c.lng.toFixed(6); }
    };

    const addMarker = (latlng, type) => {
        const color = (type === 'outer') ? '#ff2b2b' : '#111';
        const number = (type === 'outer') ? (outerMarkers.length + 1) : (innerMarkers.length + 1);
        const marker = L.marker(latlng, { draggable: true, icon: makeDotIcon(color, number) });
        marker.addTo(map);
        if (type === 'outer') outerMarkers.push(marker); else innerMarkers.push(marker);
    };

    map.on('click', (e) => {
        if (mode === 'center') {
            centerMarker.setLatLng(e.latlng);
        } else if (mode === 'outer') {
            if (outerMarkers.length < 5) addMarker(e.latlng, 'outer');
        } else if (mode === 'inner') {
            if (innerMarkers.length < 5) addMarker(e.latlng, 'inner');
        }
    });
}




