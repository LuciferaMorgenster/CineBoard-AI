import React, { useState } from 'react';
import {
  Printer,
  Download,
  FileCode,
  X,
  Check,
  Film,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ScriptProject } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ScriptProject;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const allShots = project.scenes.flatMap((s) => s.shots);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${project.title.toLowerCase().replace(/\s+/g, '_')}_storyboard.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto no-print">
      <div className="relative w-full max-w-4xl bg-[#0f111a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#131624]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Export Production Storyboard
              </h2>
              <p className="text-xs text-zinc-400">
                Print Hollywood standard boards, save PDF, or export complete project data.
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

        {/* Action Bar */}
        <div className="p-4 bg-[#0a0c13] border-b border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Project</span>
            </button>
          </div>

          <button
            onClick={handleCopyJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>JSON Copied!</span>
              </>
            ) : (
              <>
                <FileCode className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>

        {/* Printable Hollywood Storyboard Sheet Preview */}
        <div className="p-6 max-h-[65vh] overflow-y-auto bg-zinc-950 font-sans">
          <div className="bg-white text-zinc-950 p-8 rounded-xl shadow-2xl max-w-3xl mx-auto space-y-6">
            {/* Sheet Slate Header */}
            <div className="border-b-2 border-black pb-4 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-black tracking-tight font-screenplay uppercase">
                  {project.title}
                </h1>
                <p className="text-xs text-zinc-600 font-mono mt-1">
                  GENRE: {project.genre.toUpperCase()} • STYLE: {project.stylePreset.toUpperCase()}
                </p>
                <p className="text-xs text-zinc-800 italic mt-1 max-w-xl font-serif">
                  "{project.logline}"
                </p>
              </div>

              <div className="text-right font-mono text-xs border border-black p-2 rounded">
                <div>DATE: {new Date().toLocaleDateString()}</div>
                <div>BOARD TOTAL: {allShots.length} SHOTS</div>
                <div>RES: {project.defaultImageSize}</div>
              </div>
            </div>

            {/* Shots 2-column or 3-column Production Sheet Layout */}
            <div className="grid grid-cols-2 gap-6">
              {allShots.map((shot) => (
                <div
                  key={shot.id}
                  className="border border-zinc-400 rounded-lg overflow-hidden flex flex-col bg-zinc-50"
                >
                  {/* Frame */}
                  <div className="aspect-video bg-zinc-200 border-b border-zinc-400 flex items-center justify-center relative overflow-hidden">
                    {shot.imageUrl ? (
                      <img
                        src={shot.imageUrl}
                        alt={shot.shotNumber}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-[10px] font-mono text-zinc-500 text-center p-2">
                        [FRAME SKETCH: {shot.shotType}]
                      </div>
                    )}
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black text-white text-[10px] font-mono font-bold">
                      {shot.shotNumber}
                    </span>
                    <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-zinc-800 text-white text-[9px] font-mono">
                      {shot.durationSeconds}s
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="p-2.5 text-xs space-y-1.5 font-screenplay">
                    <div className="flex items-center justify-between text-[11px] font-bold border-b border-zinc-200 pb-1">
                      <span>{shot.shotType.toUpperCase()}</span>
                      <span className="font-mono text-[10px] text-zinc-600">{shot.lens}</span>
                    </div>

                    <p className="text-[11px] text-zinc-800 font-sans leading-snug">
                      {shot.actionDescription}
                    </p>

                    {shot.dialogueOrAudio && (
                      <p className="text-[11px] text-amber-900 font-screenplay italic border-l-2 border-amber-600 pl-1.5">
                        "{shot.dialogueOrAudio}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-300 pt-3 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>PRODUCED WITH CINEBOARD STUDIO AI • MODEL: gemini-3-pro-image-preview</span>
              <span>PAGE 1 OF 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
