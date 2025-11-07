from flask import Blueprint, jsonify, request
import time
import requests

EXCHANGE_RATES = {
    'USD': 1.0,
    'UAH': 42.0,
    'EUR': 0.93,
    'GBP': 0.79,
}

SUPPORTED_CURRENCIES = list(EXCHANGE_RATES.keys())  # Will be updated from API
_RATES_SCHEMA = 'UNITS_PER_USD'
_RATES_LAST_UPDATED = 0.0
_RATES_TTL_SECONDS = 6 * 60 * 60 

bp = Blueprint('rates', __name__, url_prefix='/api/rates')

@bp.route('', methods=['GET'])
def get_rates():
    """Return supported currencies and exchange rates (with live fetch + fallback).

    Query params:
      refresh=true  -> force refresh live rates
    """
    refresh = request.args.get('refresh', 'false').lower() in ('1', 'true', 'yes')
    rates, source, ts = _ensure_rates_uptodate(force=refresh)
    return jsonify({
        'base': 'USD',
        'schema': _RATES_SCHEMA,
        'source': source,
        'last_updated': ts,
        'rates': rates,
        'supported': sorted(rates.keys()),
    })

def convert_amount(amount: float, from_currency: str, to_currency: str) -> float:
    """Конвертує суму, використовуючи глобальні EXCHANGE_RATES."""
    if amount is None:
        return 0.0
    from_currency = (from_currency or 'USD').upper()
    to_currency = (to_currency or 'USD').upper()
    if from_currency == to_currency:
        return float(amount)

    # Переконуємось, що курси актуальні (але без примусового оновлення)
    rates, _, _ = _ensure_rates_uptodate(force=False)

    if from_currency not in rates or to_currency not in rates:
        return float(amount)

    amount_in_usd = float(amount) / rates[from_currency]
    converted = amount_in_usd * rates[to_currency]
    return float(converted)

def _ensure_rates_uptodate(force: bool = False) -> tuple[dict, str, float]:
    global EXCHANGE_RATES, _RATES_LAST_UPDATED, SUPPORTED_CURRENCIES
    now = time.time()
    source = 'cache'
    if force or (now - _RATES_LAST_UPDATED) > _RATES_TTL_SECONDS:
        try:
            live = _fetch_live_rates_units_per_usd()
            EXCHANGE_RATES = live
            _RATES_LAST_UPDATED = now
            source = 'live'
        except Exception:
            source = 'stale'
    return EXCHANGE_RATES, source, _RATES_LAST_UPDATED

def _fetch_live_rates_units_per_usd() -> dict:
    """Fetch live rates (USD base) and return mapping in UNITS_PER_USD schema."""
    primary = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
    fallback = 'https://latest.currency-api.pages.dev/v1/currencies/usd.json'

    def _get(url: str):
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()

    data = None
    try:
        data = _get(primary)
    except Exception:
        data = _get(fallback)

    # Expected shape: { 'date': 'YYYY-MM-DD', 'usd': { ... } }
    usd_map = data.get('usd', {}) if isinstance(data, dict) else {}
    if not usd_map:
        raise RuntimeError('Unexpected live rates response shape')

    # Build uppercase keys for all currencies in API
    rates = {k.upper(): float(v) for k, v in usd_map.items()}
    rates['USD'] = 1.0  # Ensure USD present

    # Update supported currencies globally
    global SUPPORTED_CURRENCIES
    SUPPORTED_CURRENCIES = sorted(rates.keys())

    return rates