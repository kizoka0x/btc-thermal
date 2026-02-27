import { useState, useCallback, useRef, useEffect } from "react";

// ─── THERMAL SCORE CALCULATORS ────────────────────────────────────────────
const calcETF    = v => v<=-25?{n:0,c:1,m:2,l:5}:v<=-15?{n:1,c:1,m:2,l:5}:v<=-8?{n:2,c:2,m:3,l:6}:v<=-2?{n:3,c:3,m:4,l:6}:v<=0?{n:4,c:4,m:5,l:7}:v<=5?{n:6,c:6,m:6,l:7}:v<=15?{n:7,c:7,m:7,l:8}:{n:9,c:8,m:8,l:8};
const calcUSDT   = v => v<=-2?{n:0,c:1,m:2,l:6}:v<=-1.2?{n:1,c:2,m:3,l:6}:v<=-0.5?{n:2,c:2,m:3,l:6}:v<=0?{n:3,c:4,m:5,l:7}:v<=0.5?{n:6,c:6,m:6,l:7}:{n:8,c:7,m:7,l:8};
const calcNTV    = s => s>=2?{n:2,c:2,m:4,l:6}:s===1?{n:3,c:3,m:5,l:6}:s===0?{n:5,c:5,m:5,l:6}:s===-1?{n:7,c:7,m:6,l:7}:{n:8,c:8,m:7,l:7};
const calcFut    = v => v<=30?{n:1,c:1,m:2,l:5}:v<=35?{n:1,c:2,m:3,l:5}:v<=40?{n:2,c:2,m:3,l:6}:v<=45?{n:2,c:2,m:3,l:6}:v<=50?{n:3,c:4,m:5,l:6}:v<=55?{n:6,c:6,m:6,l:7}:v<=65?{n:7,c:7,m:7,l:8}:{n:9,c:8,m:8,l:8};
const calcBB     = v => v<=-1.5?{n:0,c:1,m:2,l:5}:v<=-1?{n:1,c:2,m:2,l:5}:v<=-0.5?{n:2,c:2,m:3,l:5}:v<=0?{n:3,c:3,m:4,l:5}:v<=0.3?{n:6,c:6,m:6,l:7}:v<=0.8?{n:7,c:7,m:7,l:8}:{n:9,c:8,m:8,l:8};
const calcSOPR   = v => v<=0.4?{n:0,c:1,m:3,l:9}:v<=0.55?{n:1,c:2,m:3,l:9}:v<=0.7?{n:2,c:2,m:3,l:8}:v<=0.9?{n:2,c:3,m:4,l:7}:v<=1?{n:3,c:3,m:4,l:6}:v<=1.5?{n:6,c:6,m:6,l:6}:v<=3?{n:7,c:7,m:7,l:7}:{n:9,c:8,m:7,l:5};
const calcNUPL   = v => v<=-0.5?{n:1,c:2,m:3,l:7}:v<=-0.25?{n:2,c:3,m:4,l:7}:v<=0?{n:3,c:3,m:4,l:7}:v<=0.15?{n:5,c:5,m:5,l:6}:v<=0.3?{n:6,c:6,m:6,l:6}:v<=0.5?{n:7,c:7,m:7,l:6}:{n:9,c:8,m:7,l:4};
const calcUTXO   = v => v<=3?{n:9,c:8,m:7,l:7}:v<=5?{n:8,c:7,m:7,l:7}:v<=8?{n:7,c:7,m:7,l:7}:v<=15?{n:5,c:4,m:5,l:7}:v<=30?{n:4,c:3,m:4,l:6}:v<=100?{n:3,c:3,m:4,l:6}:{n:2,c:2,m:3,l:5};
const calcMVRV   = v => v<=2?{n:0,c:3,m:5,l:9}:v<=10?{n:1,c:3,m:5,l:9}:v<=20?{n:3,c:4,m:5,l:8}:v<=40?{n:5,c:5,m:5,l:7}:v<=70?{n:5,c:5,m:5,l:6}:v<=90?{n:3,c:3,m:4,l:4}:{n:1,c:2,m:3,l:3};
const calcMayer  = v => v<=0.55?{n:1,c:3,m:5,l:9}:v<=0.7?{n:1,c:3,m:5,l:8}:v<=0.8?{n:2,c:3,m:5,l:8}:v<=1?{n:5,c:5,m:5,l:6}:v<=1.5?{n:5,c:5,m:5,l:5}:v<=2.4?{n:3,c:3,m:3,l:4}:{n:1,c:2,m:2,l:3};
const calcSharpe = v => v<=-30?{n:0,c:3,m:5,l:9}:v<=-15?{n:1,c:3,m:5,l:8}:v<=-5?{n:2,c:4,m:5,l:7}:v<=0?{n:4,c:5,m:5,l:6}:v<=10?{n:6,c:6,m:6,l:6}:v<=30?{n:5,c:5,m:5,l:5}:{n:3,c:3,m:4,l:4};
const calcWhale  = v => v>=80000?{n:5,c:4,m:6,l:8}:v>=40000?{n:5,c:5,m:6,l:8}:v>=10000?{n:5,c:5,m:6,l:7}:v>=0?{n:5,c:5,m:5,l:6}:v>=-20000?{n:4,c:4,m:4,l:5}:{n:3,c:3,m:4,l:4};

const THERM = [
  { bg:"#1a0a0a", fg:"#ff4444", bd:"#3d0f0f" },
  { bg:"#2d0d0d", fg:"#ff6b6b", bd:"#5c1a1a" },
  { bg:"#4a1010", fg:"#ff8c8c", bd:"#7a1a1a" },
  { bg:"#7a1a1a", fg:"#ffb3b3", bd:"#a02020" },
  { bg:"#c0392b", fg:"#fff",    bd:"#e74c3c" },
  { bg:"#7d4e00", fg:"#ffd166", bd:"#a56800" },
  { bg:"#6b6000", fg:"#ffe566", bd:"#8c7d00" },
  { bg:"#1a4a25", fg:"#69db7c", bd:"#27ae60" },
  { bg:"#0f3320", fg:"#51cf66", bd:"#2ecc71" },
  { bg:"#0a2018", fg:"#40c057", bd:"#27ae60" },
];
const LEVEL_LABELS = ["CAPIT.","BEAR EXT.","BEAR FORT","BEAR","PRESSION","NEUTRE","WATCH","POTENTIEL","ACCUM. LT","ACHAT LT"];
const SIGNAL_CFG = [
  { bg:"rgba(192,57,43,.25)",  fg:"#ff6b6b", bd:"rgba(192,57,43,.4)",  lbl:"Bear Extrême" },
  { bg:"rgba(192,57,43,.25)",  fg:"#ff6b6b", bd:"rgba(192,57,43,.4)",  lbl:"Bear Extrême" },
  { bg:"rgba(231,76,60,.15)",  fg:"#ffa8a8", bd:"rgba(231,76,60,.3)",  lbl:"Bearish" },
  { bg:"rgba(231,76,60,.15)",  fg:"#ffa8a8", bd:"rgba(231,76,60,.3)",  lbl:"Bearish" },
  { bg:"rgba(243,156,18,.15)", fg:"#ffd166", bd:"rgba(243,156,18,.3)", lbl:"Pression" },
  { bg:"rgba(243,156,18,.15)", fg:"#ffe066", bd:"rgba(241,196,15,.3)", lbl:"Neutre" },
  { bg:"rgba(241,196,15,.15)", fg:"#ffe066", bd:"rgba(241,196,15,.3)", lbl:"Watch" },
  { bg:"rgba(46,204,113,.15)", fg:"#69db7c", bd:"rgba(46,204,113,.3)", lbl:"Bullish LT" },
  { bg:"rgba(39,174,96,.25)",  fg:"#51cf66", bd:"rgba(39,174,96,.4)",  lbl:"Bullish LT" },
  { bg:"rgba(26,92,58,.4)",    fg:"#40c057", bd:"rgba(39,174,96,.5)",  lbl:"Bull Extrême" },
];

// ─── DEFAULT DATA ─────────────────────────────────────────────────────────
const DEFAULT = {
  date: "26 fév 2026", btcPrice: 68000,
  etfNetflow: -32.3, usdtSma: -1.428, ntvSellCount: 2,
  futuresPower: 45, bullBear30d: -0.873, bullBear365d: -0.193,
  soprRatio: 0.99, sthNupl: -0.333, lthNupl: 0.108, utxoRatio: 11.14,
  mvrvPct: 0, mayerMultiple: 0.671, sharpeShort: -34.27, whales1k10k: 90986,
};

// ─── AI EXTRACTION PROMPT ────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es un expert en analyse on-chain Bitcoin. On te soumet des captures d'écran de CryptoQuant.
Extrais UNIQUEMENT les valeurs numériques demandées depuis les graphiques et tooltips visibles.
Réponds EXCLUSIVEMENT en JSON pur, sans markdown, sans commentaire, sans balises.
Si une valeur n'est pas visible dans les images fournies, utilise null.

Format JSON strict :
{
  "btcPrice": nombre_ou_null,
  "date": "DD MMM YYYY" ou null,
  "etfNetflow": nombre_en_milliards_ou_null,
  "usdtSma": nombre_en_milliards_ou_null,
  "ntvSellCount": entier_de_-2_a_2_ou_null,
  "futuresPower": nombre_pourcentage_ou_null,
  "bullBear30d": nombre_ou_null,
  "bullBear365d": nombre_ou_null,
  "soprRatio": nombre_ou_null,
  "sthNupl": nombre_ou_null,
  "lthNupl": nombre_ou_null,
  "utxoRatio": nombre_ou_null,
  "mvrvPct": nombre_0_a_100_ou_null,
  "mayerMultiple": nombre_ou_null,
  "sharpeShort": nombre_ou_null,
  "whales1k10k": nombre_BTC_ou_null
}

Règles d'extraction :
- etfNetflow : Total Netflow 30D Sum en milliards (ex: -32.3 pour -32.3B$)
- usdtSma : SMA(30) du 60-day change en milliards
- ntvSellCount : 2=double sell actif, 1=sell seul, 0=neutre, -1=buy seul, -2=double buy
- futuresPower : Market Power % (ex: 45 pour 45%)
- mvrvPct : MVRV Percentile Current Cycle en % (0 à 100)
- mayerMultiple : valeur décimale (ex: 0.671)
- sharpeShort : Sharpe Ratio court terme (peut être très négatif comme -34.27)
- whales1k10k : BTC net 60D de la cohorte 1k-10k (peut être positif ou négatif)`;

// ─── COMPONENTS ──────────────────────────────────────────────────────────
function TC({ level, label }) {
  const t = THERM[Math.max(0,Math.min(9,Math.round(level)))];
  return (
    <td style={{padding:"5px 6px",textAlign:"center"}}>
      <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        width:78,height:44,borderRadius:6,background:t.bg,color:t.fg,border:`1px solid ${t.bd}`,
        fontFamily:"'Space Mono',monospace",fontSize:8.5,fontWeight:700,lineHeight:1.25,letterSpacing:.4,
        whiteSpace:"pre-line",textAlign:"center"}}>
        {(label||LEVEL_LABELS[Math.max(0,Math.min(9,Math.round(level)))]).split("\n").map((l,i)=><span key={i}>{l}</span>)}
      </div>
    </td>
  );
}

function Badge({ level }) {
  const s = SIGNAL_CFG[Math.max(0,Math.min(9,Math.round(level)))];
  return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:20,fontSize:9,fontWeight:700,
    textTransform:"uppercase",letterSpacing:.8,background:s.bg,color:s.fg,border:`1px solid ${s.bd}`}}>{s.lbl}</span>;
}

function SectionRow({ label }) {
  return (
    <tr>
      <td colSpan={7} style={{background:"rgba(88,166,255,.04)",borderTop:"1px solid rgba(88,166,255,.1)",
        borderBottom:"1px solid rgba(88,166,255,.1)",padding:"4px 12px"}}>
        <span style={{fontFamily:"monospace",fontSize:9,color:"rgba(88,166,255,.7)",textTransform:"uppercase",letterSpacing:2}}>{label}</span>
      </td>
    </tr>
  );
}

// ─── DROP ZONE ───────────────────────────────────────────────────────────
function DropZone({ onFiles, loading }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();

  const handle = useCallback(files => {
    const imgs = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (imgs.length) onFiles(imgs);
  }, [onFiles]);

  return (
    <div
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
      style={{
        border:`2px dashed ${drag ? "#58a6ff" : loading ? "#f39c12" : "#1a2030"}`,
        borderRadius:12, padding:"28px 20px", textAlign:"center", cursor:"pointer",
        background: drag ? "rgba(88,166,255,.06)" : loading ? "rgba(243,156,18,.04)" : "rgba(255,255,255,.015)",
        transition:"all .2s"
      }}>
      <input ref={ref} type="file" accept="image/*" multiple style={{display:"none"}}
        onChange={e => handle(e.target.files)} />
      <div style={{fontSize:28,marginBottom:8}}>{loading ? "⏳" : drag ? "📂" : "📸"}</div>
      <div style={{fontSize:13,fontWeight:600,color:loading?"#ffa94d":drag?"#58a6ff":"#c9d1d9",marginBottom:4}}>
        {loading ? "Analyse IA en cours…" : drag ? "Déposer ici" : "Glisser / Cliquer pour ajouter des screenshots"}
      </div>
      <div style={{fontSize:11,color:"#4a5568"}}>
        {loading ? "Claude lit vos graphiques CryptoQuant" : "PNG, JPG acceptés · Plusieurs captures à la fois · Mise à jour automatique"}
      </div>
    </div>
  );
}

// ─── EXTRACTION STATUS ────────────────────────────────────────────────────
function ExtractionLog({ log }) {
  if (!log.length) return null;
  return (
    <div style={{marginTop:12,background:"#0d1117",border:"1px solid #1a2030",borderRadius:8,padding:12,maxHeight:140,overflowY:"auto"}}>
      <div style={{fontFamily:"monospace",fontSize:9,color:"rgba(88,166,255,.6)",letterSpacing:2,marginBottom:8}}>── LOG D'EXTRACTION IA</div>
      {log.map((l,i) => (
        <div key={i} style={{fontSize:11,color:l.ok?"#69db7c":l.warn?"#ffd166":"#ff6b6b",marginBottom:3,fontFamily:"monospace"}}>
          {l.ok?"✓":l.warn?"⚠":"✗"} {l.msg}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────
export default function BTCThermalAI() {
  const [vals, setVals]       = useState(DEFAULT);
  const [loading, setLoading] = useState(false);
  const [log, setLog]         = useState([]);
  const [previews, setPreviews] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [manualMode, setManualMode] = useState(false);
  const [draft, setDraft]     = useState({});

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("btc-ai-vals");
        if (r) { const d = JSON.parse(r.value); setVals(d.vals); setLastUpdate(d.date); }
        const h = await window.storage.get("btc-ai-history");
        if (h) setHistory(JSON.parse(h.value));
      } catch {}
    })();
  }, []);

  const saveToStorage = async (newVals) => {
    const now = new Date().toLocaleString("fr-FR");
    try {
      await window.storage.set("btc-ai-vals", JSON.stringify({ vals: newVals, date: now }));
      const newEntry = { date: now, btcPrice: newVals.btcPrice, etfNetflow: newVals.etfNetflow };
      const newHistory = [newEntry, ...history].slice(0, 30);
      await window.storage.set("btc-ai-history", JSON.stringify(newHistory));
      setHistory(newHistory);
      setLastUpdate(now);
    } catch {}
  };

  // ── AI EXTRACTION ───────────────────────────────────────────────────────
  const extractFromScreenshots = useCallback(async (files) => {
    setLoading(true);
    setLog([]);
    const newLog = [];

    // Convert files to base64
    const images = await Promise.all(files.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = e => res({ base64: e.target.result.split(",")[1], type: f.type, name: f.name });
      r.readAsDataURL(f);
    })));

    // Previews
    setPreviews(images.map(i => `data:${i.type};base64,${i.base64}`));
    newLog.push({ ok: true, msg: `${images.length} screenshot(s) chargé(s) → envoi à Claude…` });
    setLog([...newLog]);

    // Build message content
    const content = [
      ...images.map(img => ({
        type: "image",
        source: { type: "base64", media_type: img.type, data: img.base64 }
      })),
      {
        type: "text",
        text: `Analyse ces ${images.length} capture(s) CryptoQuant et extrais toutes les valeurs disponibles en JSON strict selon les instructions du système.`
      }
    ];

    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content }]
        })
      });

      const data = await resp.json();
      const raw = data.content?.map(b => b.text || "").join("").trim();

      // Parse JSON
      let parsed;
      try {
        const clean = raw.replace(/```json|```/g, "").trim();
        parsed = JSON.parse(clean);
      } catch {
        newLog.push({ ok: false, msg: "Erreur de parsing JSON — vérifier la réponse IA" });
        setLog([...newLog]);
        setLoading(false);
        return;
      }

      // Apply extracted values (only non-null)
      const updated = { ...vals };
      let count = 0;
      const fieldLabels = {
        btcPrice: "Prix BTC", date: "Date", etfNetflow: "ETF Netflow 30D",
        usdtSma: "USDT SMA(30)", ntvSellCount: "Net Taker Volume",
        futuresPower: "Futures Power %", bullBear30d: "Bull/Bear 30d MA",
        bullBear365d: "Bull/Bear 365d MA", soprRatio: "SOPR Ratio",
        sthNupl: "STH NUPL", lthNupl: "LTH NUPL", utxoRatio: "UTXO Ratio",
        mvrvPct: "MVRV Percentile", mayerMultiple: "Mayer Multiple",
        sharpeShort: "Sharpe CT", whales1k10k: "Baleines 1k-10k"
      };

      for (const [k, v] of Object.entries(parsed)) {
        if (v !== null && v !== undefined && k in updated) {
          const old = updated[k];
          updated[k] = v;
          count++;
          const change = typeof old === "number" && typeof v === "number"
            ? ` (${old > v ? "▼" : old < v ? "▲" : "="} ${typeof v === "number" ? v.toLocaleString("fr-FR") : v})`
            : ` → ${v}`;
          newLog.push({ ok: true, msg: `${fieldLabels[k] || k}${change}` });
        }
      }

      // Warn about missing fields
      const missing = Object.entries(parsed).filter(([,v]) => v === null).map(([k]) => fieldLabels[k] || k);
      if (missing.length) newLog.push({ warn: true, msg: `Non détecté : ${missing.join(", ")}` });

      newLog.push({ ok: true, msg: `✓ ${count} valeur(s) extraite(s) et appliquées` });
      setLog([...newLog]);
      setVals(updated);
      await saveToStorage(updated);

    } catch (e) {
      newLog.push({ ok: false, msg: `Erreur API : ${e.message}` });
      setLog([...newLog]);
    }

    setLoading(false);
  }, [vals, history]);

  // ── COMPUTE SCORES ───────────────────────────────────────────────────────
  const s = {
    etf:   calcETF(vals.etfNetflow),
    usdt:  calcUSDT(vals.usdtSma),
    ntv:   calcNTV(vals.ntvSellCount),
    fut:   calcFut(vals.futuresPower),
    bb:    calcBB(vals.bullBear30d),
    sopr:  calcSOPR(vals.soprRatio),
    nupl:  calcNUPL(vals.sthNupl),
    utxo:  calcUTXO(vals.utxoRatio),
    mvrv:  calcMVRV(vals.mvrvPct),
    mayer: calcMayer(vals.mayerMultiple),
    shrp:  calcSharpe(vals.sharpeShort),
    whl:   calcWhale(vals.whales1k10k),
  };

  const allN = Object.values(s).map(x=>x.n);
  const avgScore = (allN.reduce((a,b)=>a+b,0)/allN.length).toFixed(1);
  const bearCount = allN.filter(v=>v<=4).length;
  const bullCount = allN.filter(v=>v>=7).length;

  const checks = [
    { ok: vals.etfNetflow >= 0,      label: "ETF 30D Netflow ≥ 0" },
    { ok: vals.futuresPower > 50,    label: "Futures Power > 50%" },
    { ok: vals.usdtSma > 0,          label: "USDT SMA(30) positif" },
    { ok: vals.soprRatio <= 0.5,     label: "SOPR Alert = 1 (≤ 0.5)" },
    { ok: vals.utxoRatio <= 3,       label: "UTXO Flag = 1 (ratio ≤ 3)" },
    { ok: vals.bullBear30d > 0,      label: "Bull/Bear 30d MA > 0" },
    { ok: vals.mvrvPct <= 10,        label: "MVRV Percentile ≤ 10%" },
    { ok: vals.mayerMultiple < 0.8,  label: "Mayer Multiple < 0.8" },
    { ok: vals.sharpeShort < -20,    label: "Sharpe Low Risk (< −20)" },
    { ok: vals.whales1k10k > 20000,  label: "Baleines 1k-10k accumulent" },
  ];
  const checkScore = checks.filter(c=>c.ok).length;

  // ── ROWS CONFIG ──────────────────────────────────────────────────────────
  const rows = [
    { sec:"── Flux & Liquidité", name:"ETF Netflow 30D Sum",
      val:`${vals.etfNetflow>=0?"+":""}${vals.etfNetflow}B$`, sub: vals.etfNetflow<=-20?"Record négatif ETF spot":vals.etfNetflow<0?"Flux sortants actifs":"Flux entrants",
      sc:s.etf, nowL: vals.etfNetflow<=-20?"FUITE\nMASSIVE":vals.etfNetflow<0?"SORTIE\nACTIVE":"POSITIF", hz:"CT/MT" },
    { sec:null, name:"USDT Stablecoin SMA(30)",
      val:`${vals.usdtSma>=0?"+":""}${vals.usdtSma}B$`, sub:vals.usdtSma<0?"Pas de carburant rebond":"Liquidités disponibles",
      sc:s.usdt, nowL:vals.usdtSma<-1?"PAS DE\nCARBURANT":vals.usdtSma<0?"CONTRACTION":"POSITIF", hz:"CT/MT" },
    { sec:null, name:"Net Taker Vol. Binance",
      val:["Double Buy","Buy Signal","Neutre","Sell Signal","Double Sell"][vals.ntvSellCount+2]||"?",
      sub: vals.ntvSellCount>=2?"Vendeurs absorbent les rebonds":vals.ntvSellCount<=-2?"Acheteurs agressifs":"",
      sc:s.ntv, nowL:vals.ntvSellCount>=2?"VENTES\nACTIVES":vals.ntvSellCount<=-2?"ACHATS\nACTIFS":"NEUTRE", hz:"CT" },
    { sec:"── Dérivés & Structure", name:"Futures Power 30D Change",
      val:`${vals.futuresPower}% Market Power`, sub:vals.futuresPower<50?"Bears contrôlent les dérivés":"Bulls dominent",
      sc:s.fut, nowL:vals.futuresPower<45?"BEARS\nDOMINENT":vals.futuresPower<50?"SOUS 50%\nBEAR":"BULL\n>50%", hz:"CT/MT" },
    { sec:null, name:"Bull/Bear Cycle Indicator",
      val:`365d ${vals.bullBear365d} · 30d ${vals.bullBear30d}`, sub:vals.bullBear30d<0?"30d MA négative — bear structurel":"30d MA positive",
      sc:s.bb, nowL:vals.bullBear30d<-0.8?"BEAR\nSTRUCT.":vals.bullBear30d<0?"BEAR\nACTIF":"BULL\nACTIF", hz:"CT/MT" },
    { sec:"── Profitabilité & Holders", name:"LTH/STH SOPR Ratio",
      val:`${vals.soprRatio} (Alert ${vals.soprRatio<=0.5?"= 1 🚨":"= 0"})`, sub:vals.soprRatio<1?"Sous 1 — LTH en stress":"Au-dessus de 1",
      sc:s.sopr, nowL:vals.soprRatio<=0.5?"ALERT!\nACHAT LT":vals.soprRatio<1?"LTH\nSTRESS":"LTH\nPOSITIF", hz:"MT" },
    { sec:null, name:"aLTH/aSTH NUPL",
      val:`LTH ${vals.lthNupl>=0?"+":""}${vals.lthNupl} · STH ${vals.sthNupl}`, sub:vals.sthNupl<0?"STH collectivement sous l'eau":"STH en profit",
      sc:s.nupl, nowL:vals.sthNupl<-0.3?"STH\nSOUS EAU":vals.sthNupl<0?"ANXIETY":"NEUTRE+", hz:"CT/MT" },
    { sec:null, name:"UTXO Block P/L Count Ratio",
      val:`${vals.utxoRatio} (Flag ${vals.utxoRatio<=3?"= 1 🚨":"= 0"})`, sub:`Seuil d'achat : ~3 · SMA365: 711`,
      sc:s.utxo, nowL:vals.utxoRatio<=3?"FLAG!\nACHAT LT":vals.utxoRatio<=10?"CORRECT.\nACTIVE":"CORRECT.\nORDONNÉE", hz:"MT/LT" },
    { sec:"── Valorisation Long Terme", name:"MVRV Percentile — Cycle",
      val:`${vals.mvrvPct}% cycle (${vals.mvrvPct<=10?"Low Signal ON":"Normal"})`, sub:vals.mvrvPct<=10?"Zone d'accumulation LT historique":"Zone normale du cycle",
      sc:s.mvrv, nowL:vals.mvrvPct<=2?"0%\nPLANCHER":vals.mvrvPct<=10?"ACCUM.\nLT":"ZONE\nNEUTRE", hz:"LT" },
    { sec:null, name:"Mayer Multiple",
      val:`${vals.mayerMultiple} (${vals.mayerMultiple<0.8?"Oversold — Alert ON":"Normal"})`, sub:`SMA-200D: ~$98.3K`,
      sc:s.mayer, nowL:vals.mayerMultiple<=0.7?"OVERSOLD\nEXTRÊME":vals.mayerMultiple<=0.8?"OVERSOLD\nLT":"NORMAL", hz:"LT" },
    { sec:null, name:"Sharpe Ratio (court terme)",
      val:`${vals.sharpeShort} (${vals.sharpeShort<-20?"Low Risk Zone":"Normal"})`, sub:`4ème occurrence < −20 depuis 2012`,
      sc:s.shrp, nowL:vals.sharpeShort<=-30?`${vals.sharpeShort.toFixed(0)}\nLOW RISK`:vals.sharpeShort<=-15?"NÉGATIF\nFORT":"NÉGATIF", hz:"LT" },
    { sec:"── Smart Money & Baleines", name:"Accumulation Cohortes 1k-10k (60D)",
      val:`${vals.whales1k10k>=0?"+":""}${(vals.whales1k10k/1000).toFixed(1)}K BTC net`,
      sub:vals.whales1k10k>50000?"Smart money accumule massivement":vals.whales1k10k>0?"Accumulation modérée":"Distribution",
      sc:s.whl, nowL:vals.whales1k10k>50000?"SMART\nMONEY ▲":vals.whales1k10k>0?"ACCUM.\nMOD.":"DISTRIBUT.", hz:"LT" },
  ];

  const BG = "#080c10", PANEL = "#0d1117", BORDER = "#1a2030", MUTED = "#4a5568";

  return (
    <div style={{background:BG,color:"#c9d1d9",fontFamily:"'DM Sans','Segoe UI',sans-serif",minHeight:"100vh",padding:18,
      backgroundImage:"radial-gradient(ellipse at 20% 20%,rgba(88,166,255,.04) 0%,transparent 60%),radial-gradient(ellipse at 80% 80%,rgba(255,107,107,.03) 0%,transparent 60%)"}}>

      {/* HEADER */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16,paddingBottom:14,borderBottom:`1px solid ${BORDER}`}}>
        <div>
          <div style={{fontFamily:"monospace",fontSize:18,fontWeight:700,color:"#fff",letterSpacing:-.5}}>⬡ BTC ON-CHAIN — TABLEAU THERMIQUE AI</div>
          <div style={{fontSize:11,color:MUTED,marginTop:2}}>Mise à jour automatique par analyse de screenshots · CryptoQuant</div>
          {lastUpdate && <div style={{fontSize:10,color:"#2ecc71",marginTop:2}}>✓ Dernière mise à jour : {lastUpdate}</div>}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
          <div style={{fontFamily:"monospace",fontSize:24,fontWeight:700,color:"#ffe066"}}>${(vals.btcPrice/1000).toFixed(1)}K</div>
          <div style={{display:"flex",gap:6}}>
            <button onClick={()=>setManualMode(m=>!m)} style={{
              background:manualMode?"rgba(88,166,255,.15)":PANEL,color:manualMode?"#74c0fc":"#c9d1d9",
              border:`1px solid ${manualMode?"#58a6ff":BORDER}`,borderRadius:6,padding:"5px 12px",
              fontSize:10,cursor:"pointer",fontFamily:"monospace",letterSpacing:.8}}>
              ✏ {manualMode?"FERMER":"MANUEL"}
            </button>
            <button onClick={()=>setShowHistory(h=>!h)} style={{
              background:PANEL,color:"#c9d1d9",border:`1px solid ${BORDER}`,borderRadius:6,
              padding:"5px 12px",fontSize:10,cursor:"pointer",fontFamily:"monospace",letterSpacing:.8}}>
              📜 HISTORIQUE
            </button>
          </div>
        </div>
      </div>

      {/* HISTORY PANEL */}
      {showHistory && history.length > 0 && (
        <div style={{marginBottom:16,background:PANEL,border:`1px solid ${BORDER}`,borderRadius:10,padding:14}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"rgba(88,166,255,.7)",letterSpacing:2,marginBottom:10}}>── HISTORIQUE DES SESSIONS</div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr>{["Date","Prix BTC","ETF 30D"].map(h=><th key={h} style={{textAlign:"left",padding:"4px 10px",color:MUTED,fontSize:9,fontFamily:"monospace",letterSpacing:1}}>{h}</th>)}</tr></thead>
              <tbody>{history.map((h,i)=>(
                <tr key={i} style={{borderTop:`1px solid rgba(255,255,255,.04)`}}>
                  <td style={{padding:"4px 10px",color:"#c9d1d9",fontFamily:"monospace",fontSize:10}}>{h.date}</td>
                  <td style={{padding:"4px 10px",color:"#ffe066",fontFamily:"monospace",fontSize:10}}>${(h.btcPrice/1000).toFixed(1)}K</td>
                  <td style={{padding:"4px 10px",color:h.etfNetflow<0?"#ff6b6b":"#69db7c",fontFamily:"monospace",fontSize:10}}>{h.etfNetflow>=0?"+":""}{h.etfNetflow}B$</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI UPLOAD ZONE */}
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:"monospace",fontSize:9,color:"rgba(88,166,255,.7)",textTransform:"uppercase",letterSpacing:2,marginBottom:8}}>── 📸 MISE À JOUR AUTOMATIQUE PAR SCREENSHOTS</div>
        <DropZone onFiles={extractFromScreenshots} loading={loading} />
        <ExtractionLog log={log} />
        {previews.length>0 && (
          <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
            {previews.map((p,i)=>(
              <div key={i} style={{position:"relative"}}>
                <img src={p} alt="" style={{height:60,borderRadius:6,border:`1px solid ${BORDER}`,objectFit:"cover"}} />
              </div>
            ))}
            <div style={{display:"flex",alignItems:"center",fontSize:10,color:MUTED}}>← Screenshots analysés</div>
          </div>
        )}
      </div>

      {/* MANUAL OVERRIDE */}
      {manualMode && (
        <div style={{marginBottom:16,background:PANEL,border:`1px solid rgba(88,166,255,.2)`,borderRadius:10,padding:14,borderLeft:"3px solid #58a6ff"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"rgba(88,166,255,.7)",letterSpacing:2,marginBottom:12}}>── SAISIE MANUELLE (remplacement des valeurs)</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              ["Prix BTC ($)","btcPrice",100],["ETF Netflow (B$)","etfNetflow",.5],["USDT SMA30 (B$)","usdtSma",.1],
              ["Futures Power (%)","futuresPower",1],["Bull/Bear 30d MA","bullBear30d",.05],["Bull/Bear 365d MA","bullBear365d",.05],
              ["SOPR Ratio","soprRatio",.01],["STH NUPL","sthNupl",.01],["LTH NUPL","lthNupl",.01],
              ["UTXO Ratio","utxoRatio",.5],["MVRV Percentile (%)","mvrvPct",1],["Mayer Multiple","mayerMultiple",.01],
              ["Sharpe Ratio CT","sharpeShort",1],["Baleines 1k-10k (BTC)","whales1k10k",1000],
            ].map(([label,key,step])=>(
              <div key={key}>
                <div style={{fontSize:9,color:MUTED,letterSpacing:.8,marginBottom:3,textTransform:"uppercase"}}>{label}</div>
                <input type="number" step={step} defaultValue={vals[key]}
                  onChange={e=>setDraft(d=>({...d,[key]:parseFloat(e.target.value)||0}))}
                  style={{width:"100%",background:BG,color:"#c9d1d9",border:`1px solid ${BORDER}`,borderRadius:4,padding:"5px 8px",fontSize:11}} />
              </div>
            ))}
          </div>
          <div style={{marginTop:12,display:"flex",gap:8}}>
            <select value={draft.ntvSellCount??vals.ntvSellCount} onChange={e=>setDraft(d=>({...d,ntvSellCount:Number(e.target.value)}))}
              style={{background:BG,color:"#c9d1d9",border:`1px solid ${BORDER}`,borderRadius:4,padding:"5px 8px",fontSize:11}}>
              {[{v:2,l:"Double Sell Signal"},{v:1,l:"Sell Signal"},{v:0,l:"Neutre"},{v:-1,l:"Buy Signal"},{v:-2,l:"Double Buy Signal"}].map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <button onClick={async()=>{const u={...vals,...draft};setVals(u);await saveToStorage(u);setManualMode(false);setDraft({});}}
              style={{background:"#1F3864",color:"#74c0fc",border:"1px solid #1F6FEB",borderRadius:6,padding:"6px 16px",fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>
              ✓ APPLIQUER
            </button>
          </div>
        </div>
      )}

      {/* SCORE CARDS */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
        {[
          { label:"Signal CT/MT Global", val:bearCount>=7?"BEARISH":bearCount>=5?"MIXTE−":"MIXTE",
            sub:`${bearCount}/12 indicateurs baissiers`, color:"#ff6b6b", topG:"linear-gradient(90deg,#c0392b,#e74c3c)" },
          { label:"Score Thermique Moyen (0–9)", val:avgScore,
            sub:`${bullCount} signaux LT bullish actifs`,
            color:parseFloat(avgScore)<4?"#ff6b6b":parseFloat(avgScore)<6?"#ffe066":"#69db7c",
            topG:parseFloat(avgScore)<4?"linear-gradient(90deg,#c0392b,#e74c3c)":parseFloat(avgScore)<6?"linear-gradient(90deg,#f39c12,#f1c40f)":"linear-gradient(90deg,#27ae60,#2ecc71)" },
          { label:"Checklist Bottom", val:`${checkScore}/10`,
            sub:checkScore>=7?"⚡ Signal d'achat fort":checkScore>=4?"⏳ Conditions LT actives":"❌ Retournement non validé",
            color:checkScore>=7?"#69db7c":checkScore>=4?"#ffe066":"#ff6b6b",
            topG:checkScore>=7?"linear-gradient(90deg,#27ae60,#2ecc71)":checkScore>=4?"linear-gradient(90deg,#f39c12,#f1c40f)":"linear-gradient(90deg,#c0392b,#e74c3c)" },
        ].map((c,i)=>(
          <div key={i} style={{background:PANEL,border:`1px solid ${BORDER}`,borderRadius:10,padding:"14px 16px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:c.topG}}/>
            <div style={{fontSize:10,color:MUTED,textTransform:"uppercase",letterSpacing:1.5,marginBottom:6}}>{c.label}</div>
            <div style={{fontFamily:"monospace",fontSize:22,fontWeight:700,color:c.color}}>{c.val}</div>
            <div style={{fontSize:11,color:MUTED,marginTop:3}}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* LÉGENDE */}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <span style={{fontSize:10,color:MUTED,textTransform:"uppercase",letterSpacing:1}}>Thermique →</span>
        <div style={{display:"flex",borderRadius:4,overflow:"hidden",height:14,flex:1,maxWidth:260}}>
          {["#1a0a0a","#3d0f0f","#7a1a1a","#c0392b","#e74c3c","#f39c12","#f1c40f","#2ecc71","#27ae60","#1a5c3a"].map((bg,i)=>
            <div key={i} style={{flex:1,background:bg}}/>)}
        </div>
        <span style={{fontSize:10,color:MUTED}}>Capitulation → Euphorie</span>
      </div>

      {/* TABLE */}
      <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
          <thead>
            <tr style={{borderBottom:`2px solid ${BORDER}`}}>
              {["Indicateur / Valeur","Maintenant","CT (1–4 sem)","MT (1–3 mois)","LT (6–18 mois)","Signal","Hz"].map((h,i)=>(
                <th key={i} style={{fontFamily:"monospace",fontSize:9,textTransform:"uppercase",letterSpacing:1.5,
                  color:MUTED,padding:"8px 10px",textAlign:i===0?"left":"center",fontWeight:400,whiteSpace:"nowrap"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row,ri)=>(
              <>
                {row.sec && <SectionRow key={`s${ri}`} label={row.sec}/>}
                <tr key={`r${ri}`} style={{borderBottom:`1px solid rgba(255,255,255,.04)`}}>
                  <td style={{padding:"9px 10px",verticalAlign:"middle",minWidth:190}}>
                    <div style={{fontWeight:500,color:"#e6edf3",fontSize:12}}>{row.name}</div>
                    <div style={{fontFamily:"monospace",fontSize:10,color:MUTED,marginTop:2}}>{row.val}</div>
                    <div style={{fontSize:9,color:"#2d3748",marginTop:2}}>{row.sub}</div>
                  </td>
                  <TC level={row.sc.n} label={row.nowL}/>
                  <TC level={row.sc.c} label={LEVEL_LABELS[Math.max(0,Math.min(9,row.sc.c))]}/>
                  <TC level={row.sc.m} label={LEVEL_LABELS[Math.max(0,Math.min(9,row.sc.m))]}/>
                  <TC level={row.sc.l} label={LEVEL_LABELS[Math.max(0,Math.min(9,row.sc.l))]}/>
                  <td style={{padding:"6px 10px",textAlign:"center"}}><Badge level={row.sc.n}/></td>
                  <td style={{padding:"6px 10px",textAlign:"center",fontSize:10,color:MUTED,whiteSpace:"nowrap"}}>{row.hz}</td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOTTOM ZONES */}
      <div style={{marginTop:18,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        {[
          { z:"$65–68K", p:"Bottom : faible", l:"⚠ Distribution active", c:"#e74c3c", a:"#c0392b" },
          { z:"$58–63K", p:"Support STH cost basis", l:"⬇ CT probable", c:"#ffa94d", a:"#f39c12" },
          { z:"$50–58K", p:"Cible scénario central (~65%)", l:"🎯 Bottom le plus probable", c:"#ffe066", a:"#f1c40f" },
          { z:"$42–50K", p:"Si SOPR Alert + UTXO Flag", l:"⚡ Capitulation extrême", c:"#da77f2", a:"#9b59b6" },
        ].map((z,i)=>(
          <div key={i} style={{background:PANEL,border:`1px solid ${BORDER}`,borderRadius:8,padding:"12px 13px",position:"relative",overflow:"hidden"}}>
            <div style={{fontSize:14,fontFamily:"monospace",fontWeight:700,color:"#fff"}}>{z.z}</div>
            <div style={{fontSize:10,color:MUTED,marginTop:4}}>{z.p}</div>
            <div style={{fontSize:10,marginTop:8,fontWeight:600,textTransform:"uppercase",letterSpacing:1,color:z.c}}>{z.l}</div>
            <div style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:z.a}}/>
          </div>
        ))}
      </div>

      {/* CHECKLIST */}
      <div style={{marginTop:14,background:PANEL,border:`1px solid ${BORDER}`,borderRadius:10,padding:14,borderLeft:"3px solid #58a6ff"}}>
        <div style={{fontFamily:"monospace",fontSize:9,color:"rgba(88,166,255,.7)",textTransform:"uppercase",letterSpacing:2,marginBottom:10}}>── Conditions pour Valider le Bottom</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:2}}>
          {checks.map((c,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,padding:"3px 0"}}>
              <span style={{color:c.ok?"#2ecc71":"#e74c3c",fontSize:14,minWidth:14}}>{c.ok?"✓":"✗"}</span>
              <span style={{color:c.ok?"#69db7c":"#aaa"}}>{c.label}</span>
            </div>
          ))}
        </div>
        <div style={{marginTop:10,paddingTop:8,borderTop:`1px solid ${BORDER}`,fontSize:12}}>
          <span style={{fontWeight:700,color:"#ffd166"}}>Score : {checkScore}/10. </span>
          <span style={{color:"#718096"}}>
            {checkScore>=7?"⚡ Signal d'achat fort — confirmer avec price action":
             checkScore>=4?"⏳ Signaux LT actifs — attendre les 3 déclencheurs directionnels":
             "❌ Retournement non encore validé — patience"}
          </span>
        </div>
      </div>

      <div style={{marginTop:14,paddingTop:10,borderTop:`1px solid ${BORDER}`,fontSize:10,color:MUTED,textAlign:"center",fontStyle:"italic"}}>
        Analyse IA : Claude Sonnet · Données : CryptoQuant · Ce tableau ne constitue pas un conseil financier
      </div>
    </div>
  );
}
