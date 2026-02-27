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

    # Si CoinGecko bloque → on attend et on réessaie une fois
    if r.status_code == 401 or r.status_code == 429:
        import time
        time.sleep(5)
        r = requests.get(url, headers=headers, timeout=20)

    if r.status_code != 200:
        raise Exception(f"API error {r.status_code}")

    return r.json()

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

# NUPL proxy
def proxy_nupl(prices, days):
    return compute_bullbear(prices, days)

# UTXO profit proxy
def proxy_utxo(prices):
    return compute_mvrv_pct(prices)

# Whale proxy (volatilité volume impossible gratuitement → prix proxy)
def proxy_whales(prices):
    return int(prices.iloc[-1] / 1000)

# -------------------------
# MAIN
# -------------------------
def run():
    prices = get_btc_history()
    btc_price = get_btc_price()
    usdt_sma = get_usdt_sma30()

    # Proxies gratuits et stables
    ntv_sell_count = float((prices.pct_change().tail(7) < 0).sum())

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

        # Market pressure proxy
        "ntvSellCount": ntv_sell_count,

        # Proxies neutres pour indicateurs on-chain indisponibles
        "etfNetflow": 0,
        "usdtSma": usdt_sma,
        "futuresPower": 50,
        "soprRatio": 1,
        "lthNupl": 0,
        "sthNupl": 0,
        "utxoRatio": 0,
        "whales1k10k": 0
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
