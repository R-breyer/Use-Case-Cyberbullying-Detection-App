import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // You can add some basic styling here

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
        setAnalysisResults(null); // Clear previous results

        try {
            // Make sure this URL matches your backend server address
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

    // Helper function to format score (optional)
    const formatScore = (score) => {
        return (score * 100).toFixed(2) + '%';
    };

    return (
        <div className="App">
            <h1>Cyberbullying Analysis Tool</h1>
            <p>Paste messages below to analyze them using the Perspective API.</p>

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

            {analysisResults && (
                <div className="results">
                    <h2>Analysis Results:</h2>
                    <ul>
                        {Object.entries(analysisResults).map(([attribute, data]) => (
                            <li key={attribute}>
                                <strong>{attribute}:</strong> {formatScore(data.summaryScore.value)}
                                {/* You can add more details from data.spanScores if needed */}
                            </li>
                        ))}
                    </ul>
                    <p><em>Note: Scores represent the probability that a reader would perceive the text as having the given attribute. Higher scores indicate higher likelihood. Defining "cyberbullying" often requires considering multiple attributes and setting appropriate thresholds based on context.</em></p>
                </div>
            )}
        </div>
    );
}

export default App;