from flask import Blueprint, jsonify, abort, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Wallet, Category, Transaction
from datetime import datetime
from sqlalchemy.orm import selectinload

bp = Blueprint('wallets', __name__, url_prefix='/api/wallets')

@bp.route('', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_wallets():
    user_id = int(get_jwt_identity())
    # wallets = Wallet.query.filter_by(user_id=user_id).all()
    wallets = Wallet.query.options(selectinload(Wallet.transactions)).filter_by(user_id=user_id).all()
    return jsonify([wallet.to_dict() for wallet in wallets])


@bp.route('', methods=['POST'])
@jwt_required(locations=['cookies'])
def create_wallet():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    # Create wallet record (balance is derived from transactions only)
    wallet = Wallet(
        name=data.get('name'),
        description=data.get('description'),
        icon=data.get('icon', '💳'),
        currency=data.get('currency', 'USD'),
        user_id=user_id
    )

    db.session.add(wallet)
    db.session.commit()

    # If an initial_balance was provided, create an adjustment transaction
    try:
        initial_balance = float(data.get('initial_balance', 0) or 0)
    except Exception:
        initial_balance = 0

    if initial_balance != 0:
        # Adjustment category is guaranteed to exist after registration
        cat = Category.query.filter_by(user_id=user_id, name='Adjust Balance').first()
        t_type = 'income' if initial_balance >= 0 else 'expense'
        transaction = Transaction(
            amount=abs(initial_balance),
            date=datetime.now(),
            title='Adjust Balance',
            description='Initial balance adjustment',
            type=t_type,
            category_id=cat.id if cat else None,
            wallet_id=wallet.id,
            user_id=user_id
        )
        db.session.add(transaction)
        db.session.commit()

    return jsonify(wallet.to_dict()), 201


@bp.route('/<int:wallet_id>', methods=['PUT'])
@jwt_required(locations=['cookies'])
def update_wallet(wallet_id):
    """Оновити гаманець"""
    user_id = int(get_jwt_identity())
    # wallet = Wallet.query.get_or_404(wallet_id)
    wallet = db.session.get(Wallet, wallet_id)
    if not wallet:
        abort(404)
    
    if wallet.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    data = request.get_json()
    
    if 'name' in data:
        wallet.name = data['name']
    if 'description' in data:
        wallet.description = data['description']
    if 'icon' in data:
        wallet.icon = data['icon']
    # If client sent an adjustment (or legacy initial_balance), create an adjustment transaction
    adjustment_amount = None
    if 'adjustment' in data:
        try:
            adjustment_amount = float(data.get('adjustment', 0) or 0)
        except Exception:
            adjustment_amount = 0
    elif 'initial_balance' in data:
        # legacy field used by frontend when editing; treat as an adjustment
        try:
            adjustment_amount = float(data.get('initial_balance', 0) or 0)
        except Exception:
            adjustment_amount = 0
    
    if adjustment_amount and adjustment_amount != 0:
        # Adjustment category is guaranteed to exist after registration
        cat = Category.query.filter_by(user_id=user_id, name='Adjust Balance').first()
        t_type = 'income' if adjustment_amount >= 0 else 'expense'
        transaction = Transaction(
            amount=abs(adjustment_amount),
            date=datetime.now(),
            title='Adjust Balance',
            description='Manual balance adjustment',
            type=t_type,
            category_id=cat.id if cat else None,
            wallet_id=wallet.id,
            user_id=user_id
        )
        db.session.add(transaction)
    if 'currency' in data:
        wallet.currency = data['currency']
    
    db.session.commit()
    
    return jsonify(wallet.to_dict())


@bp.route('/<int:wallet_id>', methods=['DELETE'])
@jwt_required(locations=['cookies'])
def delete_wallet(wallet_id):
    """Видалити гаманець"""
    user_id = int(get_jwt_identity())
    # wallet = Wallet.query.get_or_404(wallet_id)
    wallet = db.session.get(Wallet, wallet_id)
    if not wallet:
        abort(404)
    
    if wallet.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403
    
    has_transactions = Transaction.query.filter_by(wallet_id=wallet_id).count() > 0
    
    if has_transactions:
        return jsonify({"msg": "Cannot delete wallet with transactions"}), 400
    
    db.session.delete(wallet)
    db.session.commit()
    
    return jsonify({"msg": "Wallet deleted"}), 200

