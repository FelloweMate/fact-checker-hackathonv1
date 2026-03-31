import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import './App.css'; 

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

function App() {
  const [claim, setClaim] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeClaim = async () => {
    if (!claim.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
      });

      const prompt = `
  You are an advanced 2026 Real-Time Fact-Checking Intelligence. 
  
  CONTEXT: The current date is April 2026. You must prioritize the most recent global events, 
  including the January 2026 capture of Nicolás Maduro (Operation Absolute Resolve) and 
  subsequent legal proceedings in New York.
  
  TASK:
  1. Analyze the user's claim against the 2026 global landscape.
  2. If a claim was true in 2025 but changed in 2026, you MUST reflect the 2026 reality.
  3. Be clinical, objective, and cite specific entities or operations where possible.
  
  RESPOND STRICTLY IN JSON:
  {
    "status": "Short verdict (e.g., Verified Fact, Debunked, Mixed)",
    "probability_real": 0-100,
    "probability_fake": 0-100,
    "analysis": "A concise paragraph explaining the 2026 context and reasoning."
  }

  USER CLAIM: "${claim}"`;

      const aiResponse = await model.generateContent(prompt);
      const data = JSON.parse(aiResponse.response.text());
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the claim. Please check your API key and connection.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic colors based on whether it is more fake or real
  const isFake = result && result.probability_fake > result.probability_real;
  const themeColor = isFake ? '#ef4444' : '#10b981'; // Red for fake, Green for real
  const bgColor = isFake ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';

  return (
    <div className="app-container">
      <h2 className="header-title">Fact-Checker</h2>
      
      <textarea 
        className="input-area"
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        placeholder="Enter a claim, news headline, or rumor to verify..."
      />
      
      <button 
        className="analyze-btn"
        onClick={analyzeClaim} 
        disabled={loading}
      >
        {loading ? 'Initiating Deep Scan...' : 'Analyze Data'}
      </button>

      {error && <div className="error-msg">{error}</div>}

      {result && (
        <div className="result-card">
          
          <div className="result-header">
            <div>
              <div className="status-badge" style={{ color: themeColor }}>
                {isFake ? '⚠ FAKE NEWS DETECTED' : '✓ FACTUAL STATEMENT'}
              </div>
              <h1 className="status-text" style={{ color: '#fff' }}>{result.status}</h1>
            </div>
            <div className="confidence-score">
              <h1 className="confidence-number" style={{ color: themeColor }}>
                {isFake ? result.probability_fake : result.probability_real}%
              </h1>
              <div className="confidence-label">CONFIDENCE</div>
            </div>
          </div>

          <div style={{ marginBottom: '35px' }}>
            <div className="section-title">Probability Breakdown</div>
            
            <div className="progress-container">
              <div className="progress-labels">
                <span style={{ color: '#10b981' }}>REAL</span>
                <span>{result.probability_real}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${result.probability_real}%`, backgroundColor: '#10b981' }}></div>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-labels">
                <span style={{ color: '#ef4444' }}>FAKE</span>
                <span>{result.probability_fake}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${result.probability_fake}%`, backgroundColor: '#ef4444' }}></div>
              </div>
            </div>
          </div>

          <div>
             <div className="section-title">Analysis & Reasoning</div>
             <div className="analysis-text" style={{ borderLeftColor: themeColor, backgroundColor: bgColor }}>
               {result.analysis}
             </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;