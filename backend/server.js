// Import necessary modules
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001; // Use port 3001 for the backend

// Configure Google Generative AI
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey) {
    console.error("FATAL ERROR: Gemini API Key not found in .env file.");
    // process.exit(1); // Optional: exit if key is essential and missing
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Or other suitable model

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable parsing JSON request bodies

// Perspective API endpoint and key
const perspectiveApiKey = process.env.PERSPECTIVE_API_KEY; // Declare perspectiveApiKey here
const PERSPECTIVE_API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${perspectiveApiKey}`;

// Define thresholds for triggering AI commentary
// Adjust these thresholds as needed 
const COMMENTARY_THRESHOLDS = {
    'TOXICITY': 0.5,
    'SEVERE_TOXICITY': 0.5,
    'THREAT': 0.5,
    'INSULT': 0.5,
    'IDENTITY_ATTACK': 0.5
};

// Define the analysis endpoint
app.post('/analyze', async (req, res) => {
    const { text } = req.body; // Get text from request body

    if (!text) {
        return res.status(400).json({ error: 'Text is required for analysis.' });
    }

    if (!perspectiveApiKey) {
         console.error('Perspective API key is missing.');
         return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    // Check for Gemini API key early if needed
    if (!geminiApiKey) {
        console.warn('Gemini API key is missing. AI commentary will be unavailable.');
// Decide if this should be a hard error or just disable the feature
        // return res.status(500).json({ error: 'Server configuration error: Gemini API key missing.' });
    }

    let perspectiveScores = null;
    let aiCommentary = null; // Variable to hold Gemini's response

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
        perspectiveScores = perspectiveResponse.data.attributeScores;

// --- Stage 2: Conditionally Call Gemini AI ---
        let shouldComment = false;
// Collect scores exceeding thresholds for the prompt          

let highScores = {}; // Collect scores exceeding thresholds for the prompt

        for (const attr in COMMENTARY_THRESHOLDS) {
            if (perspectiveScores[attr] && perspectiveScores[attr].summaryScore.value >= COMMENTARY_THRESHOLDS[attr]) {
                shouldComment = true;
                highScores[attr] = perspectiveScores[attr].summaryScore.value.toFixed(3); // Format score
            }
        }

        if (shouldComment && geminiApiKey) {
            console.log('Thresholds met. Requesting AI commentary...');
            try {
                const prompt = `You are analyzing a potentially harmful text message addressed to a teenager who is a potential victim of cyberbullying.
Original Message: "${text}"

Analysis Scores (likelihood): ${JSON.stringify(highScores)}

Based ONLY on the message and scores provided, please do the following:
Answer in whatever language the message is written in.
Start your response directly with the analysis, without any preamble or introduction.
Also, use a warm language. Try not to sound too robotic but more humane and empathetic.
1. Provide a brief, objective comment (1-2 sentences) about the potential nature of the message, referencing the high scores (e.g., "This message shows high likelihood of TOXICITY and INSULT.").
2. Explain in what the message is potentially harmful, but do not use the word "bullying", explain why it is potentially harmful and explain why such message should be dismissed and not taken at heart (try to reassure the recipient).
3. Provide a short list (3-4 bullet points) of general, safe, actionable advice options someone receiving such a message MIGHT consider (e.g., talk to an adult, block sender, keep records, report to platform).
   - Focus on safety and seeking support.
   - DO NOT give medical or legal advice.
   - DO NOT make definitive judgments or diagnoses.
   - DO NOT use overly alarming language.

4. Include this exact disclaimer at the end: "Disclaimer: This is automated analysis & advice for educational purposes. It may not be perfect. Always use your judgment and seek help from trusted humans if you feel unsafe or distressed."

Format your entire response clearly.`;

// --- Call Gemini API ---
                const result = await model.generateContent(prompt);
                const response = await result.response;
                aiCommentary = response.text(); // Get the generated text
                console.log('Received AI commentary.');

            } catch (geminiError) {
                console.error('Error calling Gemini API:', geminiError);
// Decide how to handle: Proceed without commentary or return an error?
                // For this exercise, we'll proceed but log the error.
                aiCommentary = "Error generating AI commentary."; // Indicate failure
            }

        } else if (shouldComment && !geminiApiKey) { // <<< CORRECTED LINE
            console.log('Thresholds met, but Gemini API key missing. Skipping AI commentary.'); // <<< CORRECTED LINE
        } // <<< CORRECTED LINE
        
        res.json({
// Include commentary if generated, otherwise null or error message               perspectiveScores: perspectiveScores, // Always include perspective scores
            aiCommentary: aiCommentary // Include commentary if generated, otherwise null or error message
        });

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
    if (!perspectiveApiKey) console.warn("Warning: Perspective API Key not found in .env. Perspective API calls will fail.");
    if (!geminiApiKey) console.warn("Warning: Gemini API Key not found in .env. AI Commentary feature disabled.");
});