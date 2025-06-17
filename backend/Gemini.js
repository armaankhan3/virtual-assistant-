import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Load .env if not already loaded (for local dev)
if (typeof process !== 'undefined' && process.env) {
  if (!process.env.GEMINI_API_URL || !process.env.GEMINI_API_KEY) {
    try { require('dotenv').config(); } catch (e) { console.log('dotenv not available'); }
  }
}

const geminiResponse = async (command, assistantName, userName = "Unknown") => {
  try {
    // Validate input
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

    // --- Get API key from environment ---
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key is missing or not set properly');
      return {
        type: "general",
        userinput: command,
        response: "API key is not configured properly.",
        redirectUrl: null
      };
    }

    // Use the correct Gemini API endpoint (using gemini-2.0-flash as per your config)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // Simplified prompt that's more likely to work
    const systemPrompt = `You are a virtual assistant named ${assistantName} created by ${userName}.

    Respond with ONLY a JSON object in this exact format:
    {
      "type": "general",
      "userinput": "${command}",
      "response": "your response here",
      "redirectUrl": "https://example.com" // If the user asks to open a website or app, always include the correct URL here. If you don't know the URL, set this to null.
    }

    The user said: "${command}"

    Provide a helpful response. If they ask who created you, say you were created by ${userName}.
    If the user asks to open a website or app, always include the correct URL in the 'redirectUrl' field. If you don't know the URL, set it to null. Only respond with the JSON object, nothing else.`;

    console.log('Sending request to Gemini API...');
    console.log('API URL:', apiUrl.replace(apiKey, 'HIDDEN_KEY'));
    console.log('Command:', command);

    try {
      const requestData = {
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      console.log('Request data:', JSON.stringify(requestData, null, 2));

      const result = await axios.post(apiUrl, requestData, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000 // Increased timeout
      });

      console.log('Gemini API response status:', result.status);
      console.log('Gemini API response data:', result.data);

      // Extract response text from Gemini's response structure
      const rawText = result?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        console.error('No text found in Gemini response:', result.data);
        return {
          type: "general",
          userinput: command,
          response: "Sorry, I didn't get a valid response from the AI service.",
          redirectUrl: null
        };
      }

      console.log('Raw response text:', rawText);

      // Try to extract and parse JSON
      let jsonStr = rawText.trim();
      
      // Remove markdown code block if present
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }

      // Remove any leading "json" text
      jsonStr = jsonStr.replace(/^\s*json\s*/i, '').trim();

      let parsed;
      try {
        parsed = JSON.parse(jsonStr);
        console.log('Parsed JSON response:', parsed);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        console.error("Raw text was:", rawText);
        
        // Fallback: create a response manually
        return {
          type: "general",
          userinput: command,
          response: rawText, // Use the raw response as fallback
          redirectUrl: null
        };
      }

      // Validate the parsed response structure
      if (!parsed || typeof parsed !== 'object') {
        console.error('Invalid response structure:', parsed);
        return {
          type: "general",
          userinput: command,
          response: "I received an invalid response format.",
          redirectUrl: null
        };
      }

      // Ensure required fields exist
      const validResponse = {
        type: parsed.type || "general",
        userinput: parsed.userinput || command,
        response: parsed.response || "I'm not sure how to respond to that.",
        redirectUrl: parsed.redirectUrl || parsed.redirectTo || null
      };

      console.log('Final response:', validResponse);
      return validResponse;

    } catch (error) {
      console.error("Gemini API error details:");
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Status:", error.response.status);
        console.error("Status text:", error.response.statusText);
        console.error("Response data:", error.response.data);
        console.error("Response headers:", error.response.headers);
        
        // Handle specific error cases
        if (error.response.status === 403) {
          return {
            type: "general",
            userinput: command,
            response: "API access forbidden. Please check your API key.",
            redirectUrl: null
          };
        } else if (error.response.status === 429) {
          return {
            type: "general",
            userinput: command,
            response: "Too many requests. Please try again later.",
            redirectUrl: null
          };
        } else if (error.response.status === 400) {
          return {
            type: "general",
            userinput: command,
            response: "Bad request. Please check the input format.",
            redirectUrl: null
          };
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Request made but no response received:", error.request);
      } else {
        // Something happened in setting up the request
        console.error("Error setting up request:", error.message);
      }
      
      console.error("Full error:", error);
      
      return {
        type: "general",
        userinput: command,
        response: "Sorry, I'm having trouble connecting to the AI service right now.",
        redirectUrl: null
      };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      type: "general",
      userinput: command,
      response: "Sorry, I couldn't process your request. Please try again later.",
      redirectUrl: null
    };
  }
};

export default geminiResponse;