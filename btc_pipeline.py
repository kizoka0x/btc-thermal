import requests
import pandas as pd
import numpy as np
import json
from datetime import datetime

# -------- BTC PRICE SIMPLE --------
def get_btc_price():
    url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
    r = requests.get(url, timeout=10)
    return r.json()["bitcoin"]["usd"]

# -------- HISTORICAL PRICE VIA ALTERNATIVE --------
def get_btc_history():
    # endpoint plus stable
    url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=365"
    r = requests.get(url, timeout=10)
    data = r.json()

    if "prices" not in data:
        raise Exception("CoinGecko blocked request")

    prices = pd.Series([p[1] for p in data["prices"]])
    return prices

# -------- INDICATORS --------
def compute_mayer(prices):
    ma200 = prices.rolling(200).mean().iloc[-1]
    return float(prices.iloc[-1] / ma200)

def compute_bullbear(prices, days):
    if len(prices) < days:
        return None
    return float((prices.iloc[-1] / prices.iloc[-days]) - 1)

def compute_sharpe(prices):
    returns = prices.pct_change().dropna()
    return float((returns.mean() / returns.std()) * np.sqrt(365))

# -------- MAIN --------
def run():
    prices = get_btc_history()
    btc_price = get_btc_price()

    dashboard = {
        "updated": datetime.utcnow().isoformat(),
        "btcPrice": float(btc_price),
        "mayerMultiple": compute_mayer(prices),
        "mvrvPct": float((prices < prices.iloc[-1]).sum() / len(prices) * 100),
        "bullBear30d": compute_bullbear(prices, 30),
        "bullBear365d": compute_bullbear(prices, 365),
        "sharpeShort": compute_sharpe(prices)
    }

    with open("btc_dashboard.json", "w") as f:
        json.dump(dashboard, f, indent=2)

    print("Dashboard updated successfully")

if __name__ == "__main__":
    run()
