# Docker развертывание "Рука Гроха"

Инструкция по запуску приложения с использованием Docker и Docker Compose.

## 📋 Требования

- Docker (версия 20.10+)
- Docker Compose (версия 2.0+)

### Установка Docker

**Windows:**
- Скачайте [Docker Desktop](https://www.docker.com/products/docker-desktop/)

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

**macOS:**
- Скачайте [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 🚀 Быстрый старт

### 1. Сборка и запуск

```bash
# Собрать образ и запустить контейнер
docker-compose up -d --build
```

### 2. Проверка статуса

```bash
# Посмотреть логи
docker-compose logs -f

# Проверить статус контейнеров
docker-compose ps
```

### 3. Доступ к приложению

- **Сайт квеста:** http://localhost:5000
- **Админка:** http://localhost:5000/admin/login
  - Логин: `admin`
  - Пароль: `groh2024`

## 🛠️ Команды управления

### Запуск и остановка

```bash
# Запустить контейнеры
docker-compose up -d

# Остановить контейнеры
docker-compose down

# Остановить и удалить все данные
docker-compose down -v

# Перезапустить
docker-compose restart
```

### Логи и отладка

```bash
# Смотреть логи в реальном времени
docker-compose logs -f

# Логи только web сервиса
docker-compose logs -f web

# Последние 100 строк логов
docker-compose logs --tail=100
```

### Обновление приложения

```bash
# Пересобрать образ после изменений в коде
docker-compose up -d --build

# Принудительная пересборка без кэша
docker-compose build --no-cache
docker-compose up -d
```

### Вход в контейнер

```bash
# Войти в shell контейнера
docker-compose exec web /bin/bash

# Выполнить команду в контейнере
docker-compose exec web ls -la
```

## 📁 Структура Docker

### Dockerfile
```dockerfile
FROM python:3.11-slim      # Базовый образ
WORKDIR /app               # Рабочая директория
COPY requirements.txt .    # Копируем зависимости
RUN pip install ...        # Устанавливаем
COPY . .                   # Копируем приложение
CMD ["gunicorn", ...]      # Запускаем через Gunicorn
```

### docker-compose.yml
```yaml
services:
  web:                     # Flask приложение
    build: .               # Собрать из Dockerfile
    ports:
      - "5000:5000"        # Проброс портов
    volumes:
      - ./config.json:/app/config.json  # Сохранение настроек
    restart: unless-stopped
```

## 🔧 Конфигурация

### Изменение порта

Отредактируйте `docker-compose.yml`:

```yaml
ports:
  - "8080:5000"  # Вместо 5000:5000
```

Приложение будет доступно на http://localhost:8080

### Volume для config.json

Настройки сохраняются между перезапусками благодаря volume:

```yaml
volumes:
  - ./config.json:/app/config.json
```

Вы можете редактировать `config.json` на хосте, и изменения будут применены в контейнере.

## 🌐 Nginx (опционально)

Для production рекомендуется использовать Nginx в качестве reverse proxy.

### Включение Nginx

1. Раскомментируйте секцию `nginx` в `docker-compose.yml`:

```yaml
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx.conf:/etc/nginx/nginx.conf:ro
  depends_on:
    - web
```

2. Запустите:

```bash
docker-compose up -d
```

Приложение будет доступно на http://localhost (порт 80)

### HTTPS с SSL

1. Получите SSL сертификаты (Let's Encrypt, Cloudflare и т.д.)

2. Создайте директорию `ssl/`:

```bash
mkdir ssl
# Скопируйте cert.pem и key.pem в ssl/
```

3. Раскомментируйте SSL настройки в `nginx.conf`

4. Перезапустите:

```bash
docker-compose restart nginx
```

## 🐛 Устранение неполадок

### Порт уже занят

Если порт 5000 занят:

```bash
# Найти процесс
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Linux/Mac

# Остановить
taskkill /F /PID <PID>  # Windows
kill -9 <PID>           # Linux/Mac

# Или изменить порт в docker-compose.yml
```

### Контейнер не запускается

```bash
# Проверить логи
docker-compose logs web

# Пересобрать с нуля
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### config.json не обновляется

```bash
# Перезапустить контейнер
docker-compose restart web

# Или проверить права доступа к файлу
ls -la config.json
chmod 644 config.json  # Linux/Mac
```

### Приложение недоступно

```bash
# Проверить статус
docker-compose ps

# Проверить здоровье контейнера
docker inspect groh_cult_web | grep -A 10 Health

# Проверить сеть
docker network ls
docker network inspect msr_cult_page_groh_network
```

## 📊 Мониторинг

### Использование ресурсов

```bash
# Статистика в реальном времени
docker stats

# Только для нашего контейнера
docker stats groh_cult_web
```

### Health Check

Встроенная проверка здоровья каждые 30 секунд:

```bash
# Проверить статус
docker inspect --format='{{json .State.Health}}' groh_cult_web
```

## 🔒 Безопасность

### Рекомендации для production:

1. **Измените пароли** в `config.json`
2. **Используйте переменные окружения** для секретов:

```yaml
environment:
  - SECRET_KEY=${SECRET_KEY}
  - ADMIN_PASSWORD=${ADMIN_PASSWORD}
```

3. **Включите HTTPS** через Nginx
4. **Ограничьте доступ к админке** через firewall
5. **Регулярно обновляйте образы**:

```bash
docker-compose pull
docker-compose up -d --build
```

## 🚀 Деплой в облако

### Docker Hub

```bash
# Логин
docker login

# Сборка и пуш
docker build -t yourusername/groh-cult:latest .
docker push yourusername/groh-cult:latest

# Использование на другом сервере
docker pull yourusername/groh-cult:latest
docker run -p 5000:5000 yourusername/groh-cult:latest
```

### AWS / Google Cloud / Azure

1. Установите соответствующий CLI
2. Создайте container registry
3. Push образа в registry
4. Разверните через соответствующий сервис (ECS, Cloud Run, Container Instances)

## 📚 Дополнительные ресурсы

- [Docker документация](https://docs.docker.com/)
- [Docker Compose документация](https://docs.docker.com/compose/)
- [Gunicorn документация](https://docs.gunicorn.org/)
- [Nginx документация](https://nginx.org/ru/docs/)

## 🆘 Получить помощь

```bash
# Версия Docker
docker --version
docker-compose --version

# Информация о системе
docker info

# Очистить неиспользуемые ресурсы
docker system prune -a
```

