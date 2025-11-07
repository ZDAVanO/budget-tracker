from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token, jwt_required, 
    get_jwt_identity, unset_jwt_cookies, set_access_cookies, 
    set_refresh_cookies
)
# Імпортуємо моделі ТА нові функції
from models import (
    db, User, 
    create_default_categories_for_user, 
    create_default_wallets_for_user
)
from werkzeug.security import generate_password_hash, check_password_hash

# 1. Визначаємо Blueprint з префіксом /api
bp = Blueprint('auth', __name__, url_prefix='/api')

# 2. Використовуємо @bp.route замість @app.route
@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"msg": "Missing fields"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    
    # 3. Викликаємо функції, імпортовані з models.py
    create_default_categories_for_user(user.id)
    create_default_wallets_for_user(user.id)
    
    return jsonify({"msg": "Registration successful"}), 201


@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    # 4. Краще використовувати .get() щоб уникнути KeyError
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    
    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        resp = jsonify({"msg": "login successful"})
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)
        return resp
        
    return jsonify({"msg": "Bad username or password"}), 401

@bp.route('/logout', methods=['POST'])
def logout():
    resp = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(resp)
    return resp

@bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True, locations=['cookies'])
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    resp = jsonify({"msg": "token refreshed"})
    set_access_cookies(resp, access_token)
    return resp

@bp.route('/protected', methods=['GET'])
@jwt_required(locations=['cookies'])
def protected():
    # 5. Отримуємо ID і перевіряємо
    user_id_str = get_jwt_identity()
    if not user_id_str:
        return jsonify({"msg": "Invalid token"}), 401
        
    user_id = int(user_id_str)
    user = db.session.get(User, user_id)
    
    if user is None:
        return jsonify({"msg": "User not found"}), 404
        
    return jsonify({"username": user.username})

# ping та echo видалені звідси, оскільки вони не стосуються автентифікації