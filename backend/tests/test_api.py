
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


def test_protected_categories_requires_auth(client):
    # Без JWT
    rv = client.get('/api/categories')
    assert rv.status_code in (401, 422)

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
