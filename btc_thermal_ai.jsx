const { useState, useEffect } = React;

const BORDER = "#30363d";
const PANEL = "#161b22";
const MUTED = "#8b949e";

function BTCthermalAI() {
  const [showHistory, setShowHistory] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const [vals, setVals] = useState({
    btcPrice: 65000,
    mvrvPct: 50,
    mayerMultiple: 1.2
  });

  // Simulation chargement dashboard.json
  useEffect(() => {
    fetch("btc_dashboard.json")
      .then(r => r.json())
      .then(data => {
        setVals(v => ({ ...v, ...data }));
        if (data.updated) setLastUpdate(data.updated);
      })
      .catch(() => {
        console.log("Pas de fichier dashboard — mode démo");
      });
  }, []);

  // Couleur thermique
  const getColor = (v) => {
    if (v > 80) return "#ff4d4d";
    if (v > 60) return "#ff9f43";
    if (v > 40) return "#ffe066";
    if (v > 20) return "#2ecc71";
    return "#3498db";
  };

  // Données tableau
  const rows = [
    {
      sec: "VALUATION",
      name: "MVRV Percentile",
      val: vals.mvrvPct,
      score: vals.mvrvPct
    },
    {
      name: "Mayer Multiple",
      val: vals.mayerMultiple,
      score: vals.mayerMultiple * 50
    }
  ];

  return (
    <div style={{padding:20,maxWidth:1100,margin:"auto"}}>

      {/* HEADER */}
      <div style={{
        display:"flex",
        justifyContent:"space-between",
        marginBottom:20,
        borderBottom:`1px solid ${BORDER}`,
        paddingBottom:10
      }}>
        <div>
          <div style={{fontSize:20,fontWeight:700}}>
            BTC ON-CHAIN — TABLEAU THERMIQUE
          </div>

          {lastUpdate &&
            <div style={{fontSize:11,color:"#2ecc71"}}>
              Dernière mise à jour : {lastUpdate}
            </div>
          }
        </div>

        <div style={{textAlign:"right"}}>
          <div style={{
            fontFamily:"monospace",
            fontSize:26,
            color:"#ffe066"
          }}>
            ${(vals.btcPrice/1000).toFixed(1)}K
          </div>

          <button
            onClick={() => setShowHistory(h => !h)}
            style={{
              marginTop:6,
              background:PANEL,
              color:"#c9d1d9",
              border:`1px solid ${BORDER}`,
              borderRadius:6,
              padding:"5px 12px",
              fontSize:10,
              cursor:"pointer"
            }}
          >
            📜 HISTORIQUE
          </button>
        </div>
      </div>

      {/* TABLE */}
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead>
          <tr style={{borderBottom:`1px solid ${BORDER}`}}>
            <th align="left">Indicateur</th>
            <th>Valeur</th>
            <th>Heat</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <React.Fragment key={i}>
              {row.sec &&
                <tr>
                  <td colSpan="3" style={{
                    paddingTop:12,
                    color:MUTED,
                    fontSize:11
                  }}>
                    {row.sec}
                  </td>
                </tr>
              }

              <tr style={{borderBottom:`1px solid rgba(255,255,255,.05)`}}>
                <td style={{padding:"8px 0"}}>{row.name}</td>

                <td>{row.val}</td>

                <td>
                  <div style={{
                    width:80,
                    height:10,
                    background:getColor(row.score),
                    borderRadius:4
                  }}/>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {/* HISTORY */}
      {showHistory &&
        <div style={{
          marginTop:20,
          padding:10,
          background:PANEL,
          border:`1px solid ${BORDER}`,
          borderRadius:6
        }}>
          Historique activé (placeholder)
        </div>
      }

    </div>
  );
}

// Render
ReactDOM.createRoot(document.getElementById("root"))
  .render(<BTCthermalAI />);
