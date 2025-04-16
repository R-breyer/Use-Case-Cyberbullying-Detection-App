import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Garde ton CSS custom ici

function App() {
    const [inputText, setInputText] = useState('');
    const [analysisResults, setAnalysisResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    const analyzeText = async () => {
        if (!inputText.trim()) {
            setError('Please enter some text to analyze.');
            setAnalysisResults(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResults(null);

        try {
            const response = await axios.post('http://localhost:3001/analyze', {
                text: inputText
            });
            setAnalysisResults(response.data.attributeScores);
        } catch (err) {
            console.error("Error analyzing text:", err);
            const errorMessage = err.response?.data?.error || err.message || 'An unknown error occurred.';
            setError(`Analysis failed: ${errorMessage}`);
            setAnalysisResults(null);
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
            <h1>Cyberbullying Analysis Tool</h1>
            <p>Paste messages below to analyze them using the Perspective API.</p>

            <textarea
                rows="10"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Paste your messages here..."
            />
            <button onClick={analyzeText} disabled={isLoading}>
                {isLoading ? 'Analyzing...' : 'Analyze Text'}
            </button>

            {error && <div className="error-message">{error}</div>}

            {analysisResults && (
                <div className="results">
                    <h2>Analysis Results:</h2>
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
                    <p><em>
                        Note : Les scores indiquent la probabilité qu’un lecteur perçoive le message comme contenant cet attribut. 
                        Les définitions sont contextuelles et peuvent varier. Plusieurs attributs sont à considérer pour évaluer une situation de harcèlement.
                    </em></p>
                </div>
            )}
        </div>
    );
}

export default App;
