import pytest
import requests.exceptions
from unittest.mock import patch, Mock

from app import _fetch_live_rates_units_per_usd, convert_amount, db
from models import User

# MARK: test_ping_and_echo
def test_ping_and_echo(client):
    # ping
    rv = client.get('/api/ping')
    assert rv.status_code == 200
    data = rv.get_json()
    assert data and data.get('message') == 'pong'

    # echo
    rv = client.post('/api/echo', json={'hello': 'world'})
    assert rv.status_code == 200
    data = rv.get_json()
    assert data and data.get('status') == 'received'


 # MARK: test_register_user
def test_register_user(client):
    payload = {
        'username': 'apitestuser',
        'email': 'apitestuser@example.com',
        'password': 'testpass123'
    }
    rv = client.post('/api/register', json=payload)
    assert rv.status_code == 200 or rv.status_code == 201
    data = rv.get_json()
    assert data and 'msg' in data


 # MARK: test_login_user
def test_login_user(client):
    # Register first (if not exists)
    client.post('/api/register', json={
        'username': 'apitestlogin',
        'email': 'apitestlogin@example.com',
        'password': 'testpass123'
    })
    # Login
    rv = client.post('/api/login', json={
        'username': 'apitestlogin',
        'password': 'testpass123'
    })
    assert rv.status_code == 200
    data = rv.get_json()
    assert data and 'msg' in data


 # MARK: test_protected_categories_requires_auth
def test_protected_categories_requires_auth(client):
    # Без JWT
    rv = client.get('/api/categories')
    assert rv.status_code in (401, 422)


 # MARK: test_protected_categories_with_auth
def test_protected_categories_with_auth(client):
    # Register and login
    client.post('/api/register', json={
        'username': 'apitestcat',
        'email': 'apitestcat@example.com',
        'password': 'testpass123'
    })
    rv = client.post('/api/login', json={
        'username': 'apitestcat',
        'password': 'testpass123'
    })
    assert rv.status_code == 200
    # Отримати JWT cookies
    cookies = rv.headers.getlist('Set-Cookie')
    # Витягуємо cookie для наступного запиту
    cookie_header = '; '.join([c.split(';')[0] for c in cookies])
    # Запит з JWT cookie
    rv2 = client.get('/api/categories', headers={'Cookie': cookie_header})
    assert rv2.status_code == 200
    data = rv2.get_json()
    assert isinstance(data, list)


 # MARK: test_category_crud
def test_category_crud(client):
    # Register and login
    client.post('/api/register', json={
        'username': 'apitestcat2',
        'email': 'apitestcat2@example.com',
        'password': 'testpass123'
    })
    rv = client.post('/api/login', json={
        'username': 'apitestcat2',
        'password': 'testpass123'
    })
    cookies = rv.headers.getlist('Set-Cookie')
    cookie_header = '; '.join([c.split(';')[0] for c in cookies])

    # Create category
    payload = {
        'name': 'TestCat',
        'type': 'expense',
        'icon': '🧪',
        'description': 'Test category'
    }
    rv = client.post('/api/categories', json=payload, headers={'Cookie': cookie_header})
    assert rv.status_code == 200 or rv.status_code == 201
    data = rv.get_json()
    assert data and data['name'] == 'TestCat'
    cat_id = data['id']

    # Update category
    rv = client.put(f'/api/categories/{cat_id}', json={'name': 'TestCatUpd'}, headers={'Cookie': cookie_header})
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['name'] == 'TestCatUpd'

    # Delete category
    rv = client.delete(f'/api/categories/{cat_id}', headers={'Cookie': cookie_header})
    assert rv.status_code == 200


 # MARK: test_wallet_crud
def test_wallet_crud(client):
    # Register and login
    client.post('/api/register', json={
        'username': 'apitestwallet',
        'email': 'apitestwallet@example.com',
        'password': 'testpass123'
    })
    rv = client.post('/api/login', json={
        'username': 'apitestwallet',
        'password': 'testpass123'
    })
    cookies = rv.headers.getlist('Set-Cookie')
    cookie_header = '; '.join([c.split(';')[0] for c in cookies])

    # Create wallet
    payload = {
        'name': 'TestWallet',
        'description': 'Test wallet',
        'currency': 'USD',
        'icon': '💳'
    }
    rv = client.post('/api/wallets', json=payload, headers={'Cookie': cookie_header})
    assert rv.status_code == 200 or rv.status_code == 201
    data = rv.get_json()
    assert data and data['name'] == 'TestWallet'
    wallet_id = data['id']

    # Update wallet
    rv = client.put(f'/api/wallets/{wallet_id}', json={'name': 'TestWalletUpd'}, headers={'Cookie': cookie_header})
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['name'] == 'TestWalletUpd'

    # Delete wallet
    rv = client.delete(f'/api/wallets/{wallet_id}', headers={'Cookie': cookie_header})
    assert rv.status_code == 200


 # MARK: test_transaction_crud
def test_transaction_crud(client):
    # Register and login
    client.post('/api/register', json={
        'username': 'apitesttx',
        'email': 'apitesttx@example.com',
        'password': 'testpass123'
    })
    rv = client.post('/api/login', json={
        'username': 'apitesttx',
        'password': 'testpass123'
    })
    cookies = rv.headers.getlist('Set-Cookie')
    cookie_header = '; '.join([c.split(';')[0] for c in cookies])

    # Create category and wallet first
    cat = client.post('/api/categories', json={
        'name': 'TxCat', 'type': 'expense', 'icon': '💸', 'description': 'Tx cat'
    }, headers={'Cookie': cookie_header}).get_json()
    wallet = client.post('/api/wallets', json={
        'name': 'TxWallet', 'description': 'Tx wallet', 'currency': 'USD', 'icon': '💳'
    }, headers={'Cookie': cookie_header}).get_json()

    # Create transaction
    import datetime
    payload = {
        'amount': 50.5,
        'date': datetime.datetime.now().isoformat(),
        'type': 'expense',
        'category_id': cat['id'],
        'wallet_id': wallet['id'],
        'title': 'TestTx',
        'description': 'Test transaction'
    }
    rv = client.post('/api/transactions', json=payload, headers={'Cookie': cookie_header})
    assert rv.status_code == 200 or rv.status_code == 201
    data = rv.get_json()
    assert data and data['amount'] == 50.5
    tx_id = data['id']

    # Update transaction
    rv = client.put(f'/api/transactions/{tx_id}', json={'amount': 99.9}, headers={'Cookie': cookie_header})
    assert rv.status_code == 200
    data = rv.get_json()
    assert data['amount'] == 99.9

    # Delete transaction
    rv = client.delete(f'/api/transactions/{tx_id}', headers={'Cookie': cookie_header})
    assert rv.status_code == 200


 # MARK: test_refresh_token_and_logout
def test_refresh_token_and_logout(client):
    client.post('/api/register', json={
        'username': 'apitestrefresh',
        'email': 'apitestrefresh@example.com',
        'password': 'testpass123'
    })
    rv = client.post('/api/login', json={
        'username': 'apitestrefresh',
        'password': 'testpass123'
    })
    cookies = rv.headers.getlist('Set-Cookie')
    cookie_header = '; '.join([c.split(';')[0] for c in cookies])

    # Refresh token
    rv2 = client.post('/api/refresh', headers={'Cookie': cookie_header})
    assert rv2.status_code == 200
    data = rv2.get_json()
    assert data and 'msg' in data

    # Logout
    rv3 = client.post('/api/logout', headers={'Cookie': cookie_header})
    assert rv3.status_code == 200


 # MARK: test_statistics_and_rates
def test_statistics_and_rates(client):
    client.post('/api/register', json={
        'username': 'apiteststats',
        'email': 'apiteststats@example.com',
        'password': 'testpass123'
    })
    rv = client.post('/api/login', json={
        'username': 'apiteststats',
        'password': 'testpass123'
    })
    cookies = rv.headers.getlist('Set-Cookie')
    cookie_header = '; '.join([c.split(';')[0] for c in cookies])

    # Statistics (має бути 200, навіть якщо даних мало)
    rv2 = client.get('/api/statistics', headers={'Cookie': cookie_header})
    assert rv2.status_code == 200
    data = rv2.get_json()
    assert isinstance(data, dict)

    # Rates (публічний)
    rv3 = client.get('/api/rates')
    assert rv3.status_code == 200
    data = rv3.get_json()
    assert isinstance(data, dict)


def register_and_login(client, username, email, password):
    """Допоміжна функція для реєстрації, входу та повернення cookie."""
    client.post('/api/register', json={
        'username': username,
        'email': email,
        'password': password
    })
    rv = client.post('/api/login', json={
        'username': username,
        'password': password
    })
    assert rv.status_code == 200, f"Не вдалося увійти як {username}"
    cookies = rv.headers.getlist('Set-Cookie')
    cookie_header = '; '.join([c.split(';')[0] for c in cookies])
    return cookie_header


 # MARK: test_register_user_failures
def test_register_user_failures(client):
    rv = client.post('/api/register', json={'username': 'no_email', 'password': 'pw'})
    assert rv.status_code == 400
    data = rv.get_json()
    assert data and 'Missing fields' in data.get('msg')

    client.post('/api/register', json={
        'username': 'existinguser',
        'email': 'existing@example.com',
        'password': 'testpass123'
    })
    rv = client.post('/api/register', json={
        'username': 'existinguser',
        'email': 'existing@example.com',
        'password': 'testpass123'
    })
    assert rv.status_code == 409
    data = rv.get_json()
    assert data and 'User already exists' in data.get('msg')


 # MARK: test_login_user_failures
def test_login_user_failures(client):
    client.post('/api/register', json={
        'username': 'loginfailuser',
        'email': 'loginfail@example.com',
        'password': 'correctpass'
    })

    rv = client.post('/api/login', json={'username': 'nosuchuser', 'password': 'pw'})
    assert rv.status_code == 401
    data = rv.get_json()
    assert data and 'Bad username or password' in data.get('msg')

    rv = client.post('/api/login', json={'username': 'loginfailuser', 'password': 'wrongpass'})
    assert rv.status_code == 401
    data = rv.get_json()
    assert data and 'Bad username or password' in data.get('msg')


 # MARK: test_business_logic_failures
def test_business_logic_failures(client):
    cookies = register_and_login(client, 'logicuser', 'logic@a.com', 'pass')

    rv_cats = client.get('/api/categories', headers={'Cookie': cookies})
    cats = rv_cats.get_json()
    uncat_id = next((c['id'] for c in cats if c['name'] == 'Uncategorized'), None)
    assert uncat_id is not None
    
    rv_del_uncat = client.delete(f'/api/categories/{uncat_id}', headers={'Cookie': cookies})
    assert rv_del_uncat.status_code == 400
    assert 'Cannot delete' in rv_del_uncat.get_json().get('msg')

    rv_wallets = client.get('/api/wallets', headers={'Cookie': cookies})
    wallets = rv_wallets.get_json()
    wallet_id = wallets[0]['id']

    client.post('/api/transactions', json={
        'amount': 10, 'date': '2025-10-26T12:00:00', 'type': 'expense',
        'category_id': uncat_id, 'wallet_id': wallet_id, 'title': 'test tx'
    }, headers={'Cookie': cookies})

    rv_del_wallet = client.delete(f'/api/wallets/{wallet_id}', headers={'Cookie': cookies})
    assert rv_del_wallet.status_code == 400
    assert 'Cannot delete wallet' in rv_del_wallet.get_json().get('msg')


 # MARK: test_create_transaction_failures
def test_create_transaction_failures(client):
    cookies = register_and_login(client, 'txfailuser', 'txfail@a.com', 'pass')

    wallet_id = client.get('/api/wallets', headers={'Cookie': cookies}).get_json()[0]['id']
    cat_id = client.get('/api/categories', headers={'Cookie': cookies}).get_json()[0]['id']

    base_payload = {
        'amount': 10, 'date': '2025-10-26T12:00:00', 'type': 'expense',
        'category_id': cat_id, 'wallet_id': wallet_id, 'title': 'test tx'
    }

    payload_1 = base_payload.copy(); del payload_1['wallet_id']
    rv1 = client.post('/api/transactions', json=payload_1, headers={'Cookie': cookies})
    assert rv1.status_code == 400
    assert 'Wallet is required' in rv1.get_json().get('msg')

    payload_2 = base_payload.copy(); del payload_2['category_id']
    rv2 = client.post('/api/transactions', json=payload_2, headers={'Cookie': cookies})
    assert rv2.status_code == 400
    assert 'Category is required' in rv2.get_json().get('msg')

    payload_3 = base_payload.copy(); payload_3['type'] = 'investment'
    rv3 = client.post('/api/transactions', json=payload_3, headers={'Cookie': cookies})
    assert rv3.status_code == 400
    assert 'Valid transaction type is required' in rv3.get_json().get('msg')


 # MARK: test_wallet_balance_adjustment
def test_wallet_balance_adjustment(client):
    cookies = register_and_login(client, 'adjuser', 'adj@a.com', 'pass')

    rv_post = client.post('/api/wallets', json={
        'name': 'Initial Wallet', 'currency': 'USD', 'initial_balance': 150
    }, headers={'Cookie': cookies})
    assert rv_post.status_code in (200, 201)
    wallet_id = rv_post.get_json()['id']
    
    rv_tx = client.get(f'/api/transactions?wallet_id={wallet_id}', headers={'Cookie': cookies})
    txs = rv_tx.get_json()
    assert len(txs) == 1
    assert txs[0]['title'] == 'Adjust Balance'
    assert txs[0]['type'] == 'income'
    assert txs[0]['amount'] == 150
    
    rv_wallets = client.get('/api/wallets', headers={'Cookie': cookies})
    wallet_data = next(w for w in rv_wallets.get_json() if w['id'] == wallet_id)
    assert wallet_data['balance'] == 150

    rv_put = client.put(f'/api/wallets/{wallet_id}', json={
        'name': 'Adjusted Wallet', 'adjustment': -50
    }, headers={'Cookie': cookies})
    assert rv_put.status_code == 200

    rv_tx2 = client.get(f'/api/transactions?wallet_id={wallet_id}', headers={'Cookie': cookies})
    txs2 = rv_tx2.get_json()
    assert len(txs2) == 2
    
    adj_tx = next(t for t in txs2 if t['title'] == 'Adjust Balance' and t['type'] == 'expense')
    assert adj_tx['amount'] == 50 

    rv_wallets2 = client.get('/api/wallets', headers={'Cookie': cookies})
    wallet_data2 = next(w for w in rv_wallets2.get_json() if w['id'] == wallet_id)
    assert wallet_data2['balance'] == 100

# Створюємо "мок" (імітацію) відповіді, яку повертатиме requests.get
def create_mock_response(json_data, raise_for_status=None):
    """Створює імітацію об'єкта відповіді requests."""
    mock_resp = Mock()
    mock_resp.json.return_value = json_data
    
    # Якщо raise_for_status=True, імітуємо помилку HTTP (напр. 500)
    if raise_for_status:
        mock_resp.raise_for_status.side_effect = raise_for_status
    else:
        mock_resp.raise_for_status.return_value = None
    return mock_resp

# MARK: test_fetch_rates_happy_path
@patch('app.requests.get')
@patch.dict('app.EXCHANGE_RATES', {'USD': 1.0, 'UAH': 40.0, 'EUR': 0.8})
@patch('app.SUPPORTED_CURRENCIES', ['USD', 'UAH', 'EUR'])
def test_fetch_rates_happy_path(mock_requests_get):
    """Тестує, що функція працює, коли основний URL доступний."""

    mock_data = {
        'date': '2025-10-26',
        'usd': { 'uah': 41.5, 'eur': 0.85 }
    }
    mock_requests_get.return_value = create_mock_response(mock_data)

    rates = _fetch_live_rates_units_per_usd()
    
    assert rates == {'USD': 1.0, 'UAH': 41.5, 'EUR': 0.85}

    mock_requests_get.assert_called_once_with(
        'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
        timeout=10
    )


# MARK: test_fetch_rates_fallback_path
@patch('app.requests.get')
@patch.dict('app.EXCHANGE_RATES', {'USD': 1.0, 'UAH': 40.0, 'EUR': 0.8})
@patch('app.SUPPORTED_CURRENCIES', ['USD', 'UAH', 'EUR'])
def test_fetch_rates_fallback_path(mock_requests_get):
    """Тестує, що функція використовує fallback URL, якщо primary не працює."""

    primary_url = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
    fallback_url = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json'
    
    mock_data_fallback = {
        'date': '2025-10-26',
        'usd': { 'uah': 42.0, 'eur': 0.9 }
    }
    
    mock_requests_get.side_effect = [
        requests.exceptions.RequestException("Primary URL failed"),
        create_mock_response(mock_data_fallback)
    ]
    
    rates = _fetch_live_rates_units_per_usd()
    
    assert rates == {'USD': 1.0, 'UAH': 42.0, 'EUR': 0.9}

    assert mock_requests_get.call_count == 2
    assert mock_requests_get.call_args_list[0].args[0] == primary_url
    assert mock_requests_get.call_args_list[1].args[0] == fallback_url


# MARK: test_fetch_rates_bad_data_shape
@patch('app.requests.get')
def test_fetch_rates_bad_data_shape(mock_requests_get):
    """Тестує, що функція кидає RuntimeError, якщо дані не мають 'usd' ключа."""

    mock_data = {'error': 'Invalid request'}
    mock_requests_get.return_value = create_mock_response(mock_data)
    
    with pytest.raises(RuntimeError, match='Unexpected live rates response shape'):
        _fetch_live_rates_units_per_usd()


# MARK: test_fetch_rates_partial_data
@patch('app.requests.get')
@patch.dict('app.EXCHANGE_RATES', {'USD': 1.0, 'UAH': 40.0, 'EUR': 0.8})
@patch('app.SUPPORTED_CURRENCIES', ['USD', 'UAH', 'EUR'])
def test_fetch_rates_partial_data(mock_requests_get):
    """Тестує, що функція використовує старі дані з EXCHANGE_RATES, якщо API не повернуло валюту."""

    mock_data = {
        'date': '2025-10-26',
        'usd': { 'uah': 41.5 }
    }
    mock_requests_get.return_value = create_mock_response(mock_data)
    
    rates = _fetch_live_rates_units_per_usd()
    
    assert rates == {'USD': 1.0, 'UAH': 41.5, 'EUR': 0.8}


# MARK: test_convert_amount_logic
@patch.dict('app.EXCHANGE_RATES', {'USD': 1.0, 'UAH': 40.0, 'EUR': 0.8})
def test_convert_amount_logic():
    """Тестує логіку конвертації валют, використовуючи @patch.dict."""
    
    assert convert_amount(100.0, 'UAH', 'USD') == pytest.approx(2.5)

    assert convert_amount(10.0, 'USD', 'EUR') == pytest.approx(8.0)

    assert convert_amount(50.0, 'EUR', 'UAH') == pytest.approx(2500.0)

    assert convert_amount(123.0, 'USD', 'USD') == pytest.approx(123.0)
    
    assert convert_amount(50.0, None, 'UAH') == pytest.approx(2000.0)

    assert convert_amount(4000.0, 'UAH', None) == pytest.approx(100.0)
    
    assert convert_amount(None, 'USD', 'UAH') == 0.0

    assert convert_amount(100.0, 'PLN', 'USD') == pytest.approx(100.0)
    assert convert_amount(100.0, 'USD', 'PLN') == pytest.approx(100.0)

    assert convert_amount(100.0, 'uah', 'usd') == pytest.approx(2.5)


    # MARK: test_protected_endpoint
def test_protected_endpoint(client, app):
    """Тестує /api/protected, вкл. випадок з видаленим юзером."""
    
    rv1 = client.get('/api/protected')
    assert rv1.status_code in (401, 422) 

    username_happy = 'protected_user'

    try:
        from test_api import register_and_login
    except ImportError:
        def register_and_login(client, username, email, password):
            client.post('/api/register', json={'username': username, 'email': email, 'password': password})
            rv = client.post('/api/login', json={'username': username, 'password': password})
            cookies = rv.headers.getlist('Set-Cookie')
            return '; '.join([c.split(';')[0] for c in cookies])

    cookies_happy = register_and_login(client, username_happy, 'protected@example.com', 'pass123')
    
    rv2 = client.get('/api/protected', headers={'Cookie': cookies_happy})
    assert rv2.status_code == 200
    assert rv2.get_json() == {'username': username_happy}

    username_deleted = 'deleted_user'
    cookies_deleted = register_and_login(client, username_deleted, 'deleted@example.com', 'pass123')
    
    with app.app_context():
        user = User.query.filter_by(username=username_deleted).first()
        assert user is not None 
        db.session.delete(user)
        db.session.commit()

    rv3 = client.get('/api/protected', headers={'Cookie': cookies_deleted})
    
    assert rv3.status_code == 404
    assert rv3.get_json() == {"msg": "User not found"}