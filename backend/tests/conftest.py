import pytest
from app import app as flask_app, db


@pytest.fixture(scope='session')
def app():
    """Create and configure a Flask app for tests.

    Uses in-memory SQLite so tests don't touch local database file.
    """
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'JWT_COOKIE_CSRF_PROTECT': False,
    })

    # Create DB schema once per test session
    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()
