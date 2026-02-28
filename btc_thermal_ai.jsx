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

  const [d, setD] = useState({});
  const [lastUpdate, setLastUpdate] = useState("");

  // ─── LOAD DASHBOARD ─────────────────────────
  useEffect(() => {

    const load = async () => {
      try {
        const res = await fetch("btc_dashboard.json?cache=" + Date.now());
        const data = await res.json();

        setD(data);
        setLastUpdate(data.updated || "");
      } catch (e) {
        console.error("Erreur dashboard:", e);
      }
    };

    load();
    const i = setInterval(load, 300000);
    return () => clearInterval(i);

  }, []);

  const price = d.btcPrice || 0;

  // ─── MODELE FUND (cycle) ─────────────────────
  let bottom = 0;
  let top = 0;

  if (d.mvrvPct < 0.3) bottom += 2;
  if (d.mayerMultiple < 0.9) bottom += 2;
  if (d.sharpeShort < -0.5) bottom += 1;
  if (d.soprRatio < 1) bottom += 1;
  if (d.sthNupl < 0.1) bottom += 1;
  if (d.etfNetflow < 0) bottom += 1;

  if (d.mvrvPct > 0.8) top += 2;
  if (d.mayerMultiple > 2) top += 2;
  if (d.soprRatio > 1.05) top += 1;
  if (d.lthNupl > 0.6) top += 1;
  if (d.futuresPower > 70) top += 1;
  if (d.etfNetflow > 0) top += 1;

  const bottomProb = Math.min(100, bottom * 15);
  const topProb = Math.min(100, top * 15);
  const marketScore = Math.max(0, Math.min(100, 50 + bottomProb - topProb));

  // Phase
  let phase = "Neutral";
  let phaseColor = MUTED;

  if (bottomProb > 60) { phase = "Accumulation"; phaseColor = GREEN; }
  else if (marketScore > 65) { phase = "Expansion"; phaseColor = GREEN; }
  else if (topProb > 60) { phase = "Distribution"; phaseColor = ORANGE; }
  else if (topProb > 80) { phase = "Cycle Top Risk"; phaseColor = RED; }

  // ─── UI helpers ─────────────────────────
  const card = {
    background: PANEL,
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  };

  const sectionTitle = {
    fontSize: 13,
    color: MUTED,
    marginBottom: 10,
    fontWeight: 600
  };

  const row = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
    fontFamily: "monospace"
  };

  const fmt = v => (v === undefined || v === null) ? "-" : Number(v).toFixed(3);

  return (
    <div style={{ padding: 24, color: TEXT, fontFamily: "Arial" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>
            BTC FUND+ DASHBOARD
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
        <div style={{ marginTop: 8, fontFamily: "monospace" }}>
          Market Score : {Math.round(marketScore)} | Bottom : {bottomProb}% | Top : {topProb}%
        </div>
      </div>

      {/* ── Flux & Liquidité */}
      <div style={card}>
        <div style={sectionTitle}>── Flux & Liquidité</div>
        <div style={row}><span>ETF Netflow 30D</span><span>{fmt(d.etfNetflow)}</span></div>
        <div style={row}><span>USDT Stablecoin SMA(30)</span><span>{fmt(d.usdtSma)}</span></div>
        <div style={row}><span>Net Taker Volume</span><span>{fmt(d.ntvSellCount)}</span></div>
      </div>

      {/* ── Dérivés */}
      <div style={card}>
        <div style={sectionTitle}>── Dérivés & Structure de marché</div>
        <div style={row}><span>Futures Power</span><span>{fmt(d.futuresPower)}</span></div>
        <div style={row}><span>Bull/Bear 30D</span><span>{fmt(d.bullBear30d)}</span></div>
        <div style={row}><span>Bull/Bear 365D</span><span>{fmt(d.bullBear365d)}</span></div>
      </div>

      {/* ── Holders */}
      <div style={card}>
        <div style={sectionTitle}>── Profitabilité & Comportement</div>
        <div style={row}><span>SOPR</span><span>{fmt(d.soprRatio)}</span></div>
        <div style={row}><span>STH NUPL</span><span>{fmt(d.sthNupl)}</span></div>
        <div style={row}><span>LTH NUPL</span><span>{fmt(d.lthNupl)}</span></div>
        <div style={row}><span>UTXO P/L Ratio</span><span>{fmt(d.utxoRatio)}</span></div>
        <div style={row}><span>Whales 1k–10k</span><span>{fmt(d.whales1k10k)}</span></div>
      </div>

      {/* ── Valorisation */}
      <div style={card}>
        <div style={sectionTitle}>── Valorisation & Risque Long Terme</div>
        <div style={row}><span>MVRV Percentile</span><span>{fmt(d.mvrvPct)}</span></div>
        <div style={row}><span>Mayer Multiple</span><span>{fmt(d.mayerMultiple)}</span></div>
        <div style={row}><span>Sharpe (court terme)</span><span>{fmt(d.sharpeShort)}</span></div>
        <div style={row}><span>Thermal Score</span><span>{fmt(d.thermalScore)}</span></div>
      </div>

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCFundDesk />);
