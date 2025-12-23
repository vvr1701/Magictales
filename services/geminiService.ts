
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ThemeType, ChildDetails, StoryPage } from "../types";
import { THEME_PROMPT_VARIATIONS, THEMES, STORYBOOK_STYLE_KEYWORDS } from "../constants";
import { AppLogger } from "../components/LogPanel";

// ===== LOGGING UTILITIES =====
const SOURCE = "Gemini";

const logInfo = (message: string, data?: any) => {
  console.log(`🔮 [MagicTales Gemini] ℹ️ ${message}`, data !== undefined ? data : '');
  AppLogger.info(SOURCE, message, data);
};

const logSuccess = (message: string, data?: any) => {
  console.log(`🔮 [MagicTales Gemini] ✅ ${message}`, data !== undefined ? data : '');
  AppLogger.success(SOURCE, message, data);
};

const logWarning = (message: string, data?: any) => {
  console.warn(`🔮 [MagicTales Gemini] ⚠️ ${message}`, data !== undefined ? data : '');
  AppLogger.warning(SOURCE, message, data);
};

const logError = (message: string, data?: any) => {
  console.error(`🔮 [MagicTales Gemini] ❌ ${message}`, data !== undefined ? data : '');
  AppLogger.error(SOURCE, message, data);
};

// ===== API KEY VALIDATION =====
const getApiKey = (): string => {
  // Vite injects this via vite.config.ts define block
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    logError("API KEY NOT FOUND!");
    logError("Please ensure GEMINI_API_KEY is set in your .env.local file");
    logError("Current process.env.API_KEY:", process.env.API_KEY);
    logError("Current process.env.GEMINI_API_KEY:", process.env.GEMINI_API_KEY);
    throw new Error("Gemini API key is missing. Please set GEMINI_API_KEY in .env.local");
  }

  // Log partial key for debugging (first 8 chars only for security)
  logInfo(`API Key found: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  return apiKey;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Custom error class for rate limiting
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
}

async function withRetry<T>(fn: () => Promise<T>, operationName: string = "operation", maxRetries = 2, initialDelay = 15000): Promise<T> {
  let lastError: any;
  let rateLimitHit = false;

  for (let i = 0; i < maxRetries; i++) {
    try {
      logInfo(`Attempt ${i + 1}/${maxRetries} for ${operationName}`);
      const result = await fn();
      logSuccess(`${operationName} completed successfully on attempt ${i + 1}`);
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || '';
      const errorCode = error?.code || error?.status || 'unknown';

      logError(`${operationName} failed on attempt ${i + 1}`, {
        message: errorMessage,
        code: errorCode,
        fullError: error
      });

      // Rate limit handling - only retry once with longer wait
      if (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
        rateLimitHit = true;
        if (i < maxRetries - 1) {
          const delay = initialDelay * (i + 1);
          logWarning(`Rate limit reached. Waiting ${Math.round(delay / 1000)}s before retry...`);
          await sleep(delay);
          continue;
        }
      } else {
        throw error;
      }
    }
  }

  // If we hit rate limit, throw a user-friendly error
  if (rateLimitHit) {
    logError(`Rate limit persists after ${maxRetries} attempts`);
    throw new RateLimitError(
      "🚫 API Rate Limit Reached!\n\n" +
      "Your free Gemini API key has hit its quota limit.\n\n" +
      "Solutions:\n" +
      "1. Wait 1-2 minutes and try again\n" +
      "2. Create a new API key at aistudio.google.com\n" +
      "3. Enable billing for higher quotas"
    );
  }

  logError(`${operationName} failed after ${maxRetries} attempts`, lastError);
  throw lastError;
}

export const generateStoryContent = async (
  child: ChildDetails,
  theme: ThemeType,
  length: number = 10
): Promise<StoryPage[]> => {
  logInfo("=== STARTING STORY GENERATION ===");
  logInfo("Child details:", { name: child.name, age: child.age, gender: child.gender });
  logInfo("Theme:", theme);
  logInfo("Story length:", length);

  return withRetry(async () => {
    const apiKey = getApiKey();
    logInfo("Initializing GoogleGenAI client...");
    const ai = new GoogleGenAI({ apiKey });

    const variationIndex = Math.floor(Math.random() * THEME_PROMPT_VARIATIONS[theme].length);
    const basePremise = THEME_PROMPT_VARIATIONS[theme][variationIndex].replace("{child_name}", child.name);
    const themeInfo = THEMES.find(t => t.id === theme);

    const prompt = `
      Create a personalized children's storybook for a ${child.age}-year-old ${child.gender} named ${child.name}.
      Theme: ${theme} (${themeInfo?.description}).
      Premise: ${basePremise}.
      Story Length: EXACTLY ${length} pages.
      Format: JSON array of objects {pageNumber, text, imagePrompt}.
    `;

    const modelName = import.meta.env.VITE_GEMINI_TEXT_MODEL || 'gemini-3-flash';
    logInfo(`Sending prompt to Gemini (Model: ${modelName})...`);
    logInfo("Prompt preview:", prompt.substring(0, 200) + "...");

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              pageNumber: { type: Type.INTEGER },
              text: { type: Type.STRING },
              imagePrompt: { type: Type.STRING },
            },
            required: ["pageNumber", "text", "imagePrompt"],
          },
        },
      },
    });

    logInfo("Response received from Gemini");
    logInfo("Response text length:", response.text?.length || 0);

    const pages = JSON.parse(response.text || "[]").sort((a: any, b: any) => a.pageNumber - b.pageNumber);
    logSuccess(`Story generated with ${pages.length} pages`);

    return pages;
  }, "Story Generation");
};

export const generateIllustration = async (
  prompt: string,
  child: ChildDetails,
  theme: ThemeType,
  referencePhotosBase64: string[] = []
): Promise<string> => {
  logInfo("=== STARTING ILLUSTRATION GENERATION ===");
  logInfo("Prompt:", prompt.substring(0, 100) + "...");
  logInfo("Child:", child.name);
  logInfo("Theme:", theme);
  logInfo("Reference photos count:", referencePhotosBase64.length);

  return withRetry(async () => {
    const apiKey = getApiKey();
    logInfo("Initializing GoogleGenAI client for image generation...");
    const ai = new GoogleGenAI({ apiKey });

    const stylePrompt = `${STORYBOOK_STYLE_KEYWORDS}. Main Subject: ${child.name} (${child.age}y/o ${child.gender}). Scene: ${prompt}. No text. Style: consistent digital illustration.`;

    logInfo("Style prompt:", stylePrompt.substring(0, 150) + "...");

    const parts: any[] = referencePhotosBase64.map((data, idx) => {
      logInfo(`Adding reference photo ${idx + 1}...`);
      return {
        inlineData: {
          mimeType: "image/jpeg",
          data: data.split(',')[1] || data
        }
      };
    });
    parts.push({ text: stylePrompt });

    const modelName = import.meta.env.VITE_GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview';
    logInfo(`Sending image generation request (Model: ${modelName})...`);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      }
    });

    logInfo("Image response received");
    logInfo("Candidates count:", response.candidates?.length || 0);

    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content?.parts) {
      logInfo("Parts in response:", candidates[0].content.parts.length);
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          logSuccess("Image data found! Returning base64 image.");
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    logError("No image data in response", { candidates });
    throw new Error("Canvas was empty! The magic ink failed.");
  }, "Illustration Generation");
};

export const editIllustration = async (base64Image: string, editPrompt: string): Promise<string> => {
  logInfo("=== STARTING ILLUSTRATION EDIT ===");
  logInfo("Edit prompt:", editPrompt);
  logInfo("Image data length:", base64Image.length);

  return withRetry(async () => {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });

    const modelName = import.meta.env.VITE_GEMINI_IMAGE_MODEL || 'gemini-3-pro-image-preview';
    logInfo(`Sending edit request (Model: ${modelName})...`);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data: base64Image.split(',')[1] || base64Image, mimeType: "image/png" } },
          { text: `Edit this image: ${editPrompt}` }
        ]
      },
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      }
    });

    logInfo("Edit response received");

    const candidates = response.candidates || [];
    if (candidates.length > 0 && candidates[0].content?.parts) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData) {
          logSuccess("Edited image received!");
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    logError("No edited image data in response");
    throw new Error("Magic brush failed.");
  }, "Illustration Edit");
};
