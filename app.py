from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_cors import CORS
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.config['SECRET_KEY'] = os.urandom(24)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()

# Initialize extensions with app
db.init_app(app)
bcrypt.init_app(app)
login_manager.init_app(app)

# User Model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Relationship with items
    items = db.relationship('Item', backref='owner', lazy=True)

# Item Model
class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50), nullable=False)
    condition = db.Column(db.String(20), nullable=False)
    image_url = db.Column(db.String(200))
    price = db.Column(db.Float, nullable=True)  # Nullable for donations
    is_donation = db.Column(db.Boolean, default=False)  # True if item is for donation
    is_available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Create the database tables
with app.app_context():
    db.create_all()

# Serve static files
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_file(path):
    return send_from_directory('.', path)

# Item routes
@app.route('/api/items', methods=['GET'])
def get_items():
    # Get query parameters for filtering
    category = request.args.get('category')
    is_donation = request.args.get('is_donation', type=bool)
    
    # Start with base query
    query = Item.query.filter_by(is_available=True)
    
    # Apply filters if provided
    if category:
        query = query.filter_by(category=category)
    if is_donation is not None:
        query = query.filter_by(is_donation=is_donation)
    
    # Get items
    items = query.all()
    
    return jsonify({
        'items': [{
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'category': item.category,
            'condition': item.condition,
            'image_url': item.image_url,
            'price': item.price,
            'is_donation': item.is_donation,
            'owner_email': item.owner.email,
            'created_at': item.created_at.isoformat()
        } for item in items]
    }), 200

@app.route('/api/items/donate', methods=['POST'])
@login_required
def donate_item():
    data = request.get_json()
    
    new_item = Item(
        name=data['name'],
        description=data['description'],
        category=data['category'],
        condition=data['condition'],
        image_url=data.get('image_url'),
        is_donation=True,
        user_id=current_user.id
    )
    
    try:
        db.session.add(new_item)
        db.session.commit()
        return jsonify({
            'message': 'Item donated successfully',
            'item': {
                'id': new_item.id,
                'name': new_item.name,
                'category': new_item.category
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error donating item'}), 500

@app.route('/api/items/sell', methods=['POST'])
@login_required
def sell_item():
    data = request.get_json()
    
    if 'price' not in data or not data['price']:
        return jsonify({'error': 'Price is required for items being sold'}), 400
    
    new_item = Item(
        name=data['name'],
        description=data['description'],
        category=data['category'],
        condition=data['condition'],
        image_url=data.get('image_url'),
        price=float(data['price']),
        is_donation=False,
        user_id=current_user.id
    )
    
    try:
        db.session.add(new_item)
        db.session.commit()
        return jsonify({
            'message': 'Item listed for sale successfully',
            'item': {
                'id': new_item.id,
                'name': new_item.name,
                'category': new_item.category,
                'price': new_item.price
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error listing item for sale'}), 500

@app.route('/api/items/my-items', methods=['GET'])
@login_required
def get_my_items():
    items = Item.query.filter_by(user_id=current_user.id).all()
    return jsonify({
        'items': [{
            'id': item.id,
            'name': item.name,
            'description': item.description,
            'category': item.category,
            'condition': item.condition,
            'image_url': item.image_url,
            'price': item.price,
            'is_donation': item.is_donation,
            'is_available': item.is_available,
            'created_at': item.created_at.isoformat()
        } for item in items]
    }), 200

@app.route('/api/items/<int:item_id>', methods=['PUT'])
@login_required
def update_item(item_id):
    item = Item.query.get_or_404(item_id)
    
    # Check if the current user owns the item
    if item.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    
    try:
        for key, value in data.items():
            if key == 'price' and value is not None:
                value = float(value)
            setattr(item, key, value)
        db.session.commit()
        return jsonify({'message': 'Item updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error updating item'}), 500

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
@login_required
def delete_item(item_id):
    item = Item.query.get_or_404(item_id)
    
    # Check if the current user owns the item
    if item.user_id != current_user.id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({'message': 'Item deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error deleting item'}), 500

# Routes
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
    
    # Create new user
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(email=data['email'], password_hash=hashed_password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Error creating user'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, data['password']):
        login_user(user)
        return jsonify({
            'message': 'Login successful! Welcome back.',
            'user': {'email': user.email}
        }), 200
    
    return jsonify({'error': 'Invalid email or password. Please try again.'}), 401

@app.route('/api/logout')
def logout():
    if current_user.is_authenticated:
        logout_user()
        return jsonify({'message': 'You have been successfully logged out.'}), 200
    return jsonify({'message': 'You are already logged out.'}), 200

@app.route('/api/user')
@login_required
def get_user():
    return jsonify({
        'user': {
            'email': current_user.email,
            'id': current_user.id
        }
    }), 200

if __name__ == '__main__':
    app.run(debug=True) 