/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Upload, Wand2, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResultImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async () => {
    if (!image || !prompt) return;

    setIsProcessing(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Extract base64 data and mime type
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const resultBase64 = part.inlineData.data;
          setResultImage(`data:image/png;base64,${resultBase64}`);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        // Sometimes the model might return text instead of an image if it can't perform the edit
        const textResponse = response.text;
        setError(textResponse || "The model didn't return an edited image. Try a different prompt.");
      }
    } catch (err: any) {
      console.error('Error processing image:', err);
      setError(err.message || 'An error occurred while processing the image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#1a1a1a] font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold tracking-tight mb-4"
          >
            Nano Banana <span className="text-emerald-600">Editor</span>
          </motion.h1>
          <p className="text-stone-500 max-w-xl mx-auto">
            Transform your images using natural language. Powered by Gemini 2.5 Flash Image.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload Image
              </h2>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative aspect-square rounded-2xl border-2 border-dashed 
                  flex flex-col items-center justify-center cursor-pointer
                  transition-all duration-200 overflow-hidden
                  ${image ? 'border-emerald-500 bg-emerald-50/30' : 'border-stone-300 hover:border-stone-400 bg-stone-50'}
                `}
              >
                {image ? (
                  <img src={image} alt="Original" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-12 h-12 text-stone-300 mb-2" />
                    <span className="text-sm text-stone-500">Click to upload image</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden" 
                  accept="image/*"
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Wand2 className="w-5 h-5" /> Edit Prompt
              </h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Leave only the logo Zero Hour and make the background solid blue'"
                className="w-full h-32 p-4 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none text-sm"
              />
              
              <button
                onClick={processImage}
                disabled={!image || !prompt || isProcessing}
                className={`
                  w-full mt-4 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                  ${!image || !prompt || isProcessing 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-[0.98]'}
                `}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Apply Magic
                  </>
                )}
              </button>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Result Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Preview</h2>
                <div className="flex gap-2">
                  <div className="px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-500 uppercase tracking-wider">
                    {resultImage ? 'Edited' : 'Original'}
                  </div>
                </div>
              </div>

              <div className="flex-grow relative rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {resultImage ? (
                    <motion.img
                      key="result"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={resultImage}
                      alt="Result"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : image ? (
                    <motion.img
                      key="original"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      src={image}
                      alt="Original"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-stone-300 flex flex-col items-center gap-4">
                      <ImageIcon className="w-20 h-20" />
                      <p className="text-lg font-medium">Upload an image to start</p>
                    </div>
                  )}
                </AnimatePresence>

                {isProcessing && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <p className="font-medium text-emerald-900">Gemini is working...</p>
                    </div>
                  </div>
                )}
              </div>

              {resultImage && (
                <div className="mt-6 flex justify-end">
                  <a 
                    href={resultImage} 
                    download="edited-image.png"
                    className="px-6 py-2 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors"
                  >
                    Download Result
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
