from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import json
import os
from functools import wraps

app = Flask(__name__)
app.secret_key = 'groh_secret_key_change_this_in_production'  # Измените в продакшене!

CONFIG_FILE = 'config.json'

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
    }
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
        json.dump(config, indent=4, ensure_ascii=False, fp=f)

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
    return render_template('index.html')

@app.route('/api/config')
def get_config():
    """API для получения конфигурации (без админских данных)"""
    config = load_config()
    return jsonify({
        'lock_code': config['lock_code'],
        'riddle': config['riddle'],
        'coordinates': config['coordinates']
    })

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
    return render_template('admin.html', config=config)

@app.route('/admin/update', methods=['POST'])
@login_required
def admin_update():
    """Обновление настроек"""
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
    
    # Обновляем пароль админа (если указан новый)
    new_password = request.form.get('admin_password', '').strip()
    if new_password:
        config['admin']['password'] = new_password
    
    save_config(config)
    return redirect(url_for('admin_panel'))

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

