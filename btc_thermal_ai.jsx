const { useState, useEffect } = React;

// ─────────────────────────────────────────────
// Helpers sécurité
// ─────────────────────────────────────────────
const num = (v, d = 0) => {
  const n = Number(v);
  return isNaN(n) ? d : n;
};

const f2 = v => num(v).toFixed(2);
const f4 = v => num(v).toFixed(4);
const pct = v => (num(v) * 100).toFixed(2) + "%";
const sign = (v, d = 2) => (v >= 0 ? "+" : "") + num(v).toFixed(d);

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
function BTCThermalAI() {

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  // ─────────────────────────────────────────────
  // Chargement JSON robuste
  // ─────────────────────────────────────────────
  const load = async () => {
    setStatus("loading");

    try {
      const res = await fetch("btc_dashboard.json?t=" + Date.now());
      if (!res.ok) throw new Error("HTTP " + res.status);

      const raw = await res.json();

      // Mapping EXACT avec ton JSON réel
      const mapped = {
        updated: raw.updated || "",

        btcPrice: num(raw.btcPrice),

        // Flux & liquidité
        etfNetflow: num(raw.etfNetflow),
        usdtSma: num(raw.usdtSma),
        ntvSellCount: num(raw.ntvSellCount),

        // Dérivés
        futuresPower: num(raw.futuresPower),
        bullBear30d: num(raw.bullBear30d),
        bullBear365d: num(raw.bullBear365d),

        // Holders
        soprRatio: num(raw.soprRatio),
        lthNupl: num(raw.lthNupl),
        sthNupl: num(raw.sthNupl),
        utxoRatio: num(raw.utxoRatio),

        // Valorisation
        mvrvPct: num(raw.mvrvPct),
        mayerMultiple: num(raw.mayerMultiple),
        sharpeShort: num(raw.sharpeShort),

        // Smart money
        whales1k10k: num(raw.whales1k10k),

        // Score pipeline
        thermalScore: num(raw.thermalScore)
      };

      setData(mapped);
      setStatus("ok");

    } catch (e) {
      setStatus("error");
      setError(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ─────────────────────────────────────────────
  // États
  // ─────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div style={{
        background:"#0b0f19",
        color:"#aaa",
        height:"100vh",
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontFamily:"monospace"
      }}>
        Chargement btc_dashboard.json…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{
        background:"#0b0f19",
        color:"#ff6b6b",
        height:"100vh",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"center",
        fontFamily:"monospace",
        gap:10
      }}>
        <div>Erreur chargement JSON</div>
        <div style={{fontSize:12}}>{error}</div>
        <button onClick={load}>Réessayer</button>
      </div>
    );
  }

  const d = data;

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────
  return (
    <div style={{
      background:"#080c10",
      color:"#e6edf3",
      minHeight:"100vh",
      padding:20,
      fontFamily:"Arial"
    }}>

      {/* HEADER */}
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        borderBottom:"1px solid #1a2030",
        paddingBottom:12,
        marginBottom:18
      }}>
        <div>
          <div style={{fontSize:20,fontWeight:700}}>
            BTC DASHBOARD
          </div>
          <div style={{fontSize:11,color:"#4a5568"}}>
            Source : btc_dashboard.json
          </div>
          <div style={{fontSize:10,color:"#2ecc71"}}>
            Updated : {d.updated}
          </div>
        </div>

        <div style={{textAlign:"right"}}>
          <div style={{
            fontSize:28,
            fontWeight:700,
            color:"#ffd166",
            fontFamily:"monospace"
          }}>
            ${(d.btcPrice/1000).toFixed(2)}K
          </div>
          <div style={{fontSize:11,color:"#4a5568"}}>
            Thermal Score : {f2(d.thermalScore)} / 100
          </div>
        </div>
      </div>

      {/* SECTIONS */}

      <Section title="Flux & Liquidité">
        <Row name="ETF Netflow 30D Sum" value={sign(d.etfNetflow) + "%"} />
        <Row name="USDT Stablecoin SMA(30)" value={f4(d.usdtSma)} />
        <Row name="Net Taker Volume Binance" value={d.ntvSellCount} />
      </Section>

      <Section title="Dérivés & Structure de marché">
        <Row name="Futures Power 30D Change" value={f2(d.futuresPower)} />
        <Row name="Bull/Bear Cycle Indicator"
             value={`30j ${sign(d.bullBear30d,3)} | 365j ${sign(d.bullBear365d,3)}`} />
      </Section>

      <Section title="Profitabilité & Comportement des holders">
        <Row name="LTH/STH SOPR Ratio" value={f4(d.soprRatio)} />
        <Row name="aLTH/aSTH NUPL"
             value={`LTH ${f4(d.lthNupl)} | STH ${f4(d.sthNupl)}`} />
        <Row name="UTXO Block P/L Count Ratio" value={pct(d.utxoRatio)} />
      </Section>

      <Section title="Valorisation & Risque Long Terme">
        <Row name="MVRV Percentile — Cycle" value={f4(d.mvrvPct) + "%"} />
        <Row name="Mayer Multiple" value={f4(d.mayerMultiple)} />
        <Row name="Sharpe Ratio (court terme)" value={f4(d.sharpeShort)} />
      </Section>

    </div>
  );
}

// ─────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{
        fontSize:11,
        color:"#74c0fc",
        marginBottom:6,
        fontFamily:"monospace"
      }}>
        ── {title}
      </div>
      <div style={{
        background:"#0d1117",
        border:"1px solid #1a2030",
        borderRadius:8
      }}>
        {children}
      </div>
    </div>
  );
}

function Row({ name, value }) {
  return (
    <div style={{
      display:"flex",
      justifyContent:"space-between",
      padding:"8px 12px",
      borderBottom:"1px solid #111"
    }}>
      <div style={{fontSize:12}}>{name}</div>
      <div style={{
        fontFamily:"monospace",
        color:"#ffd166",
        fontWeight:700
      }}>
        {value}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Mount
// ─────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<BTCThermalAI />);
