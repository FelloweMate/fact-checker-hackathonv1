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

      const prompt = `You are an expert fact-checking system. Analyze the user's claim and respond strictly in JSON format with the following keys:
      - "status": A short string (e.g., "Likely Misinformation", "Verified Fact", "Unverified")
      - "probability_real": An integer from 0 to 100
      - "probability_fake": An integer from 0 to 100
      - "analysis": A detailed paragraph explaining the reasoning, citing historical or scientific facts.
      
      User Claim: ${claim}`;

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