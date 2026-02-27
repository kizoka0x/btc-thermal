import requests
import pandas as pd
import numpy as np
import json
from datetime import datetime

# -------------------------
# UTILS
# -------------------------
def get_json(url):
    headers = {
        "accept": "application/json",
        "User-Agent": "btc-thermal-dashboard"
    }

    r = requests.get(url, headers=headers, timeout=20)

    # Retry si CoinGecko ou autre rate limit
    if r.status_code in [401, 429]:
        import time
        time.sleep(5)
        r = requests.get(url, headers=headers, timeout=20)

    if r.status_code != 200:
        raise Exception(f"API error {r.status_code} : {url}")

    return r.json()


# -------------------------
# BGEOMETRICS ONCHAIN
# -------------------------
def get_bgeometrics_indicator(indicator):
    try:
        url = f"https://api.bgeometrics.com/v1/{indicator}?asset=btc"
        data = get_json(url)

        if "data" not in data or len(data["data"]) == 0:
            return None

        return float(data["data"][-1]["value"])

    except:
        return None

# -------- BTC PRICE (Coinbase) --------
def get_btc_price():
    url = "https://api.exchange.coinbase.com/products/BTC-USD/ticker"
    data = get_json(url)
    return float(data["price"])

# -------- BTC HISTORY (Coinbase) --------
def get_btc_history(days=365):
    url = "https://api.exchange.coinbase.com/products/BTC-USD/candles?granularity=86400"
    data = get_json(url)

    # format: [time, low, high, open, close, volume]
    closes = [candle[4] for candle in data]

    closes.reverse()  # ordre ancien -> récent
    prices = pd.Series(closes[-days:])

    return prices

# -------------------------
# STABLECOIN (USDT SMA30)
# -------------------------
def get_usdt_sma30():
    url = "https://api.coingecko.com/api/v3/coins/tether/market_chart?vs_currency=usd&days=40"
    data = get_json(url)
    prices = pd.Series([p[1] for p in data["prices"]])
    sma30 = prices.rolling(30).mean().iloc[-1]
    return float((prices.iloc[-1] - sma30) * 100)

# -------------------------
# INDICATORS (FREE METHODS)
# -------------------------
def compute_mayer(prices):
    ma200 = prices.rolling(200).mean().iloc[-1]
    return float(prices.iloc[-1] / ma200)

def compute_bullbear(prices, days):
    # sécurité : si pas assez de données
    if len(prices) < days:
        return 0
    return float((prices.iloc[-1] / prices.iloc[-days]) - 1)

def compute_sharpe(prices):
    returns = prices.pct_change().dropna()
    return float((returns.mean() / returns.std()) * np.sqrt(365))

def compute_mvrv_pct(prices):
    return float((prices < prices.iloc[-1]).sum() / len(prices) * 100)

# -------------------------
# APPROXIMATIONS GRATUITES
# -------------------------

# Futures Open Interest global (proxy réel marché dérivés)
def get_futures_power():
    try:
        url = "https://fapi.binance.com/futures/data/openInterestHist?symbol=BTCUSDT&period=1d&limit=30"
        data = get_json(url)

        oi_values = [float(d["sumOpenInterest"]) for d in data]

        if len(oi_values) < 2:
            return 50

        change = (oi_values[-1] - oi_values[0]) / oi_values[0]
        power = 50 + change * 100

        return float(power)
    except:
        return 50

# ETF Flow (proxy = variation prix 30j)
def proxy_etf_flow(prices):
    return compute_bullbear(prices, 30) * 100

# Net Taker Volume (proxy = momentum court terme)
def proxy_ntv(prices):
    return int((prices.iloc[-1] - prices.iloc[-2]) > 0)

# Futures Power (proxy = volatilité)
def proxy_futures_power(prices):
    vol = prices.pct_change().rolling(30).std().iloc[-1]
    return float(vol * 1000)

# SOPR proxy
def proxy_sopr(prices):
    return float(prices.iloc[-1] / prices.rolling(7).mean().iloc[-1])
def compute_sopr(prices):
    ma7 = prices.rolling(7).mean().iloc[-1]
    return float(prices.iloc[-1] / ma7)

# NUPL proxy
def proxy_nupl(prices, days):
    return compute_bullbear(prices, days)
def compute_nupl(prices, window):
    if len(prices) < window:
        return 0
    low = prices.iloc[-window:].min()
    high = prices.iloc[-window:].max()
    current = prices.iloc[-1]
    return float((current - low) / (high - low) - 0.5)

# UTXO profit proxy
def proxy_utxo(prices):
    return compute_mvrv_pct(prices)
def compute_utxo_ratio(prices):
    return float((prices < prices.iloc[-1]).sum() / len(prices))

# Whale proxy (volatilité volume impossible gratuitement → prix proxy)
# -------- WHALES (CoinGlass free) --------
def get_whales_coinglass():
    url = "https://open-api.coinglass.com/public/v2/bitcoin/addresses"

    headers = {
        "accept": "application/json"
    }

    try:
        r = requests.get(url, headers=headers, timeout=20)

        if r.status_code != 200:
            return 0

        data = r.json()

        if "data" not in data:
            return 0

        value = data["data"].get("addresses_1000", 0)

        return int(value)

    except:
        return 0
        

# -------------------------
# MAIN
# -------------------------
def run():
    prices = get_btc_history()
    btc_price = get_btc_price()
    usdt_sma = get_usdt_sma30()
    etf_flow = compute_bullbear(prices, 30) * 100

    # ----- ONCHAIN REAL (BGeometrics) -----
    sopr_real = get_bgeometrics_indicator("sopr")
    lth_nupl_real = get_bgeometrics_indicator("lth_nupl")
    sth_nupl_real = get_bgeometrics_indicator("sth_nupl")
    utxo_real = get_bgeometrics_indicator("utxo_profit")

    # Proxies gratuits et stables
    neg_days = (prices.pct_change().tail(7) < 0).sum()

    if neg_days >= 5:
        ntv_sell_count = 2
    elif neg_days >= 3:
        ntv_sell_count = 1
    elif neg_days == 0:
        ntv_sell_count = -2
    elif neg_days <= 2:
        ntv_sell_count = -1
    else:
        ntv_sell_count = 0

    dashboard = {
        "updated": datetime.utcnow().isoformat(),

        # Prix
        "btcPrice": float(btc_price),

        # Cycle / valuation
        "mayerMultiple": compute_mayer(prices),
        "mvrvPct": float((prices < prices.iloc[-1]).sum() / len(prices) * 100),

        # Trend
        "bullBear30d": compute_bullbear(prices, 30),
        "bullBear365d": compute_bullbear(prices, 365),

        # Risk
        "sharpeShort": compute_sharpe(prices),

        # Market pressure
        "ntvSellCount": ntv_sell_count,

        # Autres indicateurs
        "etfNetflow": etf_flow,
        "usdtSma": usdt_sma,
        "futuresPower": get_futures_power(),
        # SOPR proxy = prix vs moyenne 7 jours
        "soprRatio": sopr_real if sopr_real else compute_sopr(prices),

       # NUPL proxies = performance cycle
       "lthNupl": lth_nupl_real if lth_nupl_real else compute_nupl(prices, 365),
       "sthNupl": sth_nupl_real if sth_nupl_real else compute_nupl(prices, 30),
       

       # UTXO proxy = % en profit
       "utxoRatio": utxo_real if utxo_real else compute_utxo_ratio(prices),

      # Whales proxy (si API échoue → fallback)
       "whales1k10k": get_whales_coinglass() or int(prices.iloc[-1] / 1000)
    }

    save_dashboard(dashboard)
    print("btc_dashboard.json updated")
    
# -------------------------
# SAVE FILE
# -------------------------
def save_dashboard(data):
    with open("btc_dashboard.json", "w") as f:
        json.dump(data, f, indent=2)
if __name__ == "__main__":
    run()
