import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey !== 'your_gemini_api_key_here' && apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    const { tasks, targetFocusHours, currentDate } = await req.json();

    const pendingTasks = tasks.filter((t: any) => t.status !== "done");

    if (!genAI) {
      const half = Math.ceil(pendingTasks.length / 2);
      return NextResponse.json({ 
        summary: "I'm running in Local Mock Mode right now. Add a Gemini API key to your .env.local file to generate an AI plan!",
        morning: pendingTasks.slice(0, half).map((t: any) => t.id),
        afternoon: pendingTasks.slice(half).map((t: any) => t.id),
        evening: []
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    if (pendingTasks.length === 0) {
      return NextResponse.json({
        summary: "You have no pending tasks for today! Great job! 🎉 Take a well-deserved break or add some new goals.",
        suggestedOrder: []
      });
    }

    const prompt = `
      You are Priora, an elite productivity assistant.
      The current date and time is ${currentDate}.
      
      The user wants you to generate a "Daily Plan" based on their current pending tasks and their target focus hours for today (${targetFocusHours} hours).
      
      Here are the pending tasks (in JSON format):
      ${JSON.stringify(pendingTasks)}

      Your job is to analyze these tasks (looking at priority, isCritical, and deadline) and distribute them intelligently across Morning, Afternoon, and Evening blocks based on urgency and typical energy levels.
      
      You MUST return a JSON object with this exact structure:
      {
        "summary": "A highly motivational and concise summary of the plan (2-3 sentences max). Acknowledge their target focus hours if relevant.",
        "morning": [ 
          // An array of the task IDs you suggest they tackle in the morning block. MUST be numbers.
        ],
        "afternoon": [ 
          // An array of the task IDs for the afternoon block. MUST be numbers.
        ],
        "evening": [ 
          // An array of the task IDs for the evening block. MUST be numbers.
        ]
      }

      Do NOT wrap your response in markdown formatting like \`\`\`json. Return ONLY the raw JSON string.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    // Fallback if AI didn't return an array for some reason
    if (!Array.isArray(parsed.morning)) {
      parsed.morning = pendingTasks.map((t: any) => t.id);
      parsed.afternoon = [];
      parsed.evening = [];
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error in Plan API route:', error);
    return NextResponse.json({ 
      summary: "Oops, my circuits got tangled while trying to generate a plan. Just tackle the most urgent task first!",
      morning: [],
      afternoon: [],
      evening: []
    }, { status: 500 });
  }
}
