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

async function callGeminiWithRetry(requestData, opts = {}) {
  const { assistantName, prompt } = opts || {};
  if (assistantName && prompt) {
    const key = cacheKey(assistantName, prompt);
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const maxAttempts = 5;
  let delay = 500;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await axios.post(process.env.GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        requestData,
        { headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, timeout: 30000 }
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

    // ✅ Gemini API Setup
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        type: "general",
        userinput: command,
        response: "API key is missing or not configured.",
        redirectUrl: null
      };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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

    const requestData = {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

    let result;
    try {
      result = await callGeminiWithRetry(requestData, { assistantName, prompt: command });
    } catch (apiErr) {
      if (apiErr && apiErr.status === 429) {
        console.error('Gemini API rate limit:', apiErr.body || apiErr.message);
        return { type: 'general', userinput: command, response: 'Gemini API error: Quota exceeded. Please try again later.', redirectUrl: null };
      }
      console.error('Gemini API error:', apiErr?.response?.status || apiErr?.status || apiErr?.message, apiErr?.response?.data || apiErr?.body || apiErr);
      return { type: 'general', userinput: command, response: 'Gemini API error: ' + (apiErr?.response?.data?.error?.message || apiErr?.message || 'Unknown error'), redirectUrl: null };
    }

    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return {
        type: "general",
        userinput: command,
        response: "Didn't receive a proper response from Gemini.",
        redirectUrl: null
      };
    }

    let jsonStr = rawText.trim();
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    jsonStr = jsonStr.replace(/^\s*json\s*/i, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (err) {
      // Try to extract JSON from text if possible
      const fallbackMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (fallbackMatch) {
        try {
          parsed = JSON.parse(fallbackMatch[0]);
        } catch {
          return {
            type: "general",
            userinput: command,
            response: "Sorry, I couldn't understand the response. Please try again.",
            redirectUrl: null
          };
        }
      } else {
        return {
          type: "general",
          userinput: command,
          response: "Sorry, I couldn't understand the response. Please try again.",
          redirectUrl: null
        };
      }
    }

    return {
      type: parsed.type || "general",
      userinput: parsed.userinput || command,
      response: parsed.response || "I'm not sure how to respond to that.",
      redirectUrl: parsed.redirectUrl || parsed.redirectTo || null
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
