import logging

logging.basicConfig()
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)


from flask import (
    Flask,
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
    JWTManager
)

from datetime import datetime, timedelta
import random
from models import (
    db, User, Transaction, Category, Wallet,
    create_default_categories_for_user, 
    create_default_wallets_for_user
)

from api.auth import bp as auth_bp
from api.wallets import bp as wallets_bp
from api.categories import bp as categories_bp
from api.transactions import bp as transactions_bp
from api.stats import bp as stats_bp
from api.rates import bp as rates_bp

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
# CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://localhost:5173"])
CORS(app, supports_credentials=True)

db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(wallets_bp)
app.register_blueprint(categories_bp)
app.register_blueprint(transactions_bp)
app.register_blueprint(stats_bp)
app.register_blueprint(rates_bp)

# login_manager = LoginManager()
# login_manager.init_app(app)
# login_manager.login_view = 'login'

# @login_manager.user_loader
# def load_user(user_id):
#     return User.query.get(int(user_id))

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"})

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json()
    print("Received from frontend:", data)
    return jsonify({"status": "received"})

# MARK: Test User
def create_test_user_with_data():
    """Create test user with extra wallets, categories, and random transactions"""
    username = "test"
    password = "test"
    email = "test@example.com"
    user = User.query.filter_by(username=username).first()
    if not user:
        from werkzeug.security import generate_password_hash
        hashed_password = generate_password_hash(password)
        user = User(username=username, email=email, password=hashed_password)
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
                currency=w['currency'],
                user_id=user.id
            )
            db.session.add(wallet)
            db.session.commit()

            # If an initial balance was specified for test data, create adjustment transaction
            try:
                init_bal = float(w.get('initial_balance', 0) or 0)
            except Exception:
                init_bal = 0
            if init_bal != 0:
                cat = Category.query.filter_by(user_id=user.id, name='Adjust Balance').first()
                t_type = 'income' if init_bal >= 0 else 'expense'
                transaction = Transaction(
                    amount=abs(init_bal),
                    date=datetime.now(),
                    title='Adjust Balance',
                    description='Initial balance (test data)',
                    type=t_type,
                    category_id=cat.id,
                    wallet_id=wallet.id,
                    user_id=user.id
                )
                db.session.add(transaction)
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

    app.run(debug=True, port=5000, host='0.0.0.0')