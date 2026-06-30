import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey !== 'your_gemini_api_key_here' && apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    const { message, currentDate } = await req.json();

    if (!genAI) {
      return NextResponse.json({ 
        action: "message", 
        response: "I'm running in Local Mock Mode right now, so I can't extract tasks. Please add a Gemini API key to .env.local!" 
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
      You are Priora, an elite productivity assistant.
      The user is chatting with you. The current date and time is ${currentDate}.
      
      Read the user's message: "${message}"

      If the user is asking you to add, create, or remind them about a task, you MUST extract the details and return a JSON object with this exact structure:
      {
        "action": "create_task",
        "task": {
          "title": "A concise title",
          "category": "General", // or "Work", "Coding"
          "priority": "Medium", // or "Low", "High"
          "est": "Est. 1h",
          "isCritical": false,
          "deadline": "YYYY-MM-DDTHH:MM" // Extract the date/time they mentioned. If they didn't specify a time, default to 17:00 (5 PM). Format EXACTLY as YYYY-MM-DDTHH:MM.
        },
        "response": "A friendly confirmation message, e.g. 'I've added the meeting to your tasks!'"
      }

      If the user is NOT asking to create a task, but just asking a question or chatting, return:
      {
        "action": "message",
        "response": "Your helpful response here."
      }

      Do NOT wrap your response in markdown formatting like \`\`\`json. Return ONLY the raw JSON string.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error in Chat API route:', error);
    return NextResponse.json({ 
      action: "message", 
      response: "Oops, my circuits got tangled. Could you try asking that again?" 
    });
  }
}
