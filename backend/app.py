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

from models import db, User, Expense, Income, Category, Wallet



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
        # Витрати
        {'name': 'Їжа', 'icon': '🍔', 'type': 'expense', 'description': 'Продукти, ресторани, кафе'},
        {'name': 'Транспорт', 'icon': '🚗', 'type': 'expense', 'description': 'Проїзд, паливо, таксі'},
        {'name': 'Розваги', 'icon': '🎮', 'type': 'expense', 'description': 'Кіно, ігри, хобі'},
        {'name': 'Здоров\'я', 'icon': '💊', 'type': 'expense', 'description': 'Ліки, лікар, спортзал'},
        {'name': 'Одяг', 'icon': '👕', 'type': 'expense', 'description': 'Одяг, взуття, аксесуари'},
        {'name': 'Дім', 'icon': '🏠', 'type': 'expense', 'description': 'Оренда, комунальні, ремонт'},
        {'name': 'Освіта', 'icon': '📚', 'type': 'expense', 'description': 'Курси, книги, навчання'},
        {'name': 'Інше', 'icon': '📦', 'type': 'expense', 'description': 'Різні витрати'},
        
        # Доходи
        {'name': 'Зарплата', 'icon': '💰', 'type': 'income', 'description': 'Основний дохід'},
        {'name': 'Фріланс', 'icon': '💻', 'type': 'income', 'description': 'Додатковий заробіток'},
        {'name': 'Подарунки', 'icon': '🎁', 'type': 'income', 'description': 'Отримані подарунки'},
        {'name': 'Інвестиції', 'icon': '📈', 'type': 'income', 'description': 'Пасивний дохід'},
        {'name': 'Інше', 'icon': '💵', 'type': 'income', 'description': 'Різні доходи'},
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
    
    db.session.commit()


def create_default_wallets_for_user(user_id):
    """Створення стандартних гаманців для нового користувача"""
    default_wallets = [
        {'name': 'Готівка', 'icon': '💵', 'description': 'Кишенькові гроші', 'initial_balance': 0.0, 'currency': 'UAH'},
        {'name': 'Банківська картка', 'icon': '💳', 'description': 'Основна картка', 'initial_balance': 0.0, 'currency': 'UAH'},
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
    user = User.query.get(user_id)
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
    has_transactions = (
        Expense.query.filter_by(wallet_id=wallet_id).count() > 0 or
        Income.query.filter_by(wallet_id=wallet_id).count() > 0
    )
    
    if has_transactions:
        return jsonify({"msg": "Cannot delete wallet with transactions"}), 400
    
    db.session.delete(wallet)
    db.session.commit()
    
    return jsonify({"msg": "Wallet deleted"}), 200


# MARK: - Transactions (Combined)
@app.route('/api/transactions', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_transactions():
    """Отримати всі транзакції (доходи + витрати) з фільтрацією"""
    user_id = int(get_jwt_identity())
    
    # Параметри фільтрації
    category_id = request.args.get('category_id')
    wallet_id = request.args.get('wallet_id')
    transaction_type = request.args.get('type')  # 'expense', 'income', або None
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    transactions = []
    
    # Отримуємо витрати
    if not transaction_type or transaction_type == 'expense':
        expenses_query = Expense.query.filter_by(user_id=user_id)
        
        if category_id:
            expenses_query = expenses_query.filter_by(category_id=int(category_id))
        if wallet_id:
            expenses_query = expenses_query.filter_by(wallet_id=int(wallet_id))
        if start_date:
            expenses_query = expenses_query.filter(Expense.date >= datetime.fromisoformat(start_date))
        if end_date:
            expenses_query = expenses_query.filter(Expense.date <= datetime.fromisoformat(end_date))
        
        transactions.extend([e.to_dict() for e in expenses_query.all()])
    
    # Отримуємо доходи
    if not transaction_type or transaction_type == 'income':
        incomes_query = Income.query.filter_by(user_id=user_id)
        
        if category_id:
            incomes_query = incomes_query.filter_by(category_id=int(category_id))
        if wallet_id:
            incomes_query = incomes_query.filter_by(wallet_id=int(wallet_id))
        if start_date:
            incomes_query = incomes_query.filter(Income.date >= datetime.fromisoformat(start_date))
        if end_date:
            incomes_query = incomes_query.filter(Income.date <= datetime.fromisoformat(end_date))
        
        transactions.extend([i.to_dict() for i in incomes_query.all()])
    
    # Сортуємо за датою (нові спочатку)
    transactions.sort(key=lambda x: x['date'], reverse=True)
    
    return jsonify(transactions)


# MARK: - Expenses
@app.route('/api/expenses', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_expenses():
    """Отримати витрати з фільтрацією"""
    user_id = int(get_jwt_identity())
    
    query = Expense.query.filter_by(user_id=user_id)
    
    # Фільтрація
    category_id = request.args.get('category_id')
    if category_id:
        query = query.filter_by(category_id=int(category_id))
    
    start_date = request.args.get('start_date')
    if start_date:
        query = query.filter(Expense.date >= datetime.fromisoformat(start_date))
    
    end_date = request.args.get('end_date')
    if end_date:
        query = query.filter(Expense.date <= datetime.fromisoformat(end_date))
    
    # Сортування за датою (нові спочатку)
    expenses = query.order_by(Expense.date.desc()).all()
    
    return jsonify([expense.to_dict() for expense in expenses])


@app.route('/api/expenses', methods=['POST'])
@jwt_required(locations=['cookies'])
def create_expense():
    """Створити витрату"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    expense = Expense(
        amount=float(data.get('amount')),
        date=datetime.fromisoformat(data.get('date')),
        title=data.get('title'),
        description=data.get('description'),
        category_id=data.get('category_id'),
        wallet_id=data.get('wallet_id'),
        user_id=user_id
    )
    
    db.session.add(expense)
    db.session.commit()
    
    return jsonify(expense.to_dict()), 201


@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
@jwt_required(locations=['cookies'])
def update_expense(expense_id):
    """Оновити витрату"""
    user_id = int(get_jwt_identity())
    expense = Expense.query.get_or_404(expense_id)
    
    if expense.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if 'amount' in data:
        expense.amount = float(data['amount'])
    if 'date' in data:
        expense.date = datetime.fromisoformat(data['date'])
    if 'title' in data:
        expense.title = data['title']
    if 'description' in data:
        expense.description = data['description']
    if 'category_id' in data:
        expense.category_id = data['category_id']
    if 'wallet_id' in data:
        expense.wallet_id = data['wallet_id']
    
    db.session.commit()
    
    return jsonify(expense.to_dict())


@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
@jwt_required(locations=['cookies'])
def delete_expense(expense_id):
    """Видалити витрату"""
    user_id = int(get_jwt_identity())
    expense = Expense.query.get_or_404(expense_id)
    
    if expense.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    db.session.delete(expense)
    db.session.commit()
    
    return jsonify({"msg": "Expense deleted"}), 200


# MARK: - Incomes
@app.route('/api/incomes', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_incomes():
    """Отримати доходи з фільтрацією"""
    user_id = int(get_jwt_identity())
    
    query = Income.query.filter_by(user_id=user_id)
    
    # Фільтрація
    category_id = request.args.get('category_id')
    if category_id:
        query = query.filter_by(category_id=int(category_id))
    
    start_date = request.args.get('start_date')
    if start_date:
        query = query.filter(Income.date >= datetime.fromisoformat(start_date))
    
    end_date = request.args.get('end_date')
    if end_date:
        query = query.filter(Income.date <= datetime.fromisoformat(end_date))
    
    # Сортування за датою (нові спочатку)
    incomes = query.order_by(Income.date.desc()).all()
    
    return jsonify([income.to_dict() for income in incomes])


@app.route('/api/incomes', methods=['POST'])
@jwt_required(locations=['cookies'])
def create_income():
    """Створити дохід"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    income = Income(
        amount=float(data.get('amount')),
        date=datetime.fromisoformat(data.get('date')),
        title=data.get('title'),
        description=data.get('description'),
        category_id=data.get('category_id'),
        wallet_id=data.get('wallet_id'),
        user_id=user_id
    )
    
    db.session.add(income)
    db.session.commit()
    
    return jsonify(income.to_dict()), 201


@app.route('/api/incomes/<int:income_id>', methods=['PUT'])
@jwt_required(locations=['cookies'])
def update_income(income_id):
    """Оновити дохід"""
    user_id = int(get_jwt_identity())
    income = Income.query.get_or_404(income_id)
    
    if income.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if 'amount' in data:
        income.amount = float(data['amount'])
    if 'date' in data:
        income.date = datetime.fromisoformat(data['date'])
    if 'title' in data:
        income.title = data['title']
    if 'description' in data:
        income.description = data['description']
    if 'category_id' in data:
        income.category_id = data['category_id']
    if 'wallet_id' in data:
        income.wallet_id = data['wallet_id']
    
    db.session.commit()
    
    return jsonify(income.to_dict())


@app.route('/api/incomes/<int:income_id>', methods=['DELETE'])
@jwt_required(locations=['cookies'])
def delete_income(income_id):
    """Видалити дохід"""
    user_id = int(get_jwt_identity())
    income = Income.query.get_or_404(income_id)
    
    if income.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    db.session.delete(income)
    db.session.commit()
    
    return jsonify({"msg": "Income deleted"}), 200


# MARK: - Statistics
@app.route('/api/statistics', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_statistics():
    """Отримати статистику"""
    user_id = int(get_jwt_identity())
    
    # Параметри фільтрації
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Запити для витрат
    expenses_query = Expense.query.filter_by(user_id=user_id)
    if start_date:
        expenses_query = expenses_query.filter(Expense.date >= datetime.fromisoformat(start_date))
    if end_date:
        expenses_query = expenses_query.filter(Expense.date <= datetime.fromisoformat(end_date))
    
    # Запити для доходів
    incomes_query = Income.query.filter_by(user_id=user_id)
    if start_date:
        incomes_query = incomes_query.filter(Income.date >= datetime.fromisoformat(start_date))
    if end_date:
        incomes_query = incomes_query.filter(Income.date <= datetime.fromisoformat(end_date))
    
    total_expenses = sum(e.amount for e in expenses_query.all())
    total_incomes = sum(i.amount for i in incomes_query.all())
    balance = total_incomes - total_expenses
    
    return jsonify({
        'total_expenses': total_expenses,
        'total_incomes': total_incomes,
        'balance': balance
    })





# Run server
if __name__ == '__main__':
    print("Starting Flask server...")

    with app.app_context():
        db.create_all()
        
    app.run(debug=True, port=5000)