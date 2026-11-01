import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Film,
  Camera,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ScriptProject, Shot } from '../types';

interface AnimaticPlayerProps {
  project: ScriptProject;
  onGenerateShotImage: (shotId: string) => Promise<void>;
}

export const AnimaticPlayer: React.FC<AnimaticPlayerProps> = ({
  project,
  onGenerateShotImage,
}) => {
  const allShots = project.scenes.flatMap((s) => s.shots);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [kenBurnsVariant, setKenBurnsVariant] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const currentShot: Shot | undefined = allShots[currentShotIndex];

  // Synthetic subtle camera slate click sound on shot change
  const playShotChangeClick = () => {
    if (isMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      // Audio context might be restricted before user interaction
    }
  };

  // Timer loop for animatic shot duration
  useEffect(() => {
    if (!isPlaying || !currentShot) return;

    const durationMs = ((currentShot.durationSeconds || 3) * 1000) / playbackSpeed;

    const timer = setTimeout(() => {
      if (currentShotIndex < allShots.length - 1) {
        setCurrentShotIndex((prev) => prev + 1);
        setKenBurnsVariant((prev) => (prev % 3) + 1);
        playShotChangeClick();
      } else {
        // End reached: pause or loop
        setIsPlaying(false);
        setCurrentShotIndex(0);
      }
    }, durationMs);

    return () => clearTimeout(timer);
  }, [isPlaying, currentShotIndex, playbackSpeed, allShots.length, currentShot]);

  const togglePlay = () => {
    if (!isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    setIsPlaying((prev) => !prev);
  };

  const handleNext = () => {
    if (currentShotIndex < allShots.length - 1) {
      setCurrentShotIndex((prev) => prev + 1);
      setKenBurnsVariant((prev) => (prev % 3) + 1);
      playShotChangeClick();
    }
  };

  const handlePrev = () => {
    if (currentShotIndex > 0) {
      setCurrentShotIndex((prev) => prev - 1);
      setKenBurnsVariant((prev) => (prev % 3) + 1);
      playShotChangeClick();
    }
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Find parent scene of current shot
  const currentScene = project.scenes.find((s) =>
    s.shots.some((shot) => shot.id === currentShot?.id)
  );

  // Total animatic duration
  const totalDuration = allShots.reduce((acc, s) => acc + (s.durationSeconds || 3), 0);
  const elapsedDuration = allShots
    .slice(0, currentShotIndex)
    .reduce((acc, s) => acc + (s.durationSeconds || 3), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Animatic Theater Box */}
      <div
        ref={containerRef}
        className="relative w-full max-w-5xl mx-auto rounded-2xl bg-black border border-zinc-800 shadow-2xl overflow-hidden select-none"
      >
        {/* Aspect Ratio Screen Frame */}
        <div className="relative aspect-video bg-[#05060a] flex items-center justify-center overflow-hidden">
          {currentShot?.imageUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={currentShot.imageUrl}
                alt={`Animatic shot ${currentShot.shotNumber}`}
                key={currentShot.id}
                className={`w-full h-full object-cover ${
                  isPlaying ? `animate-kenburns-${kenBurnsVariant}` : ''
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-3 z-10">
              <Camera className="w-12 h-12 text-zinc-700 animate-pulse" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-300">
                  Image Not Generated for Shot {currentShot?.shotNumber}
                </p>
                <p className="text-xs text-zinc-500 max-w-md">
                  {currentShot?.actionDescription}
                </p>
              </div>
              {currentShot && (
                <button
                  onClick={() => onGenerateShotImage(currentShot.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Shot Frame</span>
                </button>
              )}
            </div>
          )}

          {/* Top HUD: Slate & Camera Info */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs pointer-events-none z-20">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-amber-400 border border-amber-500/30 shadow-md">
                SHOT {currentShot?.shotNumber}
              </span>
              <span className="font-semibold px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-zinc-200 border border-zinc-800">
                {currentShot?.shotType}
              </span>
              <span className="hidden sm:inline font-mono text-[11px] px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md text-zinc-400 border border-zinc-800">
                {currentShot?.lens}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] px-2 py-1 rounded bg-black/75 backdrop-blur-md text-zinc-300 border border-zinc-800">
                {currentShotIndex + 1} / {allShots.length}
              </span>
              <span className="font-mono text-[11px] px-2 py-1 rounded bg-black/75 backdrop-blur-md text-rose-400 border border-rose-500/30">
                REC ●
              </span>
            </div>
          </div>

          {/* Bottom HUD: Subtitle Dialogue & Action Line */}
          <div className="absolute bottom-4 left-6 right-6 z-20 text-center pointer-events-none space-y-1">
            {currentShot?.dialogueOrAudio ? (
              <div className="inline-block bg-black/85 backdrop-blur-md px-5 py-2 rounded-xl border border-zinc-700/80 max-w-2xl shadow-2xl">
                <p className="text-amber-300 font-screenplay text-sm sm:text-base font-bold tracking-wide">
                  {currentShot.dialogueOrAudio}
                </p>
              </div>
            ) : (
              <div className="inline-block bg-black/75 backdrop-blur-md px-4 py-1.5 rounded-xl border border-zinc-800 max-w-xl">
                <p className="text-zinc-300 text-xs sm:text-sm font-sans line-clamp-2">
                  {currentShot?.actionDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Progress Scrubber */}
        <div className="relative h-2 bg-zinc-900 cursor-pointer group">
          <div
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-rose-500 via-amber-500 to-indigo-500 transition-all duration-300"
            style={{
              width: `${(elapsedDuration / (totalDuration || 1)) * 100}%`,
            }}
          />

          {/* Shot Markers */}
          <div className="absolute inset-0 flex">
            {allShots.map((shot, idx) => {
              const shotWeight = (shot.durationSeconds || 3) / (totalDuration || 1);
              return (
                <div
                  key={shot.id}
                  onClick={() => {
                    setCurrentShotIndex(idx);
                    playShotChangeClick();
                  }}
                  title={`Shot ${shot.shotNumber} (${shot.durationSeconds}s)`}
                  style={{ width: `${shotWeight * 100}%` }}
                  className={`h-full border-r border-black/80 hover:bg-white/20 transition-colors ${
                    idx === currentShotIndex ? 'bg-amber-400/40' : ''
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Player Controls Bar */}
        <div className="p-4 bg-[#0d0f17] border-t border-zinc-800/80 flex items-center justify-between gap-4">
          {/* Timecode */}
          <div className="font-mono text-xs text-zinc-400">
            <span className="text-white font-bold">{elapsedDuration.toFixed(1)}s</span> /{' '}
            <span>{totalDuration.toFixed(1)}s</span>
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentShotIndex === 0}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Shot"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
              title={isPlaying ? 'Pause Animatic' : 'Play Animatic Reel'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentShotIndex === allShots.length - 1}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Shot"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCurrentShotIndex(0);
                playShotChangeClick();
              }}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Restart from Beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Right Extras: Speed, Mute, Fullscreen */}
          <div className="flex items-center gap-2">
            {/* Speed Multiplier */}
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              {[0.5, 1, 1.5, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setPlaybackSpeed(s)}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                    playbackSpeed === s
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Slate Click Mute */}
            <button
              onClick={() => setIsMuted((prev) => !prev)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title={isMuted ? 'Unmute Slate Click' : 'Mute Slate Click'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fullscreen */}
            <button
              onClick={handleFullscreenToggle}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Shot Selector Thumbnail Ribbon */}
      <div className="max-w-5xl mx-auto space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Storyboard Timeline Ribbon:
          </span>
          <span>Click any thumbnail to jump</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-3 pt-1">
          {allShots.map((shot, idx) => (
            <div
              key={shot.id}
              onClick={() => {
                setCurrentShotIndex(idx);
                playShotChangeClick();
              }}
              className={`relative shrink-0 w-36 aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                idx === currentShotIndex
                  ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105 shadow-lg'
                  : 'border-zinc-800 opacity-60 hover:opacity-100'
              }`}
            >
              {shot.imageUrl ? (
                <img
                  src={shot.imageUrl}
                  alt={shot.shotNumber}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                  No Image
                </div>
              )}
              <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/80 font-mono text-[9px] font-bold text-amber-300">
                {shot.shotNumber}
              </div>
              <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[9px] text-zinc-400">
                {shot.durationSeconds}s
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
