import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: "Di solamente la palabra: FUNCIONA",
    });

    console.log("RESPUESTA COMPLETA:");
    console.log(JSON.stringify(response, null, 2));

    return res.status(200).json(response);

  } catch (error) {
    console.error("ERROR REAL:", error);
    return res.status(500).json({ error: error.message });
  }
}