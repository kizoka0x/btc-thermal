import requests
import pandas as pd
import numpy as np
import json
from datetime import datetime

def get_json(url):
    return requests.get(url).json()

# BTC history
def get_btc_history(days=400):
    url = f"https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days={days}"
    data = get_json(url)
    prices = pd.Series([p[1] for p in data["prices"]])
    return prices

# USDT SMA30
def get_usdt_sma():
    url = "https://api.coingecko.com/api/v3/coins/tether/market_chart?vs_currency=usd&days=40"
    data = get_json(url)
    prices = [p[1] for p in data["prices"]]
    return float(np.mean(prices[-30:]))

# Indicators
def compute_mayer(prices):
    ma200 = prices.rolling(200).mean().iloc[-1]
    return float(prices.iloc[-1] / ma200)

def compute_bullbear(prices, days):
    return float((prices.iloc[-1] / prices.iloc[-days]) - 1)

def compute_sharpe(prices):
    returns = prices.pct_change().dropna()
    return float((returns.mean() / returns.std()) * np.sqrt(365))

def run():
    prices = get_btc_history()

    dashboard = {
        "updated": datetime.utcnow().isoformat(),
        "btcPrice": float(prices.iloc[-1]),
        "mayerMultiple": compute_mayer(prices),
        "mvrvPct": float((prices < prices.iloc[-1]).sum() / len(prices) * 100),
        "bullBear30d": compute_bullbear(prices, 30),
        "bullBear365d": compute_bullbear(prices, 365),
        "sharpeShort": compute_sharpe(prices),
        "usdtSma30": get_usdt_sma()
    }

    with open("btc_dashboard.json", "w") as f:
        json.dump(dashboard, f, indent=2)

if __name__ == "__main__":
    run()
