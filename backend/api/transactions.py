from flask import Blueprint, jsonify, abort, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Transaction
from sqlalchemy.orm import selectinload

bp = Blueprint('transactions', __name__, url_prefix='/api/transactions')

from datetime import datetime

def parse_local_datetime(dt_str):
    """Парсити дату у форматі YYYY-MM-DDTHH:MM:SS як локальний час"""
    try:
        return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S")
    except Exception:
        return datetime.fromisoformat(dt_str)

@bp.route('', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_transactions():
    """Отримати всі транзакції з фільтрацією"""
    user_id = int(get_jwt_identity())
    
    category_id = request.args.get('category_id')
    wallet_id = request.args.get('wallet_id')
    transaction_type = request.args.get('type')  # 'expense', 'income', або None
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Transaction.query.filter_by(user_id=user_id)
    
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
    
    # transactions = query.order_by(Transaction.date.desc()).all()
    transactions = query.options(
        selectinload(Transaction.category),
        selectinload(Transaction.wallet)
    ).order_by(Transaction.date.desc()).all()

    return jsonify([t.to_dict() for t in transactions])


@bp.route('', methods=['POST'])
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


@bp.route('/<int:transaction_id>', methods=['PUT'])
@jwt_required(locations=['cookies'])
def update_transaction(transaction_id):
    """Оновити транзакцію"""
    user_id = int(get_jwt_identity())
    # transaction = Transaction.query.get_or_404(transaction_id)
    transaction = db.session.get(Transaction, transaction_id)
    if not transaction:
        abort(404)

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


@bp.route('/<int:transaction_id>', methods=['DELETE'])
@jwt_required(locations=['cookies'])
def delete_transaction(transaction_id):
    """Видалити транзакцію"""
    user_id = int(get_jwt_identity())
    # transaction = Transaction.query.get_or_404(transaction_id)
    transaction = db.session.get(Transaction, transaction_id)
    if not transaction:
        abort(404)
    
    if transaction.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    db.session.delete(transaction)
    db.session.commit()
    
    return jsonify({"msg": "Transaction deleted"}), 200