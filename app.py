from flask import Flask, render_template, request, redirect, url_for, session, jsonify, make_response, send_file, flash
import random
import string
from datetime import datetime
from werkzeug.utils import secure_filename
import json
import os
from functools import wraps

app = Flask(__name__)
# В продакшене обязательно задайте переменную окружения SECRET_KEY
app.secret_key = os.environ.get('SECRET_KEY', 'groh_secret_key_change_this_in_production')

# Базовые флаги безопасности cookies сессии
app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax'
)
app.config['UPLOAD_FOLDER'] = os.path.join('static', 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB

CONFIG_FILE = 'config.json'
USERS_FILE = 'users.json'

# Настройки по умолчанию
DEFAULT_CONFIG = {
    'lock_code': '8841',
    'riddle': {
        'text': 'Кровь земли, венчающая царей,<br>Питающая алчность человека,<br>Сияющая в глубинах и на тронах.<br>Что есть суть изобилия?',
        'answers': ['золото', 'gold', 'голд']
    },
    'coordinates': {
        'lat': 42.991889,
        'lng': 131.916750,
        'display': '42°59\'30.8"N 131°55\'00.3"E'
    },
    'admin': {
        'username': 'admin',
        'password': 'groh2024'  # Измените пароль!
    },
    'universal_cipher': '12345678' # Новый параметр
}

def load_config():
    """Загрузить конфигурацию из файла"""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    else:
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG

def save_config(config):
    """Сохранить конфигурацию в файл"""
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        # ВАЖНО: первым идет объект, вторым — файловый дескриптор
        json.dump(config, f, indent=4, ensure_ascii=False)

def load_users():
    """Загрузить базу пользователей"""
    if os.path.exists(USERS_FILE):
        try:
            with open(USERS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if isinstance(data, list):
                    return data
                return []
        except Exception:
            return []
    return []

def save_users(users):
    """Сохранить базу пользователей"""
    with open(USERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(users, f, indent=4, ensure_ascii=False)

def login_required(f):
    """Декоратор для защиты админских страниц"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    """Главная страница квеста"""
    # Требуем подтверждение персонального шифра перед Вратами
    if not session.get('cipher_verified'):
        return redirect(url_for('cipher_page'))
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    """Возвращаем пустой ответ, чтобы не было 404 для favicon."""
    return make_response(('', 204))


@app.route('/temple')
def temple():
    """Финальная страница ✦ Храм Благополучия ✦"""
    config = load_config()
    return render_template('temple.html', config=config)

@app.route('/vetovskaya', methods=['GET', 'POST'])
def vetovskaya_register():
    """Секретная страница регистрации в Ветовской ячейке Руки Гроха."""
    if request.method == 'POST':
        email = (request.form.get('email') or '').strip()
        login = (request.form.get('login') or '').strip()
        password = (request.form.get('password') or '').strip()

        errors = []
        if not email or '@' not in email:
            errors.append('Укажите корректную почту')
        if not login or len(login) < 3:
            errors.append('Логин должен быть не короче 3 символов')
        if not password or len(password) < 6:
            errors.append('Пароль должен быть не короче 6 символов')

        if errors:
            return render_template('register.html', errors=errors, success=False, email=email, login=login)

        # Проверка уникальности email/login
        users = load_users()
        lower_emails = {u.get('email', '').lower() for u in users}
        lower_logins = {u.get('login', '').lower() for u in users}
        if email.lower() in lower_emails:
            errors.append('Игрок с такой почтой уже зарегистрирован')
        if login.lower() in lower_logins:
            errors.append('Игрок с таким логином уже зарегистрирован')
        if errors:
            return render_template('register.html', errors=errors, success=False, email=email, login=login)

        # Генерируем персональный шифр для игрока и сохраняем в сессию/БД
        cipher_code = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8))
        session['personal_cipher'] = cipher_code
        lock_code = load_config().get('lock_code', '0000')
        users.append({
            'email': email,
            'login': login,
            'cipher': cipher_code,
            'created_at': datetime.utcnow().isoformat() + 'Z'
        })
        save_users(users)
        return render_template('register.html', success=True, email=email, login=login, cipher=cipher_code, lock_code=lock_code)

    return render_template('register.html', success=False)

@app.route('/cipher')
def cipher_page():
    """Страница с шифром (после регистрации)."""
    return render_template('cipher.html')

@app.route('/api/cipher/verify', methods=['POST'])
def api_cipher_verify():
    """Проверка персонального шифра из сессии."""
    try:
        data = request.get_json(silent=True) or {}
    except Exception:
        data = {}
    code = (data.get('code') or '').strip()
    expected = session.get('personal_cipher', '')
    ok = False
    cipher_type = 'unknown'  # По умолчанию неизвестный тип
    
    if code:
        # 1) Поиск среди сохранённых пользователей — приоритетно, чтобы фиксировать registered
        users = load_users()
        for u in users:
            uc = (u.get('cipher') or '').strip()
            if uc and uc.lower() == code.lower():
                ok = True
                cipher_type = 'registered'
                break
        # 2) Совпадение с шифром в сессии (если не нашли в users)
        if not ok and expected and code.lower() == expected.lower():
            ok = True
            cipher_type = 'personal'
        # 3) Универсальный шифр из конфигурации
        if not ok:
            cfg = load_config()
            uni = (cfg.get('universal_cipher') or '').strip()
            if uni and uni.lower() == code.lower():
                ok = True
                cipher_type = 'universal'
    
    if ok:
        session['cipher_verified'] = True
        session['cipher_type'] = cipher_type
        # Сохраним текущий проверенный код в сессию для связывания прогресса
        session['cipher_code'] = code
    
    return jsonify({'ok': ok, 'cipher_type': cipher_type})

@app.route('/api/progress', methods=['GET', 'POST'])
def api_progress():
    """Получение/сохранение прогресса прохождения карты для текущего шифра."""
    # Определяем активный шифр из сессии
    cipher = (session.get('cipher_code') or '').strip()
    if not cipher:
        # fallback: если есть в users — дадим прочитать по type=registered, но лучше вернём пусто
        return jsonify({'ok': False, 'error': 'no_cipher'}), 400
    users = load_users()
    # Найдём пользователя по шифру
    user = None
    for u in users:
        if (u.get('cipher') or '').strip().lower() == cipher.lower():
            user = u
            break
    if request.method == 'GET':
        step = 0
        if user:
            try:
                step = int(user.get('progress_step', 0))
            except Exception:
                step = 0
        return jsonify({'ok': True, 'step': step})
    else:
        # POST
        try:
            data = request.get_json(silent=True) or {}
        except Exception:
            data = {}
        try:
            step = int(data.get('step', 0))
            if step < 0: step = 0
            if step > 10: step = 10
        except Exception:
            return jsonify({'ok': False, 'error': 'bad_step'}), 400
        if user:
            user['progress_step'] = step
            save_users(users)
            return jsonify({'ok': True, 'step': step})
        else:
            # Если пользователя нет в базе (например personal/universal), сохранять нечего
            return jsonify({'ok': False, 'error': 'user_not_found'}), 404

@app.route('/api/config')
def get_config():
    """API для получения конфигурации (без админских данных)"""
    config = load_config()
    return jsonify({
        'lock_code': config['lock_code'],
        'riddle': config['riddle'],
        'coordinates': config['coordinates'],
        'pentagram': config.get('pentagram', {}),
        'temple': config.get('temple', {}),
        'debug': config.get('debug', False)
    })

@app.route('/api/cipher/type')
def get_cipher_type():
    """API для получения типа шифра пользователя"""
    cipher_type = session.get('cipher_type', 'unknown')
    return jsonify({'cipher_type': cipher_type})

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Страница входа в админку"""
    if request.method == 'POST':
        config = load_config()
        username = request.form.get('username')
        password = request.form.get('password')
        
        if (username == config['admin']['username'] and 
            password == config['admin']['password']):
            session['logged_in'] = True
            return redirect(url_for('admin_panel'))
        else:
            return render_template('login.html', error='Неверный логин или пароль')
    
    return render_template('login.html')

@app.route('/admin/logout')
def admin_logout():
    """Выход из админки"""
    session.pop('logged_in', None)
    return redirect(url_for('index'))

@app.route('/admin')
@login_required
def admin_panel():
    """Админ-панель"""
    config = load_config()
    # Простая CSRF-защита для формы обновления настроек
    csrf_token = session.get('csrf_token')
    if not csrf_token:
        csrf_token = os.urandom(16).hex()
        session['csrf_token'] = csrf_token
    return render_template('admin.html', config=config, csrf_token=csrf_token)

@app.route('/admin/update', methods=['POST'])
@login_required
def admin_update():
    """Обновление настроек"""
    # Проверка CSRF-токена
    form_token = request.form.get('csrf_token', '')
    if not form_token or form_token != session.get('csrf_token'):
        return redirect(url_for('admin_panel'))
    config = load_config()
    
    # Обновляем код замка
    config['lock_code'] = request.form.get('lock_code', '8841')
    
    # Обновляем загадку
    config['riddle']['text'] = request.form.get('riddle_text', '')
    answers_raw = request.form.get('riddle_answers', '')
    config['riddle']['answers'] = [a.strip() for a in answers_raw.split(',') if a.strip()]
    
    # Обновляем координаты
    try:
        config['coordinates']['lat'] = float(request.form.get('coord_lat', 42.991889))
        config['coordinates']['lng'] = float(request.form.get('coord_lng', 131.916750))
        config['coordinates']['display'] = request.form.get('coord_display', '')
    except ValueError:
        pass  # Если ошибка конвертации, оставляем старые значения
    
    # Обновляем пентаграмму
    try:
        radius_m = int(request.form.get('pg_radius', config.get('pentagram', {}).get('radius_m', 180)))
    except ValueError:
        radius_m = config.get('pentagram', {}).get('radius_m', 180)
    vertices = []
    for i in range(5):
        # Читаем слова из новых полей: outer/inner
        w1 = request.form.get(f'pg_word_outer_{i}', '').strip()
        w2 = request.form.get(f'pg_word_inner_{i}', '').strip()
        try:
            angle = float(request.form.get(f'pg_angle_{i}', '0'))
        except ValueError:
            angle = 0
        vertices.append({
            'words': [w1, w2],
            'angle_deg': angle
        })
    config['pentagram'] = {
        'radius_m': radius_m,
        'vertices': vertices
    }

    # inner_radius_factor (необязательное поле)
    try:
        inner_factor = float(request.form.get('pg_inner_factor', config.get('pentagram', {}).get('inner_radius_factor', 0.38)))
    except ValueError:
        inner_factor = config.get('pentagram', {}).get('inner_radius_factor', 0.38)
    config['pentagram']['inner_radius_factor'] = inner_factor

    # DnD точки (необязательно 10)
    dnd_points = []
    for i in range(10):
        lat_raw = request.form.get(f'pg_dnd_lat_{i}', '').strip()
        lng_raw = request.form.get(f'pg_dnd_lng_{i}', '').strip()
        if lat_raw and lng_raw:
            try:
                dnd_points.append({'lat': float(lat_raw), 'lng': float(lng_raw)})
            except ValueError:
                pass
    if dnd_points:
        config['pentagram']['dnd_points'] = dnd_points
    else:
        config['pentagram'].pop('dnd_points', None)

    # Изображение для попапа Храма (загрузка файла)
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    photo_file = request.files.get('temple_photo_file')
    photo_caption = request.form.get('temple_photo_caption', '').strip()
    if photo_file and photo_file.filename:
        filename = secure_filename(photo_file.filename)
        # Во избежание коллизий добавим префикс
        base, ext = os.path.splitext(filename)
        unique_name = f"temple_{abs(hash(base))}{ext}"
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_name)
        photo_file.save(save_path)
        rel_url = f"/static/uploads/{unique_name}"
        config['temple'] = config.get('temple', {})
        config['temple']['photo_url'] = rel_url
        if photo_caption:
            config['temple']['photo_caption'] = photo_caption
        else:
            config['temple'].pop('photo_caption', None)
        # напутствие
        final_msg = request.form.get('temple_final_message', '').strip()
        if final_msg:
            config['temple']['final_message'] = final_msg
    else:
        # Если файл не загружали, обновим/очистим подпись, но не трогаем текущий url
        if photo_caption:
            config['temple'] = config.get('temple', {})
            config['temple']['photo_caption'] = photo_caption
        else:
            if 'temple' in config and 'photo_caption' in config['temple']:
                config['temple'].pop('photo_caption', None)
        final_msg = request.form.get('temple_final_message', '').strip()
        if final_msg:
            config['temple'] = config.get('temple', {})
            config['temple']['final_message'] = final_msg
        else:
            if 'temple' in config and 'final_message' in config['temple']:
                config['temple'].pop('final_message', None)
    
    # Обновляем пароль админа (если указан новый)
    new_password = request.form.get('admin_password', '').strip()
    if new_password:
        config['admin']['password'] = new_password
    
    # Обновляем универсальный шифр
    universal_cipher = request.form.get('universal_cipher', '').strip()
    if universal_cipher:
        config['universal_cipher'] = universal_cipher
    else:
        config.pop('universal_cipher', None)

    save_config(config)
    return redirect(url_for('admin_panel'))


@app.after_request
def set_security_headers(response):
    """Минимальный набор заголовков безопасности для ответа."""
    response.headers.setdefault('X-Content-Type-Options', 'nosniff')
    response.headers.setdefault('X-Frame-Options', 'SAMEORIGIN')
    response.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
    # Базовый CSP, разрешаем наши статические и инлайновые стили/скрипты при необходимости
    csp = (
        "default-src 'self'; "
        "script-src 'self' https://unpkg.com 'unsafe-inline'; "
        "style-src 'self' https://unpkg.com https://fonts.googleapis.com 'unsafe-inline'; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org; "
        "connect-src 'self' https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org https://unpkg.com; "
        "worker-src 'self'; "
        "object-src 'none'"
    )
    response.headers.setdefault('Content-Security-Policy', csp)
    return response

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)

