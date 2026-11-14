import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const GEMINI_MODEL = env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

const isLiveGemini =
  env.GEMINI_API_KEY &&
  !env.GEMINI_API_KEY.includes('mock') &&
  !env.GEMINI_API_KEY.includes('your_');

export let genAI = null;

if (isLiveGemini) {
  try {
    genAI = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY
    });
    logger.info({ model: GEMINI_MODEL }, 'Google Gemini SDK initialized successfully');
  } catch (err) {
    logger.warn({ error: err.message }, 'Failed to initialize Google Gemini SDK, falling back to heuristic AI engine');
  }
} else {
  logger.info('Gemini API key is placeholder; using built-in intelligent support engine until GEMINI_API_KEY is supplied');
}

export { isLiveGemini };

