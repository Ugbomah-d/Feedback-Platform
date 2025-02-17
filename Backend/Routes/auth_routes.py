import uuid
from flask import Blueprint, request, jsonify, redirect, url_for, session
from flask_wtf import FlaskForm
from flask_security import Security, SQLAlchemyUserDatastore, login_required, roles_required
from flask_login import login_user, logout_user, current_user
from wtforms import StringField, PasswordField
from werkzeug.security import check_password_hash, generate_password_hash
from wtforms.validators import InputRequired, Email, Length
from flask_bcrypt import Bcrypt
from database import users_collection
from Models.user_models import User
from flask_wtf.csrf import generate_csrf

auth_routes = Blueprint("auth_routes", __name__)
bcrypt = Bcrypt()

# Flask-WTF Form for Login
class LoginForm(FlaskForm):
    username = StringField("Username", validators=[InputRequired()])
    password = PasswordField("Password", validators=[InputRequired(), Length(min=6)])

# Register Route
@auth_routes.route("/register", methods=["POST"])
def register_user():

    print("Request received:", request.data)  # Debugging
    data = request.get_json()
    print("Parsed data:", data)

    if not data or "username" not in data or "password" not in data or "email" not in data:
        return jsonify({"error": "Username, email, and password are required"}), 400

    # Check if user exists
    if users_collection.find_one({"username": data["username"]}):
        return jsonify({"error": "Username already exists"}), 400

    # Hash the password before saving it
    hashed_password = generate_password_hash(data["password"])

     # Generate a unique fs_uniquifier
    fs_uniquifier = str(uuid.uuid4())

    # Store user in MongoDB
    users_collection.insert_one({
        "username": data["username"],
        "email": data["email"],
        "password": hashed_password,
        "active": True,  # Required for Flask-Security
        "fs_uniquifier": fs_uniquifier #Needed for Flask-Security session handling
    })

    return jsonify({"message": "User registered successfully"}), 201

# ✅ Login Route

@auth_routes.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json(force=True)
        print("Received JSON data:", data)  # Debugging output
    except Exception as e:
        print("Error parsing JSON:", str(e))
        return jsonify({"error": "Invalid JSON format"}), 400

    if not data:
        return jsonify({"error": "No data received"}), 400

    if "username" not in data or "password" not in data:
        return jsonify({"error": "Invalid input"}), 400

    user = User.get_user_by_username(data["username"])
    if not user:
        return jsonify({"error": "User not found"}), 401

    if not check_password_hash(user.password, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    login_user(user)
    return jsonify({"message": "Login successful"}), 200


# Logout Route
@auth_routes.route("/api/logout", methods=["GET"])
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200

# Protected Route Example
@auth_routes.route("/api/protected", methods=["GET"])
@login_required
def protected():
    return jsonify({"message": f"Welcome, {current_user.username}! This is a protected route."}), 200

@auth_routes.route("/csrf-token", methods=["GET"])
def get_csrf_token():
    token =  generate_csrf()  # Generate CSRF token
    session['_csrf_token'] = token  # Store in session
    print("Generated CSRF Token:", token)
    return jsonify({"csrf_token": token})
