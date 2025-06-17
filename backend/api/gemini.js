import express from 'express';
import geminiResponse from '../Gemini.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { command, assistantName } = req.body;
  if (!command || !assistantName) {
    return res.status(400).json({ response: 'Missing command or assistantName.' });
  }
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
