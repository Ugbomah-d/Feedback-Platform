import os
import secrets
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, send_from_directory, session
from flask_cors import CORS
from flask_login import LoginManager
from flask_socketio import SocketIO, emit
from flask_wtf.csrf import CSRFProtect

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

from Routes.auth_routes import auth_routes
from Routes.feedback_routes import feedback_routes
from database import users_collection
from Models.user_models import User

app = Flask(__name__, static_folder="../Frontend", static_url_path="")
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", os.urandom(24))
app.config["WTF_CSRF_TIME_LIMIT"] = None
app.config["WTF_CSRF_ENABLED"] = os.getenv("WTF_CSRF_ENABLED", "False").lower() == "true"

cors_origins = os.getenv("SOCKET_CORS_ORIGINS", "*")
socketio = SocketIO(app, cors_allowed_origins=cors_origins)

CORS(app, supports_credentials=True)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "auth_routes.login"

# Initialize CSRF Protection
csrf = CSRFProtect(app)

# Load user session
@login_manager.user_loader
def load_user(user_id):
    user_data = users_collection.find_one({"_id": user_id})
    return User(user_data) if user_data else None

# Register routes
app.register_blueprint(feedback_routes)
app.register_blueprint(auth_routes)

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

#Testing connection
@socketio.on('connect')
def connect():
    print('User connected')

# Event handler for receiving chat messages
@socketio.on('chat message')
def handle_chat_message(msg):
    print('Received message: ' + msg)
    # Broadcast the message to all connected clients
    emit('chat message', msg, broadcast=True, include_self=False)
    print('Sent')


@app.before_request
def set_csrf_token():
    if "_csrf_token" not in session:
        session["_csrf_token"] = secrets.token_hex(16)  # Generate a secure token

# print(session)

if __name__ == '__main__':
    socketio.run(
        app,
        host=os.getenv("FLASK_HOST", "0.0.0.0"),
        port=int(os.getenv("FLASK_PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "True").lower() == "true",
        allow_unsafe_werkzeug=os.getenv("ALLOW_UNSAFE_WERKZEUG", "True").lower() == "true",
    )
