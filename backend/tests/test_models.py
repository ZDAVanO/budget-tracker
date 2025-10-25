import datetime
import pytest
from models import User, Wallet, Transaction, Category, db
from app import create_default_categories_for_user, create_default_wallets_for_user


def test_wallet_balance_and_to_dict(app):
    with app.app_context():
        # create user
        u = User(username='user1', email='user1@example.com', password='pass')
        db.session.add(u)
        db.session.commit()

        # create wallet
        w = Wallet(name='Test Wallet', description='desc', currency='USD', user_id=u.id)
        db.session.add(w)
        db.session.commit()

        # create categories
        c_income = Category(name='Salary', type='income', user_id=u.id)
        c_expense = Category(name='Food', type='expense', user_id=u.id)
        db.session.add_all([c_income, c_expense])
        db.session.commit()

        # create transactions
        # use timezone-aware UTC datetimes to avoid deprecation warnings
        t1 = Transaction(amount=200.0, date=datetime.datetime.now(datetime.timezone.utc), type='income', user_id=u.id, category_id=c_income.id, wallet_id=w.id)
        t2 = Transaction(amount=75.25, date=datetime.datetime.now(datetime.timezone.utc), type='expense', user_id=u.id, category_id=c_expense.id, wallet_id=w.id)
        db.session.add_all([t1, t2])
        db.session.commit()

        # balance = 200 - 75.25 = 124.75
        assert w.get_balance() == pytest.approx(124.75)

        d = w.to_dict()
        assert d['balance'] == pytest.approx(124.75)
        assert d['name'] == 'Test Wallet'


def test_create_default_categories_and_wallets(app):
    with app.app_context():
        u = User(username='user2', email='user2@example.com', password='pass')
        db.session.add(u)
        db.session.commit()

        # create defaults
        create_default_categories_for_user(u.id)
        cats = Category.query.filter_by(user_id=u.id).all()
        assert len(cats) >= 5

        create_default_wallets_for_user(u.id)
        wallets = Wallet.query.filter_by(user_id=u.id).all()
        assert len(wallets) >= 1


def test_user_repr_and_relationships(app):
    with app.app_context():
        u = User(username='u_full', email='u_full@example.com', password='pw')
        db.session.add(u)
        db.session.commit()

        # create related objects
        w = Wallet(name='W1', description='wallet', currency='EUR', user_id=u.id)
        c = Category(name='C1', description='cat', icon='📁', type='expense', user_id=u.id)
        db.session.add_all([w, c])
        db.session.commit()

        # transaction linking
        t = Transaction(amount=10.5, date=datetime.datetime.now(datetime.timezone.utc), type='expense', user_id=u.id, category_id=c.id, wallet_id=w.id)
        db.session.add(t)
        db.session.commit()

        # repr
        assert repr(u) == f"<User {u.username}>"

        # relationships
        assert w in u.wallets
        assert c in u.categories
        assert any(tx.id == t.id for tx in u.transactions)


def test_transaction_to_dict_and_nested(app):
    with app.app_context():
        u = User(username='u_tdict', email='u_tdict@example.com', password='pw')
        db.session.add(u)
        db.session.commit()

        w = Wallet(name='W2', description='wallet2', currency='USD', user_id=u.id)
        c = Category(name='C2', description='cat2', icon='🔖', type='income', user_id=u.id)
        db.session.add_all([w, c])
        db.session.commit()

        when = datetime.datetime.now(datetime.timezone.utc)
        t = Transaction(amount=123.45, date=when, type='income', user_id=u.id, category_id=c.id, wallet_id=w.id)
        db.session.add(t)
        db.session.commit()

        d = t.to_dict()
        # basic fields
        assert d['id'] == t.id
        assert d['amount'] == pytest.approx(t.amount)
        assert d['type'] == 'income'
        # date is isoformat string — accept with or without timezone info
        assert isinstance(d['date'], str)
        parsed = datetime.datetime.fromisoformat(d['date'])
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=datetime.timezone.utc)
        # should be nearly equal
        assert abs((parsed - when).total_seconds()) < 1

        # nested dicts present
        assert isinstance(d['category'], dict)
        assert d['category']['id'] == c.id
        assert isinstance(d['wallet'], dict)
        assert d['wallet']['id'] == w.id


def test_wallet_balance_and_empty_wallet(app):
    with app.app_context():
        u = User(username='u_empty', email='u_empty@example.com', password='pw')
        db.session.add(u)
        db.session.commit()

        w = Wallet(name='Empty', description='no tx', currency='UAH', user_id=u.id)
        db.session.add(w)
        db.session.commit()

        # no transactions -> zero balance
        assert w.get_balance() == 0
        d = w.to_dict()
        assert d['balance'] == 0


def test_cascade_delete_user_removes_children(app):
    with app.app_context():
        u = User(username='u_cascade', email='u_cascade@example.com', password='pw')
        db.session.add(u)
        db.session.commit()

        w = Wallet(name='WC', description='to delete', currency='USD', user_id=u.id)
        c = Category(name='CC', description='to delete', icon='❌', type='both', user_id=u.id)
        db.session.add_all([w, c])
        db.session.commit()

        t = Transaction(amount=1.0, date=datetime.datetime.now(datetime.timezone.utc), type='expense', user_id=u.id, category_id=c.id, wallet_id=w.id)
        db.session.add(t)
        db.session.commit()

        w_id, c_id, t_id = w.id, c.id, t.id

        # delete user -> cascade should remove children
        db.session.delete(u)
        db.session.commit()

        assert db.session.get(Wallet, w_id) is None
        assert db.session.get(Category, c_id) is None
        assert db.session.get(Transaction, t_id) is None
