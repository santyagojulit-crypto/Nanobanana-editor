import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    console.log("API KEY EXISTE:", !!process.env.GEMINI_API_KEY);

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY
    );

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent("Decí FUNCIONA");
    const response = await result.response;

    res.status(200).json({
      text: response.text(),
    });

  } catch (error) {
    console.error("ERROR COMPLETO:");
    console.error(error);

    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  }
}