import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { StoryboardReel } from './components/StoryboardReel';
import { AnimaticPlayer } from './components/AnimaticPlayer';
import { ScriptBreakdownView } from './components/ScriptBreakdownView';
import { DirectorChatbot } from './components/DirectorChatbot';
import { ScriptUploaderModal } from './components/ScriptUploaderModal';
import { ShotEditModal } from './components/ShotEditModal';
import { ExportModal } from './components/ExportModal';
import { ScriptProject, Shot, ImageResolution, AspectRatio, StylePresetId } from './types';
import { DEFAULT_INITIAL_PROJECT } from './data/defaultProject';
import { apiService } from './services/api';
import { Film, Sparkles, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function App() {
  const [project, setProject] = useState<ScriptProject | null>(DEFAULT_INITIAL_PROJECT);
  const [activeTab, setActiveTab] = useState<'reel' | 'animatic' | 'script'>('reel');
  const [globalResolution, setGlobalResolution] = useState<ImageResolution>('2K');
  const [globalAspectRatio, setGlobalAspectRatio] = useState<AspectRatio>('16:9');

  // Modals & Drawers
  const [isUploaderOpen, setIsUploaderOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);

  // Loading & Batch Generation States
  const [isScriptLoading, setIsScriptLoading] = useState<boolean>(false);
  const [isBatchGenerating, setIsBatchGenerating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ completed: number; total: number }>({
    completed: 0,
    total: 0,
  });

  // Global Notification Banner
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 5000);
  };

  // Generate an individual shot image using model gemini-3-pro-image-preview
  const handleGenerateShotImage = async (shotId: string, customSize?: ImageResolution) => {
    if (!project) return;

    const targetSize = customSize || globalResolution;

    // Set generating status on the specific shot
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        scenes: prev.scenes.map((scene) => ({
          ...scene,
          shots: scene.shots.map((shot) =>
            shot.id === shotId
              ? { ...shot, isGeneratingImage: true, imageGenerationError: undefined }
              : shot
          ),
        })),
      };
    });

    // Find the shot
    const allShots = project.scenes.flatMap((s) => s.shots);
    const targetShot = allShots.find((s) => s.id === shotId);

    if (!targetShot) return;

    try {
      const result = await apiService.generateShotImage({
        prompt: targetShot.imagePrompt,
        imageSize: targetSize, // 1K, 2K, 4K affordance
        aspectRatio: globalAspectRatio,
        stylePreset: project.stylePreset,
        characterContext: project.characterContext,
      });

      // Update shot with generated image URL and size used
      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          scenes: prev.scenes.map((scene) => ({
            ...scene,
            shots: scene.shots.map((shot) =>
              shot.id === shotId
                ? {
                    ...shot,
                    imageUrl: result.imageUrl,
                    imageSizeUsed: result.imageSize,
                    isGeneratingImage: false,
                    imageGenerationError: undefined,
                  }
                : shot
            ),
          })),
        };
      });

      showNotification(`Shot ${targetShot.shotNumber} generated at ${targetSize}!`, 'success');
    } catch (err: any) {
      console.error('Error generating shot image:', err);
      const errorMsg = err.message || 'Image generation failed';

      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          scenes: prev.scenes.map((scene) => ({
            ...scene,
            shots: scene.shots.map((shot) =>
              shot.id === shotId
                ? { ...shot, isGeneratingImage: false, imageGenerationError: errorMsg }
                : shot
            ),
          })),
        };
      });

      showNotification(`Failed generating Shot ${targetShot.shotNumber}: ${errorMsg}`, 'error');
    }
  };

  // Batch generate all shots in sequence
  const handleGenerateAll = async () => {
    if (!project || isBatchGenerating) return;

    const allShots = project.scenes.flatMap((s) => s.shots);
    const pendingShots = allShots.filter((s) => !s.imageUrl);
    const shotsToGenerate = pendingShots.length > 0 ? pendingShots : allShots;

    if (shotsToGenerate.length === 0) return;

    setIsBatchGenerating(true);
    setBatchProgress({ completed: 0, total: shotsToGenerate.length });
    showNotification(
      `Starting batch generation of ${shotsToGenerate.length} shots at ${globalResolution} resolution...`,
      'info'
    );

    let completed = 0;

    for (const shot of shotsToGenerate) {
      try {
        await handleGenerateShotImage(shot.id, globalResolution);
      } catch (e) {
        console.error('Batch generation shot error:', e);
      }
      completed++;
      setBatchProgress({ completed, total: shotsToGenerate.length });
    }

    setIsBatchGenerating(false);
    showNotification(`Batch generation complete! All shots generated at ${globalResolution}.`, 'success');
  };

  // Submit script for decomposition & breakdown
  const handleScriptSubmit = async (data: {
    scriptText: string;
    stylePreset: StylePresetId;
    resolution: ImageResolution;
    aspectRatio: AspectRatio;
    targetShotsCount: number;
    visualNotes: string;
    characterContext: string;
  }) => {
    setIsScriptLoading(true);
    try {
      const breakdown = await apiService.breakdownScript(
        data.scriptText,
        data.stylePreset,
        data.targetShotsCount,
        data.visualNotes
      );

      const newProject: ScriptProject = {
        id: `project-${Date.now()}`,
        title: breakdown.title || 'Untitled Screenplay',
        genre: breakdown.genre || 'Cinematic Drama',
        logline: breakdown.logline || '',
        visualStyleNotes: breakdown.visualStyleNotes,
        stylePreset: data.stylePreset,
        aspectRatio: data.aspectRatio,
        defaultImageSize: data.resolution,
        characterRoster: breakdown.characterRoster || [],
        characterContext: data.characterContext,
        rawScript: data.scriptText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scenes: breakdown.scenes.map((sc, sIdx) => ({
          sceneNumber: sc.sceneNumber || sIdx + 1,
          sceneHeading: sc.sceneHeading,
          location: sc.location,
          timeOfDay: sc.timeOfDay,
          synopsis: sc.synopsis,
          shots: sc.shots.map((sh, shIdx) => ({
            id: sh.id || `shot-${sIdx + 1}-${shIdx + 1}`,
            shotNumber: sh.shotNumber || `${sIdx + 1}.${shIdx + 1}`,
            shotType: sh.shotType || 'Wide Shot',
            cameraMovement: sh.cameraMovement || 'Static',
            lens: sh.lens || '35mm Anamorphic',
            actionDescription: sh.actionDescription,
            lightingAndAtmosphere: sh.lightingAndAtmosphere,
            dialogueOrAudio: sh.dialogueOrAudio,
            durationSeconds: sh.durationSeconds || 3,
            imagePrompt: sh.imagePrompt,
            imageUrl: undefined,
          })),
        })),
      };

      setProject(newProject);
      setGlobalResolution(data.resolution);
      setGlobalAspectRatio(data.aspectRatio);
      setIsUploaderOpen(false);
      setActiveTab('reel');

      showNotification(
        `Script decomposed into ${newProject.scenes.length} scenes and ${
          newProject.scenes.flatMap((s) => s.shots).length
        } shots!`,
        'success'
      );
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Failed to breakdown script. Please check your text.', 'error');
    } finally {
      setIsScriptLoading(false);
    }
  };

  // Re-ordering shots
  const handleMoveShot = (shotId: string, direction: 'prev' | 'next') => {
    if (!project) return;

    setProject((prev) => {
      if (!prev) return null;

      // Flatten shots, swap, then re-group or swap within scene
      const newScenes = prev.scenes.map((scene) => {
        const shotIdx = scene.shots.findIndex((s) => s.id === shotId);
        if (shotIdx === -1) return scene;

        const targetIdx = direction === 'prev' ? shotIdx - 1 : shotIdx + 1;
        if (targetIdx < 0 || targetIdx >= scene.shots.length) return scene;

        const newShots = [...scene.shots];
        const temp = newShots[shotIdx];
        newShots[shotIdx] = newShots[targetIdx];
        newShots[targetIdx] = temp;

        return { ...scene, shots: newShots };
      });

      return { ...prev, scenes: newScenes };
    });
  };

  // Delete shot
  const handleDeleteShot = (shotId: string) => {
    if (!project) return;
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        scenes: prev.scenes.map((scene) => ({
          ...scene,
          shots: scene.shots.filter((s) => s.id !== shotId),
        })),
      };
    });
  };

  // Add a shot to a scene
  const handleAddShotToScene = (sceneNumber: number) => {
    if (!project) return;

    const targetScene = project.scenes.find((s) => s.sceneNumber === sceneNumber);
    if (!targetScene) return;

    const nextShotNum = `${sceneNumber}.${targetScene.shots.length + 1}`;
    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      shotNumber: nextShotNum,
      shotType: 'Medium Shot (MS)',
      cameraMovement: 'Slow Creeping Push-In',
      lens: '50mm Prime f/1.4',
      actionDescription: 'Characters react to the ongoing beat with heightened tension.',
      lightingAndAtmosphere: 'Cinematic rim lighting with soft ambient fill',
      durationSeconds: 3,
      imagePrompt: `Cinematic medium shot of scene ${sceneNumber}, high production movie concept art, dramatic composition, 35mm film still`,
    };

    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        scenes: prev.scenes.map((scene) =>
          scene.sceneNumber === sceneNumber
            ? { ...scene, shots: [...scene.shots, newShot] }
            : scene
        ),
      };
    });

    setEditingShot(newShot);
  };

  // Update shot from modal
  const handleSaveShot = (updatedShot: Shot) => {
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        scenes: prev.scenes.map((scene) => ({
          ...scene,
          shots: scene.shots.map((s) => (s.id === updatedShot.id ? updatedShot : s)),
        })),
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#07080e] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Top Navigation Bar */}
      <Navbar
        project={project}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        onOpenUploader={() => setIsUploaderOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onGenerateAll={handleGenerateAll}
        isBatchGenerating={isBatchGenerating}
        batchProgress={batchProgress}
        globalResolution={globalResolution}
        setGlobalResolution={setGlobalResolution}
        globalAspectRatio={globalAspectRatio}
        setGlobalAspectRatio={setGlobalAspectRatio}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 max-w-md animate-in slide-in-from-top-2 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-medium backdrop-blur-md ${
              notification.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : notification.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="flex-1">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {project ? (
          <>
            {activeTab === 'reel' && (
              <StoryboardReel
                project={project}
                onGenerateShotImage={handleGenerateShotImage}
                onEditShot={(shot) => setEditingShot(shot)}
                onDeleteShot={handleDeleteShot}
                onMoveShot={handleMoveShot}
                onAddShotToScene={handleAddShotToScene}
                onOpenAnimatic={() => setActiveTab('animatic')}
                currentResolution={globalResolution}
              />
            )}

            {activeTab === 'animatic' && (
              <AnimaticPlayer
                project={project}
                onGenerateShotImage={handleGenerateShotImage}
              />
            )}

            {activeTab === 'script' && (
              <ScriptBreakdownView
                project={project}
                onSelectShot={(shot) => setEditingShot(shot)}
                onGenerateShotImage={handleGenerateShotImage}
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Film className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">No Script Loaded</h2>
              <p className="text-xs text-zinc-400 max-w-md">
                Upload a screenplay or select a pre-loaded sample script to automatically generate visual storyboard scenes and high-resolution images.
              </p>
            </div>
            <button
              onClick={() => setIsUploaderOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upload Script</span>
            </button>
          </div>
        )}
      </main>

      {/* Multi-Turn Gemini Chatbot (Director's Suite) */}
      <DirectorChatbot
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        project={project}
        onApplyPromptToShot={(prompt) => {
          if (editingShot) {
            setEditingShot({ ...editingShot, imagePrompt: prompt });
          }
        }}
      />

      {/* Script Upload & Configuration Modal */}
      <ScriptUploaderModal
        isOpen={isUploaderOpen}
        onClose={() => setIsUploaderOpen(false)}
        onSubmit={handleScriptSubmit}
        isLoading={isScriptLoading}
      />

      {/* Shot Edit & Prompt Fine-Tuning Modal */}
      <ShotEditModal
        shot={editingShot}
        isOpen={Boolean(editingShot)}
        onClose={() => setEditingShot(null)}
        onSave={handleSaveShot}
        onRegenerate={handleGenerateShotImage}
        stylePreset={project?.stylePreset || 'cinematic-film'}
        defaultResolution={globalResolution}
      />

      {/* Export Hollywood Storyboard Sheet Modal */}
      {project && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          project={project}
        />
      )}
    </div>
  );
}
