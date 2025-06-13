import axios from 'axios';

const geminiResponse = async (command, assistantName, userName = "Unknown") => {
  const apiUrl = process.env.GEMINI_API_URL;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiUrl || !apiKey) throw new Error('GEMINI_API_URL or GEMINI_API_KEY is not set in environment variables');

  const systemPrompt = `You are a helpful AI assistant named ${assistantName}, created by ${userName}.
Your task is to provide accurate and helpful responses to user queries.
When the user asks to open any app, website or platform, respond with proper redirect URL inside a JSON object.

Output format:
{
  "type": "general" | "google_search" | "youtube_search" | "website_open" | "calculator_open" | "weather_show" | "get_time" | "get_date" | "get_day",
  "userinput": "<user input after removing your name>",
  "response": "<short spoken response>",
  "redirectUrl": "<url to open if applicable>"
}

Instructions:
- Use type "website_open" for commands like "open Instagram", "open Facebook", "open YouTube", etc.
- Always include correct redirectUrl if user wants to open any app or website.
- Use proper public URL for known platforms. Example:
  Instagram -> https://www.instagram.com
  Facebook -> https://www.facebook.com
  YouTube -> https://www.youtube.com
  Google -> https://www.google.com
  Gmail -> https://mail.google.com
  Twitter -> https://twitter.com
  LinkedIn -> https://www.linkedin.com
- If website is unknown, just reply "Sorry, I can't open that site."

Now the user input: ${command}
`;

  const fullUrl = apiUrl.includes('?') ? `${apiUrl}&key=${apiKey}` : `${apiUrl}?key=${apiKey}`;

  try {
    const result = await axios.post(
      fullUrl,
      {
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const rawResponse = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const cleaned = rawResponse
      .replace(/^```json/g, '')
      .replace(/^```/g, '')
      .replace(/```$/g, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      console.log("Gemini Parsed Response:", parsed);
      return parsed;
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError, cleaned);
      return {
        type: "general",
        userinput: command,
        response: "Sorry, I couldn't understand the response.",
      };
    }
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    return {
      type: "general",
      userinput: command,
      response: "Sorry, something went wrong while processing.",
    };
  }
};

export default geminiResponse;
