import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey !== 'your_gemini_api_key_here' && apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    const { prompt, tasks } = await req.json();

    if (!genAI) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Using local mock data.' },
        { status: 503 }
      );
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construct the prompt with context
    const contextPrompt = `
      You are an elite productivity AI strategist named Priora.
      The user has asked you to: "${prompt}"
      
      Here are their current pending tasks (JSON format):
      ${JSON.stringify(tasks, null, 2)}
      
      Your goal is to organize these tasks into a highly optimized Execution Plan.
      You MUST return your response as a raw JSON object containing three arrays of task IDs, structured EXACTLY like this:
      {
        "morning": [task_id_1, task_id_2],
        "afternoon": [task_id_3],
        "evening": []
      }
      Do NOT wrap the response in markdown blocks (e.g. \`\`\`json). Just return the raw JSON string.
      Sort the tasks logically based on their priority, category, and standard deep-work principles (hardest/high priority tasks in the morning).
    `;

    const result = await model.generateContent(contextPrompt);
    const responseText = result.response.text();
    
    // Clean the response if the model accidentally wraps it in markdown
    const cleanedJson = responseText.replace(/```json\n?|\n?```/g, '').trim();
    
    const parsedPlan = JSON.parse(cleanedJson);

    return NextResponse.json(parsedPlan);
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate plan from Gemini.' },
      { status: 500 }
    );
  }
}
