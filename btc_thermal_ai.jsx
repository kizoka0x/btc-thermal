const { useState, useEffect } = React;

function BTCThermalAI() {

  const PANEL = "#111827";
  const BORDER = "#1f2937";
  const TEXT = "#e5e7eb";
  const MUTED = "#9ca3af";
  const ACCENT = "#facc15";
  const GREEN = "#22c55e";
  const RED = "#ef4444";
  const ORANGE = "#f59e0b";

  const [vals, setVals] = useState({
    btcPrice: 0,
    mayer: 0,
    mvrv: 0,
    sopr: 0,
    sharpe: 0,
    whales: 0
  });

  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(false);

  // ===== LOAD DASHBOARD JSON =====
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("btc_dashboard.json");

        if (!res.ok) throw new Error("JSON introuvable");

        const data = await res.json();

        setVals({
          btcPrice: data.price || 0,
          mayer: data.mayer || 0,
          mvrv: data.mvrv || 0,
          sopr: data.sopr || 0,
          sharpe: data.sharpe || 0,
          whales: data.whales || 0
        });

        setLastUpdate(new Date().toISOString());
        setError(false);

      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        setError(true);
      }
    };

    loadData();
  }, []);

  // ===== HELPERS =====
  const heatColor = (value, min, max) => {
    const pct = (value - min) / (max - min);
    if (pct < 0.33) return GREEN;
    if (pct < 0.66) return ORANGE;
    return RED;
  };

  const boxStyle = {
    background: PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: 10,
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
        alignItems: "flex-start",
        marginBottom: 20,
        borderBottom: `1px solid ${BORDER}`,
        paddingBottom: 12
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            BTC ON-CHAIN — TABLEAU THERMIQUE AI
          </div>

          {lastUpdate && (
            <div style={{ fontSize: 12, color: GREEN }}>
              Dernière mise à jour : {lastUpdate}
            </div>
          )}

          {error && (
            <div style={{ fontSize: 12, color: RED }}>
              Erreur chargement btc_dashboard.json
            </div>
          )}
        </div>

        <div style={{
          fontSize: 28,
          fontWeight: 700,
          color: ACCENT
        }}>
          ${(vals.btcPrice / 1000).toFixed(1)}K
        </div>
      </div>

      {/* INDICATORS */}
      <div style={boxStyle}>
        <div style={{ fontSize: 14, color: MUTED, marginBottom: 10 }}>
          VALUATION
        </div>

        {/* MVRV */}
        <div style={{ marginBottom: 12 }}>
          <div>MVRV Percentile</div>
          <div style={{
            height: 8,
            background: heatColor(vals.mvrv, 0, 20),
            borderRadius: 4,
            marginTop: 4,
            width: `${Math.min(vals.mvrv * 5, 100)}%`
          }} />
          <div style={{ fontSize: 12, color: MUTED }}>{vals.mvrv}</div>
        </div>

        {/* MAYER */}
        <div>
          <div>Mayer Multiple</div>
          <div style={{
            height: 8,
            background: heatColor(vals.mayer, 0.5, 2),
            borderRadius: 4,
            marginTop: 4,
            width: `${Math.min(vals.mayer * 40, 100)}%`
          }} />
          <div style={{ fontSize: 12, color: MUTED }}>{vals.mayer}</div>
        </div>
      </div>

      {/* MARKET STATE */}
      <div style={boxStyle}>
        <div style={{ fontSize: 14, color: MUTED, marginBottom: 10 }}>
          MARKET METRICS
        </div>

        <div>SOPR : {vals.sopr}</div>
        <div>Sharpe : {vals.sharpe}</div>
        <div>Whales (1k-10k) : {vals.whales}</div>
      </div>

    </div>
  );
}

// ===== RENDER =====
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCThermalAI />);
