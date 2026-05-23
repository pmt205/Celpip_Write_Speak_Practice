import type { VercelRequest, VercelResponse } from '@vercel/node';

const SYSTEM_PROMPT = `You are a CELPIP English test preparation assistant focused on vocabulary improvement.
Analyze the provided text and return a JSON object with the following structure:
{
  "vocabularyScore": <number 1-5, where 1 is poor vocabulary and 5 is excellent>,
  "repeatedWords": [{"word": "<repeated word>", "count": <number of times repeated>}],
  "weakWordsFound": ["<weak/basic word found>"],
  "suggestedUpgrades": [{"original": "<weak word>", "suggestion": "<better alternative>"}],
  "improvedVersion": "<the full text rewritten with stronger vocabulary>",
  "practiceTip": "<one actionable tip for the student to improve>"
}

Scoring guidelines:
- Score 1-2: Many basic/weak words (good, bad, very, nice, thing, stuff)
- Score 3: Some weak words but shows effort to use variety
- Score 4: Good vocabulary with minor improvements possible
- Score 5: Excellent, varied vocabulary appropriate for CELPIP

Return ONLY valid JSON, no additional text or markdown.`;

interface FeedbackResult {
  vocabularyScore: 1 | 2 | 3 | 4 | 5;
  repeatedWords: { word: string; count: number }[];
  weakWordsFound: string[];
  suggestedUpgrades: { original: string; suggestion: string }[];
  improvedVersion: string;
  practiceTip: string;
}

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function validateFeedbackResult(data: unknown): FeedbackResult {
  const obj = data as Record<string, unknown>;

  const vocabularyScore = Math.min(5, Math.max(1, Math.round(Number(obj.vocabularyScore) || 3))) as 1 | 2 | 3 | 4 | 5;

  const repeatedWords = Array.isArray(obj.repeatedWords)
    ? obj.repeatedWords.map((item: unknown) => {
        const r = item as Record<string, unknown>;
        return { word: String(r.word || ''), count: Number(r.count) || 2 };
      })
    : [];

  const weakWordsFound = Array.isArray(obj.weakWordsFound)
    ? obj.weakWordsFound.map((w: unknown) => String(w))
    : [];

  const suggestedUpgrades = Array.isArray(obj.suggestedUpgrades)
    ? obj.suggestedUpgrades.map((item: unknown) => {
        const u = item as Record<string, unknown>;
        return { original: String(u.original || ''), suggestion: String(u.suggestion || '') };
      })
    : [];

  const improvedVersion = typeof obj.improvedVersion === 'string' ? obj.improvedVersion : '';
  const practiceTip = typeof obj.practiceTip === 'string' ? obj.practiceTip : '';

  return {
    vocabularyScore,
    repeatedWords,
    weakWordsFound,
    suggestedUpgrades,
    improvedVersion,
    practiceTip,
  };
}

async function callGemini(text: string, mode: string, apiKey: string): Promise<FeedbackResult> {
  const userPrompt = `Mode: ${mode}\n\nText to analyze:\n${text}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: SYSTEM_PROMPT + '\n\n' + userPrompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('No content in Gemini response');
  }

  const parsed = JSON.parse(rawText);
  return validateFeedbackResult(parsed);
}

async function callOpenAI(text: string, mode: string, apiKey: string): Promise<FeedbackResult> {
  const userPrompt = `Mode: ${mode}\n\nText to analyze:\n${text}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;

  if (!rawText) {
    throw new Error('No content in OpenAI response');
  }

  const parsed = JSON.parse(rawText);
  return validateFeedbackResult(parsed);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, mode } = req.body as { text?: string; mode?: string };

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "text" field' });
    }

    const analysisMode = mode || 'general';
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let result: FeedbackResult;

    if (geminiKey) {
      result = await callGemini(text, analysisMode, geminiKey);
    } else if (openaiKey) {
      result = await callOpenAI(text, analysisMode, openaiKey);
    } else {
      return res.status(503).json({ error: 'No AI API key configured' });
    }

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return res.status(500).json({ error: message });
  }
}
