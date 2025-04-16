// Import necessary modules
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001; // Use port 3001 for the backend

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing JSON request bodies

// Perspective API endpoint and key
const PERSPECTIVE_API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.PERSPECTIVE_API_KEY}`;

// Define the analysis endpoint
app.post('/analyze', async (req, res) => {
    const { text } = req.body; // Get text from request body

    if (!text) {
        return res.status(400).json({ error: 'Text is required for analysis.' });
    }

    if (!process.env.PERSPECTIVE_API_KEY) {
         console.error('Perspective API key is missing.');
         return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    try {
        const perspectiveRequest = {
            comment: { text: text },
            languages: ['en'], // Specify language(s) if known, otherwise Perspective tries to detect
            requestedAttributes: {
                // --- Attributes potentially relevant to cyberbullying ---
                'TOXICITY': {},
                'SEVERE_TOXICITY': {},
                'IDENTITY_ATTACK': {},
                'INSULT': {},
                'PROFANITY': {},
                'THREAT': {},
                // --- You can add/remove attributes as needed ---
                // 'SPAM': {},
                // 'ADULT': {},
                // 'SEXUALLY_EXPLICIT': {},
                // 'OBSCENE': {},
                // 'ATTACK_ON_AUTHOR': {}, // May be relevant depending on context
                // 'LIKELY_TO_REJECT': {} // Might correlate with negative interactions
            }
        };

        console.log('Sending request to Perspective API...');
        const perspectiveResponse = await axios.post(PERSPECTIVE_API_URL, perspectiveRequest);
        console.log('Received response from Perspective API.');

        // Send the analysis results back to the frontend
        res.json(perspectiveResponse.data);

    } catch (error) {
        console.error('Error calling Perspective API:', error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({
            error: 'Failed to analyze text with Perspective API.',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});