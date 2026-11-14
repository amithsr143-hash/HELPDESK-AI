import { env } from '../config/env.js';
import { GEMINI_MODEL, isLiveGemini } from '../config/gemini.js';
import { SYSTEM_PROMPT } from '../prompts/system.prompt.js';
import { logger } from '../utils/logger.js';

/**
 * Clean and parse JSON response from LLM output
 */
export const cleanJsonOutput = (text) => {
  if (!text) return null;
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (clean.startsWith('```')) {
    clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }
  try {
    return JSON.parse(clean);
  } catch (err) {
    logger.warn({ error: err.message, clean }, 'Failed to parse JSON output');
    return null;
  }
};

/**
 * Execute Gemini model call with system instruction and structured JSON response
 */
export const callGemini = async ({ systemInstruction = SYSTEM_PROMPT, prompt, schema = null }) => {
  if (isLiveGemini && env.GEMINI_API_KEY) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.GEMINI_API_KEY}`;
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini HTTP ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini response candidates empty');
      }

      const parsed = cleanJsonOutput(rawText);
      if (!parsed) {
        throw new Error('Failed to parse Gemini output as JSON');
      }

      if (schema) {
        const validated = schema.safeParse(parsed);
        if (validated.success) {
          return validated.data;
        }
        logger.warn({ errors: validated.error.errors, parsed }, 'Gemini output failed Zod schema validation, attempting recovery');
      }
      return parsed;
    } catch (err) {
      clearTimeout(timeout);
      logger.error({ error: err.message }, 'Google Gemini API call failed or timed out, activating resilient AI fallback');
    }
  }

  return null;
};
