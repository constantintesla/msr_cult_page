# Flask приложение "Рука Гроха" с админкой

Полнофункциональное веб-приложение на Flask с админ-панелью для управления квестом.

## Структура проекта

```
msr_cult_page/
├── app.py                  # Главный файл Flask приложения
├── config.json             # Конфигурация (создается автоматически)
├── requirements.txt        # Зависимости Python
├── static/                 # Статические файлы
│   ├── style.css          # Стили
│   ├── script.js          # JavaScript логика
│   ├── Флаг Чечевуры PDF.png  # Флаг культа
│   └── secret.jpg         # Колесо Дхармы
└── templates/             # HTML шаблоны
    ├── index.html         # Главная страница квеста
    ├── admin.html         # Админ-панель
    └── login.html         # Страница входа
```

## Установка и запуск

### 1. Установка зависимостей

```bash
pip install -r requirements.txt
```

или

```bash
pip install Flask==3.0.0 Werkzeug==3.0.1
```

### 2. Запуск приложения

```bash
python app.py
```

Приложение будет доступно по адресу: **http://localhost:5000**

### 3. Доступ к админке

URL: **http://localhost:5000/admin/login**

**Логин по умолчанию:**
- Username: `admin`
- Password: `groh2024`

⚠️ **ВАЖНО**: Измените пароль администратора при первом входе!

## Возможности админки

В админ-панели можно редактировать:

### 🔐 1. Кодовый замок
- Изменение 4-значного кода для входа на сайт
- По умолчанию: `8841`

### ☸ 2. Загадка (Коан изобилия)
- Редактирование текста загадки (поддерживает HTML)
- Изменение правильных ответов (через запятую)
- По умолчанию: золото, gold, голд

### 🗺️ 3. Координаты Храма
- Широта (Latitude)
- Долгота (Longitude)
- Текст для отображения (формат координат)
- По умолчанию: 42°59'30.8"N 131°55'00.3"E (Владивосток)

### 🔑 4. Безопасность
- Смена пароля администратора

## API

### GET `/api/config`
Возвращает конфигурацию квеста (без админских данных):

```json
{
  "lock_code": "8841",
  "riddle": {
    "text": "Текст загадки...",
    "answers": ["золото", "gold", "голд"]
  },
  "coordinates": {
    "lat": 42.991889,
    "lng": 131.91675,
    "display": "42°59'30.8\"N 131°55'00.3\"E"
  }
}
```

## Конфигурация

Все настройки хранятся в файле `config.json`. Вы можете редактировать его вручную или через админку.

### Структура config.json

```json
{
    "lock_code": "8841",
    "riddle": {
        "text": "Кровь земли, венчающая царей,...",
        "answers": ["золото", "gold", "голд"]
    },
    "coordinates": {
        "lat": 42.991889,
        "lng": 131.91675,
        "display": "42°59'30.8\"N 131°55'00.3\"E"
    },
    "admin": {
        "username": "admin",
        "password": "groh2024"
    }
}
```

## Безопасность

### Рекомендации для продакшена:

1. **Измените secret_key** в `app.py`:
   ```python
   app.secret_key = 'ваш_супер_секретный_ключ'
   ```

2. **Смените пароль администратора** через админку или в `config.json`

3. **Используйте HTTPS** для защиты данных

4. **Отключите debug режим**:
   ```python
   app.run(debug=False)
   ```

5. **Используйте production WSGI сервер** (Gunicorn, uWSGI):
   ```bash
   pip install gunicorn
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

## Деплой

### Heroku

```bash
# Создайте файл Procfile:
echo "web: gunicorn app:app" > Procfile

# Деплой:
git init
git add .
git commit -m "Initial commit"
heroku create your-app-name
git push heroku master
```

### Docker

```dockerfile
# Создайте Dockerfile:
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

```bash
docker build -t groh-cult .
docker run -p 5000:5000 groh-cult
```

## Устранение неполадок

### Ошибка "ModuleNotFoundError: No module named 'flask'"
```bash
pip install Flask
```

### Порт 5000 уже занят
Измените порт в `app.py`:
```python
app.run(debug=True, host='0.0.0.0', port=8000)
```

### config.json не создается
Файл создается автоматически при первом запуске. Если возникли проблемы, создайте его вручную из примера выше.

## Техническая поддержка

При возникновении проблем:
1. Проверьте логи в консоли
2. Убедитесь, что все файлы на месте
3. Проверьте права доступа к файлам

## Лицензия

Проект создан для ролевого квеста культа "Рука Гроха".

