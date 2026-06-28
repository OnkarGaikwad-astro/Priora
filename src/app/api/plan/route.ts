import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey !== 'your_gemini_api_key_here' && apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    const { tasks, targetFocusHours, currentDate } = await req.json();

    if (!genAI) {
      return NextResponse.json({ 
        summary: "I'm running in Local Mock Mode right now. Add a Gemini API key to your .env.local file to generate an AI plan!",
        suggestedOrder: tasks.map((t: any) => t.id)
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Filter out completed tasks so the AI only plans for what's left
    const pendingTasks = tasks.filter((t: any) => t.status !== "done");

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

      Your job is to analyze these tasks (looking at priority, isCritical, and deadline) and determine the optimal order they should tackle them in today.
      
      You MUST return a JSON object with this exact structure:
      {
        "summary": "A highly motivational and concise summary of the plan (2-3 sentences max). Acknowledge their target focus hours if relevant.",
        "suggestedOrder": [ 
          // An array of the task IDs in the exact order you suggest they tackle them. MUST be numbers.
        ]
      }

      Do NOT wrap your response in markdown formatting like \`\`\`json. Return ONLY the raw JSON string.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanedJson);

    // Fallback if AI didn't return an array for some reason
    if (!Array.isArray(parsed.suggestedOrder)) {
      parsed.suggestedOrder = pendingTasks.map((t: any) => t.id);
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error in Plan API route:', error);
    return NextResponse.json({ 
      summary: "Oops, my circuits got tangled while trying to generate a plan. Just tackle the most urgent task first!",
      suggestedOrder: []
    }, { status: 500 });
  }
}
