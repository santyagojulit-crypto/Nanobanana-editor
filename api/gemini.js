import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    const { image, prompt } = req.body;

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
                mimeType,
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
    });

    console.log("RESPUESTA COMPLETA:");
    console.log(JSON.stringify(response, null, 2));

    const parts = response.candidates?.[0]?.content?.parts;

    if (!parts) {
      return res.status(500).json({
        error: "No response from Gemini",
        raw: response,
      });
    }

    // ⚠️ 1.5 puede devolver TEXTO en vez de imagen
    const imagePart = parts.find(p => p.inlineData);

    if (imagePart) {
      return res.status(200).json({
        image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
      });
    }

    const textPart = parts.find(p => p.text);

    return res.status(200).json({
      text: textPart?.text || "No image returned",
    });

  } catch (error) {
    console.error("Gemini error:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
}