from flask import Flask, send_from_directory, session # type: ignore
from flask_cors import CORS # type: ignore
import secrets

import os
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from Routes.auth_routes import auth_routes
from Routes.feedback_routes import feedback_routes
from database import feedback_collection
from Models.user_models import User

app = Flask(__name__, static_folder="../Frontend", static_url_path="")
app.config['SECRET_KEY'] = os.urandom(24)  # Ensure a secret key is set
app.config['WTF_CSRF_TIME_LIMIT'] = None  # Allow CSRF tokens to persist longer
app.config["WTF_CSRF_ENABLED"] = False



CORS(app, supports_credentials=True)

# Secret key for CSRF protection & authentication
app.config["SECRET_KEY"] = "supersecretkey"

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



@app.before_request
def set_csrf_token():
    if "_csrf_token" not in session:
        session["_csrf_token"] = secrets.token_hex(16)  # Generate a secure token

# print(session)

if __name__ == '__main__':

    app.run(host="0.0.0.0", port=5000,debug=True)
