import { StylePreset } from '../types';

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'cinematic-film',
    label: 'Cinematic 35mm Film',
    description: 'Natural film grain, Kodak Vision3 color science, rich shadows & realistic depth',
    badge: '35mm Film',
    accentColor: 'from-amber-600 to-orange-700',
  },
  {
    id: 'cyberpunk-neon',
    label: 'Cyberpunk Neon',
    description: 'Teal & magenta neon lighting, rain reflections, volumetric haze & anamorphic flare',
    badge: 'Neo-Tokyo',
    accentColor: 'from-cyan-500 to-fuchsia-600',
  },
  {
    id: 'film-noir',
    label: 'Classic Film Noir',
    description: 'Monochrome chiaroscuro, venetian blind shadows, silver screen contrast & smoke',
    badge: 'Noir B&W',
    accentColor: 'from-zinc-500 to-zinc-900',
  },
  {
    id: 'concept-art',
    label: 'Matte Concept Art',
    description: 'Epic digital matte painting, atmospheric perspective, dramatic cinematic framing',
    badge: 'Matte Painting',
    accentColor: 'from-emerald-500 to-teal-700',
  },
  {
    id: 'anime-ghibli',
    label: 'Painterly Anime',
    description: 'Ghibli & Shinkai inspired hand-painted backgrounds, expressive lighting & sky',
    badge: 'Anime Storyboard',
    accentColor: 'from-blue-400 to-indigo-600',
  },
  {
    id: 'charcoal-sketch',
    label: 'Hollywood Storyboard Sketch',
    description: 'Expressive charcoal and graphite sketches on toned paper, authentic studio pre-vis',
    badge: 'Charcoal Previs',
    accentColor: 'from-stone-400 to-stone-700',
  },
  {
    id: 'pixar-3d',
    label: '3D Feature Animation',
    description: 'Stylized 3D rendering with subsurface scattering, vibrant key lighting & staging',
    badge: '3D Render',
    accentColor: 'from-purple-500 to-pink-600',
  },
];

export const RESOLUTION_OPTIONS: { id: '1K' | '2K' | '4K'; label: string; desc: string; pixelBadge: string }[] = [
  { id: '1K', label: '1K Standard', desc: 'Fastest generation (~1024px)', pixelBadge: '1K High Def' },
  { id: '2K', label: '2K Sharp', desc: 'Crisp production detail (~2048px)', pixelBadge: '2K 1440p' },
  { id: '4K', label: '4K Ultra Film', desc: 'Maximum fidelity & textures (~4096px)', pixelBadge: '4K Cinema' },
];

export const ASPECT_RATIOS: { id: '16:9' | '4:3' | '1:1' | '9:16'; label: string; desc: string; aspectClass: string }[] = [
  { id: '16:9', label: '16:9', desc: 'Widescreen Cinema', aspectClass: 'aspect-video' },
  { id: '4:3', label: '4:3', desc: 'Classic Academy', aspectClass: 'aspect-4/3' },
  { id: '1:1', label: '1:1', desc: 'Square Storyboard', aspectClass: 'aspect-square' },
  { id: '9:16', label: '9:16', desc: 'Vertical / Mobile', aspectClass: 'aspect-9/16' },
];
