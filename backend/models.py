from flask_sqlalchemy import SQLAlchemy
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
    expenses = db.relationship('Expense', backref='user', lazy=True, cascade='all, delete-orphan')
    incomes = db.relationship('Income', backref='user', lazy=True, cascade='all, delete-orphan')
    categories = db.relationship('Category', backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.username}>'


# MARK: Wallet
class Wallet(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
    icon = db.Column(db.String(50), default='💳')
    initial_balance = db.Column(db.Float, default=0.0)
    currency = db.Column(db.String(10), default='UAH')
    is_default = db.Column(db.Boolean, default=False)
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    expenses = db.relationship('Expense', backref='wallet', lazy=True)
    incomes = db.relationship('Income', backref='wallet', lazy=True)
    
    def get_balance(self):
        """Розрахунок поточного балансу гаманця"""
        total_incomes = sum(i.amount for i in self.incomes)
        total_expenses = sum(e.amount for e in self.expenses)
        return self.initial_balance + total_incomes - total_expenses
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'initial_balance': self.initial_balance,
            'currency': self.currency,
            'is_default': self.is_default,
            'user_id': self.user_id,
            'balance': self.get_balance()
        }


# MARK: Expense
class Expense(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    title = db.Column(db.String(100))
    description = db.Column(db.String(255))
    type = db.Column(db.String(20), default='expense')  # Для сумісності з єдиним списком

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'date': self.date.isoformat() if self.date else None,
            'title': self.title,
            'description': self.description,
            'type': 'expense',
            'user_id': self.user_id,
            'category_id': self.category_id,
            'wallet_id': self.wallet_id,
            'category': self.category.to_dict() if self.category else None,
            'wallet': self.wallet.to_dict() if self.wallet else None
        }


# MARK: Income
class Income(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False)

    title = db.Column(db.String(100))
    description = db.Column(db.String(255))
    type = db.Column(db.String(20), default='income')  # Для сумісності з єдиним списком

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=True)
    wallet_id = db.Column(db.Integer, db.ForeignKey('wallet.id'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'amount': self.amount,
            'date': self.date.isoformat() if self.date else None,
            'title': self.title,
            'description': self.description,
            'type': 'income',
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
    is_default = db.Column(db.Boolean, default=False)  # Стандартна категорія чи ні

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # None для стандартних категорій

    expenses = db.relationship('Expense', backref='category', lazy=True)
    incomes = db.relationship('Income', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'type': self.type,
            'is_default': self.is_default,
            'user_id': self.user_id
        }















