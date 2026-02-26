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
      // 🔥 MODELO DE IMAGEN (IMPORTANTE)
      model: "gemini-1.5-flash-image",

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

      // 🔥 LE DECIMOS QUE QUEREMOS IMAGEN
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      return res.status(500).json({ error: "No response from Gemini" });
    }

    const imagePart = parts.find((part) => part.inlineData);

    if (!imagePart) {
      return res.status(500).json({
        error: "Gemini did not return an image",
        raw: response,
      });
    }

    return res.status(200).json({
      image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
    });

  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
}