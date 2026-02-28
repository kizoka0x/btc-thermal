const { useState, useEffect } = React;

function BTCHedgeInstitutional() {

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
    mvrv: 0,
    mayer: 0,
    sharpe: 0,
    whales: 0
  });

  const [loaded, setLoaded] = useState(false);

  // ───────────── FETCH JSON ─────────────
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
          mvrv: data.mvrv || 0,
          mayer: data.mayer || 0,
          sharpe: data.sharpe || 0,
          whales: data.whales || 0
        });
        setLoaded(true);
      })
      .catch(err => {
        console.error("Erreur JSON:", err);
        setLoaded(true);
      });
  }, []);

  if (!loaded) {
    return <div style={{color:"#fff",padding:40}}>Chargement...</div>;
  }

  // ───────────── HEAT ENGINE ─────────────
  const heat = (v, low, mid, high) => {
    if (v <= low) return { score: 9, color: "#22c55e" };   // Accumulation
    if (v <= mid) return { score: 6, color: "#fde047" };   // Neutre
    if (v <= high) return { score: 4, color: "#f59e0b" };  // Chaud
    return { score: 2, color: "#ef4444" };                 // Risque top
  };

  const metrics = {
    mvrv: heat(vals.mvrv, 15, 50, 80),
    mayer: heat(vals.mayer, 0.8, 1.4, 2),
    sharpe: heat(vals.sharpe, -20, 10, 40),
    sopr: heat(vals.sopr, 0.98, 1.02, 1.08),
    utxo: heat(vals.utxo, 3, 8, 15),
    futures: heat(vals.futuresPower, 40, 55, 70),
    bullbear: heat(vals.bullBear30d, -0.2, 0.2, 0.6)
  };

  const scores = Object.values(metrics).map(m => m.score);
  const thermalScore = scores.reduce((a,b)=>a+b,0) / scores.length;

  // ───────────── REGIME ─────────────
  let regime = "NEUTRAL";
  if (thermalScore >= 7.5) regime = "ACCUMULATION / BOTTOM ZONE";
  else if (thermalScore >= 6) regime = "EARLY BULL";
  else if (thermalScore >= 4.5) regime = "MID CYCLE";
  else if (thermalScore >= 3) regime = "DISTRIBUTION";
  else regime = "EUPHORIA / TOP RISK";

  const regimeColor =
    thermalScore >= 7 ? "#22c55e"
    : thermalScore >= 6 ? "#a3e635"
    : thermalScore >= 4.5 ? "#fde047"
    : thermalScore >= 3 ? "#f59e0b"
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

  const sectionTitle = {
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

  const heatDot = (color) => ({
    width:10,
    height:10,
    borderRadius:3,
    background:color,
    marginRight:8
  });

  const HeatRow = (label, value, metric) => (
    <div style={row}>
      <div style={{display:"flex",alignItems:"center"}}>
        <div style={heatDot(metric.color)}></div>
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
          BTC ON-CHAIN — HEDGE+++ INSTITUTIONAL
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
        <div>{regime}</div>
      </div>

      {/* ── Flux & Liquidité */}
      <div style={card}>
        <div style={sectionTitle}>── Flux & Liquidité</div>
        <div style={row}><span>ETF Netflow 30D</span><span>{vals.etfNetflow} B$</span></div>
        <div style={row}><span>USDT SMA(30)</span><span>{vals.usdtSma} B$</span></div>
        <div style={row}><span>Net Taker Volume</span><span>{vals.ntvSellCount}</span></div>
      </div>

      {/* ── Dérivés & Structure */}
      <div style={card}>
        <div style={sectionTitle}>── Dérivés & Structure</div>
        {HeatRow("Futures Power", vals.futuresPower, metrics.futures)}
        {HeatRow("Bull/Bear 30D", vals.bullBear30d, metrics.bullbear)}
      </div>

      {/* ── Profitabilité & Holders */}
      <div style={card}>
        <div style={sectionTitle}>── Profitabilité & Holders</div>
        {HeatRow("SOPR", vals.sopr, metrics.sopr)}
        <div style={row}><span>STH NUPL</span><span>{vals.sthNupl}</span></div>
        <div style={row}><span>Whales</span><span>{vals.whales}</span></div>
        {HeatRow("UTXO P/L Ratio", vals.utxo, metrics.utxo)}
      </div>

      {/* ── Valorisation LT */}
      <div style={card}>
        <div style={sectionTitle}>── Valorisation Long Terme</div>
        {HeatRow("MVRV Percentile", vals.mvrv, metrics.mvrv)}
        {HeatRow("Mayer Multiple", vals.mayer, metrics.mayer)}
        {HeatRow("Sharpe Ratio", vals.sharpe, metrics.sharpe)}
      </div>

    </div>
  );
}

// Render
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCHedgeInstitutional />);
