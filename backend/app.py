from flask import (
    Flask,
    render_template,
    redirect,
    url_for,
    flash,
    jsonify,
    request,
)

from flask_cors import CORS  # Allows React to access Flask

# from flask_login import (
#     LoginManager,
#     login_user,
#     logout_user,
#     login_required,
#     current_user,
# )
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, unset_jwt_cookies,
    set_access_cookies, set_refresh_cookies
)

from datetime import datetime, timedelta
import random

def parse_local_datetime(dt_str):
    """Парсити дату у форматі YYYY-MM-DDTHH:MM:SS як локальний час"""
    try:
        return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S")
    except Exception:
        # fallback на ISO (з таймзоною)
        return datetime.fromisoformat(dt_str)

from models import db, User, Transaction, Category, Wallet



app = Flask(__name__)

app.config['SECRET_KEY'] = 'your_secret_key_here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT config
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key_here'
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/api/refresh'
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # True для production!
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)


# CORS(app)  # Allows all domains (for development)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://localhost:5173"])

db.init_app(app)
jwt = JWTManager(app)

# login_manager = LoginManager()
# login_manager.init_app(app)
# login_manager.login_view = 'login'

# @login_manager.user_loader
# def load_user(user_id):
#     return User.query.get(int(user_id))








def create_default_categories_for_user(user_id):
    """Створення стандартних категорій для нового користувача"""
    default_categories = [
        # Uncategorized (must be first, protected)
        {'name': 'Uncategorized', 'icon': '📂', 'type': 'both', 'description': 'Default category for uncategorized transactions', 'uncategorized': True},
        # Витрати
        {'name': 'Food', 'icon': '🍔', 'type': 'expense', 'description': 'Groceries, restaurants, cafes'},
        {'name': 'Transport', 'icon': '🚗', 'type': 'expense', 'description': 'Transport, fuel, taxi'},
        {'name': 'Entertainment', 'icon': '🎮', 'type': 'expense', 'description': 'Movies, games, hobbies'},
        {'name': 'Health', 'icon': '💊', 'type': 'expense', 'description': 'Medicine, doctor, gym'},
        {'name': 'Clothing', 'icon': '👕', 'type': 'expense', 'description': 'Clothes, shoes, accessories'},
        {'name': 'Home', 'icon': '🏠', 'type': 'expense', 'description': 'Rent, utilities, repairs'},
        {'name': 'Education', 'icon': '📚', 'type': 'expense', 'description': 'Courses, books, learning'},
        {'name': 'Other', 'icon': '📦', 'type': 'expense', 'description': 'Other expenses'},
        
        # Доходи
        {'name': 'Salary', 'icon': '💰', 'type': 'income', 'description': 'Main income'},
        {'name': 'Freelance', 'icon': '💻', 'type': 'income', 'description': 'Additional earnings'},
        {'name': 'Gifts', 'icon': '🎁', 'type': 'income', 'description': 'Received gifts'},
        {'name': 'Investments', 'icon': '📈', 'type': 'income', 'description': 'Passive income'},
        {'name': 'Other', 'icon': '💵', 'type': 'income', 'description': 'Other incomes'},
    ]
    
    for cat_data in default_categories:
        category = Category(
            name=cat_data['name'],
            icon=cat_data['icon'],
            type=cat_data['type'],
            description=cat_data['description'],
            user_id=user_id
        )
        db.session.add(category)
        # Store uncategorized category id for later use if needed
    
    db.session.commit()


def create_default_wallets_for_user(user_id):
    """Створення стандартних гаманців для нового користувача"""
    default_wallets = [
        {'name': 'Cash', 'icon': '💵', 'description': 'Pocket money', 'initial_balance': 0.0, 'currency': 'UAH'},
        {'name': 'Bank card', 'icon': '💳', 'description': 'Main card', 'initial_balance': 0.0, 'currency': 'UAH'},
    ]
    
    for wallet_data in default_wallets:
        wallet = Wallet(
            name=wallet_data['name'],
            icon=wallet_data['icon'],
            description=wallet_data['description'],
            initial_balance=wallet_data['initial_balance'],
            currency=wallet_data['currency'],
            user_id=user_id
        )
        db.session.add(wallet)
    
    db.session.commit()


@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"msg": "Missing fields"}), 400

    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"msg": "User already exists"}), 409

    user = User(username=username, email=email, password=password)
    db.session.add(user)
    db.session.commit()
    
    # Створюємо стандартні категорії та гаманці для нового користувача
    create_default_categories_for_user(user.id)
    create_default_wallets_for_user(user.id)
    
    return jsonify({"msg": "Registration successful"}), 201





@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and user.password == data['password']:
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        resp = jsonify({"msg": "login successful"})
        set_access_cookies(resp, access_token)
        set_refresh_cookies(resp, refresh_token)
        return resp
    return jsonify({"msg": "Bad username or password"}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    resp = jsonify({"msg": "logout successful"})
    unset_jwt_cookies(resp)
    return resp

@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True, locations=['cookies'])
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    resp = jsonify({"msg": "token refreshed"})
    set_access_cookies(resp, access_token)
    return resp

@app.route('/api/protected', methods=['GET'])
@jwt_required(locations=['cookies'])
def protected():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"msg": "User not found"}), 404
    return jsonify({"username": user.username})



@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"})

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    print("Received from frontend:", data)
    return jsonify({"status": "received"})



# MARK: - Categories
@app.route('/api/categories', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_categories():
    """Отримати категорії користувача"""
    user_id = int(get_jwt_identity())
    category_type = request.args.get('type')  # 'expense', 'income', або None для всіх
    
    query = Category.query.filter_by(user_id=user_id)
    
    if category_type:
        query = query.filter(
            (Category.type == category_type) | (Category.type == 'both')
        )
    
    categories = query.all()
    return jsonify([cat.to_dict() for cat in categories])


@app.route('/api/categories', methods=['POST'])
@jwt_required(locations=['cookies'])
def create_category():
    """Створити категорію"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    category = Category(
        name=data.get('name'),
        description=data.get('description'),
        icon=data.get('icon', '📌'),
        type=data.get('type', 'both'),
        user_id=user_id
    )
    
    db.session.add(category)
    db.session.commit()
    
    return jsonify(category.to_dict()), 201


@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@jwt_required(locations=['cookies'])
def delete_category(category_id):
    """Видалити категорію"""
    user_id = int(get_jwt_identity())
    category = Category.query.get_or_404(category_id)
    
    # Перевіряємо, що це категорія користувача
    if category.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    # Заборонити видалення категорії 'Uncategorized'
    if category.name == 'Uncategorized':
        return jsonify({"msg": "Cannot delete 'Uncategorized' category"}), 400

    db.session.delete(category)
    db.session.commit()
    
    return jsonify({"msg": "Category deleted"}), 200


@app.route('/api/categories/<int:category_id>', methods=['PUT'])
@jwt_required(locations=['cookies'])
def update_category(category_id):
    """Оновити категорію"""
    user_id = int(get_jwt_identity())
    category = Category.query.get_or_404(category_id)
    
    # Перевіряємо, що це категорія користувача
    if category.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        category.name = data['name']
    if 'description' in data:
        category.description = data['description']
    if 'icon' in data:
        category.icon = data['icon']
    if 'type' in data:
        category.type = data['type']
    
    db.session.commit()
    
    return jsonify(category.to_dict())


# MARK: - Wallets
@app.route('/api/wallets', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_wallets():
    """Отримати всі гаманці користувача"""
    user_id = int(get_jwt_identity())
    wallets = Wallet.query.filter_by(user_id=user_id).all()
    return jsonify([wallet.to_dict() for wallet in wallets])


@app.route('/api/wallets', methods=['POST'])
@jwt_required(locations=['cookies'])
def create_wallet():
    """Створити новий гаманець"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    wallet = Wallet(
        name=data.get('name'),
        description=data.get('description'),
        icon=data.get('icon', '💳'),
        initial_balance=float(data.get('initial_balance', 0)),
        currency=data.get('currency', 'UAH'),
        user_id=user_id
    )
    
    db.session.add(wallet)
    db.session.commit()
    
    return jsonify(wallet.to_dict()), 201


@app.route('/api/wallets/<int:wallet_id>', methods=['PUT'])
@jwt_required(locations=['cookies'])
def update_wallet(wallet_id):
    """Оновити гаманець"""
    user_id = int(get_jwt_identity())
    wallet = Wallet.query.get_or_404(wallet_id)
    
    if wallet.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        wallet.name = data['name']
    if 'description' in data:
        wallet.description = data['description']
    if 'icon' in data:
        wallet.icon = data['icon']
    if 'initial_balance' in data:
        wallet.initial_balance = float(data['initial_balance'])
    if 'currency' in data:
        wallet.currency = data['currency']
    
    db.session.commit()
    
    return jsonify(wallet.to_dict())


@app.route('/api/wallets/<int:wallet_id>', methods=['DELETE'])
@jwt_required(locations=['cookies'])
def delete_wallet(wallet_id):
    """Видалити гаманець"""
    user_id = int(get_jwt_identity())
    wallet = Wallet.query.get_or_404(wallet_id)
    
    if wallet.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    # Перевіряємо, чи є транзакції прив'язані до цього гаманця
    has_transactions = Transaction.query.filter_by(wallet_id=wallet_id).count() > 0
    
    if has_transactions:
        return jsonify({"msg": "Cannot delete wallet with transactions"}), 400
    
    db.session.delete(wallet)
    db.session.commit()
    
    return jsonify({"msg": "Wallet deleted"}), 200


# MARK: - Transactions
@app.route('/api/transactions', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_transactions():
    """Отримати всі транзакції з фільтрацією"""
    user_id = int(get_jwt_identity())
    
    # Параметри фільтрації
    category_id = request.args.get('category_id')
    wallet_id = request.args.get('wallet_id')
    transaction_type = request.args.get('type')  # 'expense', 'income', або None
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Transaction.query.filter_by(user_id=user_id)
    
    # Фільтрація
    if category_id:
        query = query.filter_by(category_id=int(category_id))
    if wallet_id:
        query = query.filter_by(wallet_id=int(wallet_id))
    if transaction_type:
        query = query.filter_by(type=transaction_type)
    if start_date:
        query = query.filter(Transaction.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Transaction.date <= datetime.fromisoformat(end_date))
    
    # Сортування за датою (нові спочатку)
    transactions = query.order_by(Transaction.date.desc()).all()
    
    return jsonify([t.to_dict() for t in transactions])


@app.route('/api/transactions', methods=['POST'])
@jwt_required(locations=['cookies'])
def create_transaction():
    """Створити транзакцію"""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    # Require wallet_id, type, and category_id
    if not data.get('wallet_id'):
        return jsonify({"msg": "Wallet is required"}), 400
    if not data.get('type') or data.get('type') not in ['expense', 'income']:
        return jsonify({"msg": "Valid transaction type is required (expense or income)"}), 400
    if not data.get('category_id'):
        return jsonify({"msg": "Category is required"}), 400

    transaction = Transaction(
        amount=float(data.get('amount')),
        date=parse_local_datetime(data.get('date')),
        title=data.get('title'),
        description=data.get('description'),
        type=data.get('type'),
        category_id=data.get('category_id'),
        wallet_id=data.get('wallet_id'),
        user_id=user_id
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify(transaction.to_dict()), 201


@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required(locations=['cookies'])
def update_transaction(transaction_id):
    """Оновити транзакцію"""
    user_id = int(get_jwt_identity())
    transaction = Transaction.query.get_or_404(transaction_id)

    if transaction.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    data = request.get_json()

    # Require wallet_id and category_id if present or on update
    if 'wallet_id' in data and not data['wallet_id']:
        return jsonify({"msg": "Wallet is required"}), 400
    if 'type' in data and data['type'] not in ['expense', 'income']:
        return jsonify({"msg": "Valid transaction type is required (expense or income)"}), 400
    if 'category_id' in data and not data['category_id']:
        return jsonify({"msg": "Category is required"}), 400

    if 'amount' in data:
        transaction.amount = float(data['amount'])
    if 'date' in data:
        transaction.date = parse_local_datetime(data['date'])
    if 'title' in data:
        transaction.title = data['title']
    if 'description' in data:
        transaction.description = data['description']
    if 'type' in data:
        transaction.type = data['type']
    if 'category_id' in data:
        transaction.category_id = data['category_id']
    if 'wallet_id' in data:
        transaction.wallet_id = data['wallet_id']

    db.session.commit()

    return jsonify(transaction.to_dict())


@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required(locations=['cookies'])
def delete_transaction(transaction_id):
    """Видалити транзакцію"""
    user_id = int(get_jwt_identity())
    transaction = Transaction.query.get_or_404(transaction_id)
    
    if transaction.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({"msg": "Transaction deleted"}), 200


# MARK: - Statistics
@app.route('/api/statistics', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_statistics():
    """Отримати статистику"""
    user_id = int(get_jwt_identity())
    
    # Параметри фільтрації
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Запит для всіх транзакцій
    query = Transaction.query.filter_by(user_id=user_id)
    
    if start_date:
        query = query.filter(Transaction.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Transaction.date <= datetime.fromisoformat(end_date))
    
    transactions = query.all()
    
    total_expenses = sum(t.amount for t in transactions if t.type == 'expense')
    total_incomes = sum(t.amount for t in transactions if t.type == 'income')
    balance = total_incomes - total_expenses
    
    return jsonify({
        'total_expenses': total_expenses,
        'total_incomes': total_incomes,
        'balance': balance
    })


def create_test_user_with_data():
    """Create test user with extra wallets, categories, and random transactions"""
    username = "test"
    password = "test"
    email = "test@example.com"
    user = User.query.filter_by(username=username).first()
    if not user:
        user = User(username=username, email=email, password=password)
        db.session.add(user)
        db.session.commit()
        create_default_categories_for_user(user.id)
        create_default_wallets_for_user(user.id)

        # Extra wallets
        extra_wallets = [
            {'name': 'Crypto', 'icon': '🪙', 'description': 'Crypto wallet', 'initial_balance': 1000, 'currency': 'USD'},
            {'name': 'Savings', 'icon': '🏦', 'description': 'Savings account', 'initial_balance': 5000, 'currency': 'UAH'},
        ]
        for w in extra_wallets:
            wallet = Wallet(
                name=w['name'],
                icon=w['icon'],
                description=w['description'],
                initial_balance=w['initial_balance'],
                currency=w['currency'],
                user_id=user.id
            )
            db.session.add(wallet)
        db.session.commit()

        # Extra categories
        extra_categories = [
            {'name': 'Travel', 'icon': '✈️', 'type': 'expense', 'description': 'Travel expenses'},
            {'name': 'Charity', 'icon': '🙏', 'type': 'expense', 'description': 'Charity donations'},
            {'name': 'Bonus', 'icon': '🎉', 'type': 'income', 'description': 'Bonuses'},
        ]
        for c in extra_categories:
            category = Category(
                name=c['name'],
                icon=c['icon'],
                type=c['type'],
                description=c['description'],
                user_id=user.id
            )
            db.session.add(category)
        db.session.commit()

        # Get all wallets and categories for test user
        wallets = Wallet.query.filter_by(user_id=user.id).all()
        categories = Category.query.filter_by(user_id=user.id).all()
        wallet_ids = [w.id for w in wallets]
        category_ids = [c.id for c in categories]

        # Random transactions
        titles = [
            'Lunch', 'Taxi', 'Salary', 'Gift', 'Groceries', 'Rent', 'Gym', 'Book', 'Concert', 'Investment',
            'Coffee', 'Utilities', 'Internet', 'Phone', 'Insurance', 'Shopping', 'Medicine', 'Cinema', 'Flight', 'Hotel',
            'Subscription', 'Parking', 'Car Repair', 'Pet Food', 'Birthday', 'Bonus', 'Freelance', 'Transfer', 'Withdrawal', 'Deposit'
        ]
        descriptions = [
            'Paid for', 'Received', 'Spent on', 'Bought', 'Transferred', 'Top-up', 'Withdrawal', 'Donation', 'Bonus', 'Refund',
            'Monthly bill', 'Annual fee', 'Discounted', 'Online order', 'Cashback', 'Installment', 'Membership', 'Emergency', 'Travel expense', 'Gifted',
            'Reimbursement', 'Advance', 'Partial payment', 'Full payment', 'Interest', 'Commission', 'Service charge', 'Maintenance', 'Lost', 'Found'
        ]
        types = ['expense', 'income']

        for _ in range(1500):
            t_type = random.choice(types)
            amount = round(random.uniform(10, 5000), 2)
            title = random.choice(titles)
            description = random.choice(descriptions)
            category_id = random.choice(category_ids)
            wallet_id = random.choice(wallet_ids)
            # Random date in last 90 days
            days_ago = random.randint(0, 700)
            dt = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            transaction = Transaction(
                amount=amount,
                date=dt,
                title=title,
                description=description,
                type=t_type,
                category_id=category_id,
                wallet_id=wallet_id,
                user_id=user.id
            )
            db.session.add(transaction)
        db.session.commit()
        print("Test user with data created.")
    else:
        print("Test user already exists.")


# Run server
if __name__ == '__main__':
    print("Starting Flask server...")

    with app.app_context():
        db.create_all()
        create_test_user_with_data()

    app.run(debug=True, port=5000)