import os
from datetime import timedelta

basedir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-fallback-secret-key-for-dev'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-fallback-jwt-key-for-dev'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(basedir, 'instance', 'database.db')

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_TOKEN_LOCATION = ['cookies']
    JWT_ACCESS_COOKIE_PATH = '/'
    JWT_REFRESH_COOKIE_PATH = '/api/refresh'
    JWT_COOKIE_CSRF_PROTECT = False  # True for production!
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=15)

    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)