export type ImageResolution = '1K' | '2K' | '4K';
export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16';
export type StylePresetId =
  | 'cinematic-film'
  | 'film-noir'
  | 'anime-ghibli'
  | 'charcoal-sketch'
  | 'concept-art'
  | 'cyberpunk-neon'
  | 'pixar-3d';

export interface StylePreset {
  id: StylePresetId;
  label: string;
  description: string;
  badge: string;
  accentColor: string;
}

export interface Shot {
  id: string;
  shotNumber: string; // e.g., "1.1", "1.2"
  shotType: string; // "Wide Shot", "Medium Close-Up", etc.
  cameraMovement: string; // "Slow Push-In", "Tracking", etc.
  lens: string; // "35mm Anamorphic", etc.
  actionDescription: string;
  lightingAndAtmosphere: string;
  dialogueOrAudio?: string;
  durationSeconds: number;
  imagePrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  imageGenerationError?: string;
  imageSizeUsed?: ImageResolution;
}

export interface Scene {
  sceneNumber: number;
  sceneHeading: string;
  location?: string;
  timeOfDay?: string;
  synopsis: string;
  shots: Shot[];
}

export interface CharacterInfo {
  name: string;
  visualDescription: string;
  signatureWardrobe?: string;
}

export interface ScriptProject {
  id: string;
  title: string;
  genre: string;
  logline: string;
  visualStyleNotes?: string;
  stylePreset: StylePresetId;
  aspectRatio: AspectRatio;
  defaultImageSize: ImageResolution;
  characterRoster?: CharacterInfo[];
  characterContext?: string;
  scenes: Scene[];
  rawScript: string;
  createdAt: string;
  updatedAt: string;
}

export type ChatRole = 'director' | 'cinematographer' | 'script_doctor' | 'storyboard_artist';

export type ChatModel = 'gemini-3.8-flash' | 'gemini-4-argon' | 'gemini-3.1-flash-lite';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  botRole?: ChatRole;
  modelUsed?: string;
  suggestedAction?: {
    type: 'apply_prompt' | 'add_shot' | 'rewrite_dialogue';
    label: string;
    targetShotId?: string;
    payload: any;
  };
}
