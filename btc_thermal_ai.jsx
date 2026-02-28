const { useState, useEffect } = React;

function BTCDashboardCIO() {

  // ───────── STATE ─────────
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

  // ───────── LOAD JSON ─────────
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
    return <div style={{color:"#fff",padding:40}}>Chargement BTC Dashboard...</div>;
  }

  // ───────── HEAT MODEL (institutional) ─────────
  const heat = (v, low, mid, high) => {
    if (v <= low) return { score: 9, color:"#22c55e" };
    if (v <= mid) return { score: 6, color:"#fde047" };
    if (v <= high) return { score: 4, color:"#f59e0b" };
    return { score: 2, color:"#ef4444" };
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
  const composite = scores.reduce((a,b)=>a+b,0) / scores.length;

  // ───────── MARKET REGIME ─────────
  let regime = "NEUTRAL";
  if (composite >= 7.5) regime = "ACCUMULATION";
  else if (composite >= 6) regime = "EARLY BULL";
  else if (composite >= 4.5) regime = "MID CYCLE";
  else if (composite >= 3) regime = "DISTRIBUTION";
  else regime = "EUPHORIA";

  const regimeColor =
    composite >= 7 ? "#22c55e"
    : composite >= 6 ? "#a3e635"
    : composite >= 4.5 ? "#fde047"
    : composite >= 3 ? "#f59e0b"
    : "#ef4444";

  // ───────── CIO FAIR VALUE MODEL ─────────
  const fairValue = vals.price * (composite / 5);
  const bottomZone = fairValue * 0.7;
  const topZone = fairValue * 1.5;

  let cioSignal = "HOLD";
  if (vals.price < bottomZone) cioSignal = "STRONG BUY";
  else if (vals.price < fairValue) cioSignal = "ACCUMULATE";
  else if (vals.price > topZone) cioSignal = "RISK OFF";
  else if (composite < 3.5) cioSignal = "REDUCE";

  // ───────── STYLES ─────────
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

  // ───────── UI ─────────
  return (
    <div style={page}>

      {/* HEADER */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:28,fontWeight:700}}>
          BTC DASHBOARD — CIO MODEL
        </div>
        <div style={{fontSize:22,color:"#facc15"}}>
          ${vals.price.toLocaleString()}
        </div>
      </div>

      {/* CIO PANEL */}
      <div style={{...card,border:`2px solid ${regimeColor}`}}>
        <div style={{fontSize:12,color:"#9ca3af"}}>Composite Score</div>
        <div style={{fontSize:36,fontWeight:700,color:regimeColor}}>
          {composite.toFixed(1)}
        </div>
        <div>{regime}</div>

        <div style={{marginTop:10,fontSize:13}}>
          Fair Value: ${fairValue.toLocaleString(undefined,{maximumFractionDigits:0})}<br/>
          Bottom Zone: ${bottomZone.toLocaleString(undefined,{maximumFractionDigits:0})}<br/>
          Top Zone: ${topZone.toLocaleString(undefined,{maximumFractionDigits:0})}<br/>
          <b>CIO Signal: {cioSignal}</b>
        </div>
      </div>

      {/* Flux & Liquidité */}
      <div style={card}>
        <div style={section}>── Flux & Liquidité</div>
        <div style={row}><span>ETF Netflow 30D Sum</span><span>{vals.etfNetflow}</span></div>
        <div style={row}><span>USDT Stablecoin SMA(30)</span><span>{vals.usdtSma}</span></div>
        <div style={row}><span>Net Taker Volume Binance</span><span>{vals.ntvSellCount}</span></div>
      </div>

      {/* Dérivés */}
      <div style={card}>
        <div style={section}>── Dérivés & Structure de marché</div>
        {HeatRow("Futures Power 30D Change", vals.futuresPower, model.futures)}
        {HeatRow("Bull/Bear Cycle Indicator", vals.bullBear30d, model.bullbear)}
      </div>

      {/* Holders */}
      <div style={card}>
        <div style={section}>── Profitabilité & Comportement des holders</div>
        {HeatRow("LTH/STH SOPR Ratio", vals.sopr, model.sopr)}
        <div style={row}><span>aLTH/aSTH NUPL</span><span>{vals.sthNupl}</span></div>
        {HeatRow("UTXO Block P/L Count Ratio", vals.utxo, model.utxo)}
        <div style={row}><span>Accumulation Cohortes (60D)</span><span>{vals.whales}</span></div>
        <div style={row}><span>Spent Output Value Bands</span><span>{vals.spentBands}</span></div>
      </div>

      {/* Valorisation */}
      <div style={card}>
        <div style={section}>── Valorisation & Risque Long Terme</div>
        {HeatRow("MVRV Percentile — Cycle", vals.mvrv, model.mvrv)}
        {HeatRow("Mayer Multiple", vals.mayer, model.mayer)}
        {HeatRow("Sharpe Ratio (court terme)", vals.sharpe, model.sharpe)}
      </div>

    </div>
  );
}

// Render (Babel compatible)
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCDashboardCIO />);
