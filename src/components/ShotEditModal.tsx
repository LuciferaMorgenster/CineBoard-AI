import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Camera,
  RotateCw,
  Sliders,
  FileText,
  Volume2,
  Clock,
  Layers,
  Wand2,
} from 'lucide-react';
import { Shot, ImageResolution, StylePresetId } from '../types';
import { RESOLUTION_OPTIONS } from '../data/presets';
import { apiService } from '../services/api';

interface ShotEditModalProps {
  shot: Shot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedShot: Shot) => void;
  onRegenerate: (shotId: string, customSize: ImageResolution) => Promise<void>;
  stylePreset: StylePresetId;
  defaultResolution: ImageResolution;
}

const SHOT_TYPES = [
  'Extreme Wide Shot (EWS)',
  'Wide Shot (WS)',
  'Medium Wide Shot (MWS)',
  'Medium Shot (MS)',
  'Medium Close-Up (MCU)',
  'Close-Up (CU)',
  'Extreme Close-Up (ECU)',
  'Over-the-Shoulder (OTS)',
  'Point of View (POV)',
  'Low Angle Hero Shot',
  'High Angle / Bird’s Eye',
  'Dutch Angle / Canted Frame',
];

const CAMERA_MOVEMENTS = [
  'Static Tripod',
  'Slow Creeping Push-In',
  'Dynamic Push-In',
  'Slow Pull-Out Reveal',
  'Lateral Tracking / Dolly Shot',
  'Handheld Shaky-Cam Grit',
  'Steadicam Orbit',
  'Whip Pan Transition',
  'Crane / Jib Descending',
];

const COMMON_LENSES = [
  '24mm Ultra Wide Angle',
  '35mm Anamorphic (Cinematic Squeeze)',
  '50mm Prime f/1.4 (Natural Perspective)',
  '85mm Portrait (Shallow Bokeh)',
  '100mm Macro (Intense Detail)',
  '70mm IMAX Format',
];

export const ShotEditModal: React.FC<ShotEditModalProps> = ({
  shot,
  isOpen,
  onClose,
  onSave,
  onRegenerate,
  stylePreset,
  defaultResolution,
}) => {
  if (!isOpen || !shot) return null;

  const [shotType, setShotType] = useState<string>(shot.shotType);
  const [cameraMovement, setCameraMovement] = useState<string>(shot.cameraMovement);
  const [lens, setLens] = useState<string>(shot.lens);
  const [actionDescription, setActionDescription] = useState<string>(shot.actionDescription);
  const [dialogueOrAudio, setDialogueOrAudio] = useState<string>(shot.dialogueOrAudio || '');
  const [durationSeconds, setDurationSeconds] = useState<number>(shot.durationSeconds || 3);
  const [imagePrompt, setImagePrompt] = useState<string>(shot.imagePrompt);
  const [selectedResolution, setSelectedResolution] = useState<ImageResolution>(
    shot.imageSizeUsed || defaultResolution
  );
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);

  const handleEnhancePrompt = async () => {
    setIsEnhancing(true);
    try {
      const enhanced = await apiService.enhancePrompt({
        rawPrompt: imagePrompt,
        shotType,
        cameraMovement,
        stylePreset,
      });
      setImagePrompt(enhanced);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSaveOnly = () => {
    onSave({
      ...shot,
      shotType,
      cameraMovement,
      lens,
      actionDescription,
      dialogueOrAudio,
      durationSeconds,
      imagePrompt,
    });
    onClose();
  };

  const handleGenerateNow = async () => {
    setIsRegenerating(true);
    const updated = {
      ...shot,
      shotType,
      cameraMovement,
      lens,
      actionDescription,
      dialogueOrAudio,
      durationSeconds,
      imagePrompt,
    };
    onSave(updated);

    try {
      await onRegenerate(shot.id, selectedResolution);
      onClose();
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0f111a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#131624]">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              SHOT {shot.shotNumber}
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Edit Shot Framing & Image Prompt
              </h2>
              <p className="text-xs text-zinc-400">
                Configure cinematography specs and generate high-resolution frame via gemini-3-pro-image-preview.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Current Frame Preview if available */}
          {shot.imageUrl && (
            <div className="relative aspect-video max-h-56 mx-auto rounded-xl overflow-hidden border border-zinc-800 bg-black">
              <img
                src={shot.imageUrl}
                alt={shot.shotNumber}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 font-mono text-[10px] text-amber-400 border border-amber-500/30">
                Current: {shot.imageSizeUsed || '1K'}
              </span>
            </div>
          )}

          {/* Shot Type & Lens Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Shot Framing Type</label>
              <select
                value={shotType}
                onChange={(e) => setShotType(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                {SHOT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Camera Movement</label>
              <select
                value={cameraMovement}
                onChange={(e) => setCameraMovement(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                {CAMERA_MOVEMENTS.map((mov) => (
                  <option key={mov} value={mov}>
                    {mov}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300">Lens & Focal Length</label>
              <select
                value={lens}
                onChange={(e) => setLens(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                {COMMON_LENSES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300">Subject Action in Frame</label>
            <textarea
              value={actionDescription}
              onChange={(e) => setActionDescription(e.target.value)}
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Dialogue & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-3 space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                Dialogue / Sound Effect
              </label>
              <input
                type="text"
                value={dialogueOrAudio}
                onChange={(e) => setDialogueOrAudio(e.target.value)}
                placeholder="e.g. KAI: 'Hold the perimeter!' / Thunder rolls"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-screenplay text-amber-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                Duration (sec)
              </label>
              <input
                type="number"
                min={1}
                max={15}
                step={0.5}
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseFloat(e.target.value) || 3)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Prompt Section with AI Enhancer */}
          <div className="space-y-2 bg-[#090b12] p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Storyboard Image Prompt (gemini-3-pro-image-preview)
              </label>
              <button
                type="button"
                onClick={handleEnhancePrompt}
                disabled={isEnhancing}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors disabled:opacity-50"
              >
                <Wand2 className="w-3 h-3" />
                <span>{isEnhancing ? 'Enhancing...' : 'AI Enhance Prompt'}</span>
              </button>
            </div>

            <textarea
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* AFFORDANCE FOR IMAGE SIZE (1K, 2K, 4K) */}
          <div className="space-y-2 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                Generation Resolution (gemini-3-pro-image-preview)
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">{selectedResolution}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RESOLUTION_OPTIONS.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => setSelectedResolution(res.id)}
                  className={`py-2 px-3 rounded-xl border text-center transition-all ${
                    selectedResolution === res.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-zinc-950 font-bold shadow-md'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{res.id}</div>
                  <div className="text-[10px] opacity-80">{res.pixelBadge}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800 bg-[#121524]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
            >
              Save Details
            </button>

            <button
              type="button"
              onClick={handleGenerateNow}
              disabled={isRegenerating}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {isRegenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating Frame ({selectedResolution})...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Generate Frame ({selectedResolution})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
