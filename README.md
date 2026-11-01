# CineBoard — AI Script to Storyboard Studio

**CineBoard** is a full-stack production suite designed for screenwriters, directors, and cinematographers. It takes standard screenplay manuscripts, deconstructs them into chronological scenes and shots, and generates high-resolution cinematic storyboard sequences using Google's Gemini models.

---

## ✨ Features

### 1. Screenplay Manuscript Deconstruction
- **Script Uploader & Formatted Editor**: Upload screenplays (`.txt`, `.fountain`, `.md`, `.pdf`) or write directly inside an authentic Hollywood Courier Prime manuscript editor.
- **Pre-Loaded Sample Scripts**: One-click test drive featuring 4 curated screenplays:
  - *Neon Extraction* (Cyberpunk Action / Sci-Fi Thriller)
  - *The Midnight Archivist* (Film Noir / Psychological Mystery)
  - *The Sunken Citadel* (Epic Fantasy / Adventure)
  - *The 3 A.M. Departure* (Cinematic Indie Drama)
- **Automated Shot Breakdown**: Powered by `gemini-3.8-flash`, extracting scene headings, shot types (Wide, Medium Close-Up, Extreme Close-Up, Over-the-Shoulder, Dutch Angle), camera movements, lenses, action beats, dialogue/audio snippets, duration, and tailored image prompts.

### 2. High-Quality Storyboard Image Generation
- **Model**: Powered by `gemini-3-pro-image-preview`.
- **Resolution Affordance**: Choose between **1K** (Standard), **2K** (Sharp Production), and **4K** (Ultra Cinema Detail) at both the project level and per individual shot.
- **Cinematic Aspect Ratios**: Support for `16:9` (Cinema Widescreen), `4:3` (Classic Academy), `1:1` (Square Storyboard), and `9:16` (Vertical/Reels).
- **Art Direction Presets**:
  - Cinematic 35mm Film (Kodak Vision3 color science, film grain, atmospheric rim lighting)
  - Cyberpunk Neon (Teal & magenta reflections, volumetric haze, anamorphic flares)
  - Classic Film Noir (High-contrast monochrome chiaroscuro, venetian blind shadows)
  - Matte Concept Art (Digital matte painting, dramatic perspective)
  - Painterly Anime (Studio Ghibli & Makoto Shinkai inspired)
  - Hollywood Storyboard Sketch (Expressive charcoal and graphite on toned paper)
  - 3D Feature Animation (Octane render aesthetic with subsurface scattering)
- **Batch & Shot-by-Shot Generation**: "Generate All Shots" progress queue or individual frame generation with prompt fine-tuning.

### 3. Animatic Player Pre-Visualization
- **Interactive Player**: Plays through the storyboard frames according to each shot's duration.
- **Ken Burns Motion**: Smooth simulated camera pan and zoom per shot.
- **Real-Time Subtitles & HUD**: Displays live dialogue overlays, camera lens specs, and shot type badges.
- **Audio Slate**: Subtle synthetic camera slate clicks on shot transitions using the Web Audio API.
- **Playback Controls**: Play/pause, step forward/backward, loop mode, timeline scrubbing ribbon, and speed controls (`0.5x`, `1x`, `1.5x`, `2x`).

### 4. Screenplay & Beat Sheet Inspector
- **Side-by-Side View**: Compare the original manuscript text with the synchronized visual shot timeline.
- **Interactive Highlighting**: Jump straight to shots and inspect cinematography notes directly from the script.

### 5. Multi-Turn Gemini AI Director Suite
- **Scrollable Chat Thread**: Maintains persistent multi-turn conversation history with quick prompt suggestions and copyable prompt snippets.
- **Role-Based System Instructions**:
  - 🎬 **Film Director**: Visual storytelling, scene pacing, dramatic tension, and actor blocking.
  - 🎥 **Cinematographer (DP)**: Lenses (focal lengths like 24mm, 50mm, 85mm, anamorphic squeeze), lighting ratios, color palettes, and camera motion.
  - ✍️ **Script Doctor**: Screenplay polish, dialogue subtext, and scene economy.
  - 🎨 **Storyboard Artist**: Composition framing, 180° screen direction rule, and image prompt engineering.
- **Model Switcher**:
  - `gemini-3.8-flash`: Balanced for general director and storyboard consulting.
  - `gemini-4-argon`: Tailored for deep reasoning and complex narrative architecture.
  - `gemini-3.1-flash-lite`: For rapid ideation and instant prompt adjustments.

### 6. Production Export & Print Suite
- **Hollywood Storyboard Sheet**: Industry-standard 2-up production grid preview formatted for printing or PDF export.
- **Project JSON Export**: Download or copy project state for backup and collaboration.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React icons, Motion animations.
- **Backend**: Node.js, Express, tsx.
- **AI Integration**: `@google/genai` TypeScript SDK (server-side proxy routes):
  - `POST /api/breakdown-script` — `gemini-3.8-flash` with structured JSON schema.
  - `POST /api/generate-shot-image` — `gemini-3-pro-image-preview` with configurable imageSize (1K, 2K, 4K) and aspect ratio.
  - `POST /api/chat` — Multi-turn chat supporting `gemini-3.8-flash`, `gemini-4-argon`, and `gemini-3.1-flash-lite`.
  - `POST /api/enhance-prompt` — `gemini-3.1-flash-lite` for instant prompt refinement.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- Gemini API Key (configured via `GEMINI_API_KEY` in environment variables)

### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Start the development server (runs full-stack Express + Vite on port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Run production server
npm start
```

---

## 📄 License
Apache-2.0
