import express from 'express';
import geminiResponse from '../Gemini.js';
// This file handles the Gemini API requests and responses
// It receives commands and assistant names from the frontend, processes them using the Gemini API, and
// returns the response back to the frontend.
// This is a simple Express router that handles POST requests to the /api/gemini endpoint.
const router = express.Router();

router.post('/', async (req, res) => {
  const { command, assistantName } = req.body;
  if (!command || !assistantName) {
    return res.status(400).json({ response: 'Missing command or assistantName.' });
  }
  // Log the incoming request for debugging
  try {
    const result = await geminiResponse(command, assistantName);
    console.log('Gemini API backend response:', result); // Log response to terminal
    res.json(result);
  } catch (err) {
    console.error('Gemini API backend error:', err); // Log error to terminal
    res.status(500).json({ response: 'Internal server error.' });
  }
});

export default router;
