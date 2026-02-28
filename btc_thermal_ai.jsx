const { useState, useEffect } = React;

function BTCDashboardCIO() {

  const [vals, setVals] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [debugKeys, setDebugKeys] = useState([]);

  // ───────── SAFE GET (support plusieurs noms) ─────────
  const get = (data, keys, def = 0) => {
    for (let k of keys) {
      if (data[k] !== undefined && data[k] !== null) return data[k];
    }
    return def;
  };

  // ───────── FETCH JSON ─────────
  useEffect(() => {
    fetch("./btc_dashboard.json", { cache: "no-store" })
      .then(res => {
        if (!res.ok) {
          throw new Error("Fichier btc_dashboard.json introuvable (status " + res.status + ")");
        }
        return res.json();
      })
      .then(data => {
        console.log("JSON reçu:", data);
        setDebugKeys(Object.keys(data));

        setVals({
          price: get(data, ["price", "btcPrice"]),
          etfNetflow: get(data, ["etfNetflow", "etf"]),
          usdtSma: get(data, ["usdtSma", "usdt"]),
          ntvSellCount: get(data, ["ntvSellCount", "ntv"]),
          futuresPower: get(data, ["futuresPower", "futures"]),
          bullBear30d: get(data, ["bullBear30d", "bullBear"]),
          sopr: get(data, ["sopr"]),
          sthNupl: get(data, ["sthNupl", "nupl"]),
          utxo: get(data, ["utxo"]),
          whales: get(data, ["whales", "accumulation60d"]),
          spentBands: get(data, ["spentBands"]),
          mvrv: get(data, ["mvrv", "mvrvPct"]),
          mayer: get(data, ["mayer"]),
          sharpe: get(data, ["sharpe"])
        });

        setLoaded(true);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoaded(true);
      });
  }, []);

  // ───────── LOADING / ERROR ─────────
  if (!loaded) {
    return <div style={{color:"#fff",padding:40}}>Chargement BTC Dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{color:"#fff",padding:40}}>
        <h2>Erreur chargement JSON</h2>
        <div>{error}</div>
        <br/>
        <div>Vérifie que :</div>
        <ul>
          <li>btc_dashboard.json est dans le même dossier</li>
          <li>Tu ouvres via serveur (Live Server / localhost)</li>
        </ul>
      </div>
    );
  }

  // ───────── HEAT MODEL ─────────
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
    futures: heat(vals.futuresPower, 40, 55, 70)
  };

  const scores = Object.values(model).map(m => m.score);
  const composite = scores.reduce((a,b)=>a+b,0) / scores.length;

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
    padding:"6px 0"
  };

  // ───────── UI ─────────
  return (
    <div style={page}>

      <h1>BTC DASHBOARD — CIO MODEL</h1>
      <h2 style={{color:"#facc15"}}>${vals.price.toLocaleString()}</h2>

      <div style={{...card,border:`2px solid ${regimeColor}`}}>
        <div>Composite Score: {composite.toFixed(1)}</div>
        <div>{regime}</div>
      </div>

      {/* Flux */}
      <div style={card}>
        <b>── Flux & Liquidité</b>
        <div style={row}><span>ETF Netflow 30D</span><span>{vals.etfNetflow}</span></div>
        <div style={row}><span>USDT SMA(30)</span><span>{vals.usdtSma}</span></div>
        <div style={row}><span>Net Taker Volume</span><span>{vals.ntvSellCount}</span></div>
      </div>

      {/* Dérivés */}
      <div style={card}>
        <b>── Dérivés</b>
        <div style={row}><span>Futures Power</span><span>{vals.futuresPower}</span></div>
        <div style={row}><span>Bull/Bear 30D</span><span>{vals.bullBear30d}</span></div>
      </div>

      {/* Holders */}
      <div style={card}>
        <b>── Holders</b>
        <div style={row}><span>SOPR</span><span>{vals.sopr}</span></div>
        <div style={row}><span>NUPL</span><span>{vals.sthNupl}</span></div>
        <div style={row}><span>UTXO</span><span>{vals.utxo}</span></div>
        <div style={row}><span>Accumulation 60D</span><span>{vals.whales}</span></div>
        <div style={row}><span>Spent Bands</span><span>{vals.spentBands}</span></div>
      </div>

      {/* Valorisation */}
      <div style={card}>
        <b>── Valorisation</b>
        <div style={row}><span>MVRV</span><span>{vals.mvrv}</span></div>
        <div style={row}><span>Mayer</span><span>{vals.mayer}</span></div>
        <div style={row}><span>Sharpe</span><span>{vals.sharpe}</span></div>
      </div>

      {/* DEBUG */}
      <div style={{fontSize:11,color:"#9ca3af",marginTop:20}}>
        Clés JSON détectées: {debugKeys.join(", ")}
      </div>

    </div>
  );
}

// Render Babel
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCDashboardCIO />);
