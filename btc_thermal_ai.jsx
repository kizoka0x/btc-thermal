const { useState, useEffect } = React;

function BTCThermalAI() {

  // ===== STYLE =====
  const PANEL = "#0f172a";
  const BORDER = "#1e293b";
  const TEXT = "#e5e7eb";
  const MUTED = "#94a3b8";
  const GREEN = "#22c55e";
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const YELLOW = "#facc15";

  // ===== STATE =====
  const [vals, setVals] = useState({
    btcPrice: 0,
    mayer: 0,
    mvrv: 0,
    sopr: 0,
    sharpe: 0,
    whales: 0
  });

  const [lastUpdate, setLastUpdate] = useState(null);

  // ===== LOAD DASHBOARD =====
  useEffect(() => {

    const loadData = async () => {
      try {
        const res = await fetch("btc_dashboard.json?cache=" + Date.now());
        const data = await res.json();

        setVals({
          btcPrice: data.btcPrice || data.price || 0,
          mayer: data.mayerMultiple || data.mayer || 0,
          mvrv: data.mvrvPct || data.mvrv || 0,
          sopr: data.soprRatio || data.sopr || 0,
          sharpe: data.sharpeShort || data.sharpe || 0,
          whales: data.whales1k10k || data.whales || 0
        });

        setLastUpdate(data.updated || new Date().toLocaleString());

      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);

  }, []);

  // ===== SCORES =====

  // CT (structure marché)
  let scoreCT = 0;
  if (vals.sopr < 1) scoreCT += 1;
  if (vals.whales > 0) scoreCT += 1;

  // MT (stress marché)
  let scoreMT = 0;
  if (vals.mayer < 0.9) scoreMT += 1;
  if (vals.sharpe < -10) scoreMT += 1;

  // LT (zones d'accumulation)
  let scoreLT = 0;
  if (vals.mvrv < 20) scoreLT += 2;
  if (vals.mayer < 0.8) scoreLT += 2;
  if (vals.sharpe < -20) scoreLT += 2;

  const totalScore = scoreCT + scoreMT + scoreLT;

  // ===== BOTTOM PROBABILITY =====
  const bottomProb = Math.min(100, totalScore * 10);

  // ===== MARKET REGIME =====
  let regime = "Distribution";
  let regimeColor = RED;

  if (bottomProb > 70) {
    regime = "Bottom Zone / Accumulation";
    regimeColor = GREEN;
  } else if (bottomProb > 40) {
    regime = "Bear Market";
    regimeColor = ORANGE;
  }

  // ===== ALERT SYSTEM =====
  let alert = null;

  if (bottomProb > 80) {
    alert = { text: "⚡ STRONG BUY ZONE", color: GREEN };
  } else if (bottomProb > 60) {
    alert = { text: "Accumulation Phase", color: YELLOW };
  } else if (bottomProb < 20) {
    alert = { text: "Risk of Distribution", color: RED };
  }

  const card = {
    background: PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  };

  // ===== UI =====
  return (
    <div style={{ padding: 24, color: TEXT, fontFamily: "Arial" }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: 20
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            BTC ON-CHAIN — ELITE DESK
          </div>
          {lastUpdate && (
            <div style={{ fontSize: 12, color: "#22c55e" }}>
              Update : {lastUpdate}
            </div>
          )}
        </div>

        <div style={{ fontSize: 34, fontWeight: 700, color: YELLOW }}>
          ${(vals.btcPrice / 1000).toFixed(1)}K
        </div>
      </div>

      {/* ALERT */}
      {alert && (
        <div style={{
          ...card,
          borderLeft: `4px solid ${alert.color}`,
          color: alert.color,
          fontWeight: 600
        }}>
          {alert.text}
        </div>
      )}

      {/* BOTTOM PROBABILITY */}
      <div style={card}>
        <div style={{ marginBottom: 6 }}>
          Bottom Probability : {bottomProb}%
        </div>

        <div style={{
          height: 10,
          background: BORDER,
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: 10
        }}>
          <div style={{
            width: bottomProb + "%",
            height: "100%",
            background: regimeColor
          }} />
        </div>

        <div style={{ color: regimeColor, fontWeight: 600 }}>
          {regime}
        </div>
      </div>

      {/* SCORES */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 12,
        marginBottom: 16
      }}>
        <Score label="Short Term" value={scoreCT} max={2} />
        <Score label="Mid Term" value={scoreMT} max={2} />
        <Score label="Long Term" value={scoreLT} max={6} />
      </div>

      {/* METRICS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 12
      }}>
        <Metric label="MVRV %" value={vals.mvrv} />
        <Metric label="Mayer" value={vals.mayer} />
        <Metric label="SOPR" value={vals.sopr} />
        <Metric label="Sharpe" value={vals.sharpe} />
        <Metric label="Whales" value={vals.whales} />
      </div>

    </div>
  );
}

// ===== COMPONENTS =====
function Metric({ label, value }) {
  return (
    <div style={{
      background: "#020617",
      border: "1px solid #1e293b",
      borderRadius: 10,
      padding: 12
    }}>
      <div style={{ fontSize: 11, color: "#94a3b8" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>
        {typeof value === "number" ? value.toFixed(2) : value}
      </div>
    </div>
  );
}

function Score({ label, value, max }) {
  const pct = (value / max) * 100;
  return (
    <div style={{
      background: "#020617",
      border: "1px solid #1e293b",
      borderRadius: 10,
      padding: 12
    }}>
      <div style={{ fontSize: 11, color: "#94a3b8" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 600 }}>{value} / {max}</div>
      <div style={{
        height: 6,
        background: "#1e293b",
        marginTop: 6,
        borderRadius: 4,
        overflow: "hidden"
      }}>
        <div style={{
          width: pct + "%",
          height: "100%",
          background: "#22c55e"
        }} />
      </div>
    </div>
  );
}

// ===== RENDER =====
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCThermalAI />);
