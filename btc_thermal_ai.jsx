const { useState, useEffect } = React;

function BTCTerminal() {

  const [vals, setVals] = useState(null);
  const [error, setError] = useState(null);

  // ───── FETCH DASHBOARD ─────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("./btc_dashboard.json?t=" + Date.now());
        if (!res.ok) throw new Error("btc_dashboard.json introuvable");
        const d = await res.json();

        setVals({
          updated: d.updated,
          price: d.btcPrice,
          thermal: d.thermalScore,

          etf: d.etfNetflow,
          usdt: d.usdtSma,
          ntv: d.ntvSellCount,

          futures: d.futuresPower,
          bb30: d.bullBear30d,
          bb365: d.bullBear365d,

          sopr: d.soprRatio,
          lthNupl: d.lthNupl,
          sthNupl: d.sthNupl,
          utxo: d.utxoRatio,
          whales: d.whales1k10k,

          mvrv: d.mvrvPct,
          mayer: d.mayerMultiple,
          sharpe: d.sharpeShort
        });

      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    };

    load();
    const interval = setInterval(load, 300000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <div style={{color:"#fff",padding:40}}>Erreur: {error}</div>;
  if (!vals) return <div style={{color:"#fff",padding:40}}>Chargement Terminal...</div>;

  // ───── HEAT ENGINE (institutional colors) ─────
  const heat = (v, low, mid, high) => {
    if (v <= low) return "#22c55e";   // accumulation
    if (v <= mid) return "#a3e635";   // early bull
    if (v <= high) return "#fde047";  // neutral
    return "#ef4444";                 // risk
  };

  const colors = {
    mvrv: heat(vals.mvrv, 0.2, 0.6, 0.85),
    mayer: heat(vals.mayer, 0.8, 1.2, 1.8),
    sharpe: heat(vals.sharpe, -20, 10, 40),
    sopr: heat(vals.sopr, 0.98, 1.02, 1.08),
    futures: heat(vals.futures, 40, 55, 70)
  };

  // ───── MARKET SIGNAL ─────
  const s = vals.thermal;
  let signal = "HOLD";
  if (s >= 7.5) signal = "STRONG BUY";
  else if (s >= 6) signal = "BUY";
  else if (s >= 4.5) signal = "HOLD";
  else if (s >= 3) signal = "REDUCE";
  else signal = "EXIT / TOP RISK";

  const signalColor =
    s >= 7 ? "#22c55e"
    : s >= 6 ? "#84cc16"
    : s >= 4.5 ? "#fde047"
    : s >= 3 ? "#f59e0b"
    : "#ef4444";

  // ───── STYLES ─────
  const page = {
    background:"#020617",
    minHeight:"100vh",
    padding:24,
    fontFamily:"Arial",
    color:"#e5e7eb"
  };

  const grid = {
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
    gap:16
  };

  const card = {
    background:"#0b1220",
    border:"1px solid #1f2937",
    borderRadius:10,
    padding:16
  };

  const row = {
    display:"flex",
    justifyContent:"space-between",
    padding:"6px 0",
    fontSize:14
  };

  const heatBox = c => ({
    width:10,
    height:10,
    borderRadius:2,
    background:c,
    marginRight:8
  });

  // ───── UI ─────
  return (
    <div style={page}>

      {/* HEADER */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:28,fontWeight:700}}>
          BTC TERMINAL — INSTITUTIONAL
        </div>
        <div style={{fontSize:22,color:"#facc15"}}>
          ${vals.price.toLocaleString()}
        </div>
        <div style={{fontSize:11,color:"#22c55e"}}>
          Updated: {vals.updated}
        </div>
      </div>

      {/* GLOBAL PANEL */}
      <div style={{...card,marginBottom:20,border:`2px solid ${signalColor}`}}>
        <div style={{fontSize:12,color:"#9ca3af"}}>Thermal Score</div>
        <div style={{fontSize:42,fontWeight:700,color:signalColor}}>
          {s.toFixed(2)}
        </div>
        <div style={{fontSize:16,fontWeight:600}}>
          Signal: {signal}
        </div>
      </div>

      <div style={grid}>

        {/* Flux */}
        <div style={card}>
          <b>Flux & Liquidité</b>
          <div style={row}><span>ETF Netflow</span><span>{vals.etf.toFixed(2)}</span></div>
          <div style={row}><span>USDT SMA(30)</span><span>{vals.usdt.toFixed(4)}</span></div>
          <div style={row}><span>Net Taker Volume</span><span>{vals.ntv}</span></div>
        </div>

        {/* Dérivés */}
        <div style={card}>
          <b>Dérivés & Structure</b>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={heatBox(colors.futures)}></div>Futures Power
            </span>
            <span>{vals.futures}%</span>
          </div>
          <div style={row}><span>Bull/Bear 30D</span><span>{vals.bb30.toFixed(3)}</span></div>
          <div style={row}><span>Bull/Bear 365D</span><span>{vals.bb365.toFixed(3)}</span></div>
        </div>

        {/* Holders */}
        <div style={card}>
          <b>Holders Behaviour</b>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={heatBox(colors.sopr)}></div>SOPR
            </span>
            <span>{vals.sopr.toFixed(3)}</span>
          </div>
          <div style={row}><span>LTH NUPL</span><span>{vals.lthNupl.toFixed(3)}</span></div>
          <div style={row}><span>STH NUPL</span><span>{vals.sthNupl.toFixed(3)}</span></div>
          <div style={row}><span>UTXO Ratio</span><span>{vals.utxo.toFixed(4)}</span></div>
          <div style={row}><span>Whales</span><span>{vals.whales}</span></div>
        </div>

        {/* Valuation */}
        <div style={card}>
          <b>Valorisation & Risk</b>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={heatBox(colors.mvrv)}></div>MVRV
            </span>
            <span>{vals.mvrv.toFixed(3)}</span>
          </div>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={heatBox(colors.mayer)}></div>Mayer
            </span>
            <span>{vals.mayer.toFixed(3)}</span>
          </div>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={heatBox(colors.sharpe)}></div>Sharpe
            </span>
            <span>{vals.sharpe.toFixed(3)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCTerminal />);
