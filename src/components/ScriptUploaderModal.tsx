import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  X,
  Sliders,
  Palette,
  Camera,
  Layers,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Film,
  Check,
} from 'lucide-react';
import { ImageResolution, AspectRatio, StylePresetId } from '../types';
import { STYLE_PRESETS, RESOLUTION_OPTIONS, ASPECT_RATIOS } from '../data/presets';
import { SAMPLE_SCRIPTS, SampleScript } from '../data/sampleScripts';

interface ScriptUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    scriptText: string;
    stylePreset: StylePresetId;
    resolution: ImageResolution;
    aspectRatio: AspectRatio;
    targetShotsCount: number;
    visualNotes: string;
    characterContext: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export const ScriptUploaderModal: React.FC<ScriptUploaderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [scriptText, setScriptText] = useState<string>(SAMPLE_SCRIPTS[0].scriptText);
  const [stylePreset, setStylePreset] = useState<StylePresetId>(SAMPLE_SCRIPTS[0].stylePreset);
  const [resolution, setResolution] = useState<ImageResolution>('2K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [targetShotsCount, setTargetShotsCount] = useState<number>(8);
  const [characterContext, setCharacterContext] = useState<string>(SAMPLE_SCRIPTS[0].characterContext);
  const [visualNotes, setVisualNotes] = useState<string>('Atmospheric cinematic lighting, dramatic depth of field');
  const [activeTab, setActiveTab] = useState<'editor' | 'samples'>('editor');
  const [dragOver, setDragOver] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectSample = (sample: SampleScript) => {
    setScriptText(sample.scriptText);
    setStylePreset(sample.stylePreset);
    setCharacterContext(sample.characterContext);
    setActiveTab('editor');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readTextFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    readTextFile(file);
  };

  const readTextFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setScriptText(content);
        setActiveTab('editor');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptText.trim()) return;

    await onSubmit({
      scriptText,
      stylePreset,
      resolution,
      aspectRatio,
      targetShotsCount,
      visualNotes,
      characterContext,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0f111a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#131622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                New Storyboard Project
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Script Deconstruction
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Upload or paste your script to automatically generate visual scenes, camera shots, and storyboard art.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Script Input Mode Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'editor'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                Script Text & Upload
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('samples')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'samples'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pre-loaded Screenplays</span>
                <span className="text-[10px] bg-zinc-800 text-amber-300 px-1.5 rounded-full">4</span>
              </button>
            </div>

            <div className="text-xs text-zinc-400 hidden sm:block">
              Supports .txt, .fountain, .md, .pdf scripts
            </div>
          </div>

          {activeTab === 'samples' ? (
            /* Sample Scripts Grid */
            <div className="space-y-3">
              <p className="text-xs text-zinc-400">
                Select an industry-formatted screenplay excerpt to instantly test the storyboard generator:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                {SAMPLE_SCRIPTS.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 hover:border-amber-500/50 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                        {sample.genre}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {sample.stylePreset}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                      {sample.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {sample.tagline}
                    </p>
                    <div className="mt-3 flex items-center text-[11px] text-amber-400 font-medium gap-1">
                      <span>Use this screenplay</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Editor & Drop Zone */
            <div className="space-y-4">
              {/* Drop Area & Screenplay Editor */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative rounded-xl border-2 transition-all ${
                  dragOver
                    ? 'border-amber-500 bg-amber-500/5'
                    : 'border-zinc-800 bg-[#0a0c13]'
                }`}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/80 bg-zinc-900/50 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-mono">SCREENPLAY EXCERPT (COURIER FORMAT)</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 cursor-pointer py-0.5 px-2 rounded hover:bg-zinc-800 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept=".txt,.fountain,.md,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Paste your screenplay, stage play, or commercial script here... e.g.:

EXT. CYBERPUNK ALLEYWAY - NIGHT
Heavy rain drenches the asphalt. Neon signs flicker in Japanese kanji.
KAI (30s) crouches beneath the fire escape..."
                  rows={8}
                  className="w-full p-4 bg-transparent text-zinc-200 font-screenplay text-sm leading-relaxed focus:outline-none focus:ring-0 placeholder-zinc-600 resize-y"
                  required
                />
              </div>
            </div>
          )}

          {/* Generator Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-zinc-800">
            {/* Visual Style Preset */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-400" />
                Visual Concept Style
              </label>
              <select
                value={stylePreset}
                onChange={(e) => setStylePreset(e.target.value as StylePresetId)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                {STYLE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label} ({preset.badge})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-zinc-500">
                Sets artistic medium, color grading, and lens textures.
              </p>
            </div>

            {/* IMAGE RESOLUTION AFFORDANCE (1K, 2K, 4K) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Image Size (gemini-3-pro-image-preview)
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">{resolution}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {RESOLUTION_OPTIONS.map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setResolution(res.id)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-mono font-bold transition-all ${
                      resolution === res.id
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 border-amber-400 text-zinc-950 shadow-md'
                        : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                  >
                    {res.id}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500">
                1K (Fast), 2K (Crisp Production), 4K (Ultra Cinema Detail)
              </p>
            </div>

            {/* Target Shot Count & Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Target Shot Count
                </span>
                <span className="text-[10px] text-amber-400 font-mono font-bold">
                  ~{targetShotsCount} shots
                </span>
              </label>
              <input
                type="range"
                min={4}
                max={16}
                step={2}
                value={targetShotsCount}
                onChange={(e) => setTargetShotsCount(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>4 (Quick beats)</span>
                <span>8 (Standard)</span>
                <span>16 (Detailed)</span>
              </div>
            </div>
          </div>

          {/* Character & Visual Continuity Anchors */}
          <div className="space-y-1.5 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Character Continuity & Visual Anchors (Optional)
            </label>
            <input
              type="text"
              value={characterContext}
              onChange={(e) => setCharacterContext(e.target.value)}
              placeholder="e.g. Kai: 30s detective with neon cyber-eye and wet trenchcoat. Lyra: silver visor and glowing drive."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-zinc-500">
              Helps maintain character wardrobe and visual features across subsequent shots in the sequence.
            </p>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-850 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || !scriptText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white shadow-xl shadow-amber-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deconstructing Script & Scenes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Breakdown Script & Generate Storyboard</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
