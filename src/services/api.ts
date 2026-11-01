import { ImageResolution, AspectRatio, StylePresetId, ChatRole, ChatModel, ChatMessage } from '../types';

export interface ScriptBreakdownResponse {
  title: string;
  genre: string;
  logline: string;
  visualStyleNotes?: string;
  characterRoster?: Array<{
    name: string;
    visualDescription: string;
    signatureWardrobe?: string;
  }>;
  scenes: Array<{
    sceneNumber: number;
    sceneHeading: string;
    location?: string;
    timeOfDay?: string;
    synopsis: string;
    shots: Array<{
      id: string;
      shotNumber: string;
      shotType: string;
      cameraMovement: string;
      lens: string;
      actionDescription: string;
      lightingAndAtmosphere: string;
      dialogueOrAudio?: string;
      durationSeconds: number;
      imagePrompt: string;
    }>;
  }>;
}

export interface GenerateImageParams {
  prompt: string;
  imageSize: ImageResolution; // 1K, 2K, 4K affordance
  aspectRatio: AspectRatio;
  stylePreset: StylePresetId;
  characterContext?: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
  imageSize: ImageResolution;
  aspectRatio: AspectRatio;
  prompt: string;
}

export const apiService = {
  async breakdownScript(
    scriptText: string,
    stylePreset: StylePresetId,
    targetShotsCount: number = 8,
    visualNotes: string = ''
  ): Promise<ScriptBreakdownResponse> {
    const res = await fetch('/api/breakdown-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scriptText,
        stylePreset,
        targetShotsCount,
        visualNotes,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to breakdown script (Status: ${res.status})`);
    }

    return res.json();
  },

  async generateShotImage(params: GenerateImageParams): Promise<GenerateImageResponse> {
    const res = await fetch('/api/generate-shot-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to generate image (Status: ${res.status})`);
    }

    return res.json();
  },

  async sendChatMessage(params: {
    messages: Array<{ role: 'user' | 'model'; content: string }>;
    role: ChatRole;
    modelChoice: ChatModel;
    context?: any;
  }): Promise<{ reply: string; role: string; modelUsed: string }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to send chat message (Status: ${res.status})`);
    }

    return res.json();
  },

  async enhancePrompt(params: {
    rawPrompt: string;
    shotType?: string;
    cameraMovement?: string;
    stylePreset?: StylePresetId;
  }): Promise<string> {
    const res = await fetch('/api/enhance-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to enhance prompt');
    }

    const data = await res.json();
    return data.enhancedPrompt || params.rawPrompt;
  },
};
