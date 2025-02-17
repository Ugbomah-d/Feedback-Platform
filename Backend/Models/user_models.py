from flask_security import UserMixin, RoleMixin
from flask_login import UserMixin as FlaskLoginUserMixin
from database import users_collection

# Define User Model for Flask-Security
class User(UserMixin, FlaskLoginUserMixin):
    def __init__(self, user_data):
        self.id = str(user_data["_id"])
        self.username = user_data["username"]
        self.email = user_data["email"]
        self.password = user_data["password"]
        self.active = user_data["active"]
        self.fs_uniquifier = user_data.get("fs_uniquifier")

    @staticmethod
    def get_user_by_username(username):
        user_data = users_collection.find_one({"username": username})
        return User(user_data) if user_data else None
