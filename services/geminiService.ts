
import { GoogleGenAI, Type } from "@google/genai";
import { MoodEntry } from "../types";

// Always use the process.env.API_KEY directly in the constructor
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeMoodTrend(entries: MoodEntry[]): Promise<string> {
  if (entries.length === 0) return "Start tracking your mood to see insights here.";

  const moodSummary = entries.map(e => `Score: ${e.score}, Note: ${e.note}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a compassionate mental health AI assistant. Based on the following recent mood logs, provide a brief (2-3 sentence) supportive summary. If the mood scores are consistently low (1 or 2), gently encourage the user to reach out to their support system or use the SOS feature in the app.
      
      Logs:
      ${moodSummary}`,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });

    // Use the .text property directly from GenerateContentResponse
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Keep taking care of yourself. Remember that support is always available.";
  }
}
