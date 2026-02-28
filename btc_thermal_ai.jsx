import React, { useState } from "react";

const BORDER = "rgba(255,255,255,.08)";
const PANEL = "#0d1117";
const MUTED = "#8b949e";

/* =========================
   COULEURS THERMIQUES
========================= */
const LEVEL = {
  0: { bg: "#161b22", color: "#8b949e" }, // neutre
  1: { bg: "#3a1f1f", color: "#ff6b6b" }, // bear
  2: { bg: "#5c2e00", color: "#ffa657" }, // pression
  3: { bg: "#7a6b00", color: "#f2cc60" }, // watch
  4: { bg: "#0f3d2e", color: "#3fb950" }  // accum
};

const TC = ({ level = 0, label }) => {
  const l = LEVEL[level] || LEVEL[0];
  return (
    <td style={{ padding: 4, textAlign: "center" }}>
      <div
        style={{
          background: l.bg,
          color: l.color,
          fontSize: 10,
          fontWeight: 600,
          padding: "6px 4px",
          borderRadius: 6,
          border: `1px solid ${BORDER}`,
          fontFamily: "monospace",
          letterSpacing: 0.5
        }}
      >
        {label || ""}
      </div>
    </td>
  );
};

const Badge = ({ level = 0 }) => {
  const l = LEVEL[level] || LEVEL[0];
  return (
    <div
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 20,
        background: l.bg,
        color: l.color,
        fontSize: 10,
        fontWeight: 600,
        border: `1px solid ${BORDER}`,
        fontFamily: "monospace"
      }}
    >
      {level >= 4
        ? "ACCUM"
        : level === 3
        ? "WATCH"
        : level === 2
        ? "PRESSION"
        : level === 1
        ? "BEAR"
        : "NEUTRE"}
    </div>
  );
};

const SectionRow = ({ label }) => (
  <tr>
    <td
      colSpan={7}
      style={{
        padding: "10px 12px",
        fontSize: 10,
        color: "#58a6ff",
        letterSpacing: 2,
        fontFamily: "monospace",
        borderTop: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        background: "linear-gradient(90deg, rgba(88,166,255,.08), transparent)"
      }}
    >
      — {label.toUpperCase()}
    </td>
  </tr>
);

/* =========================
   COMPOSANT PRINCIPAL
========================= */
export default function BTCThermiqueProd() {
  const [vals] = useState({
    btcPrice: 64200,
    mayer: 0.71,
    mvrv: 8,
    sopr: 0.99,
    sharpe: -34,
    whales: 91000
  });

  const rows = [
    {
      sec: "Profitabilité & Holders",
      name: "LTH/STH SOPR",
      val: vals.sopr.toFixed(2),
      sub: "Sous 1 = stress",
      sc: { n: vals.sopr < 1 ? 1 : 3, c: 1, m: 2, l: 3 },
      nowL: "STRESS",
      hz: "MT"
    },
    {
      name: "aLTH/aSTH NUPL",
      val: "STH sous eau",
      sub: "",
      sc: { n: 1, c: 1, m: 2, l: 4 },
      nowL: "SOUS EAU",
      hz: "CT/MT"
    },
    {
      name: "UTXO P/L Ratio",
      val: "11.1",
      sub: "loin du flag",
      sc: { n: 2, c: 2, m: 3, l: 4 },
      nowL: "NEUTRE",
      hz: "MT/LT"
    },

    {
      sec: "Valorisation long terme",
      name: "MVRV Percentile",
      val: vals.mvrv + "%",
      sub: "zone basse",
      sc: { n: vals.mvrv < 10 ? 4 : 2, c: 1, m: 2, l: 4 },
      nowL: "PLANCHER",
      hz: "LT"
    },
    {
      name: "Mayer Multiple",
      val: vals.mayer.toFixed(2),
      sub: "oversold",
      sc: { n: vals.mayer < 0.8 ? 4 : 2, c: 1, m: 2, l: 4 },
      nowL: "OVERSOLD",
      hz: "LT"
    },
    {
      name: "Sharpe Ratio",
      val: vals.sharpe,
      sub: "low risk",
      sc: { n: vals.sharpe < -20 ? 4 : 2, c: 1, m: 2, l: 4 },
      nowL: "LOW RISK",
      hz: "LT"
    },

    {
      sec: "Smart Money",
      name: "Whales 1k-10k",
      val: "+" + (vals.whales / 1000).toFixed(1) + "k BTC",
      sub: "accumulation",
      sc: { n: vals.whales > 0 ? 4 : 1, c: 2, m: 3, l: 4 },
      nowL: "ACCUM",
      hz: "LT"
    }
  ];

  return (
    <div
      style={{
        background: "#010409",
        padding: 20,
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        fontFamily: "system-ui"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          borderBottom: `1px solid ${BORDER}`,
          paddingBottom: 10
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff"
            }}
          >
            BTC ON-CHAIN — THERMAL MODEL
          </div>
          <div style={{ fontSize: 11, color: MUTED }}>
            Pipeline automatique CryptoQuant / AI
          </div>
        </div>

        <div
          style={{
            fontFamily: "monospace",
            fontSize: 24,
            fontWeight: 700,
            color: "#f2cc60"
          }}
        >
          ${(vals.btcPrice / 1000).toFixed(1)}K
        </div>
      </div>

      {/* TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ fontSize: 10, color: MUTED }}>
            <th style={{ textAlign: "left", padding: 6 }}>Metric</th>
            <th>Now</th>
            <th>CT</th>
            <th>MT</th>
            <th>LT</th>
            <th>Bias</th>
            <th>Horizon</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <React.Fragment key={i}>
              {row.sec && <SectionRow label={row.sec} />}

              <tr style={{ borderBottom: `1px solid rgba(255,255,255,.04)` }}>
                <td style={{ padding: "8px 10px" }}>
                  <div style={{ fontSize: 12, color: "#e6edf3" }}>
                    {row.name}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      fontFamily: "monospace",
                      color: MUTED
                    }}
                  >
                    {row.val}
                  </div>
                  <div style={{ fontSize: 9, color: "#2d3748" }}>
                    {row.sub}
                  </div>
                </td>

                <TC level={row.sc.n} label={row.nowL} />
                <TC level={row.sc.c} />
                <TC level={row.sc.m} />
                <TC level={row.sc.l} />

                <td style={{ textAlign: "center" }}>
                  <Badge level={row.sc.n} />
                </td>

                <td
                  style={{
                    textAlign: "center",
                    fontSize: 10,
                    color: MUTED
                  }}
                >
                  {row.hz}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
