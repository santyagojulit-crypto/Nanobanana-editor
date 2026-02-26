/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, Wand2, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

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
    const apiResponse = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image, prompt }),
    });

    const data = await apiResponse.json();

    if (data.image) {
      setResultImage(data.image);
    } else {
      setError(data.error || "No image returned from Gemini.");
    }

  } catch (err: any) {
    setError("Error processing image.");
  } finally {
    setIsProcessing(false);
  }
};
    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          image, // enviamos imagen + prompt al backend
        }),
      });

      if (!response.ok) {
        throw new Error("Server error");
      }

      const data = await response.json();

      if (data.image) {
        setResultImage(data.image);
      } else {
        setError("No image returned from Gemini.");
      }

    } catch (err: any) {
      console.error("Error processing image:", err);
      setError(err.message || "An error occurred while processing the image.");
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
            Transform your images using natural language. Powered by Gemini.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload Image
              </h2>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-square rounded-2xl border-2 border-dashed 
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
                placeholder="Describe how you want to edit the image..."
                className="w-full h-32 p-4 rounded-xl bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-sm"
              />

              <button
                onClick={processImage}
                disabled={!image || !prompt || isProcessing}
                className={`w-full mt-4 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                  ${!image || !prompt || isProcessing 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg'}
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
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200 min-h-[600px] flex flex-col">
              <h2 className="text-xl font-bold mb-6">Preview</h2>

              <div className="flex-grow rounded-2xl overflow-hidden bg-stone-50 border flex items-center justify-center">
                {resultImage ? (
                  <img src={resultImage} alt="Result" className="max-w-full max-h-full object-contain" />
                ) : image ? (
                  <img src={image} alt="Original" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-stone-300 flex flex-col items-center gap-4">
                    <ImageIcon className="w-20 h-20" />
                    <p>Upload an image to start</p>
                  </div>
                )}
              </div>

              {resultImage && (
                <div className="mt-6 flex justify-end">
                  <a 
                    href={resultImage} 
                    download="edited-image.png"
                    className="px-6 py-2 bg-stone-900 text-white rounded-full hover:bg-stone-800"
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
