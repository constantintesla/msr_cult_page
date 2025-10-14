# Используем официальный Python образ
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файл зависимостей
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем все файлы приложения
COPY . .

# Создаем директорию для конфигурации (если она будет примонтирована)
RUN mkdir -p /app/data

# Открываем порт
EXPOSE 5000

# Устанавливаем переменные окружения
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Запускаем приложение через gunicorn для продакшена
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "app:app"]

