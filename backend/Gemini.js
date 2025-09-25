import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
import fetch from 'node-fetch';

// Simple in-memory cache for recent prompts (keyed by assistant+prompt)
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

function cacheKey(assistant, prompt) {
  return `${assistant || 'anon'}::${String(prompt || '')}`;
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// === Claude (Anthropic) support ===
async function callClaudeWithRetry(promptText, opts = {}) {
  let maxAttempts = opts.maxAttempts || 4;
  let delay = 500;
  const apiKey = process.env.CLAUDE_API_KEY;
  const model = process.env.CLAUDE_MODEL || 'claude-sonnet-3.5';
  if (!apiKey) throw new Error('CLAUDE_API_KEY not configured');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const body = {
        model,
        prompt: promptText,
        max_tokens_to_sample: 1000,
        temperature: 0.7,
      };

      const timeout = opts.timeout || (opts.maxAttempts === 1 ? 5000 : 30000);
      const res = await axios.post(
        process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/complete',
        body,
        { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout }
      );

      if (!res || !res.data) throw new Error('Empty Claude response');

      // Anthropic responses typically include `completion` or `output` text fields
      const text = res.data.completion || res.data.output || res.data.output_text || (res.data?.choices && res.data.choices[0]?.text) || '';
      return { candidates: [{ content: { parts: [ { text } ] } }] };
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      if (err && err.response && err.response.status === 429) {
        // back off more for rate limits
        await sleep(delay * 6);
      } else {
        await sleep(delay);
      }
      delay *= 2;
    }
  }
}

// === OpenAI support ===
async function callOpenAIWithRetry(systemPrompt, userPrompt, opts = {}) {
  let maxAttempts = opts.maxAttempts || 4;
  let delay = 500;
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const body = {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1200,
        temperature: 0.7
      };

      const timeout = opts.timeout || (opts.maxAttempts === 1 ? 5000 : 30000);
      const res = await axios.post(
        process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions',
        body,
        { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout }
      );

      if (!res || !res.data) throw new Error('Empty OpenAI response');
      const text = res.data.choices?.[0]?.message?.content || res.data.choices?.[0]?.text || '';
      return { candidates: [{ content: { parts: [ { text } ] } }] };
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      if (err && err.response && err.response.status === 429) {
        await sleep(delay * 6);
      } else {
        await sleep(delay);
      }
      delay *= 2;
    }
  }
}

async function callGeminiWithRetry(requestData, opts = {}) {
  const { assistantName, prompt } = opts || {};
  let maxAttempts = opts.maxAttempts || 5;
  if (assistantName && prompt) {
    const key = cacheKey(assistantName, prompt);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.data;
    }
  }
  let delay = 500;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const timeout = opts.timeout || (opts.maxAttempts === 1 ? 5000 : 30000);
      const res = await axios.post(process.env.GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        requestData,
        { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, timeout }
      );

      if (res.status === 429) {
        const body = res.data || {};
        const err = new Error('Gemini rate limited (429)');
        err.status = 429; err.body = body; throw err;
      }

      if (!res || !res.data) throw new Error('Empty Gemini response');

      const data = res.data;
      if (assistantName && prompt) {
        const key = cacheKey(assistantName, prompt);
        cache.set(key, { ts: Date.now(), data });
      }
      return data;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      // aggressive backoff for quota issues
      if (err && (err.status === 429 || (err.response && err.response.status === 429))) {
        await sleep(delay * 6);
      } else {
        await sleep(delay);
      }
      delay *= 2;
    }
  }
}

// Load .env fallback
if (typeof process !== 'undefined' && process.env) {
  if (!process.env.GEMINI_API_KEY) {
    try { require('dotenv').config(); } catch (e) { console.log('dotenv not available'); }
  }
}

// ✅ Built-in Command Handler
const handleBuiltInCommand = (command, userName = "User") => {
  const normalized = command.toLowerCase().trim();

  if (normalized.includes("time")) {
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return {
      type: "general",
      userinput: command,
      response: `The current time is ${time}`,
      redirectUrl: null
    };
  }

  if (normalized.includes("date")) {
    const date = new Date().toLocaleDateString('en-IN');
    return {
      type: "general",
      userinput: command,
      response: `Today's date is ${date}`,
      redirectUrl: null
    };
  }

  if (normalized.includes("open youtube")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening YouTube...",
      redirectUrl: "https://www.youtube.com"
    };
  }
  if (normalized.includes("open instagram")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening instagram...",
      redirectUrl: "https://www.instagram.com"
    };
  }
    if (normalized.includes("news")) {
    return {
      type: "action",
      userinput: command,
      response: "Here are the latest news headlines.",
      redirectUrl: "https://news.google.com"
    };
  }

  if (normalized.includes("cricket score")) {
    return {
      type: "action",
      userinput: command,
      response: "Fetching the latest cricket scores...",
      redirectUrl: "https://www.espncricinfo.com"
    };
  }

  if (normalized.includes("google maps") || normalized.includes("location")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Google Maps...",
      redirectUrl: "https://maps.google.com"
    };
  }

  if (normalized.includes("email") || normalized.includes("gmail")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Gmail...",
      redirectUrl: "https://mail.google.com"
    };
  }

  if (normalized.includes("open facebook")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Facebook...",
      redirectUrl: "https://www.facebook.com"
    };
  }

  if (normalized.includes("spotify") || normalized.includes("play music")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Spotify...",
      redirectUrl: "https://open.spotify.com"
    };
  }

  if (normalized.includes("shopping") || normalized.includes("buy")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Amazon for shopping...",
      redirectUrl: "https://www.amazon.in"
    };
  }

  if (normalized.includes("flipkart")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Flipkart...",
      redirectUrl: "https://www.flipkart.com"
    };
  }

  if (normalized.includes("open whatsapp")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening WhatsApp Web...",
      redirectUrl: "https://web.whatsapp.com"
    };
  }

  if (normalized.includes("translate")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Google Translate...",
      redirectUrl: "https://translate.google.com"
    };
  }

  if (normalized.includes("currency rate") || normalized.includes("usd to inr")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening exchange rates...",
      redirectUrl: "https://www.xe.com"
    };
  }

  if (normalized.includes("train status")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening train running status...",
      redirectUrl: "https://enquiry.indianrail.gov.in"
    };
  }

  if (normalized.includes("book ticket") || normalized.includes("irctc")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening IRCTC for train booking...",
      redirectUrl: "https://www.irctc.co.in"
    };
  }

  if (normalized.includes("movie") || normalized.includes("bookmyshow")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening BookMyShow for movie tickets...",
      redirectUrl: "https://in.bookmyshow.com"
    };
  }

  if (normalized.includes("zomato") || normalized.includes("food")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Zomato for food delivery...",
      redirectUrl: "https://www.zomato.com"
    };
  }

  if (normalized.includes("swiggy")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Swiggy...",
      redirectUrl: "https://www.swiggy.com"
    };
  }

  if (normalized.includes("linkedin")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening LinkedIn...",
      redirectUrl: "https://www.linkedin.com"
    };
  }

  if (normalized.includes("resume") || normalized.includes("cv")) {
    return {
      type: "general",
      userinput: command,
      response: "Need help creating a resume? I recommend using Canva or Novoresume.",
      redirectUrl: "https://www.canva.com/resumes"
    };
  }


  if (normalized.includes("open google")) {
    return {
      type: "action",
      userinput: command,
      response: "Opening Google...",
      redirectUrl: "https://www.google.com"
    };
  }

  if (normalized.includes("weather")) {
    return {
      type: "general",
      userinput: command,
      response: "Weather info is not available right now. You can enable a weather API to fetch live data.",
      redirectUrl: null
    };
  }

  if (normalized.includes("joke")) {
    return {
      type: "general",
      userinput: command,
      response: "Why did the computer go to therapy? Because it had too many bytes of emotional baggage!",
      redirectUrl: null
    };
  }

  if (normalized.includes("who created you")) {
    return {
      type: "general",
      userinput: command,
      response: `I was created by Armaan bhai using advanced AI technology.`,
      redirectUrl: null
    };
  }

  return null; // Not a built-in command
};

// Local fallback responder used when Gemini API is unavailable or rate-limited.
const generateLocalReply = (command, assistantName = 'Assistant', userName = 'User') => {
  const normalized = (command || '').trim();
  const lower = normalized.toLowerCase();

  // Greetings
  if (/(^hi\b|^hello\b|introduce|who are you)/i.test(lower)) {
    return {
      type: 'general',
      userinput: command,
      response: `Hello! I'm ${assistantName} — a local assistant running without cloud access. I can create short poems, answer simple questions, evaluate basic math, and open links when asked. What would you like me to do?`,
      redirectUrl: null
    };
  }

  // Time & date
  if (lower.includes('time')) {
    return { type: 'general', userinput: command, response: `The current time is ${new Date().toLocaleTimeString()}`, redirectUrl: null };
  }
  if (lower.includes('date')) {
    return { type: 'general', userinput: command, response: `Today's date is ${new Date().toLocaleDateString()}`, redirectUrl: null };
  }

  // Haiku or short poem
  if (lower.includes('haiku') || /two-? ?line/.test(lower)) {
    // try to extract subject after 'about'
    const m = normalized.match(/about\s+(.+)$/i);
    const subject = m ? m[1].replace(/[\.?]$/, '') : 'autumn';
    // Two-line haiku-like structure (not strict syllable counting)
    const line1 = `${subject.charAt(0).toUpperCase() + subject.slice(1)} steam rises slow,`;
    const line2 = `mug warms hands — morning soft and low.`;
    return { type: 'general', userinput: command, response: `${line1}\n${line2}`, redirectUrl: null };
  }

  if (lower.includes('poem') || lower.includes('compose') || lower.includes('write a')) {
    const m = normalized.match(/about\s+(.+)$/i);
    const subject = m ? m[1].replace(/[\.?]$/, '') : 'life';
    const poem = `Soft winds around ${subject},\nquiet thoughts begin to bloom.\nSmall joys find the day.`;
    return { type: 'general', userinput: command, response: poem, redirectUrl: null };
  }

  // Joke
  if (lower.includes('joke')) {
    return { type: 'general', userinput: command, response: "Why did the programmer quit his job? Because he didn't get arrays (a raise)!", redirectUrl: null };
  }

  // Simple math evaluation (only digits, spaces and +-*/().)
  if (/^[0-9\s+\-*/().^%]+$/.test(normalized)) {
    try {
      // evaluate safely by replacing ^ with ** for exponent
      const expr = normalized.replace(/\^/g, '**');
      // eslint-disable-next-line no-new-func
      const value = Function(`return (${expr})`)();
      return { type: 'general', userinput: command, response: `Result: ${value}`, redirectUrl: null };
    } catch (e) {
      return { type: 'general', userinput: command, response: `I couldn't evaluate that expression.`, redirectUrl: null };
    }
  }

  // If it looks like a 'what/why/how' question, provide a concise general-answer template.
  if (/^(what|who|why|how|when|where)\b/.test(lower)) {
    // Short heuristic answers for common topics
    if (lower.includes('photosynthesis')) {
      return { type: 'general', userinput: command, response: 'Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into sugar and oxygen, powering growth.', redirectUrl: null };
    }
    if (lower.includes('javascript') || lower.includes('node') || lower.includes('express')) {
      return { type: 'general', userinput: command, response: 'JavaScript is a programming language used for web development. Node.js runs JavaScript on the server; Express is a minimal framework for building web APIs.', redirectUrl: null };
    }
    // Generic fallback for questions
    return { type: 'general', userinput: command, response: `I don't have cloud access right now, but here's a concise answer based on common knowledge: ${command}`, redirectUrl: null };
  }

  // Default helpful response: try to satisfy creative / instruction prompts
  if (/^(tell|describe|list|give|generate|create|summarize)\b/.test(lower)) {
    return { type: 'general', userinput: command, response: `Here's a short response to your request: ${command}`, redirectUrl: null };
  }

  // Fallback final note
  return {
    type: 'general',
    userinput: command,
    response: `I can't reach the cloud AI right now, but I received your message: "${command}". Here's a concise helpful note based on built-in knowledge.`,
    redirectUrl: null
  };
};

// ✅ Main Function
const geminiResponse = async (command, assistantName, userName = "Unknown") => {
  try {
    if (!command || typeof command !== 'string' || !command.trim()) {
      return {
        type: "general",
        userinput: command,
        response: "Please provide a valid command.",
        redirectUrl: null
      };
    }

    if (!assistantName || typeof assistantName !== 'string' || !assistantName.trim()) {
      return {
        type: "general",
        userinput: command,
        response: "Assistant name is missing.",
        redirectUrl: null
      };
    }

    // If the command is just the assistant's name (with or without punctuation), do not answer, just listen again
    const normalizedCmd = command.trim().toLowerCase().replace(/[!,.?]/g, '');
    const normalizedName = assistantName.trim().toLowerCase();
    if (normalizedCmd === normalizedName) {
      return {
        type: "listening",
        userinput: command,
        response: "Listening...",
        redirectUrl: null
      };
    }

    // ✅ Check Built-in Commands First
    const builtIn = handleBuiltInCommand(command, userName);
    if (builtIn) return builtIn;

    // Fallback for unknown  hkuhuh hiugig igiugigicommands (before Gemini API)
    if (command.toLowerCase().includes('help')) {
      return {
        type: "general",
        userinput: command,
        response: "You can ask me to open websites, get the time/date, or ask for jokes, news, weather, and more!",
        redirectUrl: null
      };
    }

    // Build the system prompt that asks the model to reply with JSON.
    const systemPrompt = `You are a smart AI virtual assistant named ${assistantName}, created by ${userName}.
Your job is to answer or help execute commands smartly.
Reply ONLY using this JSON format:
{
  "type": "general",
  "userinput": "${command}",
  "response": "your reply here",
  "redirectUrl": "https://example.com" // null if not needed
}
If you’re asked to open any app/website, always add a correct redirectUrl.
Do not say anything outside this JSON.`;

    // Prepare Gemini request payload (if used)
    const geminiRequest = {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

  // Provider selection and failover logic
  // Default to cloud-first: try OpenAI, then Claude, then Gemini, then local fallback.
  // You can override via PREFERRED_AI_PROVIDER env var: 'openai', 'claude', 'gemini', or 'local'.
  const preferred = (process.env.PREFERRED_AI_PROVIDER || 'openai').toLowerCase();
    let result;
    const tryClaude = async () => {
      // For Claude we pass a combined prompt (system + user command)
      const combined = `${systemPrompt}\n\nUser: ${command}\nAssistant:`;
      return await callClaudeWithRetry(combined, { assistantName, prompt: command });
    };

    const tryGemini = async () => {
      return await callGeminiWithRetry(geminiRequest, { assistantName, prompt: command });
    };

    const tryOpenAI = async () => {
      return await callOpenAIWithRetry(systemPrompt, command, { assistantName, prompt: command });
    };

    try {
      // Build ordered provider list based on preference and availability
      const order = [];
      if (preferred === 'openai') order.push('openai','claude','gemini');
      else if (preferred === 'claude') order.push('claude','openai','gemini');
      else order.push('gemini','openai','claude');

      const available = order.filter(p => {
        if (p === 'openai') return !!process.env.OPENAI_API_KEY;
        if (p === 'claude') return !!process.env.CLAUDE_API_KEY;
        if (p === 'gemini') return !!(process.env.GEMINI_API_KEY || process.env.GEMINI_API_URL);
        return false;
      });

      if (available.length === 0) {
        // No cloud providers configured -> local responder
        return generateLocalReply(command, assistantName, userName);
      }

        // Try providers in order with short attempts to avoid long backoffs
        for (const p of available) {
          console.log('[geminiResponse] attempting provider', p);
          console.time(`[provider:${p}]`);
          try {
            if (p === 'openai') {
              result = await tryOpenAI({ maxAttempts: 1, timeout: 5000 });
            } else if (p === 'claude') {
              result = await tryClaude({ maxAttempts: 1, timeout: 5000 });
            } else if (p === 'gemini') {
              result = await tryGemini({ maxAttempts: 1, timeout: 5000 });
            }
            console.timeEnd(`[provider:${p}]`);
            // If a result looks valid, stop
            if (result) break;
          } catch (provErr) {
            console.timeEnd(`[provider:${p}]`);
            console.warn(`[geminiResponse] Provider ${p} failed:`, provErr?.message || provErr);
            // If rate-limited or failed, try next provider quickly
            continue;
          }
        }

      if (!result) {
        // All configured providers failed quickly -> local fallback
        return generateLocalReply(command, assistantName, userName);
      }
    } catch (finalErr) {
      console.error('AI provider chain error:', finalErr);
      return { type: 'general', userinput: command, response: 'AI providers are unavailable. Please try again later.', redirectUrl: null };
    }

    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return {
        type: "general",
        userinput: command,
        response: "Didn't receive a proper response from the AI provider.",
        redirectUrl: null
      };
    }

    // Try to parse JSON output first (models may return JSON fenced in markdown).
    let parsed = null;
    try {
      let jsonStr = rawText.trim();
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonStr = jsonMatch[1].trim();
      jsonStr = jsonStr.replace(/^\s*json\s*/i, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch (err) {
      // If JSON parsing fails, attempt to extract any JSON object embedded in the text
      try {
        const fallbackMatch = rawText.match(/\{[\s\S]*\}/);
        if (fallbackMatch) parsed = JSON.parse(fallbackMatch[0]);
      } catch (e) {
        parsed = null;
      }
    }

    // If we successfully parsed JSON, return structured response
    if (parsed && typeof parsed === 'object') {
      return {
        type: parsed.type || "general",
        userinput: parsed.userinput || command,
        response: parsed.response || "I'm not sure how to respond to that.",
        redirectUrl: parsed.redirectUrl || parsed.redirectTo || null
      };
    }

    // Fallback: providers often return readable plain text — use it directly as the assistant response
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return {
      type: 'general',
      userinput: command,
      response: cleaned || "The AI returned an empty response.",
      redirectUrl: null
    };

  } catch (err) {
    console.error("Gemini error:", err);
    return {
      type: "general",
      userinput: command,
      response: "Sorry, something went wrong. Please try again.",
      redirectUrl: null
    };
  }
};

export default geminiResponse;
