import React, { useState } from 'react';
import {
  Film,
  Camera,
  Play,
  RotateCw,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  AlertCircle,
  Eye,
  Sliders,
  Volume2,
  Clock,
  Plus,
  Image as ImageIcon,
} from 'lucide-react';
import { ScriptProject, Scene, Shot, ImageResolution } from '../types';
import { RESOLUTION_OPTIONS } from '../data/presets';

interface StoryboardReelProps {
  project: ScriptProject;
  onGenerateShotImage: (shotId: string, customSize?: ImageResolution) => Promise<void>;
  onEditShot: (shot: Shot) => void;
  onDeleteShot: (shotId: string) => void;
  onMoveShot: (shotId: string, direction: 'prev' | 'next') => void;
  onAddShotToScene: (sceneNumber: number) => void;
  onOpenAnimatic: () => void;
  currentResolution: ImageResolution;
}

export const StoryboardReel: React.FC<StoryboardReelProps> = ({
  project,
  onGenerateShotImage,
  onEditShot,
  onDeleteShot,
  onMoveShot,
  onAddShotToScene,
  onOpenAnimatic,
  currentResolution,
}) => {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; shotNumber: string; prompt: string } | null>(null);

  const allShots = project.scenes.flatMap((s) => s.shots);
  const generatedCount = allShots.filter((s) => Boolean(s.imageUrl)).length;

  return (
    <div className="space-y-10 pb-20">
      {/* Project Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#131625] via-[#10121d] to-[#0d0f17] border border-zinc-800/80 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {project.genre}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                Style: {project.stylePreset}
              </span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-850 text-cyan-400 border border-cyan-500/30">
                gemini-3-pro-image-preview
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40">
                {currentResolution}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-3xl leading-relaxed">
              {project.logline}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-zinc-400">Storyboard Progress</div>
              <div className="text-sm font-bold text-white font-mono">
                {generatedCount} / {allShots.length} Generated
              </div>
            </div>

            {generatedCount > 0 && (
              <button
                onClick={onOpenAnimatic}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Animatic</span>
              </button>
            )}
          </div>
        </div>

        {/* Character Roster Strip if available */}
        {project.characterRoster && project.characterRoster.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center gap-3 overflow-x-auto pb-1 text-xs">
            <span className="text-zinc-500 uppercase font-semibold text-[10px] tracking-wider whitespace-nowrap">
              Cast & Wardrobe:
            </span>
            {project.characterRoster.map((char, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300 whitespace-nowrap"
              >
                <span className="font-bold text-white">{char.name}:</span>
                <span className="text-zinc-400 truncate max-w-xs">{char.visualDescription}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storyboard Scenes & Shot Reels */}
      <div className="space-y-12">
        {project.scenes.map((scene) => (
          <div key={scene.sceneNumber} className="space-y-4">
            {/* Scene Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 text-amber-400 font-mono font-bold text-xs">
                  {scene.sceneNumber}
                </span>
                <div>
                  <h2 className="text-base font-bold text-white tracking-wide font-screenplay">
                    {scene.sceneHeading}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">{scene.synopsis}</p>
                </div>
              </div>

              <button
                onClick={() => onAddShotToScene(scene.sceneNumber)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Add Shot</span>
              </button>
            </div>

            {/* Shots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {scene.shots.map((shot, shotIndex) => {
                const isFirst = shotIndex === 0 && scene.sceneNumber === 1;
                const isLast =
                  shotIndex === scene.shots.length - 1 &&
                  scene.sceneNumber === project.scenes.length;

                return (
                  <div
                    key={shot.id}
                    className="flex flex-col bg-[#11131e] border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 group"
                  >
                    {/* Shot Header Bar */}
                    <div className="flex items-center justify-between px-3 py-2 bg-[#161929] border-b border-zinc-800/80 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          {shot.shotNumber}
                        </span>
                        <span className="font-semibold text-zinc-300 truncate max-w-[110px]">
                          {shot.shotType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 font-mono">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span>{shot.durationSeconds}s</span>
                      </div>
                    </div>

                    {/* Storyboard Image Frame */}
                    <div className="relative aspect-video bg-black/60 flex items-center justify-center overflow-hidden border-b border-zinc-800/80">
                      {shot.isGeneratingImage ? (
                        /* Generating Loading State */
                        <div className="absolute inset-0 bg-[#0e1019] flex flex-col items-center justify-center p-4 text-center space-y-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
                            <Camera className="w-5 h-5 text-amber-400 absolute inset-0 m-auto" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-white">
                              Generating {currentResolution} Frame
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                              gemini-3-pro-image-preview
                            </p>
                          </div>
                        </div>
                      ) : shot.imageUrl ? (
                        /* Generated Image View */
                        <div className="relative w-full h-full group/img overflow-hidden cursor-pointer"
                             onClick={() => setLightboxImage({ url: shot.imageUrl!, shotNumber: shot.shotNumber, prompt: shot.imagePrompt })}>
                          <img
                            src={shot.imageUrl}
                            alt={`Storyboard frame ${shot.shotNumber}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                            loading="lazy"
                          />

                          {/* Image Resolution Tag */}
                          <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono font-bold text-amber-400 border border-amber-400/30">
                            {shot.imageSizeUsed || currentResolution}
                          </div>

                          {/* Hover Overlay Controls */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImage({ url: shot.imageUrl!, shotNumber: shot.shotNumber, prompt: shot.imagePrompt });
                              }}
                              className="p-2 rounded-xl bg-zinc-800/90 text-white hover:bg-zinc-700 transition-colors shadow-lg"
                              title="Full Screen Preview"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onGenerateShotImage(shot.id);
                              }}
                              className="p-2 rounded-xl bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400 transition-colors shadow-lg"
                              title={`Regenerate at ${currentResolution}`}
                            >
                              <RotateCw className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Placeholder / Generate Prompt View */
                        <div className="p-4 text-center space-y-2">
                          <ImageIcon className="w-7 h-7 text-zinc-600 mx-auto" />
                          <p className="text-[11px] text-zinc-400 line-clamp-2 px-2">
                            {shot.lens} • {shot.cameraMovement}
                          </p>
                          <button
                            type="button"
                            onClick={() => onGenerateShotImage(shot.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-md transition-all cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Generate ({currentResolution})</span>
                          </button>
                        </div>
                      )}

                      {/* Error state alert */}
                      {shot.imageGenerationError && (
                        <div className="absolute bottom-2 left-2 right-2 bg-red-950/90 border border-red-500/50 rounded-lg p-2 text-[11px] text-red-200 flex items-start gap-1.5 z-10 backdrop-blur-sm">
                          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                          <div className="flex-1 truncate">{shot.imageGenerationError}</div>
                          <button
                            onClick={() => onGenerateShotImage(shot.id)}
                            className="text-amber-400 hover:underline font-bold shrink-0"
                          >
                            Retry
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Camera Specs & Shot Details */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {/* Lens & Camera Movement Pills */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {shot.lens}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-850 text-indigo-300">
                            {shot.cameraMovement}
                          </span>
                        </div>

                        {/* Action Description */}
                        <p className="text-xs text-zinc-200 leading-relaxed font-sans line-clamp-3">
                          {shot.actionDescription}
                        </p>

                        {/* Dialogue / Audio Line */}
                        {shot.dialogueOrAudio && (
                          <div className="p-2 rounded-lg bg-[#0a0c13] border border-zinc-800/80 text-[11px] font-screenplay text-amber-200/90 flex items-start gap-2">
                            <Volume2 className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                            <div className="line-clamp-2 italic">{shot.dialogueOrAudio}</div>
                          </div>
                        )}

                        {/* Atmosphere Tag */}
                        <div className="text-[10px] text-zinc-400 italic line-clamp-1">
                          Light: {shot.lightingAndAtmosphere}
                        </div>
                      </div>

                      {/* Shot Bottom Controls */}
                      <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                        {/* Reorder Arrows */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => onMoveShot(shot.id, 'prev')}
                            disabled={isFirst}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Shot Left"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveShot(shot.id, 'next')}
                            disabled={isLast}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move Shot Right"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Quick Size Selector Affordance per-shot */}
                        <div className="flex items-center gap-1 bg-zinc-900 px-1 py-0.5 rounded border border-zinc-800">
                          {(['1K', '2K', '4K'] as ImageResolution[]).map((res) => (
                            <button
                              key={res}
                              type="button"
                              onClick={() => onGenerateShotImage(shot.id, res)}
                              title={`Generate this frame at ${res} using gemini-3-pro-image-preview`}
                              className={`text-[9px] font-mono px-1 py-0.5 rounded transition-colors ${
                                (shot.imageSizeUsed || currentResolution) === res
                                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              {res}
                            </button>
                          ))}
                        </div>

                        {/* Edit & Delete */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEditShot(shot)}
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800"
                            title="Edit Shot & Prompt"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteShot(shot.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
                            title="Delete Shot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-lg"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-[#0c0e17] rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-[#121524]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                  SHOT {lightboxImage.shotNumber}
                </span>
                <span className="text-xs text-zinc-400">
                  Generated with model: gemini-3-pro-image-preview
                </span>
              </div>
              <button
                onClick={() => setLightboxImage(null)}
                className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white text-xs"
              >
                Close (ESC)
              </button>
            </div>

            <div className="relative aspect-video max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={lightboxImage.url}
                alt="Storyboard frame preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="p-4 bg-[#0e101b] border-t border-zinc-800 text-xs text-zinc-300 font-mono">
              <span className="text-zinc-500 font-bold block mb-1">PROMPT:</span>
              <p className="text-zinc-300 leading-relaxed font-sans">{lightboxImage.prompt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
