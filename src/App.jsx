import { useState, useRef, useCallback, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');`;

const styles = `
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060810; overflow-x: hidden; }

  .fnd-root { min-height: 100vh; background: #060810; font-family: 'DM Sans', sans-serif; color: #E8EAF0; padding: 2rem 1rem 4rem; position: relative; }
  .fnd-root::before { content: ''; position: fixed; top: -40%; left: -20%; width: 70%; height: 70%; background: radial-gradient(ellipse, rgba(220,38,38,0.06) 0%, transparent 65%); pointer-events: none; z-index: 0; }
  .fnd-root::after { content: ''; position: fixed; bottom: -30%; right: -10%; width: 60%; height: 60%; background: radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 65%); pointer-events: none; z-index: 0; }
  .grid-bg { position: fixed; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px); background-size: 60px 60px; pointer-events: none; z-index: 0; }
  
  .container { max-width: 780px; margin: 0 auto; position: relative; z-index: 1; transition: transform 0.3s ease; }

  /* SIDEBAR & NAV */
  .menu-btn { position: fixed; top: 1.5rem; left: 1.5rem; z-index: 100; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #E8EAF0; cursor: pointer; transition: all 0.2s; backdrop-filter: blur(10px); }
  .menu-btn:hover { background: rgba(255,255,255,0.1); }
  
  .sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 320px; background: rgba(10,12,25,0.85); backdrop-filter: blur(25px); border-right: 1px solid rgba(255,255,255,0.07); z-index: 90; transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; padding: 5rem 1.5rem 2rem; box-shadow: 20px 0 50px rgba(0,0,0,0.5); }
  .sidebar.open { transform: translateX(0); }
  .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(3px); z-index: 80; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
  .sidebar-overlay.open { opacity: 1; pointer-events: auto; }
  
  .history-title { font-family: 'Syne', sans-serif; font-size: 1.2rem; font-weight: 700; color: #F1F3FA; margin-bottom: 1.5rem; display: flex; align-items: center; justify-content: space-between; }
  .clear-btn { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #EF4444; background: transparent; border: none; cursor: pointer; }
  .history-list { display: flex; flex-direction: column; gap: 10px; overflow-y: auto; padding-right: 5px; }
  .history-list::-webkit-scrollbar { width: 4px; }
  .history-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
  .history-item { padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
  .history-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }
  .hist-query { font-size: 13px; color: #E8EAF0; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .hist-meta { display: flex; justify-content: space-between; align-items: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; }
  .hist-meta .REAL { color: #4ADE80; } .hist-meta .FAKE { color: #F87171; } .hist-meta .UNCERTAIN { color: #FBBF24; }

  /* HEADER */
  .header { text-align: center; margin-bottom: 3rem; margin-top: 1rem; }
  .badge-top { display: inline-flex; align-items: center; gap: 6px; background: rgba(220,38,38,0.12); border: 1px solid rgba(220,38,38,0.25); border-radius: 999px; padding: 5px 14px; font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 500; color: #F87171; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 1.25rem; }
  .badge-top .dot { width: 6px; height: 6px; border-radius: 50%; background: #EF4444; animation: pulse-dot 2s ease-in-out infinite; }
  @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }
  .header h1 { font-family: 'Syne', sans-serif; font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; color: #F1F3FA; margin-bottom: 0.75rem; }
  .header h1 span { color: #EF4444; }
  .header p { font-size: 15px; color: #7A809A; font-weight: 300; max-width: 440px; margin: 0 auto; line-height: 1.6; }

  /* CARD & TABS */
  .card { background: rgba(13,16,30,0.85); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 2rem; backdrop-filter: blur(20px); margin-bottom: 1rem; }
  .tabs { display: flex; background: rgba(255,255,255,0.04); border-radius: 12px; padding: 4px; gap: 2px; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .tab { flex: 1; min-width: 120px; padding: 9px 12px; border-radius: 9px; border: none; background: transparent; color: #5A6080; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; }
  .tab:hover { color: #A0A8C0; }
  .tab.active { background: rgba(255,255,255,0.08); color: #E8EAF0; box-shadow: 0 1px 3px rgba(0,0,0,0.3); }

  /* INPUTS */
  .textarea-wrap { position: relative; }
  textarea, .url-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; color: #E8EAF0; font-family: 'JetBrains Mono', monospace; font-size: 13.5px; font-weight: 300; line-height: 1.7; padding: 1rem 1.1rem; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
  textarea { min-height: 130px; resize: none; }
  .url-input { height: 60px; font-size: 14px; }
  textarea:focus, .url-input:focus { border-color: rgba(255,255,255,0.18); }

  /* SUGGESTIONS */
  .suggestions-wrap { margin-top: 1rem; }
  .sugg-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #5A6080; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .sugg-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .sugg-pill { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 999px; padding: 6px 12px; font-size: 12px; color: #A0A8C0; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
  .sugg-pill:hover { background: rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.25); color: #93C5FD; transform: translateY(-1px); }

  /* DROPZONE */
  .dropzone { border: 1.5px dashed rgba(255,255,255,0.1); border-radius: 14px; padding: 2.5rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.25s ease; background: rgba(255,255,255,0.02); }
  .dropzone:hover, .dropzone.drag-over { border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.03); }
  .dropzone input[type="file"] { display: none; }
  .dz-icon { width: 44px; height: 44px; margin: 0 auto 1rem; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
  .dz-title { font-size: 14px; color: #8A90A8; margin-bottom: 4px; }
  .dz-sub { font-size: 12px; color: #4A5070; font-family: 'JetBrains Mono', monospace; }
  .dz-filename { margin-top: 0.75rem; display: inline-flex; align-items: center; gap: 6px; background: rgba(59,130,246,0.12); border: 1px solid rgba(59,130,246,0.2); border-radius: 8px; padding: 4px 10px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #93C5FD; }

  /* BUTTONS & LOADING */
  .btn-analyze { width: 100%; padding: 14px; border-radius: 12px; border: none; background: linear-gradient(135deg, #DC2626 0%, #9F1239 100%); color: white; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 0.04em; cursor: pointer; transition: all 0.2s ease; margin-top: 1.25rem; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-analyze:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(220,38,38,0.35); }
  .btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }
  
  .loading-card { background: rgba(13,16,30,0.85); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 2.5rem 2rem; text-align: center; margin-bottom: 1rem; }
  .loading-spinner { width: 48px; height: 48px; border: 2px solid rgba(255,255,255,0.06); border-top-color: #EF4444; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1.25rem; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* RESULT UI */
  .result-card { background: rgba(13,16,30,0.85); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; margin-bottom: 1rem; animation: fadeUp 0.5s ease; }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .verdict-banner { padding: 1.75rem 2rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; }
  .verdict-banner.fake { background: rgba(220,38,38,0.08); border-bottom: 1px solid rgba(220,38,38,0.12); }
  .verdict-banner.real { background: rgba(34,197,94,0.06); border-bottom: 1px solid rgba(34,197,94,0.1); }
  .verdict-banner.uncertain { background: rgba(245,158,11,0.07); border-bottom: 1px solid rgba(245,158,11,0.12); }
  .verdict-left { display: flex; align-items: center; gap: 14px; }
  .verdict-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .verdict-icon.fake { background: rgba(220,38,38,0.15); color: #EF4444; }
  .verdict-icon.real { background: rgba(34,197,94,0.12); color: #22C55E; }
  .verdict-icon.uncertain { background: rgba(245,158,11,0.12); color: #F59E0B; }
  .verdict-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; margin-bottom: 4px; }
  .verdict-label.fake { color: #F87171; } .verdict-label.real { color: #86EFAC; } .verdict-label.uncertain { color: #FCD34D; }
  .verdict-title { font-family: 'Syne', sans-serif; font-size: 1.4rem; font-weight: 800; }
  .verdict-title.fake { color: #FCA5A5; } .verdict-title.real { color: #BBF7D0; } .verdict-title.uncertain { color: #FDE68A; }
  
  .confidence-num { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 800; line-height: 1; text-align: right;}
  .confidence-num.fake { color: #EF4444; } .confidence-num.real { color: #22C55E; } .confidence-num.uncertain { color: #F59E0B; }
  .confidence-sub { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #4A5070; text-transform: uppercase; text-align: right;}

  .result-body { padding: 1.5rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .prob-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .prob-label { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #5A6080; text-transform: uppercase; }
  .prob-value { font-size: 13px; font-family: 'JetBrains Mono', monospace; color: #A0A8C0; }
  .bar-track { height: 6px; background: rgba(255,255,255,0.05); border-radius: 999px; }
  .bar-fill { height: 100%; border-radius: 999px; transition: width 1s; }
  .bar-fill.fake { background: linear-gradient(90deg, #991B1B, #EF4444); }
  .bar-fill.real { background: linear-gradient(90deg, #15803D, #22C55E); }
  .section-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #3A4060; text-transform: uppercase; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 8px;}
  .reasoning-text { font-size: 14px; line-height: 1.75; color: #8A90A8; font-weight: 300; }
  .reset-btn { display: inline-flex; align-items: center; gap: 6px; background: transparent; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #5A6080; font-size: 13px; padding: 7px 14px; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem; align-self: flex-start;}
  .reset-btn:hover { color: #A0A8C0; border-color: rgba(255,255,255,0.15); }
  .footer-note { text-align: center; font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #2A2E44; margin-top: 2rem; }
`;

const SUGGESTIONS = [
  "Did the US capture Nicolás Maduro in 2026?",
  "Does the new Gemini 3 AI write its own code?",
  "Is the Earth officially flat?",
  "New study claims coffee cures the common cold"
];

const VERDICTS = {
  FAKE: { cls: "fake", icon: "✕", title: "Likely Misinformation", label: "FAKE NEWS DETECTED" },
  REAL: { cls: "real", icon: "✓", title: "Credible & Verified", label: "VERIFIED AS REAL" },
  UNCERTAIN: { cls: "uncertain", icon: "?", title: "Inconclusive", label: "UNVERIFIABLE" },
};

// SVG Icons
const IconText = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="2" width="12" height="1.5" rx="0.75" fill="currentColor"/><rect x="1" y="5.5" width="9" height="1.5" rx="0.75" fill="currentColor"/><rect x="1" y="9" width="11" height="1.5" rx="0.75" fill="currentColor"/></svg>;
const IconImage = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none"/><circle cx="4.5" cy="5" r="1.2" fill="currentColor"/><path d="M1.5 10L4.5 7L7 9.5L9.5 7L12.5 10" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg>;
const IconPDF = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2.5 1.5H8.5L11.5 4.5V12.5H2.5V1.5Z" stroke="currentColor" strokeWidth="1.2" fill="none"/><path d="M8.5 1.5V4.5H11.5" stroke="currentColor" strokeWidth="1.2" fill="none"/><rect x="4" y="7" width="6" height="1" rx="0.5" fill="currentColor"/><rect x="4" y="9.5" width="4" height="1" rx="0.5" fill="currentColor"/></svg>;
const IconLink = () => <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M6 8L8 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M4 8.5C3.5 8.5 2.5 8 2.5 6.5C2.5 5 3.5 4.5 4 4.5H6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M10 5.5C10.5 5.5 11.5 6 11.5 7.5C11.5 9 10.5 9.5 10 9.5H7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconSparkles = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18M3 12h18M16.5 7.5l-9 9M7.5 7.5l9 9"/></svg>;

export default function App() {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Load history from LocalStorage
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("fnd-history");
    return saved ? JSON.parse(saved) : [];
  });

  const fileRef = useRef();

  // Save history when it updates
  useEffect(() => {
    localStorage.setItem("fnd-history", JSON.stringify(history));
  }, [history]);

  // Global Paste Listener
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFile = e.clipboardData.files[0];
        if (pastedFile.type.startsWith("image/")) {
          setFile(pastedFile);
          setTab("image");
          e.preventDefault();
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const toBase64 = (f) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const handleSuggestionClick = (sugg) => {
    setTab("text");
    setText(sugg);
  };

  const handleHistoryClick = (item) => {
    setTab("text");
    setText(item.query);
    setIsSidebarOpen(false);
  };

  const handleAnalyze = async () => {
    if (tab === "text" && !text.trim()) return;
    if (tab === "url" && !url.trim()) return;
    if ((tab === "image" || tab === "pdf") && !file) return;

    setStatus("loading");
    setResult(null);

    try {
      // NOTE: Using 1.5-flash as the fallback you requested earlier!
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash", 
        generationConfig: { responseMimeType: "application/json" }
      });

      const systemPrompt = `
        You are an advanced 2026 Real-Time Fact-Checking Intelligence.
        CONTEXT: The current date is April 2026.
        CRITICAL RULE: If the user simply says hello or types random gibberish, return "UNCERTAIN" and ask for a real claim.
        RESPOND STRICTLY IN JSON: {"verdict": "FAKE"|"REAL"|"UNCERTAIN", "probability_real": 0-100, "probability_fake": 0-100, "reasoning": "A short paragraph.", "sources": ["url1"]}
      `;

      let contents = [];
      let currentQuery = "";

      if (tab === "text") {
        contents = [systemPrompt + "\n\nUSER CLAIM:\n" + text];
        currentQuery = text;
      } else if (tab === "url") {
        contents = [systemPrompt + "\n\nANALYZE DOMAIN AND URL SLUG:\n" + url];
        currentQuery = url;
      } else {
        const base64Data = await toBase64(file);
        contents = [
          systemPrompt + "\n\nAnalyze this attached file:",
          { inlineData: { data: base64Data, mimeType: file.type } }
        ];
        currentQuery = `File: ${file.name}`;
      }

      const aiResponse = await model.generateContent(contents);
      const data = JSON.parse(aiResponse.response.text());
      
      setResult(data);
      
      // Add to History
      setHistory(prev => [
        { id: Date.now(), query: currentQuery, verdict: data.verdict, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) },
        ...prev
      ].slice(0, 15)); // Keep only last 15 searches

    } catch (error) {
      console.error(error);
      setResult({
        verdict: "UNCERTAIN", probability_real: 50, probability_fake: 50,
        reasoning: `API Error: ${error.message} Check the console.`, sources: []
      });
    } finally {
      setStatus("result");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setIsDrag(false);
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  }, []);

  const v = result ? VERDICTS[result.verdict] || VERDICTS["UNCERTAIN"] : null;
  const isButtonDisabled = status === "loading" || (tab === "text" && !text.trim()) || (tab === "url" && !url.trim()) || ((tab === "image" || tab === "pdf") && !file);

  return (
    <>
      <style>{styles}</style>
      
      <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
        <IconMenu />
      </button>

      {/* OVERLAY & SIDEBAR */}
      <div className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`} onClick={() => setIsSidebarOpen(false)} />
      <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="history-title">
          History
          {history.length > 0 && <button className="clear-btn" onClick={() => setHistory([])}>Clear</button>}
        </div>
        
        <div className="history-list">
          {history.length === 0 ? (
            <p style={{fontSize: "12px", color: "#5A6080"}}>No recent searches.</p>
          ) : (
            history.map(item => (
              <div key={item.id} className="history-item" onClick={() => handleHistoryClick(item)}>
                <div className="hist-query">{item.query}</div>
                <div className="hist-meta">
                  <span className={item.verdict}>{item.verdict}</span>
                  <span style={{color: "#5A6080"}}>{item.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fnd-root">
        <div className="grid-bg" />
        <div className="container">

          <div className="header">
            <div className="badge-top">
              <span className="dot" /> AI Fact-Check Engine
            </div>
            <h1>Detect <span>Fake</span> News<br />in Seconds</h1>
            <p>Paste a headline, URL, or upload a screenshot to get a credibility verdict.</p>
          </div>

          {status !== "result" && (
            <div className="card">
              <div className="tabs">
                {[
                  { id: "text", label: "Text", icon: <IconText /> },
                  { id: "url", label: "Link", icon: <IconLink /> },
                  { id: "image", label: "Image", icon: <IconImage /> },
                  { id: "pdf", label: "PDF", icon: <IconPDF /> },
                ].map((t) => (
                  <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => { setTab(t.id); setFile(null); }}>
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {tab === "text" && (
                <>
                  <div className="textarea-wrap">
                    <textarea placeholder="Paste a news headline..." value={text} onChange={(e) => setText(e.target.value)} />
                  </div>
                  <div className="suggestions-wrap">
                    <div className="sugg-label">Trending Searches</div>
                    <div className="sugg-list">
                      {SUGGESTIONS.map((sugg, i) => (
                        <div key={i} className="sugg-pill" onClick={() => handleSuggestionClick(sugg)}>
                          <IconSparkles /> {sugg}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {tab === "url" && (
                <div className="textarea-wrap">
                  <input type="url" className="url-input" placeholder="Paste an article link (e.g., https://...)" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
              )}

              {(tab === "image" || tab === "pdf") && (
                <div className={`dropzone ${isDrag ? "drag-over" : ""}`} onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }} onDragLeave={() => setIsDrag(false)} onDrop={handleDrop} onClick={() => fileRef.current.click()}>
                  <input ref={fileRef} type="file" accept={tab === "image" ? "image/*" : "application/pdf"} onChange={(e) => setFile(e.target.files[0])} />
                  <div className="dz-icon">{tab === "image" ? <IconImage /> : <IconPDF />}</div>
                  <p className="dz-title">Drop your file here or hit Ctrl+V</p>
                  {file && <div className="dz-filename">{file.name}</div>}
                </div>
              )}

              <button className="btn-analyze" onClick={handleAnalyze} disabled={isButtonDisabled}>
                {status === "loading" ? "Scanning Database..." : "Analyze Now"}
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="loading-card">
              <div className="loading-spinner" />
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: 600, color: "#A0A8C0" }}>Analyzing data...</p>
            </div>
          )}

          {status === "result" && result && v && (
            <div className="result-card">
              <div className={`verdict-banner ${v.cls}`}>
                <div className="verdict-left">
                  <div className={`verdict-icon ${v.cls}`}>{v.icon}</div>
                  <div>
                    <div className={`verdict-label ${v.cls}`}>{v.label}</div>
                    <div className={`verdict-title ${v.cls}`}>{v.title}</div>
                  </div>
                </div>
                <div>
                  <div className={`confidence-num ${v.cls}`}>{result.verdict === "FAKE" ? result.probability_fake : result.verdict === "REAL" ? result.probability_real : 50}%</div>
                  <div className="confidence-sub">confidence</div>
                </div>
              </div>

              <div className="result-body">
                <div>
                  <div className="section-label">Analysis & Reasoning</div>
                  <p className="reasoning-text">{result.reasoning}</p>
                </div>
                <button className="reset-btn" onClick={() => { setStatus("idle"); setResult(null); }}>← Analyze another claim</button>
              </div>
            </div>
          )}
          
          <p className="footer-note">Powered by Gemini AI · Web Search</p>
        </div>
      </div>
    </>
  );
}