from flask import Blueprint, jsonify, abort, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Category, Transaction

bp = Blueprint('categories', __name__, url_prefix='/api/categories')

PROTECTED_CATEGORY_NAMES = {'Uncategorized', 'Adjust Balance'}

@bp.route('', methods=['GET'])
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


@bp.route('', methods=['POST'])
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


@bp.route('/<int:category_id>', methods=['DELETE'])
@jwt_required(locations=['cookies'])
def delete_category(category_id):
    """Видалити категорію"""
    user_id = int(get_jwt_identity())
    # category = Category.query.get_or_404(category_id)
    category = db.session.get(Category, category_id)
    if not category:
        abort(404)
    
    if category.user_id != user_id:
        return jsonify({"msg": "Unauthorized"}), 403

    if category.name in PROTECTED_CATEGORY_NAMES:
        return jsonify({"msg": "Cannot delete category"}), 400
    
    Transaction.query.filter_by(category_id=category.id).delete()
    db.session.delete(category)
    db.session.commit()
    
    return jsonify({"msg": "Category deleted"}), 200


@bp.route('/<int:category_id>', methods=['PUT'])
@jwt_required(locations=['cookies'])
def update_category(category_id):
    """Оновити категорію"""
    user_id = int(get_jwt_identity())
    # category = Category.query.get_or_404(category_id)
    category = db.session.get(Category, category_id)
    if not category:
        abort(404)
    
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
