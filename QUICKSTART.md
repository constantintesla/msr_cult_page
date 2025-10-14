# 🚀 Быстрый старт с Docker

## За 3 команды запустить "Рука Гроха"

### 1️⃣ Убедитесь, что Docker установлен

```bash
docker --version
docker compose version
```

Если не установлен:
- **Windows/Mac:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux:** `sudo apt install docker.io docker-compose`

### 2️⃣ Соберите и запустите

```bash
docker compose up -d --build
```

### 3️⃣ Откройте в браузере

**Сайт:** http://localhost:5000

**Админка:** http://localhost:5000/admin/login
- Логин: `admin`
- Пароль: `groh2024`

---

## ✅ Готово!

Приложение работает! 🎉

---

## 🛑 Остановить

```bash
docker compose down
```

## 📋 Посмотреть логи

```bash
docker compose logs -f
```

## 🔄 Перезапустить

```bash
docker compose restart
```

---

## 📖 Подробная документация

- **Для Flask:** `README_FLASK.md`
- **Для Docker:** `DOCKER_README.md`

## 🆘 Проблемы?

**Порт 5000 занят?**
```bash
# Измените порт в docker-compose.yml:
ports:
  - "8080:5000"  # Вместо 5000:5000
```

**Не запускается?**
```bash
docker compose logs web
```

**Очистить всё и начать заново:**
```bash
docker compose down -v
docker system prune -a
docker compose up -d --build
```

