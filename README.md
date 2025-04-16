# Use-Case-Cyberbullying-Detection-App

# Text Analysis App with Perspective API

This project is a simple web application that allows users to paste text messages and analyze them using Google's Perspective API to identify potential signs of toxicity, threat, insult, and other attributes often associated with cyberbullying.

The application consists of:
* A **React** frontend for user interaction (pasting text, viewing results).
* A **Node.js (Express)** backend that acts as a proxy to securely communicate with the Perspective API.

## Features

* Simple textarea input for pasting messages.
* Button to trigger text analysis.
* Communicates with a Node.js backend to query the Perspective API.
* Displays scores for various attributes returned by the Perspective API (e.g., TOXICITY, SEVERE_TOXICITY, THREAT, INSULT).
* Basic loading state and error handling.

## Tech Stack

* **Frontend:** React, Axios
* **Backend:** Node.js, Express.js, Axios, Cors, Dotenv
* **API:** Google Perspective API

## Prerequisites

Before you begin, ensure you have the following installed and set up:

1.  **Node.js and npm (or yarn):** Download and install from [nodejs.org](https://nodejs.org/).
2.  **Git:** For cloning the repository.
3.  **Perspective API Key:**
    * Go to the [Google Cloud Console](https://console.cloud.google.com/).
    * Create a project or select an existing one.
    * Enable the **Perspective Comment Analyzer API** for your project.
    * Create API credentials (generate an API key). **Keep this key secure!**

## Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd perspective-analysis-app
    ```

2.  **Set up the Backend:**
    ```bash
    cd backend
    npm install
    ```
    * Create a `.env` file in the `backend` directory:
        ```
        touch .env
        ```
    * Add your Perspective API key to the `.env` file:
        ```env
        PERSPECTIVE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
        ```
    * **Important Security Note:** Ensure the `.env` file is listed in your `.gitignore` file (create one in the `backend` directory if it doesn't exist) to prevent accidentally committing your secret key.
        ```gitignore
        # .gitignore in backend/
        node_modules
        .env
        ```

3.  **Set up the Frontend:**
    ```bash
    cd ../frontend # Navigate back to the root and then into frontend
    # Or if already in root: cd frontend
    npm install
    ```

## Running the Application

You need to run both the backend and frontend servers concurrently.

1.  **Start the Backend Server:**
    * Open a terminal in the `backend` directory.
    * Run:
        ```bash
        npm start
        # or node server.js
        ```
    * The backend server should start, typically on `http://localhost:3001`.

2.  **Start the Frontend Development Server:**
    * Open a *separate* terminal in the `frontend` directory.
    * Run:
        ```bash
        npm start
        ```
    * This will usually open the application automatically in your default web browser at `http://localhost:3000`. If not, navigate to that URL manually.

## Usage

1.  Open the application in your browser (usually `http://localhost:3000`).
2.  Paste the text message(s) you want to analyze into the text area.
3.  Click the "Analyze Text" button.
4.  Wait for the analysis results to appear below the button. The scores represent the likelihood (as a percentage) that a reader would perceive the text as having the specified attribute.

## Important Considerations

* **API Key Security:** Your Perspective API key is sensitive. **Never** commit it to version control or expose it in the frontend code. The backend proxy approach used here helps protect it.
* **Interpreting Scores:** The scores provided by the Perspective API are probabilities (0.0 to 1.0). They indicate the likelihood that the text exhibits a certain attribute. Defining what constitutes "cyberbullying" is complex and context-dependent. You may need to experiment with different attributes and set appropriate thresholds based on your specific use case. This tool provides data points; it doesn't make definitive judgments.
* **Perspective API Limitations:** Be aware of the API's rate limits and usage quotas. Also, understand that AI models can have biases and may not perfectly capture nuance or context in all situations.
* **Privacy:** Be mindful of privacy concerns when analyzing text, especially if it contains personal information. Ensure compliance with relevant data protection regulations.
* **Development Status:** This is a basic implementation. For production use, consider enhancements like more robust error handling, improved UI/UX, potential rate limiting on the backend, and deployment strategies.

## License

[Optional: Add your chosen license here. MIT is common for open-source projects.]

Example:
This project is licensed under the MIT License - see the LICENSE.md file for details.
