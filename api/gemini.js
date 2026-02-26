import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY not configured",
      });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Missing prompt",
      });
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Gemini error:", error);

    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }

  const response = await fetch("/api/gemini", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    prompt: "Decí solamente FUNCIONA",
  }),
});

const data = await response.json();
console.log(data);
}