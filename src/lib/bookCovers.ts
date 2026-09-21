// ── Official Cover Assignments for Draftwell Novels ───────────────────────
import shapeOfRainCover from '../assets/images/shape_of_rain_1789976981502.jpg'
import gardenerOfVorCover from '../assets/images/gardener_of_vor_1789976939127.jpg'
import glassOrchardCover from '../assets/images/glass_orchard_1789976965862.jpg'
import hollowSeasonCover from '../assets/images/hollow_season_1789976953673.jpg'
import paperCrownsCover from '../assets/images/paper_crowns_cover_1789976913938.jpg'
import saltInTheStaticCover from '../assets/images/salt_in_the_static_1789977530474.jpg'
import seventeenMoonsCover from '../assets/images/seventeen_moons_1789978589792.jpg'
import lastTrainToYonderCover from '../assets/images/last_train_to_yonder_1789978607423.jpg'

export interface BookCoverAsset {
  title: string
  normalizedKey: string
  storyId: string
  image: string
  publicUrl: string
  coverColor: string
}

export const OFFICIAL_BOOK_COVERS: BookCoverAsset[] = [
  {
    title: 'The Shape of Rain',
    normalizedKey: 'shape of rain',
    storyId: 'demo-1',
    image: shapeOfRainCover,
    publicUrl: '/covers/shape-of-rain.jpg',
    coverColor: '#0a1d33',
  },
  {
    title: 'Salt in the Static',
    normalizedKey: 'salt in the static',
    storyId: 'demo-2',
    image: saltInTheStaticCover,
    publicUrl: '/covers/salt-in-the-static.jpg',
    coverColor: '#1a3a5c',
  },
  {
    title: 'The Glass Orchard',
    normalizedKey: 'glass orchard',
    storyId: 'demo-3',
    image: glassOrchardCover,
    publicUrl: '/covers/the-glass-orchard.jpg',
    coverColor: '#1d1230',
  },
  {
    title: 'Hollow Season',
    normalizedKey: 'hollow season',
    storyId: 'demo-4',
    image: hollowSeasonCover,
    publicUrl: '/covers/hollow-season.jpg',
    coverColor: '#181b24',
  },
  {
    title: 'Seventeen Moons',
    normalizedKey: 'seventeen moons',
    storyId: 'demo-5',
    image: seventeenMoonsCover,
    publicUrl: '/covers/seventeen-moons.jpg',
    coverColor: '#2b173e',
  },
  {
    title: 'The Gardener of Vor',
    normalizedKey: 'the gardner of vor', // handles user spelling "The Gardner of vor"
    storyId: 'demo-6',
    image: gardenerOfVorCover,
    publicUrl: '/covers/the-gardener-of-vor.jpg',
    coverColor: '#1f3418',
  },
  {
    title: 'Last Train to Yonder',
    normalizedKey: 'last train to yonder',
    storyId: 'demo-7',
    image: lastTrainToYonderCover,
    publicUrl: '/covers/last-train-to-yonder.jpg',
    coverColor: '#102744',
  },
  {
    title: 'Paper Crowns',
    normalizedKey: 'papaer crowns', // handles user spelling "papaer crowns"
    storyId: 'demo-8',
    image: paperCrownsCover,
    publicUrl: '/covers/paper-crowns.jpg',
    coverColor: '#281a2e',
  },
]

export const BOOK_COVER_MAP: Record<string, string> = {
  // Title matches
  'The Shape of Rain': shapeOfRainCover,
  'Shape of Rain': shapeOfRainCover,
  'shape of rain': shapeOfRainCover,

  'Salt in the Static': saltInTheStaticCover,
  'salt in the static': saltInTheStaticCover,
  'Salt In The Static': saltInTheStaticCover,

  'The Glass Orchard': glassOrchardCover,
  'Glass Orchard': glassOrchardCover,
  'glass orchard': glassOrchardCover,

  'Hollow Season': hollowSeasonCover,
  'hollow season': hollowSeasonCover,

  'Seventeen Moons': seventeenMoonsCover,
  'seventeen moons': seventeenMoonsCover,

  'The Gardener of Vor': gardenerOfVorCover,
  'Gardener of Vor': gardenerOfVorCover,
  'The Gardner of Vor': gardenerOfVorCover,
  'The Gardner of vor': gardenerOfVorCover,
  'gardener of vor': gardenerOfVorCover,

  'Last Train to Yonder': lastTrainToYonderCover,
  'last train to yonder': lastTrainToYonderCover,

  'Paper Crowns': paperCrownsCover,
  'paper crowns': paperCrownsCover,
  'papaer crowns': paperCrownsCover,
  'Papaer Crowns': paperCrownsCover,

  // Story ID matches
  'demo-1': shapeOfRainCover,
  'demo-2': saltInTheStaticCover,
  'demo-3': glassOrchardCover,
  'demo-4': hollowSeasonCover,
  'demo-5': seventeenMoonsCover,
  'demo-6': gardenerOfVorCover,
  'demo-7': lastTrainToYonderCover,
  'demo-8': paperCrownsCover,
}

export function getCoverForBook(titleOrId?: string): string | undefined {
  if (!titleOrId) return undefined
  if (BOOK_COVER_MAP[titleOrId]) return BOOK_COVER_MAP[titleOrId]
  const lower = titleOrId.toLowerCase().trim()
  if (BOOK_COVER_MAP[lower]) return BOOK_COVER_MAP[lower]

  // Fuzzy check for partial name matches
  if (lower.includes('rain')) return shapeOfRainCover
  if (lower.includes('static') || lower.includes('salt')) return saltInTheStaticCover
  if (lower.includes('orchard')) return glassOrchardCover
  if (lower.includes('hollow')) return hollowSeasonCover
  if (lower.includes('seventeen') || lower.includes('moon')) return seventeenMoonsCover
  if (lower.includes('gardner') || lower.includes('gardener') || lower.includes('vor')) return gardenerOfVorCover
  if (lower.includes('yonder') || lower.includes('train')) return lastTrainToYonderCover
  if (lower.includes('crown')) return paperCrownsCover

  return undefined
}
