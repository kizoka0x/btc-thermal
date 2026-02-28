const { useState, useEffect } = React;

function BTCFundDesk() {

  const PANEL = "#0f172a";
  const BORDER = "#1e293b";
  const TEXT = "#e5e7eb";
  const MUTED = "#94a3b8";
  const GREEN = "#22c55e";
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const YELLOW = "#facc15";

  const [vals, setVals] = useState({
    btcPrice: 0,
    mvrv: 0,
    mayer: 0,
    sopr: 0,
    sharpe: 0,
    whales: 0
  });

  const [lastUpdate, setLastUpdate] = useState("");

  // ===== DATA LOAD =====
  useEffect(() => {

    const load = async () => {
      try {
        const res = await fetch("btc_dashboard.json?cache=" + Date.now());
        const d = await res.json();

        setVals({
          btcPrice: d.btcPrice || d.price || 0,
          mvrv: d.mvrvPct || d.mvrv || 0,
          mayer: d.mayerMultiple || d.mayer || 0,
          sopr: d.soprRatio || d.sopr || 0,
          sharpe: d.sharpeShort || d.sharpe || 0,
          whales: d.whales1k10k || d.whales || 0
        });

        setLastUpdate(d.updated || new Date().toLocaleString());

      } catch (e) {
        console.error("Dashboard error:", e);
      }
    };

    load();
    const i = setInterval(load, 300000);
    return () => clearInterval(i);

  }, []);

  // ===== FUND MODEL =====

  let score = 0;

  // Bottom signals
  if (vals.mvrv < 15) score += 2;
  if (vals.mayer < 0.8) score += 2;
  if (vals.sharpe < -20) score += 2;
  if (vals.sopr < 1) score += 1;
  if (vals.whales > 0) score += 1;

  // Top risk
  let topRisk = 0;
  if (vals.mvrv > 80) topRisk += 2;
  if (vals.mayer > 2) topRisk += 2;
  if (vals.sopr > 1.05) topRisk += 1;

  const bottomProb = Math.min(100, score * 10);
  const topProb = Math.min(100, topRisk * 15);

  // ===== CYCLE PHASE =====
  let phase = "Distribution";
  let phaseColor = RED;

  if (bottomProb > 70) {
    phase = "Capitulation / Accumulation";
    phaseColor = GREEN;
  }
  else if (bottomProb > 40) {
    phase = "Accumulation Range";
    phaseColor = ORANGE;
  }
  else if (topProb > 60) {
    phase = "Late Bull / Distribution";
    phaseColor = RED;
  }
  else if (vals.mvrv > 40) {
    phase = "Early Bull";
    phaseColor = YELLOW;
  }

  // ===== PRICE ZONES MODEL =====
  const price = vals.btcPrice;

  const zones = [
    { label: "Capitulation Zone", value: price * 0.6 },
    { label: "Probable Bottom", value: price * 0.75 },
    { label: "Fair Value", value: price },
    { label: "Cycle Top Risk", value: price * 1.8 }
  ];

  const card = {
    background: PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  };

  return (
    <div style={{ padding: 24, color: TEXT, fontFamily: "Arial" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            BTC FUND DESK — CYCLE MODEL
          </div>
          <div style={{ fontSize: 12, color: GREEN }}>
            Update : {lastUpdate}
          </div>
        </div>

        <div style={{ fontSize: 34, fontWeight: 700, color: YELLOW }}>
          ${(price / 1000).toFixed(1)}K
        </div>
      </div>

      {/* CYCLE PHASE */}
      <div style={{ ...card, borderLeft: `4px solid ${phaseColor}` }}>
        <div style={{ fontSize: 12, color: MUTED }}>Cycle Phase</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: phaseColor }}>
          {phase}
        </div>
      </div>

      {/* PROBABILITIES */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Prob label="Bottom Probability" value={bottomProb} />
        <Prob label="Top Risk" value={topProb} />
      </div>

      {/* PRICE ZONES */}
      <div style={card}>
        <div style={{ marginBottom: 10, color: MUTED }}>Cycle Price Model</div>
        {zones.map((z, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>{z.label}</span>
            <span style={{ fontFamily: "monospace" }}>
              ${(z.value / 1000).toFixed(1)}K
            </span>
          </div>
        ))}
      </div>

      {/* METRICS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12 }}>
        <Metric label="MVRV %" value={vals.mvrv} />
        <Metric label="Mayer" value={vals.mayer} />
        <Metric label="SOPR" value={vals.sopr} />
        <Metric label="Sharpe" value={vals.sharpe} />
        <Metric label="Whales" value={vals.whales} />
      </div>

    </div>
  );
}

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
        {Number(value).toFixed(2)}
      </div>
    </div>
  );
}

function Prob({ label, value }) {
  const color = value > 70 ? "#22c55e" : value > 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={{
      background: "#020617",
      border: "1px solid #1e293b",
      borderRadius: 10,
      padding: 12
    }}>
      <div style={{ fontSize: 11, color: "#94a3b8" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>
        {value}%
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCFundDesk />);
