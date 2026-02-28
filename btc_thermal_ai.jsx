import React, { useState, useEffect } from "react";

export default function BTCHedgeUltimate() {

  // ───────────── DATA STATE ─────────────
  const [vals, setVals] = useState({
    price: 0,
    etfNetflow: 0,
    usdtSma: 0,
    ntvSellCount: 0,
    futuresPower: 0,
    bullBear30d: 0,
    sopr: 0,
    sthNupl: 0,
    utxo: 0,
    mvrv: 0,
    mayer: 0,
    sharpe: 0,
    whales: 0
  });

  const [loaded, setLoaded] = useState(false);

  // ───────────── FETCH DASHBOARD JSON ─────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/btc_dashboard.json");
        const data = await res.json();

        setVals({
          price: data.price || 0,
          etfNetflow: data.etfNetflow || 0,
          usdtSma: data.usdtSma || 0,
          ntvSellCount: data.ntvSellCount || 0,
          futuresPower: data.futuresPower || 0,
          bullBear30d: data.bullBear30d || 0,
          sopr: data.sopr || 0,
          sthNupl: data.sthNupl || 0,
          utxo: data.utxo || 0,
          mvrv: data.mvrv || 0,
          mayer: data.mayer || 0,
          sharpe: data.sharpe || 0,
          whales: data.whales || 0
        });

      } catch (e) {
        console.error("Erreur chargement btc_dashboard.json", e);
      }
      setLoaded(true);
    };

    load();
  }, []);

  if (!loaded) {
    return <div style={{color:"#fff",padding:40}}>Chargement...</div>;
  }

  // ───────────── HEAT ENGINE ─────────────
  const heat = (v, low, mid, high) => {
    if (v <= low) return { score: 9, color: "#2ecc71" };      // très bullish
    if (v <= mid) return { score: 6, color: "#ffe066" };      // neutre
    if (v <= high) return { score: 4, color: "#ffa500" };     // chaud
    return { score: 2, color: "#ff4d4d" };                    // euphorie / risque
  };

  const metrics = {
    mvrv: heat(vals.mvrv, 15, 50, 80),
    mayer: heat(vals.mayer, 0.8, 1.4, 2),
    sharpe: heat(vals.sharpe, -20, 10, 40),
    sopr: heat(vals.sopr, 0.98, 1.02, 1.08),
    utxo: heat(vals.utxo, 3, 8, 15),
    futures: heat(vals.futuresPower, 40, 55, 70)
  };

  const scores = Object.values(metrics).map(m => m.score);
  const thermalScore =
    scores.reduce((a, b) => a + b, 0) / scores.length;

  // ───────────── MARKET REGIME ─────────────
  let regime = "NEUTRAL";
  if (thermalScore >= 7.5) regime = "ACCUMULATION ZONE";
  else if (thermalScore >= 6) regime = "EARLY BULL";
  else if (thermalScore >= 4.5) regime = "LATE BULL";
  else if (thermalScore >= 3) regime = "DISTRIBUTION";
  else regime = "EUPHORIA / TOP RISK";

  const regimeColor =
    thermalScore >= 7 ? "#2ecc71"
    : thermalScore >= 6 ? "#a3e635"
    : thermalScore >= 4.5 ? "#ffe066"
    : thermalScore >= 3 ? "#ffa500"
    : "#ff4d4d";

  // ───────────── STYLES ─────────────
  const page = {
    background:"#020617",
    minHeight:"100vh",
    padding:24,
    color:"#e5e7eb",
    fontFamily:"Inter"
  };

  const card = {
    background:"#0b1220",
    border:"1px solid #1f2937",
    borderRadius:10,
    padding:16,
    marginBottom:16
  };

  const row = {
    display:"flex",
    justifyContent:"space-between",
    padding:"6px 0",
    fontSize:14
  };

  const heatBox = (color) => ({
    width:12,
    height:12,
    borderRadius:3,
    background:color,
    marginRight:8
  });

  // ───────────── UI ─────────────
  return (
    <div style={page}>

      {/* HEADER */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:26,fontWeight:700}}>
          BTC ON-CHAIN — HEDGE++ ULTIMATE
        </div>
        <div style={{fontSize:22,color:"#facc15"}}>
          ${vals.price.toLocaleString()}
        </div>
      </div>

      {/* GLOBAL SCORE */}
      <div style={{...card,border:`2px solid ${regimeColor}`}}>
        <div style={{fontSize:12,color:"#9ca3af"}}>Thermal Score</div>
        <div style={{fontSize:40,fontWeight:700,color:regimeColor}}>
          {thermalScore.toFixed(1)}
        </div>
        <div style={{fontSize:14}}>{regime}</div>
      </div>

      {/* HEATMAP */}
      <div style={card}>
        <div style={{fontWeight:600,marginBottom:10}}>Heatmap (Institutional)</div>

        {[
          ["MVRV Percentile", vals.mvrv, metrics.mvrv],
          ["Mayer Multiple", vals.mayer, metrics.mayer],
          ["Sharpe Ratio", vals.sharpe, metrics.sharpe],
          ["SOPR", vals.sopr, metrics.sopr],
          ["UTXO Ratio", vals.utxo, metrics.utxo],
          ["Futures Power", vals.futuresPower, metrics.futures]
        ].map(([name, value, m]) => (
          <div key={name} style={row}>
            <div style={{display:"flex",alignItems:"center"}}>
              <div style={heatBox(m.color)}></div>
              {name}
            </div>
            <div>{value}</div>
          </div>
        ))}
      </div>

      {/* FLOWS */}
      <div style={card}>
        <div style={{fontWeight:600,marginBottom:10}}>Flux & Liquidité</div>
        <div style={row}><span>ETF Netflow 30D</span><span>{vals.etfNetflow} B$</span></div>
        <div style={row}><span>USDT SMA(30)</span><span>{vals.usdtSma} B$</span></div>
        <div style={row}><span>Net Taker Volume</span><span>{vals.ntvSellCount}</span></div>
      </div>

      {/* DERIVATIVES */}
      <div style={card}>
        <div style={{fontWeight:600,marginBottom:10}}>Dérivés</div>
        <div style={row}><span>Futures Power</span><span>{vals.futuresPower}%</span></div>
        <div style={row}><span>Bull/Bear 30D</span><span>{vals.bullBear30d}</span></div>
      </div>

      {/* HOLDERS */}
      <div style={card}>
        <div style={{fontWeight:600,marginBottom:10}}>Holders</div>
        <div style={row}><span>SOPR</span><span>{vals.sopr}</span></div>
        <div style={row}><span>STH NUPL</span><span>{vals.sthNupl}</span></div>
        <div style={row}><span>Whales</span><span>{vals.whales}</span></div>
      </div>

    </div>
  );
}
