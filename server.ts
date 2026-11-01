import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini AI client with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to sanitize and check API key
const checkApiKey = (res: Response): boolean => {
  if (!process.env.GEMINI_API_KEY) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Please check your Settings > Secrets panel.',
    });
    return false;
  }
  return true;
};

// Retry helper for handling temporary spikes in demand or transient errors
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 1200): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      attempt++;
      const errMsg = err?.message || String(err);
      const isTransient =
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') ||
        errMsg.includes('429') ||
        errMsg.includes('RESOURCE_EXHAUSTED');

      if (attempt < maxRetries && isTransient) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`[Gemini API] Transient error (attempt ${attempt}/${maxRetries}), retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

// Helper to format clean human-readable error messages
function formatErrorMessage(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const msg = error.message || String(error);
  try {
    const parsed = JSON.parse(msg);
    if (parsed.error?.message) {
      return parsed.error.message;
    }
  } catch {
    // not JSON
  }
  return msg;
}

// ==========================================
// 1. Script Breakdown API (gemini-3.8-flash)
// ==========================================
app.post('/api/breakdown-script', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  const { scriptText, stylePreset = 'cinematic-film', targetShotsCount = 8, visualNotes = '' } = req.body;

  if (!scriptText || typeof scriptText !== 'string' || scriptText.trim().length === 0) {
    res.status(400).json({ error: 'Please provide script text to analyze.' });
    return;
  }

  try {
    const prompt = `Analyze this screenplay / script excerpt and break it down into a production-ready sequence of cinematic storyboard scenes and individual visual shots (target around ${targetShotsCount} key visual shots total across the scenes).

Art Direction / Style Preset: "${stylePreset}"
Additional Visual & Character Notes: "${visualNotes}"

Screenplay to analyze:
"""
${scriptText}
"""

Deconstruct the narrative into dramatic visual beats. Every shot must have:
- A shot number (e.g. 1.1, 1.2, 2.1)
- Shot type (Wide Shot, Medium Close-Up, Extreme Close-Up, Over-the-Shoulder, Low Angle, Dutch Angle, Tracking Shot, Bird's Eye View)
- Camera movement (e.g. Slow creeping push-in, Handheld whip-pan, Static tripod, Steadicam orbit)
- Focal length & lens (e.g. 35mm Anamorphic, 50mm Prime f/1.4, 85mm shallow depth of field)
- Specific action description of what occurs visually
- Lighting & atmospheric atmosphere (color temperature, rim lighting, neon reflection, volumetric haze, shadows)
- Exact dialogue snippet or audio sound effects
- Estimated duration in seconds (2 to 6 seconds)
- Highly descriptive image prompt tailored for high-end film concept art image generation. Describe camera angle, lighting, subject placement, atmosphere, and visual textures without buzzwords like "photorealistic", focusing on concrete cinematic photographic language.`;

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an award-winning feature film director, visual storyboard artist, and script supervisor. You break down screenplays into breathtaking, sequence-coherent storyboard shot lists for pre-visualization. Produce structured JSON following the requested schema precisely.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Title or working title of the script' },
              genre: { type: Type.STRING, description: 'Genre of the story' },
              logline: { type: Type.STRING, description: 'One-sentence summary logline' },
              visualStyleNotes: { type: Type.STRING, description: 'Overall color palette and visual direction advice' },
              characterRoster: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    visualDescription: { type: Type.STRING },
                    signatureWardrobe: { type: Type.STRING },
                  },
                  required: ['name', 'visualDescription'],
                },
              },
              scenes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sceneNumber: { type: Type.INTEGER },
                    sceneHeading: { type: Type.STRING, description: 'Standard slugline e.g. INT. ALLEY - NIGHT' },
                    location: { type: Type.STRING },
                    timeOfDay: { type: Type.STRING },
                    synopsis: { type: Type.STRING },
                    shots: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING, description: 'Unique shot ID' },
                          shotNumber: { type: Type.STRING, description: 'e.g. "1.1", "1.2"' },
                          shotType: { type: Type.STRING, description: 'WS, MCU, CU, OTS, etc.' },
                          cameraMovement: { type: Type.STRING },
                          lens: { type: Type.STRING },
                          actionDescription: { type: Type.STRING },
                          lightingAndAtmosphere: { type: Type.STRING },
                          dialogueOrAudio: { type: Type.STRING },
                          durationSeconds: { type: Type.NUMBER },
                          imagePrompt: { type: Type.STRING, description: 'Cinematic storyboard concept image prompt' },
                        },
                        required: [
                          'id',
                          'shotNumber',
                          'shotType',
                          'cameraMovement',
                          'lens',
                          'actionDescription',
                          'lightingAndAtmosphere',
                          'durationSeconds',
                          'imagePrompt',
                        ],
                      },
                    },
                  },
                  required: ['sceneNumber', 'sceneHeading', 'synopsis', 'shots'],
                },
              },
            },
            required: ['title', 'genre', 'logline', 'scenes'],
          },
        },
      })
    );

    const rawJson = response.text || '{}';
    const parsed = JSON.parse(rawJson);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error breaking down script:', error);
    res.status(500).json({
      error: formatErrorMessage(error) || 'Failed to breakdown script. Please try again.',
    });
  }
});

// ==========================================
// 2. High-Quality Image Generation API
// Model: gemini-3-pro-image-preview
// Affordance: 1K, 2K, 4K resolution
// ==========================================
app.post('/api/generate-shot-image', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  const {
    prompt,
    imageSize = '1K', // Supported: "1K", "2K", "4K"
    aspectRatio = '16:9', // Supported: "16:9", "4:3", "1:1", "9:16", "3:4"
    stylePreset = 'cinematic-film',
    characterContext = '',
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Image prompt is required.' });
    return;
  }

  // Validate imageSize to guarantee 1K, 2K, or 4K
  const validSizes = ['1K', '2K', '4K'];
  const finalImageSize = validSizes.includes(imageSize) ? imageSize : '1K';

  // Map style preset to rich artistic modifier
  let styleModifier = '';
  switch (stylePreset) {
    case 'cinematic-film':
      styleModifier = 'Cinematic 35mm film still, Kodak Vision3 color science, realistic film grain, atmospheric rim lighting, deep shadows, authentic production movie still';
      break;
    case 'film-noir':
      styleModifier = 'High-contrast black and white film noir still, deep chiaroscuro lighting, sharp venetian blind shadows, silver screen cinematic aesthetic, moody smoke';
      break;
    case 'anime-ghibli':
      styleModifier = 'High quality hand-painted anime storyboard concept, Makoto Shinkai and Studio Ghibli inspired painterly backgrounds, lush vibrant color grading, expressive lighting';
      break;
    case 'charcoal-sketch':
      styleModifier = 'Classic Hollywood production storyboard sketch, expressive charcoal and graphite pencil strokes on toned paper, bold composition lines, director visual pre-vis';
      break;
    case 'concept-art':
      styleModifier = 'Premium film production concept art, digital matte painting, matte textures, dramatic cinematic composition, volumetric lighting, ArtStation trending quality';
      break;
    case 'cyberpunk-neon':
      styleModifier = 'Futuristic neon cyberpunk cinematography, saturated teal and magenta neon reflections on wet asphalt, anamorphic blue horizontal lens flares, atmospheric smog';
      break;
    case 'pixar-3d':
      styleModifier = '3D animated feature film concept render, subsurface scattering, stylized character lighting, expressive cinematic framing, octane render look';
      break;
    default:
      styleModifier = 'Cinematic feature film still, cinematic framing and volumetric lighting';
      break;
  }

  const enhancedPrompt = `${prompt}. Style: ${styleModifier}.${characterContext ? ` Visual consistency notes: ${characterContext}.` : ''} High resolution production storyboard panel, pristine framing, cinematic widescreen composition.`;

  try {
    const response = await withRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
            imageSize: finalImageSize as any,
          },
        },
      })
    );

    let imageUrl: string | null = null;
    const parts = response.candidates?.[0]?.content?.parts ?? [];

    for (const part of parts) {
      if (part.inlineData?.data) {
        const mimeType = part.inlineData.mimeType || 'image/png';
        imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      console.warn('No inlineData found in response parts. Checking text parts:', parts);
      res.status(502).json({
        error: 'The image generation model did not return image data. Please check prompt or try again.',
      });
      return;
    }

    res.json({
      imageUrl,
      imageSize: finalImageSize,
      aspectRatio,
      prompt: enhancedPrompt,
    });
  } catch (error: any) {
    console.error('Error generating image with gemini-3-pro-image-preview:', error);
    res.status(500).json({
      error: formatErrorMessage(error) || 'Image generation failed with gemini-3-pro-image-preview.',
    });
  }
});

// ==========================================
// 3. Multi-Turn Gemini Chatbot
// Model: gemini-3.8-flash (default) / gemini-4-argon / gemini-3.1-flash-lite
// Maintains conversation history in thread
// System instruction sets specific filmmaking roles
// ==========================================
app.post('/api/chat', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  const {
    messages = [],
    role = 'director',
    modelChoice = 'gemini-3.8-flash',
    context = {},
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  // Model selection rules:
  // Use gemini-4-argon for particularly complex tasks,
  // gemini-3.8-flash for general tasks,
  // gemini-3.1-flash-lite for tasks that should happen fast.
  let selectedModel = 'gemini-3.8-flash';
  if (modelChoice === 'gemini-4-argon' || modelChoice === 'models/gemini-4-argon') {
    selectedModel = 'gemini-4-argon';
  } else if (modelChoice === 'gemini-3.1-flash-lite' || modelChoice === 'models/gemini-3.1-flash-lite') {
    selectedModel = 'gemini-3.1-flash-lite';
  } else {
    selectedModel = 'gemini-3.8-flash';
  }

  // Role-specific System Instructions
  let systemInstruction = '';
  switch (role) {
    case 'cinematographer':
      systemInstruction = `You are a legendary Director of Photography (ASC / BSC).
Your expertise is in visual composition, camera lenses (focal lengths like 24mm, 50mm, anamorphic squeeze), lighting ratios, color palettes, chiaroscuro, camera motion (dollies, cranes, jibs, handheld grit), and translating dramatic emotion into tangible cinematographic choices.
When the user asks for storyboard suggestions, advise them on specific angles, lens choices, lighting schemes, and frame composition.
Keep your feedback concise, professional, visual, and immediately actionable for storyboard artists.`;
      break;
    case 'script_doctor':
      systemInstruction = `You are a top Hollywood Script Doctor and Story Analyst.
Your expertise is in narrative pacing, visual economy, dialogue subtext, character tension, and ensuring every scene earns its place in the storyboard reel.
You help identify flabby action lines, elevate flat dialogue, and craft dramatic turning points that translate into powerful visual moments.
Provide sharp, punchy advice and concrete script revisions when asked.`;
      break;
    case 'storyboard_artist':
      systemInstruction = `You are a veteran Pre-visualization and Storyboard Artist who has worked on major franchise feature films.
Your expertise is in shot flow, screen direction continuity (180-degree rule), visual pacing, dynamic silhouette, and creating vivid image prompts for concept art generation.
You provide concrete prompt improvements and camera framing techniques.`;
      break;
    case 'director':
    default:
      systemInstruction = `You are a visionary Film Director acting as the lead collaborator on this script-to-storyboard project.
You orchestrate the overall creative vision, emotional arc, rhythm, actor blocking, and visual storytelling.
You help the creator decide how to frame pivotal moments, maintain visual continuity between shots, heighten suspense or drama, and craft unforgettable cinematic sequences.
Be inspiring, sharp, and practical. Offer suggestions for shot ideas, pacing tweaks, and camera perspectives.`;
      break;
  }

  // Append project context if provided
  if (context && (context.scriptTitle || context.currentShotCount || context.currentScriptSnippet)) {
    systemInstruction += `\n\nCURRENT PROJECT CONTEXT:
- Title: ${context.scriptTitle || 'Untitled Script'}
- Total Shots: ${context.currentShotCount || 0}
- Current Visual Style: ${context.stylePreset || 'Cinematic Film'}
${context.currentScriptSnippet ? `- Script Snippet:\n"""\n${context.currentScriptSnippet.slice(0, 800)}\n"""` : ''}`;
  }

  try {
    // Format conversation history for Gemini SDK
    // contents: [{ role: 'user' | 'model', parts: [{ text }] }]
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
    }));

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: selectedModel,
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      })
    );

    const reply = response.text || "I'm reviewing the script and storyboard sequence. How would you like to proceed?";
    res.json({
      reply,
      role,
      modelUsed: selectedModel,
    });
  } catch (error: any) {
    console.error('Error in chatbot API:', error);
    res.status(500).json({
      error: formatErrorMessage(error) || 'Failed to process chat message.',
    });
  }
});

// ==========================================
// 4. Prompt Enhancement Helper
// ==========================================
app.post('/api/enhance-prompt', async (req: Request, res: Response) => {
  if (!checkApiKey(res)) return;

  const { rawPrompt, shotType = 'Wide Shot', cameraMovement = 'Push In', stylePreset = 'cinematic-film' } = req.body;

  if (!rawPrompt) {
    res.status(400).json({ error: 'rawPrompt is required' });
    return;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: `Transform this shot description into a single concise, visually rich cinematic prompt for a storyboard frame.
Shot Type: ${shotType}
Camera Movement: ${cameraMovement}
Style: ${stylePreset}
Description: "${rawPrompt}"

Return ONLY the enhanced prompt string without quotes or conversational filler.`,
    });

    res.json({ enhancedPrompt: (response.text || rawPrompt).trim() });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to enhance prompt' });
  }
});

// Vite middleware for dev or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineBoard Studio Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
