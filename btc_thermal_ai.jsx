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

  // ===== LOAD DASHBOARD (auto refresh) =====
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
        console.error("Erreur chargement dashboard:", err);
      }
    };

    loadData();
    const interval = setInterval(loadData, 300000); // 5 min

    return () => clearInterval(interval);

  }, []);

  // ===== THERMAL SCORE (0–10) =====
  let score = 0;

  if (vals.mvrv < 10) score += 2;
  if (vals.mayer < 0.8) score += 2;
  if (vals.sopr < 1) score += 2;
  if (vals.sharpe < -20) score += 2;
  if (vals.whales > 0) score += 2;

  if (score > 10) score = 10;

  const scorePct = score * 10;

  // ===== MARKET REGIME =====
  let regime = "NEUTRE";
  let regimeColor = YELLOW;

  if (score >= 8) {
    regime = "CAPITULATION / BOTTOM ZONE";
    regimeColor = GREEN;
  } else if (score >= 5) {
    regime = "BEAR MARKET";
    regimeColor = ORANGE;
  } else if (score <= 3) {
    regime = "DISTRIBUTION";
    regimeColor = RED;
  }

  // ===== COMPONENT STYLE =====
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
            BTC ON-CHAIN — PRO DESK
          </div>
          {lastUpdate && (
            <div style={{ fontSize: 12, color: "#22c55e" }}>
              Update : {lastUpdate}
            </div>
          )}
        </div>

        <div style={{
          fontSize: 34,
          fontWeight: 700,
          color: YELLOW
        }}>
          ${(vals.btcPrice / 1000).toFixed(1)}K
        </div>
      </div>

      {/* THERMAL SCORE */}
      <div style={card}>
        <div style={{ marginBottom: 6 }}>
          Thermal Score : {score} / 10
        </div>

        <div style={{
          height: 10,
          background: BORDER,
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: 10
        }}>
          <div style={{
            width: scorePct + "%",
            height: "100%",
            background: regimeColor
          }} />
        </div>

        <div style={{ color: regimeColor, fontWeight: 600 }}>
          {regime}
        </div>
      </div>

      {/* METRICS GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
        gap: 12
      }}>

        <Metric label="MVRV %" value={vals.mvrv} />
        <Metric label="Mayer" value={vals.mayer} />
        <Metric label="SOPR" value={vals.sopr} />
        <Metric label="Sharpe CT" value={vals.sharpe} />
        <Metric label="Whales 1k-10k" value={vals.whales} />

      </div>

      {/* CONDITIONS */}
      <div style={{ ...card, marginTop: 16 }}>
        <div style={{ marginBottom: 8 }}>Bottom Conditions</div>

        <Condition ok={vals.mvrv < 10} text="MVRV < 10%" />
        <Condition ok={vals.mayer < 0.8} text="Mayer < 0.8" />
        <Condition ok={vals.sopr < 1} text="SOPR < 1" />
        <Condition ok={vals.sharpe < -20} text="Sharpe < -20" />
        <Condition ok={vals.whales > 0} text="Whales accumulating" />
      </div>

    </div>
  );
}

// ===== SMALL COMPONENTS =====
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

function Condition({ ok, text }) {
  return (
    <div style={{
      color: ok ? "#22c55e" : "#ef4444",
      fontSize: 14,
      marginBottom: 6
    }}>
      {ok ? "✓" : "✕"} {text}
    </div>
  );
}

// ===== RENDER =====
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCThermalAI />);
