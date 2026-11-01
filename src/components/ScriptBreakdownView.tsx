import React, { useState } from 'react';
import {
  FileText,
  Camera,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Eye,
  Film,
  Clock,
} from 'lucide-react';
import { ScriptProject, Scene, Shot } from '../types';

interface ScriptBreakdownViewProps {
  project: ScriptProject;
  onSelectShot: (shot: Shot) => void;
  onGenerateShotImage: (shotId: string) => Promise<void>;
}

export const ScriptBreakdownView: React.FC<ScriptBreakdownViewProps> = ({
  project,
  onSelectShot,
  onGenerateShotImage,
}) => {
  const [selectedShotId, setSelectedShotId] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20">
      {/* Left Column: Screenplay Reader (Courier Font) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Screenplay Manuscript
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Industry Standard Format</span>
        </div>

        <div className="bg-[#0b0d14] rounded-2xl border border-zinc-800 p-6 max-h-[750px] overflow-y-auto shadow-xl film-grain font-screenplay text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap select-text">
          {project.rawScript}
        </div>
      </div>

      {/* Right Column: Visual Breakdown & Shot Sequence */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Scene & Shot Breakdown Timeline
            </h2>
          </div>
          <span className="text-[11px] font-mono text-amber-400">
            {project.scenes.length} Scenes • {project.scenes.flatMap((s) => s.shots).length} Shots
          </span>
        </div>

        <div className="space-y-8 max-h-[750px] overflow-y-auto pr-2">
          {project.scenes.map((scene) => (
            <div
              key={scene.sceneNumber}
              className="bg-[#10121d] border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-lg"
            >
              {/* Scene Heading */}
              <div className="flex items-start justify-between gap-3 border-b border-zinc-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      SCENE {scene.sceneNumber}
                    </span>
                    <h3 className="font-screenplay font-bold text-sm text-white">
                      {scene.sceneHeading}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400">{scene.synopsis}</p>
                </div>
              </div>

              {/* Shots List for this Scene */}
              <div className="space-y-3">
                {scene.shots.map((shot) => (
                  <div
                    key={shot.id}
                    onClick={() => {
                      setSelectedShotId(shot.id);
                      onSelectShot(shot);
                    }}
                    className={`flex items-start gap-4 p-3.5 rounded-xl border transition-all cursor-pointer ${
                      selectedShotId === shot.id
                        ? 'bg-zinc-800/90 border-amber-400 shadow-md ring-1 ring-amber-400/30'
                        : 'bg-[#141724]/70 border-zinc-800/80 hover:bg-zinc-800/50 hover:border-zinc-700'
                    }`}
                  >
                    {/* Shot Thumbnail */}
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-zinc-700">
                      {shot.imageUrl ? (
                        <img
                          src={shot.imageUrl}
                          alt={shot.shotNumber}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 p-1 text-center">
                          <Camera className="w-4 h-4 mb-1" />
                          <span className="text-[9px] font-mono">No Image</span>
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] font-bold text-amber-400">
                        {shot.shotNumber}
                      </span>
                    </div>

                    {/* Shot Details */}
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-white">{shot.shotType}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-indigo-300">
                            {shot.lens}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                            {shot.cameraMovement}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                          {shot.durationSeconds}s
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed font-sans line-clamp-2">
                        {shot.actionDescription}
                      </p>

                      {shot.dialogueOrAudio && (
                        <p className="text-[11px] font-screenplay text-amber-300/90 italic truncate">
                          "{shot.dialogueOrAudio}"
                        </p>
                      )}
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0 self-center" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
