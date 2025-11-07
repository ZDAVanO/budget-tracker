from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Transaction

from datetime import datetime

from .rates import convert_amount

bp = Blueprint('statistics', __name__, url_prefix='/api/statistics')

@bp.route('', methods=['GET'])
@jwt_required(locations=['cookies'])
def get_statistics():
    """Отримати статистику.

    Optionally accepts base_currency query param (UAH|USD|EUR) to convert sums.
    """
    user_id = int(get_jwt_identity())

    # Параметри фільтрації
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    base_currency = (request.args.get('base_currency') or 'USD').upper()

    # Запит для всіх транзакцій
    query = Transaction.query.filter_by(user_id=user_id)

    if start_date:
        query = query.filter(Transaction.date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Transaction.date <= datetime.fromisoformat(end_date))

    transactions = query.all()

    total_expenses = 0.0
    total_incomes = 0.0
    for t in transactions:
        # Determine currency of the transaction via its wallet
        tx_currency = t.wallet.currency if t.wallet and t.wallet.currency else 'USD'
        converted = convert_amount(t.amount, tx_currency, base_currency)
        if t.type == 'expense':
            total_expenses += converted
        elif t.type == 'income':
            total_incomes += converted

    balance = total_incomes - total_expenses

    return jsonify({
        'total_expenses': round(total_expenses, 2),
        'total_incomes': round(total_incomes, 2),
        'balance': round(balance, 2),
        'base_currency': base_currency,
    })
