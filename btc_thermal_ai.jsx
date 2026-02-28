const { useState, useEffect } = React;

// ─────────────────────────────────────────
// Sécurisation valeurs
// ─────────────────────────────────────────
const num = (v, d = 0) => {
  const n = Number(v);
  return isNaN(n) ? d : n;
};

const f2 = v => num(v).toFixed(2);
const f4 = v => num(v).toFixed(4);
const sign = (v, d = 2) => (v >= 0 ? "+" : "") + num(v).toFixed(d);

// ─────────────────────────────────────────
// Palette thermique (comme avant)
// ─────────────────────────────────────────
const THERM = [
  "#1a0a0a","#3d0f0f","#7a1a1a","#c0392b","#e74c3c",
  "#f39c12","#f1c40f","#2ecc71","#27ae60","#1a5c3a"
];

const levelColor = v => THERM[Math.max(0, Math.min(9, Math.round(v)))];

// Scoring simplifié mais stable
const score = v => {
  if (v <= -20) return 2;
  if (v <= -5) return 4;
  if (v <= 0) return 5;
  if (v <= 10) return 6;
  if (v <= 25) return 7;
  return 8;
};

// ─────────────────────────────────────────
// Cellule thermique
// ─────────────────────────────────────────
function TCell({ level }) {
  return (
    <td style={{ padding:6, textAlign:"center" }}>
      <div style={{
        width:70,
        height:36,
        borderRadius:6,
        background: levelColor(level),
        display:"flex",
        alignItems:"center",
        justifyContent:"center",
        fontSize:10,
        fontFamily:"monospace",
        color:"#fff"
      }}>
        {level}
      </div>
    </td>
  );
}

// ─────────────────────────────────────────
// Ligne tableau
// ─────────────────────────────────────────
function Row({ name, value, s }) {
  return (
    <tr style={{ borderBottom:"1px solid rgba(255,255,255,.05)" }}>
      <td style={{ padding:"8px 10px" }}>
        <div style={{ fontSize:12 }}>{name}</div>
        <div style={{ fontFamily:"monospace", fontSize:10, color:"#4a5568" }}>
          {value}
        </div>
      </td>
      <TCell level={s} />
      <TCell level={s} />
      <TCell level={s} />
      <TCell level={s} />
    </tr>
  );
}

// ─────────────────────────────────────────
// APP
// ─────────────────────────────────────────
function BTCThermalAI() {

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = async () => {
    try {
      const res = await fetch("btc_dashboard.json?t=" + Date.now());
      const raw = await res.json();

      setData({
        updated: raw.updated || "",
        btcPrice: num(raw.btcPrice),
        etfNetflow: num(raw.etfNetflow),
        usdtSma: num(raw.usdtSma),
        ntvSellCount: num(raw.ntvSellCount),
        futuresPower: num(raw.futuresPower),
        bullBear30d: num(raw.bullBear30d),
        bullBear365d: num(raw.bullBear365d),
        soprRatio: num(raw.soprRatio),
        lthNupl: num(raw.lthNupl),
        sthNupl: num(raw.sthNupl),
        utxoRatio: num(raw.utxoRatio),
        mvrvPct: num(raw.mvrvPct),
        mayerMultiple: num(raw.mayerMultiple),
        sharpeShort: num(raw.sharpeShort),
        whales1k10k: num(raw.whales1k10k),
        thermalScore: num(raw.thermalScore)
      });

      setStatus("ok");

    } catch {
      setStatus("error");
    }
  };

  useEffect(() => { load(); }, []);

  if (status === "loading") {
    return (
      <div style={{
        background:"#080c10",
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
        background:"#080c10",
        color:"#ff6b6b",
        height:"100vh",
        display:"flex",
        alignItems:"center",
        justifyContent:"center"
      }}>
        Erreur chargement JSON
      </div>
    );
  }

  const d = data;

  // Score global moyen
  const avg =
    (
      score(d.etfNetflow) +
      score(d.futuresPower - 50) +
      score(d.mvrvPct) +
      score(d.mayerMultiple * 10)
    ) / 4;

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
        marginBottom:16,
        borderBottom:"1px solid #1a2030",
        paddingBottom:10
      }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700 }}>
            BTC DASHBOARD — TABLEAU THERMIQUE
          </div>
          <div style={{ fontSize:11, color:"#4a5568" }}>
            Updated : {d.updated}
          </div>
        </div>

        <div style={{ textAlign:"right" }}>
          <div style={{
            fontSize:28,
            fontWeight:700,
            fontFamily:"monospace",
            color:"#ffd166"
          }}>
            ${(d.btcPrice/1000).toFixed(2)}K
          </div>
          <div style={{ fontSize:11 }}>
            Score pipeline : {f2(d.thermalScore)} / 100
          </div>
        </div>
      </div>

      {/* SCORE GLOBAL */}
      <div style={{
        marginBottom:14,
        background:"#0d1117",
        border:"1px solid #1a2030",
        borderRadius:8,
        padding:10
      }}>
        Score Thermique Moyen :{" "}
        <span style={{
          fontFamily:"monospace",
          color: levelColor(avg)
        }}>
          {f2(avg)} / 9
        </span>
      </div>

      {/* TABLEAU */}
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ borderBottom:"2px solid #1a2030" }}>
            <th style={{ textAlign:"left", padding:8 }}>Indicateur</th>
            <th>Now</th>
            <th>CT</th>
            <th>MT</th>
            <th>LT</th>
          </tr>
        </thead>
        <tbody>

          {/* Flux */}
          <Row name="ETF Netflow 30D"
               value={sign(d.etfNetflow) + "%"}
               s={score(d.etfNetflow)} />

          <Row name="USDT SMA"
               value={f4(d.usdtSma)}
               s={score(d.usdtSma * 1000)} />

          <Row name="Net Taker Volume"
               value={d.ntvSellCount}
               s={score(-d.ntvSellCount * 5)} />

          {/* Derivés */}
          <Row name="Futures Power"
               value={f2(d.futuresPower)}
               s={score(d.futuresPower - 50)} />

          <Row name="Bull/Bear 30d"
               value={sign(d.bullBear30d,3)}
               s={score(d.bullBear30d * 100)} />

          {/* Holders */}
          <Row name="SOPR"
               value={f4(d.soprRatio)}
               s={score((1 - d.soprRatio) * 100)} />

          <Row name="LTH / STH NUPL"
               value={`${f4(d.lthNupl)} / ${f4(d.sthNupl)}`}
               s={score(d.lthNupl * 100)} />

          <Row name="UTXO Ratio"
               value={(d.utxoRatio*100).toFixed(2)+"%"}
               s={score(-d.utxoRatio * 100)} />

          {/* Valorisation */}
          <Row name="MVRV Percentile"
               value={f4(d.mvrvPct)+"%"}
               s={score(d.mvrvPct)} />

          <Row name="Mayer Multiple"
               value={f4(d.mayerMultiple)}
               s={score((1 - d.mayerMultiple) * 50)} />

          <Row name="Sharpe Ratio"
               value={f4(d.sharpeShort)}
               s={score(-d.sharpeShort * 50)} />

        </tbody>
      </table>

    </div>
  );
}

// Mount
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<BTCThermalAI />);
