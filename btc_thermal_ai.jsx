const { useState, useEffect } = React;

function BTCDashboard() {

  const [vals, setVals] = useState(null);
  const [error, setError] = useState(null);

  // ───────── FETCH JSON (avec refresh auto) ─────────
  useEffect(() => {

    const load = async () => {
      try {
        const res = await fetch("./btc_dashboard.json?t=" + Date.now());
        if (!res.ok) throw new Error("btc_dashboard.json introuvable");

        const data = await res.json();
        console.log("Dashboard chargé:", data);

        setVals({
          updated: data.updated,
          price: data.btcPrice,
          thermalScore: data.thermalScore,

          // Flux
          etfNetflow: data.etfNetflow,
          usdtSma: data.usdtSma,
          ntvSellCount: data.ntvSellCount,

          // Market structure
          futuresPower: data.futuresPower,
          bullBear30d: data.bullBear30d,
          bullBear365d: data.bullBear365d,

          // Holders
          sopr: data.soprRatio,
          lthNupl: data.lthNupl,
          sthNupl: data.sthNupl,
          utxo: data.utxoRatio,
          whales: data.whales1k10k,

          // Valuation
          mvrv: data.mvrvPct,
          mayer: data.mayerMultiple,
          sharpe: data.sharpeShort
        });

      } catch (e) {
        console.error(e);
        setError(e.message);
      }
    };

    load();
    const interval = setInterval(load, 300000); // 5 min
    return () => clearInterval(interval);

  }, []);

  if (error) {
    return <div style={{color:"#fff",padding:40}}>Erreur: {error}</div>;
  }

  if (!vals) {
    return <div style={{color:"#fff",padding:40}}>Chargement BTC Dashboard...</div>;
  }

  // ───────── REGIME (basé sur ton thermalScore) ─────────
  const s = vals.thermalScore;

  let regime = "NEUTRAL";
  if (s >= 7.5) regime = "ACCUMULATION";
  else if (s >= 6) regime = "EARLY BULL";
  else if (s >= 4.5) regime = "MID CYCLE";
  else if (s >= 3) regime = "DISTRIBUTION";
  else regime = "EUPHORIA / TOP";

  const regimeColor =
    s >= 7 ? "#22c55e"
    : s >= 6 ? "#a3e635"
    : s >= 4.5 ? "#fde047"
    : s >= 3 ? "#f59e0b"
    : "#ef4444";

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

  const row = {
    display:"flex",
    justifyContent:"space-between",
    padding:"6px 0",
    fontSize:14
  };

  // ───────── UI ─────────
  return (
    <div style={page}>

      {/* HEADER */}
      <div style={{marginBottom:20}}>
        <div style={{fontSize:26,fontWeight:700}}>
          BTC DASHBOARD — CIO MODEL
        </div>
        <div style={{fontSize:22,color:"#facc15"}}>
          ${vals.price.toLocaleString()}
        </div>
        <div style={{fontSize:11,color:"#22c55e"}}>
          Dernière mise à jour: {vals.updated}
        </div>
      </div>

      {/* SCORE GLOBAL */}
      <div style={{...card,border:`2px solid ${regimeColor}`}}>
        <div style={{fontSize:12,color:"#9ca3af"}}>Thermal Score</div>
        <div style={{fontSize:40,fontWeight:700,color:regimeColor}}>
          {s.toFixed(2)}
        </div>
        <div>{regime}</div>
      </div>

      {/* ── Flux & Liquidité */}
      <div style={card}>
        <b>── Flux & Liquidité</b>
        <div style={row}><span>ETF Netflow 30D</span><span>{vals.etfNetflow.toFixed(2)}</span></div>
        <div style={row}><span>USDT SMA(30)</span><span>{vals.usdtSma.toFixed(4)}</span></div>
        <div style={row}><span>Net Taker Volume</span><span>{vals.ntvSellCount}</span></div>
      </div>

      {/* ── Dérivés & Structure */}
      <div style={card}>
        <b>── Dérivés & Structure de marché</b>
        <div style={row}><span>Futures Power</span><span>{vals.futuresPower}%</span></div>
        <div style={row}><span>Bull/Bear 30D</span><span>{vals.bullBear30d.toFixed(3)}</span></div>
        <div style={row}><span>Bull/Bear 365D</span><span>{vals.bullBear365d.toFixed(3)}</span></div>
      </div>

      {/* ── Profitabilité & Holders */}
      <div style={card}>
        <b>── Profitabilité & Comportement des holders</b>
        <div style={row}><span>SOPR</span><span>{vals.sopr.toFixed(3)}</span></div>
        <div style={row}><span>LTH NUPL</span><span>{vals.lthNupl.toFixed(3)}</span></div>
        <div style={row}><span>STH NUPL</span><span>{vals.sthNupl.toFixed(3)}</span></div>
        <div style={row}><span>UTXO Ratio</span><span>{vals.utxo.toFixed(4)}</span></div>
        <div style={row}><span>Whales 1k-10k</span><span>{vals.whales}</span></div>
      </div>

      {/* ── Valorisation */}
      <div style={card}>
        <b>── Valorisation & Risque Long Terme</b>
        <div style={row}><span>MVRV Percentile</span><span>{vals.mvrv.toFixed(3)}</span></div>
        <div style={row}><span>Mayer Multiple</span><span>{vals.mayer.toFixed(3)}</span></div>
        <div style={row}><span>Sharpe (CT)</span><span>{vals.sharpe.toFixed(3)}</span></div>
      </div>

    </div>
  );
}

// Render React (Babel version)
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCDashboard />);
