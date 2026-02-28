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

  // ===== LOAD JSON =====
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("btc_dashboard.json");
        const data = await res.json();

        setVals({
          btcPrice: data.price || 0,
          mayer: data.mayer || 0,
          mvrv: data.mvrv || 0,
          sopr: data.sopr || 0,
          sharpe: data.sharpe || 0,
          whales: data.whales || 0
        });

        setLastUpdate(new Date().toLocaleString());

      } catch (err) {
        console.error("Erreur dashboard:", err);
      }
    };

    loadData();
  }, []);

  // ===== THERMAL SCORE =====
  let score = 0;

  if (vals.mvrv < 10) score++;
  if (vals.mayer < 0.8) score++;
  if (vals.sopr < 1) score++;
  if (vals.sharpe < -20) score++;
  if (vals.whales > 0) score++;

  const scorePct = (score / 5) * 100;

  // ===== MARKET REGIME =====
  let regime = "NEUTRE";
  let regimeColor = YELLOW;

  if (score >= 4) {
    regime = "ZONE BOTTOM";
    regimeColor = GREEN;
  } else if (score <= 1) {
    regime = "DISTRIBUTION";
    regimeColor = RED;
  } else if (score === 2) {
    regime = "BEAR MARKET";
    regimeColor = ORANGE;
  }

  // ===== PRICE ZONES =====
  const price = vals.btcPrice;

  const zones = [
    { label: "$65–68K", text: "Distribution active", color: RED },
    { label: "$58–63K", text: "CT probable", color: ORANGE },
    { label: "$50–58K", text: "Bottom le plus probable", color: YELLOW },
    { label: "$42–50K", text: "Capitulation extrême", color: "#a855f7" }
  ];

  const cardStyle = {
    background: PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: 180
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
            BTC ON-CHAIN — DESK THERMIQUE
          </div>
          {lastUpdate && (
            <div style={{ fontSize: 12, color: GREEN }}>
              Dernière mise à jour : {lastUpdate}
            </div>
          )}
        </div>

        <div style={{
          fontSize: 32,
          fontWeight: 700,
          color: YELLOW
        }}>
          ${(price / 1000).toFixed(1)}K
        </div>
      </div>

      {/* SCORE + REGIME */}
      <div style={{
        background: PANEL,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20
      }}>
        <div style={{ marginBottom: 8 }}>
          Score thermique : {score}/5
        </div>

        <div style={{
          height: 8,
          background: BORDER,
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 10
        }}>
          <div style={{
            width: scorePct + "%",
            background: regimeColor,
            height: "100%"
          }} />
        </div>

        <div style={{ color: regimeColor, fontWeight: 600 }}>
          {regime}
        </div>
      </div>

      {/* PRICE ZONES */}
      <div style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 20
      }}>
        {zones.map((z, i) => (
          <div key={i} style={cardStyle}>
            <div style={{ fontWeight: 700 }}>{z.label}</div>
            <div style={{ fontSize: 12, color: MUTED }}>{z.text}</div>
          </div>
        ))}
      </div>

      {/* CONDITIONS BOTTOM */}
      <div style={{
        background: PANEL,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: 16
      }}>
        <div style={{ marginBottom: 10 }}>
          Conditions bottom
        </div>

        <Condition ok={vals.mvrv < 10} text="MVRV < 10%" />
        <Condition ok={vals.mayer < 0.8} text="Mayer < 0.8" />
        <Condition ok={vals.sopr < 1} text="SOPR < 1" />
        <Condition ok={vals.sharpe < -20} text="Sharpe < -20" />
        <Condition ok={vals.whales > 0} text="Accumulation whales" />
      </div>

    </div>
  );
}

// ===== CONDITION COMPONENT =====
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
