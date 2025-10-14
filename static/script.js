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
        riddleContainer.innerHTML = appConfig.riddle.text;
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
            mainContainer.style.display = 'block';
            mainContainer.style.animation = 'fadeIn 1.5s ease-in';
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
            // Переходим на экран Врат Пяти Слов сначала
            const gate = document.getElementById('pentagram-gate');
            gate.classList.remove('hidden');
            playRevealSound();
            
            // Активация логики врат
            setupPentagramGate();
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
        coordsElement.innerHTML = `
            📍 Координаты Храма: <span class="coords-highlight">${appConfig.coordinates.display}</span>
        `;
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
document.getElementById('answer').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        checkAnswer();
    }
});

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
    const map = L.map('real-map', {
        center: [targetLat, targetLng],
        zoom: 15,
        zoomControl: true,
        attributionControl: false
    });
    
    // Добавляем слой OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
    }).addTo(map);
    
    // Создаем золотой HTML для маркера
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
    
    // Создаем кастомную иконку
    const goldIcon = L.divIcon({
        className: 'custom-gold-marker',
        html: goldMarkerHtml,
        iconSize: [80, 80],
        iconAnchor: [40, 40]
    });
    
    // Добавляем маркер
    const marker = L.marker([targetLat, targetLng], { 
        icon: goldIcon,
        title: 'ХРАМ ГРОХА'
    }).addTo(map);
    
    // Добавляем popup с информацией
    marker.bindPopup(`
        <div style="text-align: center; font-family: 'Cinzel', serif; color: #0a0805;">
            <strong style="color: #B8860B; font-size: 16px;">✦ ХРАМ ГРОХА ✦</strong><br>
            <span style="font-size: 12px; color: #666;">${appConfig.coordinates.display}</span>
        </div>
    `).openPopup();
    
    // Добавляем золотой круг вокруг метки
    L.circle([targetLat, targetLng], {
        color: '#FFD700',
        fillColor: '#FFD700',
        fillOpacity: 0.15,
        radius: 100,
        weight: 3
    }).addTo(map);

    // Пентаграмма: ввод слов и постановка точек
    setupPentagramInputs(map, [targetLat, targetLng]);
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

function setupPentagramInputs(map, centerLatLng) {
    const pgConfig = appConfig.pentagram || { vertices: [], radius_m: 150 };
    const vertices = pgConfig.vertices || [];
    const radius = pgConfig.radius_m || 150;
    const placed = new Array(vertices.length).fill(false);
    const markers = [];

    // Вешаем обработчики ввода на все поля
    document.querySelectorAll('.pg-input').forEach((input) => {
        input.addEventListener('input', () => {
            const vertexIndex = parseInt(input.getAttribute('data-vertex'), 10);
            const pairInputs = Array.from(document.querySelectorAll(`.pg-input[data-vertex="${vertexIndex}"]`));
            if (pairInputs.length < 2 || !vertices[vertexIndex]) return;

            const [val1, val2] = pairInputs.map((el) => el.value.trim().toLowerCase());
            const [word1, word2] = vertices[vertexIndex].words.map((w) => w.toLowerCase());

            if (val1 === word1 && val2 === word2 && !placed[vertexIndex]) {
                placed[vertexIndex] = true;

                const angle = vertices[vertexIndex].angle_deg || 0;
                const point = offsetLatLng(centerLatLng, radius, angle);

                const dot = L.circleMarker(point, {
                    radius: 8,
                    color: '#FFD700',
                    fillColor: '#FFD700',
                    fillOpacity: 0.9,
                    weight: 3
                }).addTo(map);
                markers.push(dot);

                // Соединяем в звезду, когда поставлено хотя бы 3 точки — постепенно
                drawPentagramIfReady(map, markers);
            }
        });
    });
}

function drawPentagramIfReady(map, markers) {
    if (markers.length < 5) return;

    const points = markers.map((m) => m.getLatLng());
    // Упорядочим как звезду (индексы 0-2-4-1-3-0)
    const order = [0, 2, 4, 1, 3, 0];
    const starCoords = order.map((i) => points[i]);

    L.polyline(starCoords, {
        color: '#DAA520',
        weight: 3,
        opacity: 0.9
    }).addTo(map);
}

// Экран врат: ввод пар слов → когда все 5 вершин подтверждены, активируем кнопку «ОТКРЫТЬ КАРТУ»
function setupPentagramGate() {
    const pgConfig = appConfig.pentagram || { vertices: [], radius_m: 150 };
    const vertices = pgConfig.vertices || [];
    const placed = new Array(vertices.length).fill(false);
    const openBtn = document.getElementById('open-map-btn');
    if (!openBtn) return;

    document.querySelectorAll('#pentagram-gate .pg-input').forEach((input) => {
        input.addEventListener('input', () => {
            const vertexIndex = parseInt(input.getAttribute('data-vertex'), 10);
            const pairInputs = Array.from(document.querySelectorAll(`#pentagram-gate .pg-input[data-vertex="${vertexIndex}"]`));
            if (pairInputs.length < 2 || !vertices[vertexIndex]) return;

            const [val1, val2] = pairInputs.map((el) => el.value.trim().toLowerCase());
            const [word1, word2] = vertices[vertexIndex].words.map((w) => w.toLowerCase());

            const statusEl = document.querySelector(`#pentagram-gate .pg-status[data-vertex="${vertexIndex}"]`);

            if (val1 === word1 && val2 === word2) {
                placed[vertexIndex] = true;
                pairInputs.forEach((el) => {
                    el.style.borderColor = '#B8860B';
                    el.style.boxShadow = '0 0 12px rgba(218,165,32,0.6)';
                });
                if (statusEl) {
                    statusEl.classList.remove('err');
                    statusEl.classList.add('ok');
                }
            } else if (val1 || val2) {
                // Если что-то введено, но пара не совпала — показываем ошибку
                if (statusEl) {
                    statusEl.classList.remove('ok');
                    statusEl.classList.add('err');
                }
                pairInputs.forEach((el) => {
                    el.style.borderColor = '#ff6b6b';
                    el.style.boxShadow = '0 0 10px rgba(255,107,107,0.6)';
                });
            } else {
                // Очищено — возвращаем базовый вид
                if (statusEl) {
                    statusEl.classList.remove('ok', 'err');
                }
                pairInputs.forEach((el) => {
                    el.style.borderColor = '#8B7355';
                    el.style.boxShadow = '';
                });
            }

            // Если все 5 подтверждены — разрешаем открыть карту
            if (placed.every(Boolean)) {
                openBtn.disabled = false;
            }
        });
    });

    openBtn.addEventListener('click', () => {
        // Скрываем врата, показываем карту и инициализируем её
        document.getElementById('pentagram-gate').classList.add('hidden');
        const secret = document.getElementById('secret-section');
        secret.classList.remove('hidden');
        updateCoordinates();
        setTimeout(() => initTreasureMap(), 200);
    });
}

// Запускаем создание образов, логотипов и золотых частиц при загрузке
document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем конфигурацию
    await loadConfig();
    
    // Создаем визуальные эффекты
    createHauntingFigures();
    createFloatingLogos();
    createGoldParticles();

    // Отладочные кнопки для переключения экранов
    if (appConfig && appConfig.debug) {
        injectDebugControls();
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

