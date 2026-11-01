import { StylePresetId } from '../types';

export interface SampleScript {
  id: string;
  title: string;
  genre: string;
  tagline: string;
  stylePreset: StylePresetId;
  characterContext: string;
  scriptText: string;
}

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: 'neon-extraction',
    title: 'Neon Extraction',
    genre: 'Cyberpunk Action / Sci-Fi Thriller',
    tagline: 'A rainy rooftop rendezvous turns into an aerial drone interception.',
    stylePreset: 'cyberpunk-neon',
    characterContext: 'Protagonist KAI: cyber-tactical trenchcoat with illuminated collar, titanium cybernetic right eye glowing faint cyan, weathered street fighter look. Target LYRA: holographic courier in sleek silver visor.',
    scriptText: `EXT. NEO-SHINJUKU ROOFTOP - NIGHT (HEAVY RAIN)

A relentless curtain of fluorescent rain drenches the steel catwalks. Giant holographic geishas ripple across adjacent skyscrapers.

KAI (30s), wrapped in a drenched tactical duster, crouches beside an industrial ventilation exhaust. His titanium cybernetic eye clicks into focus, zooming 12x through the mist.

Across the catwalk, LYRA (20s) clutches a glowing obsidian data-drive to her chest.

KAI
(into comms)
I have eyes on the asset. But we're not alone.

A low-frequency WHIR vibrations rattle the steel floor beneath them.

Above the neon haze, THREE HUNTER-DRONES descend silently, searchlights slicing through the downpour like laser scalpels.

LYRA
Kai! They jammed the mag-lift!

One drone locks its crimson targeting reticle directly onto Lyra.

KAI
DOWN!

Kai sprints across the rain-slick grating, unholstering his electromagnetic pulse pistol in mid-stride. He dives over a cluster of high-voltage conduits as sparks erupt in blinding arcs against the dark sky.`,
  },
  {
    id: 'midnight-archivist',
    title: 'The Midnight Archivist',
    genre: 'Film Noir / Psychological Mystery',
    tagline: 'In a cathedral-like basement archive, a forbidden dossier surfaces.',
    stylePreset: 'film-noir',
    characterContext: 'SILAS VANE: 40s weary archivist in rolled-up suspenders, fedora tilted low, wire-rimmed spectacles catching reflection of match flame. Mystery visitor ELENA: silhouette in high collar coat and black veil.',
    scriptText: `INT. MUNICIPAL ARCHIVES - BASEMENT VAULT - NIGHT

Endless corridors of floor-to-ceiling brass filing cabinets stretch into deep shadow. Dust motes float lazily through narrow shafts of moonlight filtering through sidewalk glass prisms above.

SILAS VANE (40s) strikes a wooden match against a iron beam. The sulfur flair illuminates his tired, razor-sharp eyes and wire spectacles.

He slides open DRAWER 407-B. The brass rollers groans like a dying engine.

Inside: A single Manila folder labeled "PROJECT OBLIVION - 1954".

SILAS
(whispers)
They said you burned.

FOOTSTEPS. Slow. Calculated. The distinct click of Italian leather heels against cold terrazzo tile.

Silas freezes. His hand slips discreetly to the Colt Detective Special tucked inside his vest.

From the mouth of the aisle, a tall SHADOW stretches 30 feet long across the floor.

ELENA (O.S.)
Some secrets are waterproof, Silas. Put the folder on the table.

Silas turns slowly. Elena stands backlit in the corridor archway, smoke curling from a cigarette in a black holder.`,
  },
  {
    id: 'sunken-citadel',
    title: 'The Sunken Citadel',
    genre: 'Epic Fantasy / Adventure',
    tagline: 'An explorer discovers a dormant celestial golem beneath the tidal ruins.',
    stylePreset: 'concept-art',
    characterContext: 'ELODIA: nimble dune-scout in leather cowl with runic compass brass gauntlet. THE GOLEM: 40-foot colossal moss-covered celestial automaton with glowing lapis lazuli core.',
    scriptText: `EXT. TIDAL TEMPLE OF AELORIA - DAWN

The ocean has receded for the first time in three centuries, revealing an enormous amphitheater carved from pearl-white sea stone and overgrown with bioluminescent barnacles.

ELODIA (20s) leaps across a collapsed pillar, landing softly on the tidal sand. Her runic gauntlet begins to spin, its needle pointing toward the center dais.

ELODIA
The sea kept its promise.

In the center of the amphitheater sits what appears to be a hill of coral. But as the morning sunlight strikes the stone, the coral splits.

A massive ANCIENT TITAN raises its head. Its chest chamber opens, revealing a blinding core of azure celestial fire that casts shimmering caustic ripples onto the surrounding ruin walls.

The Titan's eye sockets flare with golden starlight.

It tilts its gargantuan head down toward Elodia, its breath releasing centuries of trapped oceanic steam.

Elodia raises her palm. The markings on her gauntlet match the constellations etched into the Titan's brow.`,
  },
  {
    id: 'final-coffee',
    title: 'The 3 A.M. Departure',
    genre: 'Cinematic Indie Drama',
    tagline: 'Two estranged partners share one last cup before the cross-country train.',
    stylePreset: 'cinematic-film',
    characterContext: 'MAYA: worn denim jacket, sleepless gaze, fingers nervously turning a ceramic diner mug. LEO: wool peacoat, bag packed beside booth, holding an envelope with two train tickets.',
    scriptText: `INT. EDDIE'S 24-HOUR DINER - NIGHT

Fluorescent hum. Warm amber vinyl booths. Outside the rain-streaked window, yellow taxi cabs splash through puddles on 8th Avenue.

MAYA (30s) watches steam rise from her chipped white ceramic coffee mug. Her reflection in the dark glass looks ghostly, exhausted.

Across the table, LEO (30s) hasn't touched his diner pie. Between them on the formica table sits a sealed manila envelope.

LEO
The sleeper train leaves Penn Station in forty minutes.

Maya smiles, but her eyes don't follow.

MAYA
You always pack too early.

Leo reaches his hand halfway across the table, hovering over the envelope.

LEO
Come with me. Not tomorrow. Tonight.

A waitress in an apron refills Leo's coffee, the liquid splashing dark and hot. The moment shatters.

Maya looks out the window as the red tail-lights of a downtown bus reflect across her face like a stop sign.`,
  },
];
