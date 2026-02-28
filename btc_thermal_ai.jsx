import React, { useState, useEffect } from "react";

export default function BTCThermiqueHedgePlus() {

  // ───────────────── DATA ─────────────────
  const [vals, setVals] = useState({
    btcPrice: 0,
    etfNetflow: 0,
    usdtSma: 0,
    ntvSellCount: 0,
    futuresPower: 0,
    bullBear30d: 0,
    soprRatio: 0,
    sthNupl: 0,
    utxoRatio: 0,
    mvrvPct: 0,
    mayerMultiple: 0,
    sharpeShort: 0,
    whales: 0
  });

  const [loaded, setLoaded] = useState(false);

  // ───────────────── FETCH JSON ─────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/btc_dashboard.json");
        const data = await res.json();

        setVals(v => ({
          ...v,
          btcPrice: data.price || 0,
          etfNetflow: data.etfNetflow || 0,
          usdtSma: data.usdtSma || 0,
          ntvSellCount: data.ntvSellCount || 0,
          futuresPower: data.futuresPower || 0,
          bullBear30d: data.bullBear30d || 0,
          soprRatio: data.sopr || 0,
          sthNupl: data.sthNupl || 0,
          utxoRatio: data.utxo || 0,
          mvrvPct: data.mvrv || 0,
          mayerMultiple: data.mayer || 0,
          sharpeShort: data.sharpe || 0,
          whales: data.whales || 0
        }));

        setLoaded(true);
      } catch (e) {
        console.error("Erreur chargement btc_dashboard.json", e);
        setLoaded(true);
      }
    };

    load();
  }, []);

  // ───────────────── THERMAL SCORE (simple stable) ─────────────────
  const scoreList = [
    vals.mvrvPct < 10 ? 8 : vals.mvrvPct < 40 ? 5 : 2,
    vals.mayerMultiple < 0.8 ? 8 : vals.mayerMultiple < 1.5 ? 5 : 2,
    vals.sharpeShort < -20 ? 8 : vals.sharpeShort < 10 ? 5 : 2,
    vals.etfNetflow > 0 ? 7 : 3,
    vals.usdtSma > 0 ? 7 : 3,
    vals.futuresPower > 50 ? 7 : 3,
    vals.soprRatio < 1 ? 7 : 3,
    vals.utxoRatio < 5 ? 7 : 3,
    vals.whales > 0 ? 7 : 3
  ];

  const thermalScore =
    scoreList.reduce((a, b) => a + b, 0) / scoreList.length;

  // ───────────────── PHASE ─────────────────
  let phase = "NEUTRE";
  if (thermalScore <= 3) phase = "BEAR EXTREME";
  else if (thermalScore <= 5) phase = "BEAR";
  else if (thermalScore <= 7) phase = "ACCUMULATION";
  else phase = "BULL";

  const color =
    thermalScore <= 3
      ? "#ff4d4d"
      : thermalScore <= 5
      ? "#ffa500"
      : thermalScore <= 7
      ? "#ffe066"
      : "#2ecc71";

  // ───────────────── UI ─────────────────
  if (!loaded) {
    return (
      <div style={{ color: "#fff", padding: 40 }}>
        Chargement des données...
      </div>
    );
  }

  const sectionStyle = {
    background: "#0d1117",
    border: "1px solid #1f2937",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16
  };

  const label = { color: "#9ca3af", fontSize: 12 };
  const value = { fontSize: 18, fontWeight: 600 };

  return (
    <div
      style={{
        background: "#020617",
        minHeight: "100vh",
        padding: 20,
        color: "#e5e7eb",
        fontFamily: "Inter"
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 700 }}>
          BTC Thermique — Hedge+
        </div>
        <div style={{ fontSize: 22, color: "#facc15" }}>
          ${vals.btcPrice.toLocaleString()}
        </div>
      </div>

      {/* SCORE */}
      <div
        style={{
          background: "#0d1117",
          padding: 20,
          borderRadius: 10,
          marginBottom: 20,
          border: `2px solid ${color}`
        }}
      >
        <div style={{ fontSize: 14, color: "#9ca3af" }}>
          Score Thermique
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color }}>
          {thermalScore.toFixed(1)}
        </div>
        <div style={{ fontSize: 14 }}>{phase}</div>
      </div>

      {/* ── Flux & Liquidité ── */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>
          Flux & Liquidité
        </div>
        <div style={label}>ETF Netflow 30D</div>
        <div style={value}>{vals.etfNetflow} B$</div>
        <div style={label}>USDT SMA(30)</div>
        <div style={value}>{vals.usdtSma} B$</div>
        <div style={label}>Net Taker Volume</div>
        <div style={value}>{vals.ntvSellCount}</div>
      </div>

      {/* ── Dérivés ── */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>
          Dérivés & Structure
        </div>
        <div style={label}>Futures Power</div>
        <div style={value}>{vals.futuresPower}%</div>
        <div style={label}>Bull/Bear 30D</div>
        <div style={value}>{vals.bullBear30d}</div>
      </div>

      {/* ── Holders ── */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>
          Profitabilité & Holders
        </div>
        <div style={label}>SOPR</div>
        <div style={value}>{vals.soprRatio}</div>
        <div style={label}>STH NUPL</div>
        <div style={value}>{vals.sthNupl}</div>
        <div style={label}>UTXO Ratio</div>
        <div style={value}>{vals.utxoRatio}</div>
      </div>

      {/* ── Valorisation ── */}
      <div style={sectionStyle}>
        <div style={{ fontWeight: 600, marginBottom: 10 }}>
          Valorisation & Risque LT
        </div>
        <div style={label}>MVRV Percentile</div>
        <div style={value}>{vals.mvrvPct}%</div>
        <div style={label}>Mayer Multiple</div>
        <div style={value}>{vals.mayerMultiple}</div>
        <div style={label}>Sharpe Ratio</div>
        <div style={value}>{vals.sharpeShort}</div>
        <div style={label}>Whales</div>
        <div style={value}>{vals.whales}</div>
      </div>
    </div>
  );
}
