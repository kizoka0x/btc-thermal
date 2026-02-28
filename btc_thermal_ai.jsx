const { useState, useEffect } = React;

function BTCQuantDesk() {

  const PANEL = "#0f172a";
  const BORDER = "#1e293b";
  const TEXT = "#e5e7eb";
  const MUTED = "#94a3b8";
  const GREEN = "#22c55e";
  const ORANGE = "#f59e0b";
  const RED = "#ef4444";
  const YELLOW = "#facc15";

  const [d, setD] = useState({});
  const [lastUpdate, setLastUpdate] = useState("");

  // ===== LOAD DASHBOARD =====
  useEffect(() => {

    const load = async () => {
      try {
        const res = await fetch("btc_dashboard.json?cache=" + Date.now());
        const data = await res.json();

        setD(data);
        setLastUpdate(data.updated || "");

      } catch (e) {
        console.error("Dashboard load error:", e);
      }
    };

    load();
    const i = setInterval(load, 300000);
    return () => clearInterval(i);

  }, []);

  const price = d.btcPrice || 0;

  // ===== QUANT MODEL =====

  let bottomScore = 0;
  let topScore = 0;

  // Bottom logic (capitulation / early cycle)
  if (d.mvrvPct < 0.3) bottomScore += 2;
  if (d.mayerMultiple < 0.9) bottomScore += 2;
  if (d.sharpeShort < -0.5) bottomScore += 1;
  if (d.soprRatio < 1) bottomScore += 1;
  if (d.sthNupl < 0.1) bottomScore += 1;
  if (d.etfNetflow < 0) bottomScore += 1;

  // Top logic (euphoria / distribution)
  if (d.mvrvPct > 0.8) topScore += 2;
  if (d.mayerMultiple > 2.0) topScore += 2;
  if (d.soprRatio > 1.05) topScore += 1;
  if (d.lthNupl > 0.6) topScore += 1;
  if (d.futuresPower > 70) topScore += 1;
  if (d.etfNetflow > 0) topScore += 1;

  const bottomProb = Math.min(100, bottomScore * 15);
  const topProb = Math.min(100, topScore * 15);

  const marketScore = Math.max(0, Math.min(100, 50 + bottomProb - topProb));

  // ===== CYCLE PHASE =====

  let phase = "Neutral";
  let phaseColor = MUTED;
  let outlook = "No strong edge";

  if (bottomProb > 60) {
    phase = "Accumulation";
    phaseColor = GREEN;
    outlook = "Early cycle — smart money buying";
  }
  else if (marketScore > 65) {
    phase = "Expansion";
    phaseColor = GREEN;
    outlook = "Bull trend intact";
  }
  else if (topProb > 60) {
    phase = "Distribution";
    phaseColor = ORANGE;
    outlook = "Late cycle risk building";
  }
  else if (topProb > 80) {
    phase = "Cycle Top Risk";
    phaseColor = RED;
    outlook = "High probability macro top";
  }

  // ===== 4Y CYCLE POSITION (approx) =====
  // Halving April 2024 → cycle top expected 2025–2026
  const year = new Date().getFullYear();
  const cycleProgress = Math.min(100, Math.max(0, (year - 2024) * 40));

  // ===== PRICE ZONES (thermal based) =====
  const zones = [
    { label: "Deep Value", v: price * 0.6 },
    { label: "Institutional Accumulation", v: price * 0.8 },
    { label: "Fair Value", v: price },
    { label: "Distribution Zone", v: price * 1.5 },
    { label: "Blow-off Risk", v: price * 2 }
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
            BTC QUANT DESK — CYCLE ENGINE
          </div>
          <div style={{ fontSize: 12, color: GREEN }}>
            Update : {lastUpdate}
          </div>
        </div>

        <div style={{ fontSize: 34, fontWeight: 700, color: YELLOW }}>
          ${(price / 1000).toFixed(1)}K
        </div>
      </div>

      {/* PHASE */}
      <div style={{ ...card, borderLeft: `4px solid ${phaseColor}` }}>
        <div style={{ fontSize: 12, color: MUTED }}>Cycle Phase</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: phaseColor }}>
          {phase}
        </div>
        <div style={{ fontSize: 12, color: MUTED }}>
          {outlook}
        </div>
      </div>

      {/* SCORES */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Score label="Market Score" value={marketScore} />
        <Score label="Bottom Prob" value={bottomProb} />
        <Score label="Top Prob" value={topProb} />
      </div>

      {/* CYCLE POSITION */}
      <div style={card}>
        <div style={{ fontSize: 12, color: MUTED }}>4Y Cycle Progress</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          {cycleProgress}%
        </div>
      </div>

      {/* THERMAL SCORE */}
      <div style={card}>
        <div style={{ fontSize: 12, color: MUTED }}>Thermal Score (dashboard)</div>
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          {Number(d.thermalScore || 0).toFixed(2)}
        </div>
      </div>

      {/* ZONES */}
      <div style={card}>
        <div style={{ marginBottom: 10, color: MUTED }}>Cycle Price Zones</div>
        {zones.map((z, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span>{z.label}</span>
            <span style={{ fontFamily: "monospace" }}>
              ${(z.v / 1000).toFixed(1)}K
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}

function Score({ label, value }) {
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
        {Math.round(value)}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCQuantDesk />);
