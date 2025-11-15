from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
# from flask_login import UserMixin
db = SQLAlchemy()


# MARK: User
# class User(db.Model, UserMixin):
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=False)
    
    wallets = db.relationship('Wallet', backref='user', lazy=True, cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade='all, delete-orphan')
    categories = db.relationship('Category', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'


# MARK: Wallet
class Wallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(50), default='💳')
    currency = db.Column(db.String(10), default='USD')
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    transactions = db.relationship('Transaction', backref='wallet', lazy='selectin')
    
    def get_balance(self):
        """Розрахунок поточного балансу гаманця"""
        total_incomes = sum(t.amount for t in self.transactions if t.type == 'income')
        total_expenses = sum(t.amount for t in self.transactions if t.type == 'expense')
        return total_incomes - total_expenses
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'currency': self.currency,
            'user_id': self.user_id,
            'balance': self.get_balance()
        }


# MARK: Transaction
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    modified_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    title = db.Column(db.String(100))
    description = db.Column(db.String(255))
    type = db.Column(db.String(20), nullable=False)  # 'expense' або 'income'

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.id'), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'date': self.date.isoformat() if self.date else None,
            "modified_at": self.modified_at.isoformat() if self.modified_at else None,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'user_id': self.user_id,
            'category_id': self.category_id,
            'wallet_id': self.wallet_id,
            'category': self.category.to_dict() if self.category else None,
            'wallet': self.wallet.to_dict() if self.wallet else None
        }



# MARK: Category
class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(50))  # Emoji або іконка
    type = db.Column(db.String(20), nullable=False)  # 'expense' або 'income' або 'both'

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    transactions = db.relationship('Transaction', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'type': self.type,
            'user_id': self.user_id
        }

def create_default_categories_for_user(user_id):
    """Створення стандартних категорій для нового користувача"""
    default_categories = [
        # Uncategorized (must be first, protected)
        {'name': 'Uncategorized', 'icon': '📂', 'type': 'both', 'description': 'Default category for uncategorized transactions', 'uncategorized': True},
        # Adjustment category (must always exist)
        {'name': 'Adjust Balance', 'icon': '⚖️', 'type': 'both', 'description': 'Balance adjustments (initial/manual)', 'uncategorized': True},
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
        # Avoid duplicate category names for user
        exists = Category.query.filter_by(user_id=user_id, name=cat_data['name']).first()
        if not exists:
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
        {'name': 'Cash', 'icon': '💵', 'description': 'Pocket money', 'initial_balance': 0.0, 'currency': 'USD'},
        {'name': 'Bank card', 'icon': '💳', 'description': 'Main card', 'initial_balance': 0.0, 'currency': 'USD'},
    ]
    
    for wallet_data in default_wallets:
        wallet = Wallet(
            name=wallet_data['name'],
            icon=wallet_data['icon'],
            description=wallet_data['description'],
            currency=wallet_data['currency'],
            user_id=user_id
        )
        db.session.add(wallet)
    
    db.session.commit()














