const { useState, useEffect } = React;

function BTCDashboardFund() {

  // ───────────── STATE ─────────────
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
    whales: 0,
    spentBands: 0,
    mvrv: 0,
    mayer: 0,
    sharpe: 0
  });

  const [loaded, setLoaded] = useState(false);

  // ───────────── LOAD JSON ─────────────
  useEffect(() => {
    fetch("btc_dashboard.json")
      .then(res => res.json())
      .then(data => {
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
          whales: data.whales || 0,
          spentBands: data.spentBands || 0,
          mvrv: data.mvrv || 0,
          mayer: data.mayer || 0,
          sharpe: data.sharpe || 0
        });
        setLoaded(true);
      })
      .catch(err => {
        console.error("Erreur btc_dashboard.json", err);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return <div style={{color:"#fff",padding:40}}>Chargement dashboard...</div>;
  }

  // ───────────── FUND HEAT MODEL ─────────────
  const heat = (v, low, mid, high) => {
    if (v <= low) return { score: 9, color:"#22c55e" };   // accumulation
    if (v <= mid) return { score: 6, color:"#fde047" };   // neutre
    if (v <= high) return { score: 4, color:"#f59e0b" };  // chaud
    return { score: 2, color:"#ef4444" };                 // euphorie
  };

  const model = {
    mvrv: heat(vals.mvrv, 15, 50, 80),
    mayer: heat(vals.mayer, 0.8, 1.4, 2),
    sharpe: heat(vals.sharpe, -20, 10, 40),
    sopr: heat(vals.sopr, 0.98, 1.02, 1.08),
    utxo: heat(vals.utxo, 3, 8, 15),
    futures: heat(vals.futuresPower, 40, 55, 70),
    bullbear: heat(vals.bullBear30d, -0.2, 0.2, 0.6)
  };

  const scores = Object.values(model).map(m => m.score);
  const fundScore = scores.reduce((a,b)=>a+b,0) / scores.length;

  // ───────────── REGIME ─────────────
  let regime = "NEUTRAL";
  if (fundScore >= 7.5) regime = "ACCUMULATION / BOTTOM";
  else if (fundScore >= 6) regime = "EARLY BULL";
  else if (fundScore >= 4.5) regime = "MID CYCLE";
  else if (fundScore >= 3) regime = "DISTRIBUTION";
  else regime = "EUPHORIA / TOP";

  const regimeColor =
    fundScore >= 7 ? "#22c55e"
    : fundScore >= 6 ? "#a3e635"
    : fundScore >= 4.5 ? "#fde047"
    : fundScore >= 3 ? "#f59e0b"
    : "#ef4444";

  // ───────────── STYLES ─────────────
  const page = {
    background:"#020617",
    minHeight:"100vh",
    padding:24,
    fontFamily:"Arial",
    color:"#e5e7eb"
  };

  const card = {
    background:"#0b1220",
    border:"1px solid #1f2937",
    borderRadius:10,
    padding:16,
    marginBottom:16
  };

  const section = {
    color:"#9ca3af",
    fontSize:12,
    marginBottom:8,
    letterSpacing:1
  };

  const row = {
    display:"flex",
    justifyContent:"space-between",
    padding:"6px 0",
    fontSize:14
  };

  const dot = (color) => ({
    width:10,
    height:10,
    borderRadius:3,
    background:color,
    marginRight:8
  });

  const HeatRow = (label, value, metric) => (
    <div style={row}>
      <div style={{display:"flex",alignItems:"center"}}>
        <div style={dot(metric.color)}></div>
        {label}
      </div>
      <div>{value}</div>
    </div>
  );

  // ───────────── UI ─────────────
  return (
    <div style={page}>

      {/* HEADER */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:26,fontWeight:700}}>
          BTC DASHBOARD — FUND QUANT
        </div>
        <div style={{fontSize:22,color:"#facc15"}}>
          ${vals.price.toLocaleString()}
        </div>
      </div>

      {/* FUND SCORE */}
      <div style={{...card,border:`2px solid ${regimeColor}`}}>
        <div style={{fontSize:12,color:"#9ca3af"}}>Fund Composite Score</div>
        <div style={{fontSize:40,fontWeight:700,color:regimeColor}}>
          {fundScore.toFixed(1)}
        </div>
        <div>{regime}</div>
      </div>

      {/* ── Flux & Liquidité */}
      <div style={card}>
        <div style={section}>── Flux & Liquidité</div>
        <div style={row}><span>ETF Netflow 30D Sum</span><span>{vals.etfNetflow}</span></div>
        <div style={row}><span>USDT Stablecoin SMA(30)</span><span>{vals.usdtSma}</span></div>
        <div style={row}><span>Net Taker Volume Binance</span><span>{vals.ntvSellCount}</span></div>
      </div>

      {/* ── Dérivés & Structure */}
      <div style={card}>
        <div style={section}>── Dérivés & Structure de marché</div>
        {HeatRow("Futures Power 30D Change", vals.futuresPower, model.futures)}
        {HeatRow("Bull/Bear Cycle Indicator", vals.bullBear30d, model.bullbear)}
      </div>

      {/* ── Profitabilité & Holders */}
      <div style={card}>
        <div style={section}>── Profitabilité & Comportement des holders</div>
        {HeatRow("LTH/STH SOPR Ratio", vals.sopr, model.sopr)}
        <div style={row}><span>aLTH/aSTH NUPL</span><span>{vals.sthNupl}</span></div>
        {HeatRow("UTXO Block P/L Count Ratio", vals.utxo, model.utxo)}
        <div style={row}><span>Accumulation Cohortes (60D)</span><span>{vals.whales}</span></div>
        <div style={row}><span>Spent Output Value Bands</span><span>{vals.spentBands}</span></div>
      </div>

      {/* ── Valorisation & Risque LT */}
      <div style={card}>
        <div style={section}>── Valorisation & Risque Long Terme</div>
        {HeatRow("MVRV Percentile — Cycle", vals.mvrv, model.mvrv)}
        {HeatRow("Mayer Multiple", vals.mayer, model.mayer)}
        {HeatRow("Sharpe Ratio (court terme)", vals.sharpe, model.sharpe)}
      </div>

    </div>
  );
}

// Render
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCDashboardFund />);
