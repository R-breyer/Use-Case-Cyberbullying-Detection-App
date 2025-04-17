import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Garde ton CSS custom ici

function App() {
  const [inputText, setInputText] = useState('');
  const [analysisResults, setAnalysisResults] = useState(null);
  // --- NEW: State for AI commentary ---
  const [aiCommentary, setAiCommentary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (event) => {
      setInputText(event.target.value);
  };

  const analyzeText = async () => {
    if (!inputText.trim()) {
        setError('Please enter some text to analyze.');
        setAnalysisResults(null);
        setAiCommentary(null); // Clear previous commentary
        return;
    }

        setIsLoading(true);
        setError(null);
        setAnalysisResults(null);
        setAiCommentary(null); // Clear previous commentary

        try {
          const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/analyze';
          const response = await axios.post(backendUrl, {
              text: inputText
          });

          // --- UPDATED: Extract both scores and commentary ---
          setAnalysisResults(response.data.perspectiveScores);
          setAiCommentary(response.data.aiCommentary); // Will be null if not generated

      } catch (err) {
          console.error("Error analyzing text:", err);
          const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';
          setError(`Analysis failed: ${errorMessage}`);
          setAnalysisResults(null);
          setAiCommentary(null);
      } finally {
          setIsLoading(false);
      }
  };

    const formatScore = (score) => {
        return (score * 100).toFixed(2) + '%';
    };

    // Définition simple des attributs
    const attributeDescriptions = {
        TOXICITY: "Contenu globalement agressif ou haineux.",
        SEVERE_TOXICITY: "Toxicité extrême, particulièrement violente.",
        INSULT: "Utilisation d’insultes ou de langage dégradant.",
        PROFANITY: "Langage vulgaire ou inapproprié.",
        THREAT: "Contenu perçu comme une menace.",
        IDENTITY_ATTACK: "Attaque ciblée contre une identité (genre, origine, etc.).",
        FLIRTATION: "Contenu à connotation romantique ou séductrice.",
        SEXUALLY_EXPLICIT: "Contenu sexuellement explicite."
    };

    return (
      <div className="App">
          <h1>Cyberbullying Analysis Tool (with AI Commentary - Practice)</h1>
          <p>Paste messages below to analyze them using the Perspective API. If scores are high, AI commentary may be generated.</p>

          <textarea
              rows="10"
              cols="60"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Paste your messages here..."
          />
          <br />
          <button onClick={analyzeText} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Analyze Text'}
          </button>

          {error && <div className="error-message">{error}</div>}

          {/* Display Perspective Scores */}
          {analysisResults && (
              <div className="results">
                  <h2>Perspective API Scores:</h2>
                  <ul>
                        {Object.entries(analysisResults).map(([attribute, data]) => (
                            <li key={attribute}>
                                <span
                                    className="tooltip"
                                    data-tooltip={attributeDescriptions[attribute] || 'Description not available'}
                                >
                                    {attribute}
                                </span>: {formatScore(data.summaryScore.value)}
                            </li>
                        ))}
                    </ul>
                  <p><em>NNote : Les scores indiquent la probabilité qu’un lecteur perçoive le message comme contenant cet attribut. 
                  Les définitions sont contextuelles et peuvent varier. Plusieurs attributs sont à considérer pour évaluer une situation de harcèlement.</em></p>
              </div>
          )}

          {/* --- NEW: Display AI Commentary --- */}
          {aiCommentary && (
              <div className="ai-commentary results"> {/* Optional: Add specific class */}
                  <h2>AI Generated Commentary & Advice:</h2>
                  {/* Pre-wrap preserves whitespace/line breaks from the AI response */}
                  <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'inherit', fontSize: 'inherit' }}>
                      {aiCommentary}
                  </pre>
                   {/* You might already have the disclaimer within the AI response based on the prompt,
                       but adding one here too reinforces the message */}
                  <p style={{marginTop: '10px', fontWeight: 'bold', color: '#555'}}>
                       Reminder: This AI commentary is for educational practice. Always rely on human judgment and seek help from trusted individuals.
                  </p>
              </div>
          )}

      </div>
  );
}

export default App;
