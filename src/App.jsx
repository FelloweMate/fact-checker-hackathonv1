import { useState, useRef, useCallback } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');`;

const styles = `
  ${FONTS}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060810; }

  .fnd-root {
    min-height: 100vh;
    background: #060810;
    font-family: 'DM Sans', sans-serif;
    color: #E8EAF0;
    padding: 2rem 1rem 4rem;
    position: relative;
    overflow-x: hidden;
  }

  .fnd-root::before {
    content: '';
    position: fixed;
    top: -40%;
    left: -20%;
    width: 70%;
    height: 70%;
    background: radial-gradient(ellipse, rgba(220,38,38,0.06) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .fnd-root::after {
    content: '';
    position: fixed;
    bottom: -30%;
    right: -10%;
    width: 60%;
    height: 60%;
    background: radial-gradient(ellipse, rgba(59,130,246,0.05) 0%, transparent 65%);
    pointer-events: none;
    z-index: 0;
  }

  .grid-bg {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }

  .container {
    max-width: 780px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* HEADER */
  .header { text-align: center; margin-bottom: 3rem; }
  .badge-top {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(220,38,38,0.12);
    border: 1px solid rgba(220,38,38,0.25);
    border-radius: 999px;
    padding: 5px 14px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 500;
    color: #F87171;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 1.25rem;
  }
  .badge-top .dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #EF4444;
    animation: pulse-dot 2s ease-in-out infinite;
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(0.7); }
  }

  .header h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 5vw, 3.2rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: #F1F3FA;
    margin-bottom: 0.75rem;
  }
  .header h1 span { color: #EF4444; }
  .header p {
    font-size: 15px;
    color: #7A809A;
    font-weight: 300;
    max-width: 440px;
    margin: 0 auto;
    line-height: 1.6;
  }

  /* CARD */
  .card {
    background: rgba(13,16,30,0.85);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 2rem;
    backdrop-filter: blur(20px);
    margin-bottom: 1rem;
  }

  /* TABS */
  .tabs {
    display: flex;
    background: rgba(255,255,255,0.04);
    border-radius: 12px;
    padding: 4px;
    gap: 2px;
    margin-bottom: 1.5rem;
  }
  .tab {
    flex: 1;
    padding: 9px 12px;
    border-radius: 9px;
    border: none;
    background: transparent;
    color: #5A6080;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .tab:hover { color: #A0A8C0; }
  .tab.active {
    background: rgba(255,255,255,0.08);
    color: #E8EAF0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .tab svg { flex-shrink: 0; }

  /* TEXTAREA */
  .textarea-wrap { position: relative; }
  textarea {
    width: 100%;
    min-height: 130px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    color: #E8EAF0;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13.5px;
    font-weight: 300;
    line-height: 1.7;
    padding: 1rem 1.1rem;
    resize: none;
    outline: none;
    transition: border-color 0.2s;
    letter-spacing: 0.01em;
  }
  textarea::placeholder { color: #3A4060; }
  textarea:focus { border-color: rgba(255,255,255,0.18); }

  /* DROPZONE */
  .dropzone {
    border: 1.5px dashed rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 2.5rem 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.25s ease;
    background: rgba(255,255,255,0.02);
    position: relative;
  }
  .dropzone:hover, .dropzone.drag-over {
    border-color: rgba(239,68,68,0.35);
    background: rgba(239,68,68,0.03);
  }
  .dropzone input[type="file"] { display: none; }
  .dz-icon {
    width: 44px; height: 44px;
    margin: 0 auto 1rem;
    background: rgba(255,255,255,0.05);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dz-title { font-size: 14px; color: #8A90A8; margin-bottom: 4px; }
  .dz-sub { font-size: 12px; color: #4A5070; font-family: 'JetBrains Mono', monospace; }
  .dz-filename {
    margin-top: 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(59,130,246,0.12);
    border: 1px solid rgba(59,130,246,0.2);
    border-radius: 8px;
    padding: 4px 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #93C5FD;
  }

  /* ANALYZE BUTTON */
  .btn-analyze {
    width: 100%;
    padding: 14px;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #DC2626 0%, #9F1239 100%);
    color: white;
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: relative;
    overflow: hidden;
  }
  .btn-analyze:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(220,38,38,0.35);
  }
  .btn-analyze:active:not(:disabled) { transform: translateY(0px); }
  .btn-analyze:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-analyze .scan-line {
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
    transform: translateX(-100%);
    animation: scan 1.5s ease-in-out infinite;
  }
  @keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  /* LOADING */
  .loading-card {
    background: rgba(13,16,30,0.85);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 2.5rem 2rem;
    text-align: center;
    margin-bottom: 1rem;
  }
  .loading-spinner {
    width: 48px; height: 48px;
    border: 2px solid rgba(255,255,255,0.06);
    border-top-color: #EF4444;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1.25rem;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-steps { display: flex; flex-direction: column; gap: 8px; margin-top: 1rem; }
  .loading-step {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #4A5070;
  }
  .loading-step.active { color: #A0A8C0; }
  .loading-step.done { color: #4ADE80; }
  .step-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #2A2E44;
    flex-shrink: 0;
  }
  .step-dot.active { background: #EF4444; animation: pulse-dot 1s infinite; }
  .step-dot.done { background: #4ADE80; }

  /* RESULT CARD */
  .result-card {
    background: rgba(13,16,30,0.85);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 1rem;
    animation: fadeUp 0.5s ease;
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .verdict-banner {
    padding: 1.75rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
  }
  .verdict-banner.fake { background: rgba(220,38,38,0.08); border-bottom: 1px solid rgba(220,38,38,0.12); }
  .verdict-banner.real { background: rgba(34,197,94,0.06); border-bottom: 1px solid rgba(34,197,94,0.1); }
  .verdict-banner.uncertain { background: rgba(245,158,11,0.07); border-bottom: 1px solid rgba(245,158,11,0.12); }

  .verdict-left { display: flex; align-items: center; gap: 14px; }
  .verdict-icon {
    width: 52px; height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }
  .verdict-icon.fake { background: rgba(220,38,38,0.15); }
  .verdict-icon.real { background: rgba(34,197,94,0.12); }
  .verdict-icon.uncertain { background: rgba(245,158,11,0.12); }
  .verdict-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .verdict-label.fake { color: #F87171; }
  .verdict-label.real { color: #86EFAC; }
  .verdict-label.uncertain { color: #FCD34D; }
  .verdict-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }
  .verdict-title.fake { color: #FCA5A5; }
  .verdict-title.real { color: #BBF7D0; }
  .verdict-title.uncertain { color: #FDE68A; }

  .confidence-badge {
    text-align: right;
  }
  .confidence-num {
    font-family: 'Syne', sans-serif;
    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 2px;
  }
  .confidence-num.fake { color: #EF4444; }
  .confidence-num.real { color: #22C55E; }
  .confidence-num.uncertain { color: #F59E0B; }
  .confidence-sub {
    font-size: 10px;
    font-family: 'JetBrains Mono', monospace;
    color: #4A5070;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* PROBA BARS */
  .result-body { padding: 1.5rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .prob-row { display: flex; flex-direction: column; gap: 6px; }
  .prob-header { display: flex; justify-content: space-between; align-items: center; }
  .prob-label { font-size: 12px; font-family: 'JetBrains Mono', monospace; color: #5A6080; letter-spacing: 0.06em; text-transform: uppercase; }
  .prob-value { font-size: 13px; font-family: 'JetBrains Mono', monospace; font-weight: 500; color: #A0A8C0; }
  .bar-track {
    height: 6px;
    background: rgba(255,255,255,0.05);
    border-radius: 999px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width 1s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .bar-fill.fake { background: linear-gradient(90deg, #991B1B, #EF4444); }
  .bar-fill.real { background: linear-gradient(90deg, #15803D, #22C55E); }
  .bar-fill.uncertain { background: linear-gradient(90deg, #B45309, #F59E0B); }

  /* REASONING */
  .section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #3A4060;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(255,255,255,0.05);
  }

  .reasoning-text {
    font-size: 14px;
    line-height: 1.75;
    color: #8A90A8;
    font-weight: 300;
  }

  /* SOURCES */
  .sources-list { display: flex; flex-direction: column; gap: 6px; }
  .source-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s;
    cursor: pointer;
  }
  .source-item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.09); }
  .source-dot { width: 6px; height: 6px; background: #3B82F6; border-radius: 50%; flex-shrink: 0; }
  .source-text { font-size: 12.5px; color: #6B7494; font-family: 'JetBrains Mono', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; }
  .source-arrow { color: #3A4060; font-size: 12px; flex-shrink: 0; }

  /* FOOTER */
  .footer-note {
    text-align: center;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: #2A2E44;
    margin-top: 2rem;
    letter-spacing: 0.04em;
  }

  .divider { height: 1px; background: rgba(255,255,255,0.05); margin: 1.25rem 0; }

  .reset-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    color: #5A6080;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    padding: 7px 14px;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 0.5rem;
  }
  .reset-btn:hover { color: #A0A8C0; border-color: rgba(255,255,255,0.15); }
`;

const VERDICTS = {
  FAKE: {
    cls: "fake",
    icon: "✕",
    title: "Likely Misinformation",
    label: "FAKE NEWS DETECTED",
  },
  REAL: {
    cls: "real",
    icon: "✓",
    title: "Credible & Verified",
    label: "VERIFIED AS REAL",
  },
  UNCERTAIN: {
    cls: "uncertain",
    icon: "?",
    title: "Inconclusive",
    label: "UNVERIFIABLE",
  },
};

const LOADING_STEPS = [
  "Extracting data from file...",
  "Running optical character recognition...",
  "Cross-referencing live knowledge...",
  "Computing credibility score...",
];

function IconText() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="1.5" rx="0.75" fill="currentColor" opacity="0.7"/>
      <rect x="1" y="5.5" width="9" height="1.5" rx="0.75" fill="currentColor" opacity="0.7"/>
      <rect x="1" y="9" width="11" height="1.5" rx="0.75" fill="currentColor" opacity="0.7"/>
    </svg>
  );
}

function IconImage() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1.5" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7"/>
      <circle cx="4.5" cy="5" r="1.2" fill="currentColor" opacity="0.7"/>
      <path d="M1.5 10L4.5 7L7 9.5L9.5 7L12.5 10" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.7"/>
    </svg>
  );
}

function IconPDF() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 1.5H8.5L11.5 4.5V12.5H2.5V1.5Z" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.7"/>
      <path d="M8.5 1.5V4.5H11.5" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.7"/>
      <rect x="4" y="7" width="6" height="1" rx="0.5" fill="currentColor" opacity="0.5"/>
      <rect x="4" y="9.5" width="4" height="1" rx="0.5" fill="currentColor" opacity="0.5"/>
    </svg>
  );
}

function ProbBar({ label, value, type }) {
  return (
    <div className="prob-row">
      <div className="prob-header">
        <span className="prob-label">{label}</span>
        <span className="prob-value">{value}%</span>
      </div>
      <div className="bar-track">
        <div
          className={`bar-fill ${type}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [isDrag, setIsDrag] = useState(false);
  const [status, setStatus] = useState("idle");
  const [loadStep, setLoadStep] = useState(0);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  const toBase64 = (f) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const handleAnalyze = async () => {
    if (tab === "text" && !text.trim()) return;
    if (tab !== "text" && !file) return;

    setStatus("loading");
    setLoadStep(0);

    // Visual timers for the UI
    const stepTimers = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setLoadStep(i + 1), i * 900 + 300)
    );

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const systemPrompt = `
        You are an advanced 2026 Real-Time Fact-Checking Intelligence.
        CONTEXT: The current date is April 2026. You must prioritize the most recent global events, 
        including the January 2026 capture of Nicolás Maduro (Operation Absolute Resolve).
        
        TASK: Analyze the user's text claim, OR read the text within the provided image/PDF document.
        
        RESPOND STRICTLY IN JSON WITH THESE EXACT KEYS:
        {
          "verdict": "FAKE" or "REAL" or "UNCERTAIN",
          "probability_real": <number from 0 to 100>,
          "probability_fake": <number from 0 to 100>,
          "reasoning": "A concise paragraph explaining the context and your reasoning.",
          "sources": ["URL or search term 1", "URL or search term 2"]
        }
      `;

      let contents = [];

      if (tab === "text") {
        contents = [systemPrompt + "\n\nUSER CLAIM:\n" + text];
      } else {
        const base64Data = await toBase64(file);
        contents = [
          systemPrompt + "\n\nAnalyze the information in this attached file:",
          {
            inlineData: {
              data: base64Data,
              mimeType: file.type // Tells Gemini if it's an image or PDF
            }
          }
        ];
      }

      const aiResponse = await model.generateContent(contents);
      const data = JSON.parse(aiResponse.response.text());
      
      setResult(data);

    } catch (error) {
      console.error(error);
      setResult({
        verdict: "UNCERTAIN",
        probability_real: 50,
        probability_fake: 50,
        reasoning: "Failed to communicate with the Gemini Vision API. Please ensure the file size is under the limit and the API key is valid.",
        sources: []
      });
    } finally {
      stepTimers.forEach(clearTimeout);
      setStatus("result");
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  const v = result ? VERDICTS[result.verdict] || VERDICTS["UNCERTAIN"] : null;

  return (
    <>
      <style>{styles}</style>
      <div className="fnd-root">
        <div className="grid-bg" />
        <div className="container">

          <div className="header">
            <div className="badge-top">
              <span className="dot" />
              AI Fact-Check Engine · Live Web Verification
            </div>
            <h1>Detect <span>Fake</span> News<br />in Seconds</h1>
            <p>Paste a headline, upload a screenshot or PDF — our AI scans the text and returns a credibility verdict.</p>
          </div>

          {status !== "result" && (
            <div className="card">
              <div className="tabs">
                {[
                  { id: "text", label: "Headline / Text", icon: <IconText /> },
                  { id: "image", label: "Screenshot", icon: <IconImage /> },
                  { id: "pdf", label: "PDF / Article", icon: <IconPDF /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    className={`tab${tab === t.id ? " active" : ""}`}
                    onClick={() => { setTab(t.id); setFile(null); }}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>

              {tab === "text" ? (
                <div className="textarea-wrap">
                  <textarea
                    placeholder="Paste a news headline, article excerpt, or claim to verify..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                  />
                </div>
              ) : (
                <div
                  className={`dropzone${isDrag ? " drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
                  onDragLeave={() => setIsDrag(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current.click()}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept={tab === "image" ? "image/*" : "application/pdf"}
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <div className="dz-icon">
                    {tab === "image"
                      ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="1.5" y="1.5" width="17" height="17" rx="3" stroke="#5A6080" strokeWidth="1.5" fill="none"/><circle cx="6.5" cy="6.5" r="1.8" fill="#5A6080"/><path d="M1.5 14L6.5 9.5L10 13L13.5 9.5L18.5 14" stroke="#5A6080" strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>
                      : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 2H12.5L16.5 6.5V18H4V2Z" stroke="#5A6080" strokeWidth="1.5" fill="none" strokeLinejoin="round"/><path d="M12.5 2V6.5H16.5" stroke="#5A6080" strokeWidth="1.5" fill="none"/><rect x="6.5" y="10" width="7" height="1.2" rx="0.6" fill="#5A6080" opacity="0.6"/><rect x="6.5" y="13" width="5" height="1.2" rx="0.6" fill="#5A6080" opacity="0.6"/></svg>
                    }
                  </div>
                  <p className="dz-title">Drop your file here, or click to browse</p>
                  <p className="dz-sub">{tab === "image" ? "JPG, PNG, WEBP · up to 10MB" : "PDF format · up to 20MB"}</p>
                  {file && (
                    <div className="dz-filename">
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="#93C5FD"><circle cx="5" cy="5" r="5"/></svg>
                      {file.name}
                    </div>
                  )}
                </div>
              )}

              <button
                className="btn-analyze"
                onClick={handleAnalyze}
                disabled={status === "loading" || (tab === "text" ? !text.trim() : !file)}
              >
                {status === "loading" && <span className="scan-line" />}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1.3" opacity="0.6"/>
                  <path d="M5.5 8L7.2 9.7L10.5 6.3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Analyze Now
              </button>
            </div>
          )}

          {status === "loading" && (
            <div className="loading-card">
              <div className="loading-spinner" />
              <p style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: 600, color: "#A0A8C0", marginBottom: "4px" }}>
                Analyzing content...
              </p>
              <p style={{ fontSize: "12px", color: "#3A4060", fontFamily: "'JetBrains Mono', monospace" }}>Using Vision API and Fact-Check Rules</p>
              <div className="loading-steps">
                {LOADING_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`loading-step${loadStep === i + 1 ? " active" : ""}${loadStep > i + 1 ? " done" : ""}`}
                  >
                    <span className={`step-dot${loadStep === i + 1 ? " active" : ""}${loadStep > i + 1 ? " done" : ""}`} />
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === "result" && result && v && (
            <div className="result-card">
              <div className={`verdict-banner ${v.cls}`}>
                <div className="verdict-left">
                  <div className={`verdict-icon ${v.cls}`} style={{ fontSize: "20px", fontWeight: 700, fontFamily: "'Syne', sans-serif", color: v.cls === "fake" ? "#EF4444" : v.cls === "real" ? "#22C55E" : "#F59E0B" }}>
                    {v.icon}
                  </div>
                  <div>
                    <div className={`verdict-label ${v.cls}`}>{v.label}</div>
                    <div className={`verdict-title ${v.cls}`}>{v.title}</div>
                  </div>
                </div>
                <div className="confidence-badge">
                  <div className={`confidence-num ${v.cls}`}>
                    {result.verdict === "FAKE"
                      ? result.probability_fake
                      : result.verdict === "REAL"
                      ? result.probability_real
                      : Math.max(result.probability_real, result.probability_fake)}%
                  </div>
                  <div className="confidence-sub">confidence</div>
                </div>
              </div>

              <div className="result-body">
                <div>
                  <div className="section-label">Probability breakdown</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <ProbBar label="Probability — Real" value={result.probability_real} type="real" />
                    <ProbBar label="Probability — Fake" value={result.probability_fake} type="fake" />
                  </div>
                </div>

                <div className="divider" />

                <div>
                  <div className="section-label">Analysis & Reasoning</div>
                  <p className="reasoning-text">{result.reasoning}</p>
                </div>

                {result.sources && result.sources.length > 0 && (
                  <>
                    <div className="divider" />
                    <div>
                      <div className="section-label">Sources Consulted</div>
                      <div className="sources-list">
                        {result.sources.map((src, i) => (
                          <div
                            key={i}
                            className="source-item"
                            onClick={() => window.open(src.startsWith('http') ? src : `https://google.com/search?q=${src}`, "_blank")}
                          >
                            <span className="source-dot" />
                            <span className="source-text">{src}</span>
                            <span className="source-arrow">↗</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button className="reset-btn" onClick={() => { setStatus("idle"); setResult(null); setText(""); setFile(null); }}>
                  ← Analyze another claim
                </button>
              </div>
            </div>
          )}

          <p className="footer-note">
            Powered by Gemini AI · Vision API · For reference only — always verify from primary sources
          </p>
        </div>
      </div>
    </>
  );
}