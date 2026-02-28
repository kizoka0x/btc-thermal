const { useState, useEffect } = React;

const PANEL = "#0b1220";
const BORDER = "#1f2a3a";
const GREEN = "#2ecc71";
const RED = "#ff4d4f";
const ORANGE = "#f39c12";
const YELLOW = "#f1c40f";

function heatColor(v, min, max) {
  if (v === undefined || v === null) return "#555";
  const pct = (v - min) / (max - min);
  if (pct < 0.3) return GREEN;
  if (pct < 0.6) return YELLOW;
  if (pct < 0.8) return ORANGE;
  return RED;
}

function Card({ title, value, heat }) {
  return (
    <div style={{
      background: PANEL,
      border: `1px solid ${BORDER}`,
      borderRadius: 8,
      padding: 14,
      marginBottom: 10
    }}>
      <div style={{fontSize:12,opacity:.7}}>{title}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}>
        <div style={{fontSize:18,fontWeight:700}}>
          {value}
        </div>
        <div style={{
          width:80,
          height:8,
          borderRadius:4,
          background: heat
        }} />
      </div>
    </div>
  );
}

function BTCThermalAI() {
  const [vals, setVals] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [thermalScore, setThermalScore] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/btc_dashboard.json?t=" + Date.now());
        const data = await res.json();

        setVals(data);
        setLastUpdate(data.updated);

        // Score thermique simple (production stable)
        let score = 0;
        if (data.mvrvPct < 1) score += 1;
        if (data.mayerMultiple < 1) score += 1;
        if (data.etfNetflow < 0) score += 1;
        if (data.bullBear30d < 0) score += 1;
        if (data.futuresPower < 50) score += 1;
        if (data.soprRatio < 1) score += 1;

        setThermalScore(score);

      } catch (e) {
        console.log("Erreur chargement dashboard", e);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const sentiment =
    thermalScore >= 5 ? "BEARISH" :
    thermalScore <= 2 ? "BULLISH" :
    "NEUTRE";

  const sentimentColor =
    sentiment === "BEARISH" ? RED :
    sentiment === "BULLISH" ? GREEN :
    YELLOW;

  return (
    <div style={{maxWidth:1100,margin:"40px auto",padding:20}}>

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <div style={{fontSize:24,fontWeight:700}}>
            BTC ON-CHAIN — TABLEAU THERMIQUE
          </div>
          {lastUpdate && (
            <div style={{fontSize:12,color:"#6ee7b7"}}>
              Dernière mise à jour : {lastUpdate}
            </div>
          )}
        </div>

        <div style={{fontSize:32,fontWeight:700,color:"#ffe066"}}>
          ${vals.btcPrice ? (vals.btcPrice/1000).toFixed(1) : "--"}K
        </div>
      </div>

      {/* GLOBAL STATUS */}
      <div style={{
        background:PANEL,
        border:`1px solid ${BORDER}`,
        borderRadius:10,
        padding:16,
        marginBottom:20
      }}>
        <div style={{fontSize:12,opacity:.7}}>SIGNAL GLOBAL</div>
        <div style={{fontSize:28,fontWeight:700,color:sentimentColor}}>
          {sentiment}
        </div>
        <div style={{fontSize:12,marginTop:4}}>
          Score thermique : {thermalScore} / 6
        </div>
      </div>

      {/* INDICATEURS */}
      <Card
        title="MVRV Percentile"
        value={vals.mvrvPct?.toFixed(2)}
        heat={heatColor(vals.mvrvPct, 0, 2)}
      />

      <Card
        title="Mayer Multiple"
        value={vals.mayerMultiple?.toFixed(2)}
        heat={heatColor(vals.mayerMultiple, 0, 2)}
      />

      <Card
        title="ETF Netflow"
        value={vals.etfNetflow?.toFixed(2)}
        heat={heatColor(-vals.etfNetflow, -50, 50)}
      />

      <Card
        title="Futures Power"
        value={vals.futuresPower}
        heat={heatColor(vals.futuresPower, 0, 100)}
      />

      <Card
        title="SOPR"
        value={vals.soprRatio?.toFixed(2)}
        heat={heatColor(vals.soprRatio, 0.9, 1.1)}
      />

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<BTCThermalAI />);
