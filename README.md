# 🏛️ Рука Гроха - Интерактивный Ролевой Квест

Полнофункциональное веб-приложение на Flask с админ-панелью для управления ролевым квестом культа "Рука Гроха" - культа крови и денег с буддийской направленностью.

![Python](https://img.shields.io/badge/python-3.11-blue)
![Flask](https://img.shields.io/badge/flask-3.0.0-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## ✨ Особенности

### 🎮 Игровой процесс
- 🔐 **Золотой кодовый замок** - защита от "простолюдинов" (4-значный код)
- ☸ **Коан изобилия** - загадка для проверки достойности
- 🗺️ **Интерактивная карта** - настоящая карта мира с GPS-координатами Храма Гроха
- ✦ **Анимированный маркер** - золотая метка с пульсацией на карте

### 🎨 Визуал и атмосфера
- 💎 **Роскошный золотой дизайн** с эффектами свечения и мерцания
- 🏴 **Анимированный флаг** культа с реалистичным развеванием на ветру
- ☸ **Вращающиеся Колёса Дхармы** буддийской символики
- 🌟 **Золотые частицы и блики** на фоне
- 📱 **Адаптивный дизайн** для всех устройств

### ⚙️ Админ-панель
- ✏️ **Редактирование кодового замка** (изменение 4-значного кода)
- 📝 **Редактирование загадки** и правильных ответов
- 📍 **Изменение координат** Храма на карте
- 🔐 **Управление безопасностью** (смена пароля администратора)
- 💾 **Автосохранение** в JSON конфигурацию

### 🐳 Технологии
- **Backend:** Flask + Gunicorn
- **Frontend:** Vanilla JS + CSS3 Animations
- **Maps:** Leaflet.js + OpenStreetMap
- **Deploy:** Docker + Docker Compose
- **Config:** JSON-based configuration

---

## 🚀 Быстрый старт

### Вариант 1: Docker Compose (Рекомендуется) 🐳

```bash
# 1. Клонируйте репозиторий
git clone <repo-url>
cd msr_cult_page

# 2. Запустите через Docker Compose
docker compose up -d --build

# 3. Откройте в браузере
# Сайт: http://localhost:5000
# Админка: http://localhost:5000/admin/login
```

**Логин в админку:**
- Username: `admin`
- Password: `groh2024`

### Вариант 2: Локальный запуск 🐍

```bash
# 1. Установите зависимости
pip install -r requirements.txt

# 2. Запустите приложение
python app.py

# 3. Откройте http://localhost:5000
```

---

## 📁 Структура проекта

```
msr_cult_page/
├── app.py                      # Flask приложение с API
├── config.json                 # Конфигурация (редактируется через админку)
├── requirements.txt            # Python зависимости
│
├── static/                     # Статические файлы
│   ├── style.css              # Стили и анимации
│   ├── script.js              # JavaScript логика + Leaflet карта
│   ├── Флаг Чечевуры PDF.png  # Флаг культа
│   └── uploads/               # Загружаемые файлы админкой (фото храма)
│
├── templates/                  # HTML шаблоны (Jinja2)
│   ├── index.html             # Главная страница квеста
│   ├── admin.html             # Админ-панель
│   └── login.html             # Страница входа в админку
│
├── Dockerfile                  # Docker образ
├── docker-compose.yml          # Docker Compose конфигурация
├── nginx.conf                  # Nginx конфигурация (опционально)
│
└── Документация/
    ├── README.md              # Этот файл
    ├── README_FLASK.md        # Подробно о Flask приложении
    ├── DOCKER_README.md       # Подробно о Docker
    └── QUICKSTART.md          # Быстрый старт за 3 команды
```

---

## 🎯 Квест - Этапы прохождения

### **Этап 1: Золотой Замок** 🔐
Игрок должен ввести священный 4-значный код (по умолчанию: **8841**)

### **Этап 2: Коан Изобилия** ☸
Разгадать загадку:
> *"Кровь земли, венчающая царей,  
> Питающая алчность человека,  
> Сияющая в глубинах и на тронах.  
> Что есть суть изобилия?"*

**Ответ:** `золото` (или `gold`, `голд`)

### **Этап 3: Путь к Храму** 🗺️
После правильного ответа открывается интерактивная карта с точными GPS-координатами **Храма Гроха**

**Координаты по умолчанию:** 42°59'30.8"N 131°55'00.3"E (Владивосток)

---

## ⚙️ Конфигурация через Админку

Зайдите в админку: **http://localhost:5000/admin/login**

### Что можно настроить:

#### 1. 🔐 Кодовый замок
```
Код: 8841 → Любой 4-значный код
```

#### 2. ☸ Загадка
```
Текст: (поддерживает HTML теги: <br>, <strong>, <p>)
Ответы: золото, gold, голд (через запятую, регистр не важен)
```

#### 3. 🗺️ Координаты Храма
```
Широта: 42.991889
Долгота: 131.916750
Отображение: 42°59'30.8"N 131°55'00.3"E
```

#### 4. 🔑 Пароль администратора
```
Смена пароля для безопасности
```

Все изменения сохраняются в `config.json` и применяются сразу!

---

## 🐳 Docker команды

```bash
# Запуск
docker compose up -d

# Остановка
docker compose down

# Просмотр логов
docker compose logs -f

# Перезапуск
docker compose restart

# Пересборка после изменений
docker compose up -d --build

# Очистка
docker compose down -v
docker system prune -a
```

---

## 🌐 API Endpoints

### Public API

#### GET `/`
Главная страница квеста

#### GET `/api/config`
Получить конфигурацию (без админских данных)

**Response:**
```json
{
  "lock_code": "8841",
  "riddle": {
    "text": "Загадка...",
    "answers": ["золото", "gold"]
  },
  "coordinates": {
    "lat": 42.991889,
    "lng": 131.91675,
    "display": "42°59'30.8\"N 131°55'00.3\"E"
  }
}
```

### Admin API (требуется авторизация)

#### GET `/admin`
Админ-панель

#### POST `/admin/update`
Обновление конфигурации

#### GET `/admin/login`
Страница входа

#### GET `/admin/logout`
Выход

---

## 🔒 Безопасность

### ⚠️ Важно для продакшена:

1. **Измените `secret_key`** в `app.py`:
   ```python
   app.secret_key = 'your-super-secret-key-here'
   ```

2. **Смените пароль администратора** сразу после первого входа

3. **Используйте HTTPS** (раскомментируйте nginx в docker-compose.yml)

4. **Отключите debug** в продакшене:
   ```python
   app.run(debug=False)
   ```

5. **Ограничьте доступ** к админке через firewall

---

## 🛠️ Разработка

### Локальная разработка

```bash
# Установка зависимостей для разработки
pip install -r requirements.txt
pip install flask-debugtoolbar  # опционально

# Запуск в режиме разработки
export FLASK_ENV=development  # Linux/Mac
set FLASK_ENV=development     # Windows
python app.py
```

### Изменение конфигурации

Либо через админку, либо напрямую в `config.json`:

```json
{
    "lock_code": "8841",
    "riddle": {
        "text": "Ваша загадка",
        "answers": ["ответ1", "ответ2"]
    },
    "coordinates": {
        "lat": 55.751244,
        "lng": 37.618423,
        "display": "Ваши координаты"
    },
    "admin": {
        "username": "admin",
        "password": "your-password"
    }
}
```

---

## 📚 Документация

- **[README.md](README.md)** - Этот файл (общий обзор)
- **[README_FLASK.md](README_FLASK.md)** - Детали Flask приложения
- **[DOCKER_README.md](DOCKER_README.md)** - Подробно о Docker
- **[QUICKSTART.md](QUICKSTART.md)** - Быстрый старт

---

## 🎨 Кастомизация

### Замена флага культа

Замените файл `static/Флаг Чечевуры PDF.png` на свое изображение (PNG/JPG)

### Изменение цветовой схемы

Отредактируйте `static/style.css` - переменные цветов:
```css
/* Золотые цвета */
#FFD700  /* Яркое золото */
#DAA520  /* Золотарник */
#B8860B  /* Темное золото */
#C19A6B  /* Медь */
#8B7355  /* Темная медь */
```

### Изменение названия культа

В `templates/index.html` найдите и замените:
```html
<h1 class="title">Рука Гроха</h1>
```

---

## 🚀 Деплой

### Heroku

```bash
# Создайте Procfile
echo "web: gunicorn app:app" > Procfile

# Деплой
heroku create your-app-name
git push heroku master
```

### DigitalOcean / AWS / GCP

1. Установите Docker на сервере
2. Клонируйте репозиторий
3. Запустите `docker-compose up -d`
4. Настройте Nginx/Apache как reverse proxy
5. Получите SSL сертификат (Let's Encrypt)

---

## 🐛 Устранение неполадок

### Порт 5000 занят

**Решение:**
```yaml
# Измените в docker-compose.yml
ports:
  - "8080:5000"  # Вместо 5000:5000
```

### Конфигурация не обновляется

**Решение:**
```bash
docker-compose restart web
# или
python app.py  # для локальной версии
```

### Карта не загружается

**Причина:** Нет интернета (используется OpenStreetMap CDN)

**Решение:** Убедитесь в наличии интернет-соединения

---

## 🤝 Вклад в проект

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

---

## 📄 Лицензия

Этот проект создан для ролевого квеста культа "Рука Гроха".

---

## 📞 Контакты

**Основной лозунг культа:** *"ОТЪЕБИСЬ НИЩЕТА"*

Пусть золото течёт сквозь пальцы достойных! ✦

---

## 🙏 Благодарности

- [Flask](https://flask.palletsprojects.com/) - веб-фреймворк
- [Leaflet.js](https://leafletjs.com/) - интерактивные карты
- [OpenStreetMap](https://www.openstreetmap.org/) - картографические данные
- [Docker](https://www.docker.com/) - контейнеризация
- [Gunicorn](https://gunicorn.org/) - WSGI сервер

---

<div align="center">

**⊕ Да пребудет с вами изобилие ⊕**

Made with 💛 for the Cult of Groh

</div>
