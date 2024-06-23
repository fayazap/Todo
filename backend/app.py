import os
import ssl
import random
import string
import smtplib
from email.message import EmailMessage
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db, User, Todo
from config import config
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Apply CORS to your Flask app

# Load configuration from config.py
env_config = os.getenv('FLASK_CONFIG', 'dev')
app.config.from_object(config[env_config])

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Create database tables if they don't exist
with app.app_context():
    db.create_all()

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400

        user = User.query.filter_by(email=email).first()

        if user and bcrypt.check_password_hash(user.password, password):
            access_token = create_access_token(identity=user.id)
            response_data = {'access_token': access_token, 'user_id': user.id}
            return jsonify(response_data), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def send_password_reset_token(email, token):
    # SMTP server configuration
    smtp_server = 'smtp.gmail.com'
    smtp_port = 465  # SSL port for Gmail SMTP
    smtp_username = "chatbotacad@gmail.com"  # Your Gmail address
    smtp_password = "bfxr ophc ubaf xvot"  # Your Gmail password

    # Create the email message
    email_msg = EmailMessage()
    email_msg['Subject'] = 'Password Reset Instructions'
    email_msg['From'] = "chatbotacad@gmail.com"
    email_msg['To'] = email
    email_msg.set_content(f'Hi,\n\nPlease use the following token to reset your password: {token}')

    # Connect to the SMTP server and send the email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
        server.login(smtp_username, smtp_password)
        server.send_message(email_msg)
        print(f"Password reset instructions sent to {email}")

def generate_reset_token(length=6):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.json
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email is required'}), 400

        user = User.query.filter_by(email=email).first()

        if user:
            token = generate_reset_token()
            user.reset_password_token = token
            db.session.commit()
            send_password_reset_token(email, token)
            return jsonify({'message': 'Password reset instructions sent to your email'}), 200
        else:
            return jsonify({'error': 'User with this email does not exist'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.json
        email = data.get('email')
        token = data.get('token')
        new_password = data.get('new_password')

        if not email or not token or not new_password:
            return jsonify({'error': 'Email, token, and new password are required'}), 400

        user = User.query.filter_by(email=email).first()

        if user:
            if user.reset_password_token == token:
                user.password = bcrypt.generate_password_hash(new_password).decode('utf-8')
                user.reset_password_token = None
                db.session.commit()
                return jsonify({'message': 'Password reset successfully'}), 200
            else:
                return jsonify({'error': 'Invalid token'}), 400
        else:
            return jsonify({'error': 'User with this email does not exist'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/signup', methods=['POST'])
def signup():
    try:
        data = request.json
        name = data.get('name')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not name or not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({'error': 'Username already exists. Please choose a different username.'}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(name=name, username=username, email=email, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=new_user.id)
        print(f"User created successfully: {new_user}")
        return jsonify({'message': 'User created successfully', 'access_token': access_token}), 201

    except Exception as e:
        print(f"Error in signup route: {str(e)}")
        return jsonify({'error': 'Internal Server Error'}), 500

    
@app.route('/todos', methods=['GET'])
@jwt_required()
def get_todos():
    try:
        current_user_id = get_jwt_identity()
        todos = Todo.query.filter_by(user_id=current_user_id).all()
        todos_list = []
        for todo in todos:
            if not todo.completed:  # Only include todos that are not completed
                todos_list.append({
                    'id': todo.id,
                    'title': todo.title,
                    'description': todo.description,
                    'completed': todo.completed,
                    'deadline': todo.deadline.isoformat() if todo.deadline else None
                })
        return jsonify({'todos': todos_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/todos', methods=['POST'])
@jwt_required()
def create_todo():
    try:
        current_user_id = get_jwt_identity()
        data = request.json
        title = data.get('title')
        description = data.get('description')
        completed = data.get('completed', False)  # Default completed to False if not provided
        deadline = data.get('deadline')

        if not title:
            return jsonify({'error': 'Title is required'}), 400

        new_todo = Todo(
            title=title,
            description=description,
            user_id=current_user_id,
            completed=completed,
            deadline=datetime.fromisoformat(deadline) if deadline else None
        )
        db.session.add(new_todo)
        db.session.commit()

        return jsonify({'message': 'Todo created successfully', 'todo': {
            'id': new_todo.id,
            'title': new_todo.title,
            'description': new_todo.description,
            'completed': new_todo.completed,
            'deadline': new_todo.deadline.isoformat() if new_todo.deadline else None
        }}), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/todos/<int:todo_id>', methods=['PUT'])
@jwt_required()
def update_todo(todo_id):
    try:
        current_user_id = get_jwt_identity()
        todo = Todo.query.filter_by(id=todo_id, user_id=current_user_id).first()

        if not todo:
            return jsonify({'error': 'Todo not found or you do not have permission to update it'}), 404

        data = request.json
        title = data.get('title')
        description = data.get('description')
        completed = data.get('completed')
        deadline = data.get('deadline')

        if title:
            todo.title = title
        if description:
            todo.description = description
        if completed is not None:
            todo.completed = completed
        if deadline:
            todo.deadline = datetime.fromisoformat(deadline)

        db.session.commit()

        return jsonify({'message': 'Todo updated successfully', 'todo': {
            'id': todo.id,
            'title': todo.title,
            'description': todo.description,
            'completed': todo.completed,
            'deadline': todo.deadline.isoformat() if todo.deadline else None
        }}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/todos/<int:todo_id>', methods=['DELETE'])
@jwt_required()
def delete_todo(todo_id):
    try:
        current_user_id = get_jwt_identity()
        todo = Todo.query.filter_by(id=todo_id, user_id=current_user_id).first()

        if not todo:
            return jsonify({'error': 'Todo not found or you do not have permission to delete it'}), 404

        db.session.delete(todo)
        db.session.commit()

        return jsonify({'message': 'Todo deleted successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/completed-todos', methods=['GET'])
@jwt_required()
def get_completed_todos():
    try:
        current_user_id = get_jwt_identity()
        completed_todos = Todo.query.filter_by(user_id=current_user_id, completed=True).all()
        completed_todos_list = [{
            'id': todo.id,
            'title': todo.title,
            'description': todo.description,
            'completed': todo.completed,
            'deadline': todo.deadline.isoformat() if todo.deadline else None
        } for todo in completed_todos]

        return jsonify({'completed_todos': completed_todos_list}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(400)
def bad_request(e):
    return jsonify({'error': 'Bad request'}), 400

if __name__ == '__main__':
    app.run(debug=True)