# config.py

import os

class Config:
    SECRET_KEY = 'your_secret_key_here'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///todo.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'jwt_secret_key_here'

    @staticmethod
    def init_app(app):
        pass

config = {
    'dev': Config,
    'prod': Config  # Add production config if needed
}
