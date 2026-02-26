import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { image, prompt } = req.body;

    if (!image || !prompt) {
      return res.status(400).json({ error: "Missing image or prompt" });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const base64Data = image.split(",")[1];
    const mimeType = image.split(";")[0].split(":")[1];

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      return res.status(500).json({ error: "No response from Gemini" });
    }

    for (const part of parts) {
      if (part.inlineData) {
        return res.status(200).json({
          image: `data:image/png;base64,${part.inlineData.data}`,
        });
      }
    }

    return res.status(500).json({
      error: "Gemini did not return an image",
      raw: response,
    });

  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
}