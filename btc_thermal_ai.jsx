const { useState, useEffect } = React;

function BTCHedgeUltimate() {

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

  // Fetch JSON
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

  // Heat function
  const heat = (v, low, mid, high) => {
    if (v <= low) return { score: 9, color: "#22c55e" };
    if (v <= mid) return { score: 6, color: "#fde047" };
    if (v <= high) return { score: 4, color: "#f59e0b" };
    return { score: 2, color: "#ef4444" };
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
    scores.reduce((a,b)=>a+b,0) / scores.length;

  let regime = "NEUTRAL";
  if (thermalScore >= 7.5) regime = "ACCUMULATION";
  else if (thermalScore >= 6) regime = "EARLY BULL";
  else if (thermalScore >= 4.5) regime = "LATE BULL";
  else if (thermalScore >= 3) regime = "DISTRIBUTION";
  else regime = "TOP RISK";

  const regimeColor =
    thermalScore >= 7 ? "#22c55e"
    : thermalScore >= 6 ? "#a3e635"
    : thermalScore >= 4.5 ? "#fde047"
    : thermalScore >= 3 ? "#f59e0b"
    : "#ef4444";

  const card = {
    background:"#0b1220",
    border:"1px solid #1f2937",
    borderRadius:10,
    padding:16,
    marginBottom:16,
    color:"#e5e7eb"
  };

  const row = {
    display:"flex",
    justifyContent:"space-between",
    padding:"6px 0"
  };

  return (
    <div style={{padding:24}}>

      <h1 style={{color:"#fff"}}>BTC HEDGE++ ULTIMATE</h1>
      <h2 style={{color:"#facc15"}}>${vals.price.toLocaleString()}</h2>

      <div style={{...card,border:`2px solid ${regimeColor}`}}>
        <div>Thermal Score</div>
        <div style={{fontSize:36,color:regimeColor}}>
          {thermalScore.toFixed(1)}
        </div>
        <div>{regime}</div>
      </div>

      <div style={card}>
        <b>Heatmap</b>
        {Object.entries(metrics).map(([k,m])=>(
          <div key={k} style={row}>
            <span>{k}</span>
            <span style={{color:m.color}}>
              {vals[k] ?? vals.futuresPower}
            </span>
          </div>
        ))}
      </div>

      <div style={card}>
        <b>Flux & Liquidité</b>
        <div style={row}><span>ETF</span><span>{vals.etfNetflow}</span></div>
        <div style={row}><span>USDT</span><span>{vals.usdtSma}</span></div>
        <div style={row}><span>NTV</span><span>{vals.ntvSellCount}</span></div>
      </div>

    </div>
  );
}

// Render
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCHedgeUltimate />);
