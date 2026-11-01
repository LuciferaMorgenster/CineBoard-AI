import React from 'react';
import {
  Clapperboard,
  Play,
  Film,
  FileText,
  Sparkles,
  Bot,
  Download,
  PlusCircle,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { ImageResolution, AspectRatio, ScriptProject } from '../types';
import { RESOLUTION_OPTIONS, ASPECT_RATIOS } from '../data/presets';

interface NavbarProps {
  project: ScriptProject | null;
  activeTab: 'reel' | 'animatic' | 'script';
  setActiveTab: (tab: 'reel' | 'animatic' | 'script') => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  onOpenUploader: () => void;
  onOpenExport: () => void;
  onGenerateAll: () => void;
  isBatchGenerating: boolean;
  batchProgress: { completed: number; total: number };
  globalResolution: ImageResolution;
  setGlobalResolution: (res: ImageResolution) => void;
  globalAspectRatio: AspectRatio;
  setGlobalAspectRatio: (ratio: AspectRatio) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  activeTab,
  setActiveTab,
  isChatOpen,
  setIsChatOpen,
  onOpenUploader,
  onOpenExport,
  onGenerateAll,
  isBatchGenerating,
  batchProgress,
  globalResolution,
  setGlobalResolution,
  globalAspectRatio,
  setGlobalAspectRatio,
}) => {
  const totalShots = project ? project.scenes.flatMap((s) => s.shots).length : 0;
  const generatedShots = project
    ? project.scenes.flatMap((s) => s.shots).filter((s) => Boolean(s.imageUrl)).length
    : 0;

  return (
    <header className="sticky top-0 z-30 bg-[#0c0e17]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={onOpenUploader}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-950/40 text-white">
              <Clapperboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  CineBoard
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-amber-400 border border-amber-500/30">
                  Studio AI
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 truncate max-w-[200px] sm:max-w-[260px]">
                {project ? project.title : 'No script loaded'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          {project && (
            <div className="hidden sm:flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800/80 ml-2">
              <button
                onClick={() => setActiveTab('reel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'reel'
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-amber-400" />
                <span>Storyboard Reel</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-950 text-zinc-300 rounded-full font-mono">
                  {totalShots}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('animatic')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'animatic'
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-rose-400" />
                <span>Animatic Player</span>
                {generatedShots > 0 && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('script')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  activeTab === 'script'
                    ? 'bg-zinc-800 text-white shadow-sm font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Screenplay & Beats</span>
              </button>
            </div>
          )}
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center gap-2 flex-wrap justify-end w-full md:w-auto">
          {project && (
            <>
              {/* IMAGE SIZE AFFORDANCE (1K, 2K, 4K) */}
              <div className="flex items-center bg-zinc-900/90 rounded-xl p-1 border border-zinc-800/80">
                <span className="text-[10px] font-semibold uppercase text-zinc-400 px-2 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-cyan-400" />
                  Res
                </span>
                <div className="flex items-center gap-0.5">
                  {RESOLUTION_OPTIONS.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => setGlobalResolution(res.id)}
                      title={`${res.label}: ${res.desc}`}
                      className={`text-xs px-2 py-1 rounded-lg font-mono font-medium transition-all ${
                        globalResolution === res.id
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-zinc-950 font-bold shadow-sm'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {res.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selector */}
              <div className="hidden lg:flex items-center bg-zinc-900/90 rounded-xl p-1 border border-zinc-800/80">
                <span className="text-[10px] font-semibold uppercase text-zinc-400 px-2">Ratio</span>
                <div className="flex items-center gap-0.5">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setGlobalAspectRatio(ratio.id)}
                      title={ratio.desc}
                      className={`text-xs px-2 py-1 rounded-lg font-mono transition-all ${
                        globalAspectRatio === ratio.id
                          ? 'bg-zinc-700 text-white font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                      }`}
                    >
                      {ratio.id}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batch Generate All Shots */}
              <button
                onClick={onGenerateAll}
                disabled={isBatchGenerating || totalShots === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-lg shadow-rose-950/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title="Generate images for all storyboard shots with gemini-3-pro-image-preview"
              >
                {isBatchGenerating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      Generating ({batchProgress.completed}/{batchProgress.total})
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Shots ({globalResolution})</span>
                  </>
                )}
              </button>

              {/* Export / Print */}
              <button
                onClick={onOpenExport}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-zinc-800 transition-all cursor-pointer"
                title="Export or print storyboard"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Export</span>
              </button>
            </>
          )}

          {/* New / Load Script Button */}
          <button
            onClick={onOpenUploader}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>{project ? 'Load Script' : 'Upload Script'}</span>
          </button>

          {/* AI Director Chatbot Toggle */}
          <button
            onClick={() => setIsChatOpen((prev) => !prev)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              isChatOpen
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-indigo-500/40'
            }`}
            title="Open Gemini AI Director & Cinematography Consultant"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-300" />
            <span>Director's Suite</span>
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      {project && (
        <div className="flex sm:hidden items-center justify-around bg-zinc-900/95 p-1 rounded-xl border border-zinc-800 mt-2">
          <button
            onClick={() => setActiveTab('reel')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center ${
              activeTab === 'reel' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            Reel ({totalShots})
          </button>
          <button
            onClick={() => setActiveTab('animatic')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center ${
              activeTab === 'animatic' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            Animatic
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg text-center ${
              activeTab === 'script' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
            }`}
          >
            Script
          </button>
        </div>
      )}
    </header>
  );
};
