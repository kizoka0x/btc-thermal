const { useState, useEffect } = React;

function BTCTerminal() {

  const [v, setV] = useState(null);

  // ───── LOAD DASHBOARD ─────
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("./btc_dashboard.json?t=" + Date.now());
        const d = await r.json();

        setV({
          updated: d.updated,
          price: d.btcPrice,
          thermal: d.thermalScore,

          // Flux
          etf: d.etfNetflow,
          usdt: d.usdtSma,
          ntv: d.ntvSellCount,

          // Structure
          futures: d.futuresPower,
          bb30: d.bullBear30d,
          bb365: d.bullBear365d,

          // Holders
          sopr: d.soprRatio,
          lthNupl: d.lthNupl,
          sthNupl: d.sthNupl,
          utxo: d.utxoRatio,
          whales: d.whales1k10k,

          // Valuation
          mvrv: d.mvrvPct,
          mayer: d.mayerMultiple,
          sharpe: d.sharpeShort
        });

      } catch (e) {
        console.error("Dashboard error", e);
      }
    };

    load();
    const i = setInterval(load, 300000);
    return () => clearInterval(i);
  }, []);

  if (!v) return <div style={{color:"#fff",padding:40}}>Loading Sovereign Model...</div>;

  // ───── SOVEREIGN CYCLE ENGINE ─────

  // Long-term cycle score (valuation)
  const cycleScore =
    (v.mvrv * 4) +
    (v.mayer * 2) +
    (v.lthNupl * 3);

  // Liquidity regime
  const liquidity =
    (v.etf) +
    (v.usdt * 1000) -
    (v.futures - 50);

  // Market stress
  const stress =
    Math.abs(v.sopr - 1) * 10 +
    Math.abs(v.bb30) * 5 +
    Math.abs(v.sharpe) / 5;

  // ───── GLOBAL REGIME ─────
  let regime = "Neutral";
  let color = "#fde047";

  if (v.thermal >= 7.5) { regime = "Strategic Accumulation"; color = "#22c55e"; }
  else if (v.thermal >= 6) { regime = "Expansion Phase"; color = "#84cc16"; }
  else if (v.thermal >= 4.5) { regime = "Late Cycle"; color = "#fde047"; }
  else if (v.thermal >= 3) { regime = "Distribution Risk"; color = "#f59e0b"; }
  else { regime = "Cycle Top Zone"; color = "#ef4444"; }

  // ───── HEAT COLORS ─────
  const heat = (val, a, b, c) => {
    if (val <= a) return "#22c55e";
    if (val <= b) return "#a3e635";
    if (val <= c) return "#fde047";
    return "#ef4444";
  };

  const h = {
    mvrv: heat(v.mvrv, 0.2, 0.6, 0.85),
    mayer: heat(v.mayer, 0.8, 1.2, 1.8),
    sopr: heat(v.sopr, 0.98, 1.02, 1.08),
    futures: heat(v.futures, 40, 55, 70),
    sharpe: heat(v.sharpe, -20, 10, 40)
  };

  // ───── STYLE ─────
  const page = {
    background:"#020617",
    minHeight:"100vh",
    padding:24,
    color:"#e5e7eb",
    fontFamily:"Arial"
  };

  const card = {
    background:"#0b1220",
    border:"1px solid #1f2937",
    borderRadius:10,
    padding:16
  };

  const grid = {
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
    gap:16
  };

  const row = {
    display:"flex",
    justifyContent:"space-between",
    padding:"6px 0",
    fontSize:14
  };

  const dot = c => ({
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
          BTC SOVEREIGN FUND MODEL
        </div>
        <div style={{fontSize:22,color:"#facc15"}}>
          ${v.price.toLocaleString()}
        </div>
        <div style={{fontSize:11,color:"#22c55e"}}>
          Updated: {v.updated}
        </div>
      </div>

      {/* GLOBAL REGIME */}
      <div style={{...card,marginBottom:20,border:`2px solid ${color}`}}>
        <div style={{fontSize:12,color:"#9ca3af"}}>Macro Cycle Regime</div>
        <div style={{fontSize:38,fontWeight:700,color:color}}>
          {regime}
        </div>
        <div style={{fontSize:14}}>
          Thermal Score: {v.thermal.toFixed(2)}
        </div>
      </div>

      <div style={grid}>

        {/* Liquidity */}
        <div style={card}>
          <b>Liquidity & Flows</b>
          <div style={row}><span>ETF Netflow</span><span>{v.etf.toFixed(2)}</span></div>
          <div style={row}><span>USDT SMA</span><span>{v.usdt.toFixed(4)}</span></div>
          <div style={row}><span>Net Taker</span><span>{v.ntv}</span></div>
        </div>

        {/* Market Structure */}
        <div style={card}>
          <b>Market Structure</b>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={dot(h.futures)}></div>Futures Power
            </span>
            <span>{v.futures}%</span>
          </div>
          <div style={row}><span>Bull/Bear 30D</span><span>{v.bb30.toFixed(3)}</span></div>
          <div style={row}><span>Bull/Bear 365D</span><span>{v.bb365.toFixed(3)}</span></div>
        </div>

        {/* Holders */}
        <div style={card}>
          <b>Holder Behaviour</b>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={dot(h.sopr)}></div>SOPR
            </span>
            <span>{v.sopr.toFixed(3)}</span>
          </div>
          <div style={row}><span>LTH NUPL</span><span>{v.lthNupl.toFixed(3)}</span></div>
          <div style={row}><span>STH NUPL</span><span>{v.sthNupl.toFixed(3)}</span></div>
          <div style={row}><span>UTXO</span><span>{v.utxo.toFixed(4)}</span></div>
          <div style={row}><span>Whales</span><span>{v.whales}</span></div>
        </div>

        {/* Valuation */}
        <div style={card}>
          <b>Valuation & Risk</b>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={dot(h.mvrv)}></div>MVRV
            </span>
            <span>{v.mvrv.toFixed(3)}</span>
          </div>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={dot(h.mayer)}></div>Mayer
            </span>
            <span>{v.mayer.toFixed(3)}</span>
          </div>
          <div style={row}>
            <span style={{display:"flex",alignItems:"center"}}>
              <div style={dot(h.sharpe)}></div>Sharpe
            </span>
            <span>{v.sharpe.toFixed(3)}</span>
          </div>
        </div>

      </div>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCTerminal />);
