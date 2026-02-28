import React, { useState, useEffect } from "react";

export default function BTCThermalAI() {

  // ───────── CONFIG UI ─────────
  const BG = "#080c10";
  const PANEL = "#0d1117";
  const BORDER = "#1a2030";
  const MUTED = "#4a5568";

  // ───────── DATA STATE ─────────
  const [vals, setVals] = useState({
    btcPrice: 0,

    // Flux & Liquidité
    etfNetflow: 0,
    usdtSma: 0,
    ntv: 0,

    // Dérivés
    futuresPower: 0,
    bullBear: 0,

    // Holders
    sopr: 0,
    sthNupl: 0,
    lthNupl: 0,
    utxo: 0,
    whales: 0,

    // Valorisation
    mvrv: 0,
    mayer: 0,
    sharpe: 0
  });

  const [lastUpdate, setLastUpdate] = useState(null);

  // ───────── LOAD JSON ─────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("btc_dashboard.json?t=" + Date.now());
        const data = await res.json();

        setVals(v => ({
          ...v,
          btcPrice: data.price || 0,
          etfNetflow: data.etfNetflow || 0,
          usdtSma: data.usdtSma || 0,
          ntv: data.ntv || 0,
          futuresPower: data.futuresPower || 0,
          bullBear: data.bullBear || 0,
          sopr: data.sopr || 0,
          sthNupl: data.sthNupl || 0,
          lthNupl: data.lthNupl || 0,
          utxo: data.utxo || 0,
          whales: data.whales || 0,
          mvrv: data.mvrv || 0,
          mayer: data.mayer || 0,
          sharpe: data.sharpe || 0
        }));

        setLastUpdate(new Date().toLocaleString("fr-FR"));
      } catch (e) {
        console.error("Erreur chargement JSON", e);
      }
    };

    load();
  }, []);

  // ───────── THERMAL SCORE ─────────
  const score = [
    vals.etfNetflow > 0 ? 7 : 3,
    vals.usdtSma > 0 ? 7 : 3,
    vals.futuresPower > 50 ? 7 : 3,
    vals.bullBear > 0 ? 7 : 3,
    vals.sopr > 1 ? 6 : 3,
    vals.mvrv < 20 ? 8 : 4,
    vals.mayer < 1 ? 7 : 4,
    vals.sharpe < -10 ? 8 : 5,
    vals.whales > 0 ? 7 : 4
  ];

  const avgScore = (
    score.reduce((a, b) => a + b, 0) / score.length
  ).toFixed(1);

  const phase =
    avgScore <= 3
      ? "CAPITULATION"
      : avgScore <= 4.5
      ? "BEAR"
      : avgScore <= 6
      ? "NEUTRE"
      : avgScore <= 7.5
      ? "ACCUMULATION"
      : "BULL";

  const phaseColor =
    avgScore <= 3
      ? "#ff4d4d"
      : avgScore <= 4.5
      ? "#ff8c42"
      : avgScore <= 6
      ? "#ffd166"
      : avgScore <= 7.5
      ? "#69db7c"
      : "#2ecc71";

  // ───────── ROW COMPONENT ─────────
  const Row = ({ name, value }) => (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,.05)" }}>
      <td style={{ padding: "8px 10px", color: "#e6edf3" }}>{name}</td>
      <td style={{ padding: "8px 10px", fontFamily: "monospace", color: "#c9d1d9" }}>
        {value}
      </td>
    </tr>
  );

  const Section = ({ title }) => (
    <tr>
      <td colSpan="2" style={{
        padding: "6px 10px",
        color: "#58a6ff",
        fontSize: 11,
        fontFamily: "monospace",
        letterSpacing: 1.5,
        borderTop: `1px solid ${BORDER}`
      }}>
        {title}
      </td>
    </tr>
  );

  // ───────── UI ─────────
  return (
    <div style={{
      background: BG,
      color: "#c9d1d9",
      minHeight: "100vh",
      padding: 18,
      fontFamily: "Segoe UI"
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        borderBottom: `1px solid ${BORDER}`,
        paddingBottom: 12,
        marginBottom: 16
      }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700 }}>
            BTC THERMAL HEDGE+
          </div>
          {lastUpdate && (
            <div style={{ fontSize: 11, color: "#2ecc71" }}>
              Mise à jour : {lastUpdate}
            </div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "monospace",
            fontSize: 26,
            fontWeight: 700,
            color: "#ffe066"
          }}>
            ${(vals.btcPrice / 1000).toFixed(1)}K
          </div>
          <div style={{ color: phaseColor, fontSize: 12 }}>
            Phase : {phase}
          </div>
        </div>
      </div>

      {/* SCORE CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginBottom: 16
      }}>
        <div style={{ background: PANEL, border: `1px solid ${BORDER}`, padding: 12, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: MUTED }}>Score thermique</div>
          <div style={{ fontSize: 26, fontFamily: "monospace", color: phaseColor }}>
            {avgScore}
          </div>
        </div>

        <div style={{ background: PANEL, border: `1px solid ${BORDER}`, padding: 12, borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: MUTED }}>Régime marché</div>
          <div style={{ fontSize: 20, fontFamily: "monospace", color: phaseColor }}>
            {phase}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <tbody>

            <Section title="── Flux & Liquidité" />
            <Row name="ETF Netflow 30D" value={`${vals.etfNetflow} B$`} />
            <Row name="USDT SMA(30)" value={`${vals.usdtSma} B$`} />
            <Row name="Net Taker Volume" value={vals.ntv} />

            <Section title="── Dérivés & Structure" />
            <Row name="Futures Power" value={`${vals.futuresPower}%`} />
            <Row name="Bull/Bear Indicator" value={vals.bullBear} />

            <Section title="── Profitabilité & Holders" />
            <Row name="SOPR Ratio" value={vals.sopr} />
            <Row name="STH NUPL" value={vals.sthNupl} />
            <Row name="LTH NUPL" value={vals.lthNupl} />
            <Row name="UTXO P/L Ratio" value={vals.utxo} />
            <Row name="Whales 1k-10k (60D)" value={vals.whales} />

            <Section title="── Valorisation & Risque LT" />
            <Row name="MVRV Percentile" value={`${vals.mvrv}%`} />
            <Row name="Mayer Multiple" value={vals.mayer} />
            <Row name="Sharpe Ratio" value={vals.sharpe} />

          </tbody>
        </table>
      </div>

    </div>
  );
}
