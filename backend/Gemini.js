import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

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

    const result = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    const rawText = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
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
    } catch {
      return {
        type: "general",
        userinput: command,
        response: rawText,
        redirectUrl: null
      };
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
