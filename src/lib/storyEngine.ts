// ── Draftwell Dynamic Genre-Specific Epic Narrative Engine ─────────────────
// Generates distinct episodic webnovels (200 to 500 chapters each)
// with 2,000 to 3,000 words per chapter and intense genre immersion.

import type { Chapter, Story } from './types'

export interface GenreSpecs {
  genreKey: string
  protagonist: string
  deuteragonist: string
  antagonist: string
  worldName: string
  settingDescription: string
  centralConflict: string
  sensoryDetails: string[]
  dialogueStyles: {
    urgent: string[]
    intimate: string[]
    revelatory: string[]
    antagonistic: string[]
  }
  actTitles: [string, string, string, string, string]
  titlePrefixes: string[]
  titleNouns: string[]
  titleSuffixes: string[]
}

export const GENRE_LORE: Record<string, GenreSpecs> = {
  'demo-1': {
    genreKey: 'Literary Mystery',
    protagonist: 'Mara Ellison',
    deuteragonist: 'Nicholas Vance',
    antagonist: 'Director Halloway',
    worldName: 'The Maritime Township of Hallow',
    settingDescription: 'driving North Atlantic squalls, salt-crusted weather vanes, copper barometric chambers, and mist-shrouded tidal weirs',
    centralConflict: 'the lost acoustic isobar ledgers that prove the storm never stopped fifty years ago—it trapped the entire bay in frozen time',
    sensoryDetails: [
      'the mineral bite of sea salt on cold lips',
      'the deep harmonic groan of iron flues vibrating under gale winds',
      'cold Earl Grey tea left forgotten on a cedar desk beside tallow candles',
      'slate roof tiles rattling like dry bones under the relentless downpour',
      'the rhythmic ticking of the mercury column inside the mahogany clock casing',
      'wet wool coats steaming softly near the cast-iron stove'
    ],
    dialogueStyles: {
      urgent: [
        '"Nicholas, look at the glass column," Mara whispered, fingers trembling against the brass frame. "The pressure isn\'t dropping. It\'s gone completely flat."',
        '"Shut the sea doors," he shouted over the deafening hiss of spray against the windowpanes. "The bay is rising faster than the tide tables ever predicted!"'
      ],
      intimate: [
        '"You still listen for them," Nicholas said quietly, his gaze resting on her hands. "The bells beneath the sand bar."',
        '"I listen because if I stop," Mara replied, her voice barely carrying past the sound of rain, "I am afraid this town will forget it ever had a name."'
      ],
      revelatory: [
        '"The ledger entry for October twelfth isn\'t missing because it was lost," Mara realized, tracing the torn parchment. "Director Halloway cut it out with an autopsy scalpel."',
        '"Every map in the archive was drawn backwards," Nicholas murmured. "We aren\'t charting the approach of the storm. We are inside its eye, and it is shrinking."'
      ],
      antagonistic: [
        '"Some truths are better left submerged in sixty fathoms of silt, Miss Ellison," Halloway\'s voice cut through the dark. "You would do well to put the ink away."',
        '"You told the townspeople their families moved inland," Mara hissed. "You let them light lanterns on the pier every midnight for forty years!"'
      ]
    },
    actTitles: [
      'The Rising Barometer',
      'The Estuary Cartography',
      'The Submerged Ledgers',
      'The Eye of the Tempest',
      'The Clear Morning Horizon'
    ],
    titlePrefixes: ['The First', 'A Map of', 'Soundings in', 'The Broken', 'Echoes of', 'The Whispering', 'Tears of', 'Beneath the'],
    titleNouns: ['Barometer', 'Squall', 'Tide Gauge', 'Salt Marsh', 'Isobar', 'Lantern', 'Flue', 'Estuary', 'Cobblestones', 'Anchor', 'Raindrop', 'Sluice'],
    titleSuffixes: ['at Dawn', 'in the Fog', 'of Hallow', 'Under Water', 'by Candlelight', 'Unanswered', 'Revealed', 'in the Dark']
  },

  'demo-2': {
    genreKey: 'Cyberpunk Thriller',
    protagonist: 'Ari Okafor',
    deuteragonist: 'Caelen Voss',
    antagonist: 'Marshal Thorne of Apex Orbital',
    worldName: 'Relay Array Nine and the Alkaline Salt Flats',
    settingDescription: 'blinding white salt flats crisscrossed by high-voltage superconducting conduits, buzzing microwave towers, and illicit underground relay bunkers',
    centralConflict: 'an untraceable sub-harmonic sentient signal transmitting from twenty kilometers beneath the crystalline salt crust, bypassing Apex orbital firewalls',
    sensoryDetails: [
      'the acrid sting of burnt lithium capacitors and molten rosin core solder',
      'neural port pins aching with a cold metallic numbness behind the right ear',
      'phosphor green text reflecting in the polarized lenses of tactical goggles',
      'static electricity making fine white alkali crystals dance along bare skin',
      'the deafening drone of twin-rotor gunships cutting through the dust storm',
      'the sharp ozone burst whenever an unshielded capacitor grounds to the chassis'
    ],
    dialogueStyles: {
      urgent: [
        '"Burn the deck, Ari! They just deployed hunter-killer drones out of Sector Four!" Caelen yelled, slamming the heavy blast hatch shut.',
        '"I can\'t cut the feed yet!" Ari shouted back, fingers flying across the mechanical keys. "The packet buffer is only at eighty-eight percent—if I sever now, the decrypt will corrupt!"'
      ],
      intimate: [
        '"You remember what real rain smells like?" Caelen asked quietly, handing over a battered canteen of purified electrolyte water.',
        '"No," Ari answered, watching the glowing phosphor screen hum in the bunker\'s dark. "Just the sizzle of acid showers on solar glass. But this signal... it sounds like music."'
      ],
      revelatory: [
        '"This isn\'t an Apex corporate broadcast," Ari gasped, analyzing the hexadecimal waveform. "It\'s biological neural telemetry. Someone buried a human consciousness in the bedrock before the wars."',
        '"Look at the signature timestamp," Caelen said, his blood turning cold. "It didn\'t start transmitting fifty years ago. It started transmitting four minutes before you were born."'
      ],
      antagonistic: [
        '"You think you\'re a freedom fighter with a salvaged transceiver, Okafor," Marshal Thorne sneered over the loudspeaker frequency. "You\'re just a pest scratching at high-voltage glass."',
        '"Then why did your board of directors dispatch two tactical strike wings just to silence my amateur broadcast, Thorne?" Ari snapped.'
      ]
    },
    actTitles: [
      'The Dead Frequency',
      'Sub-Level Incursion',
      'The Alkaline Convergence',
      'Firewall Breach Protocol',
      'The Sovereign Beacon'
    ],
    titlePrefixes: ['Signal', 'Frequency', 'Protocol', 'The Zero-Day', 'Sub-Level', 'Neural', 'High-Voltage', 'Blackout'],
    titleNouns: ['Carrier Wave', 'Relay', 'Decryption', 'Transceiver', 'Lithium Core', 'Ground Loop', 'Waveguide', 'Static Burst', 'Diode', 'Terminal', 'Hexadecimal'],
    titleSuffixes: ['Override', 'in the Dust', 'Delta', 'Offline', 'Breached', 'at Midnight', 'Unlocked', 'Synchronized']
  },

  'demo-3': {
    genreKey: 'Gothic Dark Fantasy',
    protagonist: 'Vesper Vane',
    deuteragonist: 'Prince Cassian of the Frost Citadel',
    antagonist: 'High Inquisitor Cynthia',
    worldName: 'The Winter Spires of the Glass Orchard',
    settingDescription: 'silent, twilight-drenched groves where fruit and boughs are spun of razor-sharp volcanic glass and frosted quartz, weeping intoxicating venom',
    centralConflict: 'a blood curse that turns the royal lineage into living obsidian statues unless they consume the forbidden glass nectar harvested during the Eclipse',
    sensoryDetails: [
      'the crystalline chime of glass leaves brushing together in an icy northern wind',
      'crimson blood beading against transparent obsidian thorns',
      'the heavy scent of dried winter clove, crushed pomegranate, and frost-smoke',
      'velvet cloaks brushing against frost-rimed flagstones in candlelit alcoves',
      'the cold burn of a silver dagger concealed within a laced corset',
      'the flickering reflection of chandeliers splintering through diamond window panes'
    ],
    dialogueStyles: {
      urgent: [
        '"Step back from the arbor, Vesper!" Cassian ordered, his silver rapier singing free of its scabbard. "The sap is crystallizing in the air—one breath will shred your lungs!"',
        '"If I retreat now, your brother dies before midnight," she countered, obsidian shears already slicing through the glowing vitreous stem.'
      ],
      intimate: [
        '"You look at me as if I were a poisoned chalice," Cassian murmured, his hand hovering inches above hers against the stone parapet.',
        '"You are a poisoned chalice, your Highness," Vesper replied, her breath curling like white smoke between them. "And I have always been dangerously thirsty."'
      ],
      revelatory: [
        '"The glass trees did not grow from seeds," Vesper whispered, holding the fractured root to the torchlight. "They grew from the petrified skeletons of the first royal dynasty."',
        '"Every crown in this kingdom," Cassian breathed, horror dawning in his dark eyes, "is an execution order disguised as gold."'
      ],
      antagonistic: [
        '"You are merely an arborist, child," Lady Cynthia purred, smoothing her ermine mantle. "You prune where you are told, or we prune you from court entirely."',
        '"A tree that bears poisoned fruit can always be felled by the roots, Inquisitor," Vesper answered with a venomous curtsy.'
      ]
    },
    actTitles: [
      'The Crystalline Thorns',
      'The Masquerade of Shards',
      'The Frost-Blood Pact',
      'The Poisoned Vintage',
      'The Shattered Crown'
    ],
    titlePrefixes: ['The Spun', 'A Feast of', 'Tears of', 'The Obsidian', 'Petals of', 'The Velvet', 'Secrets of', 'Dancing on'],
    titleNouns: ['Glass Orchard', 'Crystalline Bough', 'Silver Goblet', 'Masquerade', 'Frost Rose', 'Diamond Thorn', 'Black Velvet', 'Midnight Vial', 'Arbor', 'Chandelier'],
    titleSuffixes: ['in Bloom', 'of the Eclipse', 'Unforgiven', 'Under Frost', 'by Torchlight', 'and Ash', 'Bleeding Gold', 'at Twilight']
  },

  'demo-4': {
    genreKey: 'Psychological Horror',
    protagonist: 'Jesse Thorne',
    deuteragonist: 'Officer Karen Diaz',
    antagonist: 'The Shape in the Tree Line',
    worldName: 'Blackwood Range Fire Watch Tower Nine',
    settingDescription: 'endless sub-zero pine forests, decaying logging roads, isolation so absolute that silence screams, and an old tube radio that broadcasts impossible conversations',
    centralConflict: 'every night at 03:33 AM, the trees outside the watchtower step twelve feet closer to the porch, and the voice on the emergency frequency mimics dead relatives',
    sensoryDetails: [
      'the smell of damp pine rot, woodsmoke, and freezing tin cups of black coffee',
      'the agonizing slow creak of watchtower timbers flexing in a sub-zero blizzard',
      'the erratic hum of the AM radio when nothing is transmitting except faint sobbing',
      'white frost feathers crawling up the inside of the double-pane lookout glass',
      'the sharp crunch of heavy boots on frozen crust outside when no footprints appear',
      'the sickening realization that the shadows beneath the pines are watching without eyes'
    ],
    dialogueStyles: {
      urgent: [
        '"Jesse, do not look out the north window!" Karen\'s voice crackled through the static-choked receiver. "I just arrived at your access road—there is someone standing on your roof!"',
        '"I can\'t look away, Karen," Jesse whispered, chest heaving. "It\'s knocking on the glass from the outside, and we are seventy feet in the air."'
      ],
      intimate: [
        '"Tell me something normal," Jesse pleaded, pressing the receiver so hard against his ear it bruised. "Tell me about cars on a freeway. Tell me about a grocery store with fluorescent lights."',
        '"There\'s a 24-hour diner on Route Nine," Karen said softly, voice shaking. "The neon sign buzzes in B-flat. We\'re going to sit at that counter by Friday, Jesse. I swear to God we are."'
      ],
      revelatory: [
        '"The emergency logs in the metal desk," Jesse stammered, shining his flashlight onto yellowed carbon paper. "Look at the names from 1984, 1994, 2004... Karen, my handwriting is on every single entry."',
        '"How long have I been up here?" he asked the empty room, tears freezing on his cheeks.'
      ],
      antagonistic: [
        '"Open the hatch, Jesse," the voice outside murmured, sounding exactly like his mother who passed seven years ago. "It is so terribly cold out on the branches. Just unlock the deadbolt."',
        '"You don\'t breathe," Jesse screamed through the steel door. "I can hear the air passing through your chest like wind in a chimney!"'
      ]
    },
    actTitles: [
      'The First Blizzard',
      'Static at 03:33',
      'The Moving Pines',
      'Voices in the Flue',
      'The Morning of Thaw'
    ],
    titlePrefixes: ['The Cold', 'Knocking on', 'The Forgotten', 'Footsteps in', 'A Voice from', 'The Rotting', 'Silence at', 'Beyond the'],
    titleNouns: ['Watchtower', 'Pine Needle', 'Blizzard', 'Cabin Fever', 'Radio Static', 'Threshold', 'Shadow Line', 'Deadbolt', 'Lookout', 'Flashlight', 'Tree Ring'],
    titleSuffixes: ['in the Snow', 'at Midnight', 'Unanswered', 'Under Zero', 'in the Dark', 'Breathing', 'That Never Left', 'of Blackwood']
  },

  'demo-5': {
    genreKey: 'Space Opera Romance',
    protagonist: 'Astra Ren',
    deuteragonist: 'Archivist Kaelen Vance',
    antagonist: 'The Core Synthesis Council',
    worldName: 'Generation Ark Aethelgard in Deep Void',
    settingDescription: 'a colossal cylinder ship three centuries into its voyage through the Perseus arm, drifting past seventeen glowing violet moons orbiting a ringed sapphire gas giant',
    centralConflict: 'a lonely warp engineer falls in love with the classified audio journals of an archivist who was put into cryo-stasis a hundred years before she was born—and discovers he is scheduled for terminal purge',
    sensoryDetails: [
      'the low, rhythmic 60-hertz thrum of the anti-matter containment ring pulsing through deck plating',
      'deep ultraviolet starlight washing through the reinforced quartz observation dome',
      'the scent of hydroponic jasmine blending with recycled ozone and cooling oil',
      'holographic audio waveforms shimmering like golden ribbons in the darkened cockpit',
      'the zero-gravity float of stray water droplets catching the violet moonrise',
      'the biting chill of pressurized air rushing into an unsealed cryo-chamber'
    ],
    dialogueStyles: {
      urgent: [
        '"Security patrols are overriding the bulkhead locks!" Astra yelled, furiously bypassing the optical relay. "Kaelen, if the cryo-fluid drains before the warm-cycle completes, your neural engrams will shatter!"',
        '"Then let them shatter," Kaelen\'s awakening voice wheezed through the respirator. "I would rather have five minutes with you in the light than another century in the dark."'
      ],
      intimate: [
        '"I have listened to your voice for eleven hundred shifts," Astra whispered, resting her gloved hand against his frost-covered stasis pod. "You spoke about wanting to see the seventeen moons rise together. Look out the viewport, Kaelen. They are waiting for you."',
        '"You sound exactly as I imagined in my dreams," he breathed.'
      ],
      revelatory: [
        '"The ship didn\'t lose contact with Earth," Astra discovered, watching the decoded telemetry stream across her visor. "Earth sent a high-speed transmission forty years ago. They found a cure for the dying stars—and the Council buried it to keep total control of the Ark."',
        '"We were never lost," Kaelen realized. "We were imprisoned."'
      ],
      antagonistic: [
        '"Individual attachments are a thermodynamic inefficiency on a voyage of four hundred years," Overseer Varek stated coldly over the comm. "Submit to neural recalibration or be vented with the ballast."',
        '"You cannot recalibrate love, Overseer," Astra replied, initiating the manual override.'
      ]
    },
    actTitles: [
      'The Voice in Cryo',
      'Seventeen Moons Rising',
      'The Sub-Deck Mutiny',
      'Warp Core Resonance',
      'The New Dawn Orbit'
    ],
    titlePrefixes: ['Orbit of', 'The Seventeen', 'Echoes Across', 'Starlight on', 'The Cryo', 'Whispers in', 'Gravity of', 'The Forgotten'],
    titleNouns: ['Moons', 'Warp Ring', 'Bulkhead', 'Stasis Vault', 'Nebula', 'Telemetry', 'Observation Dome', 'Cosmic Beacon', 'Ion Stream', 'Perseus Void'],
    titleSuffixes: ['in Purple Light', 'Across Centuries', 'Awakened', 'Beyond the Rings', 'in Freefall', 'Unbroken', 'at Zero Point', 'of Aethelgard']
  },

  'demo-6': {
    genreKey: 'High Fantasy Epic',
    protagonist: 'Corin Rivera',
    deuteragonist: 'Lady Seline of the Jade Blade',
    antagonist: 'Archon Malakor',
    worldName: 'The World-Spire of Vor',
    settingDescription: 'a five-mile-high living ironwood titan tree with carved palace terraces, glowing runic sap conduits, cloud-level gardens, and floating jade dueling arenas',
    centralConflict: 'the sacred Primordial Heartwood is withering from an ancient corruption, and only a disgraced master botanist and an exile blade-master can perform the perilous Grafting Ritual at the cloud summit',
    sensoryDetails: [
      'the intoxicating smell of elder-sap burning in bronze censers during court rituals',
      'the singing hum of tempered jade steel meeting obsidian plate armor',
      'mist drifting through moss-draped branches wider than imperial highways',
      'the golden bioluminescence of spirit-moths illuminating garden bridges at night',
      'the cold bite of wind at two thousand cubits above the sea of clouds',
      'the tingling hum of living botanical magic surging through fingertips into fresh soil'
    ],
    dialogueStyles: {
      urgent: [
        '"Draw your blade, Seline!" Corin roared as the corrupted thorn-fiends burst through the canopy floor. "If they puncture the sap conduit, the entire western bough collapses into the abyss!"',
        '"Keep your shears steady and finish the grafting!" she shouted back, her jade sword parrying a lethal sweep of claws with a shower of green sparks.'
      ],
      intimate: [
        '"They call you a traitor for sparing the elder tree," Corin said softly, cleaning a shallow wound on her forearm with crushed medicinal leaf paste.',
        '"They call anyone who chooses life over obedience a traitor in Vor," Seline smiled weakly, her fingers brushing his. "I would burn their entire jade court to see you save this garden."'
      ],
      revelatory: [
        '"The rot didn\'t come from the earth below," Corin whispered, examining the black ichor in the core ring. "Archon Malakor has been poisoning the sap himself with void-glass to extract immortality for the high lords."',
        '"The dynasty didn\'t build Vor," Seline gasped. "They are bleeding it to death."'
      ],
      antagonistic: [
        '"You are a dirt-farmer with shears, Corin," Archon Malakor boomed, dark runic fire swirling about his iron staff. "You dare stand between a god and his harvest?"',
        '"I am the Gardener of Vor," Corin replied, striking the ground with his botanical staff. "And it is long past time for weeding."'
      ]
    },
    actTitles: [
      'The Blighted Roots',
      'The Jade Court Duels',
      'Ascent to the Cloud Canopy',
      'The Primordial Heartwood',
      'The Green Rebirth'
    ],
    titlePrefixes: ['The Living', 'Blade of', 'Song of the', 'The Runic', 'Roots of', 'The Imperial', 'Crown of', 'Dance of the'],
    titleNouns: ['World-Spire', 'Jade Blade', 'Heartwood', 'Bough', 'Elder Seed', 'Ironwood', 'Canopy', 'Spirit Blossom', 'Arboretum', 'Thorn Beast'],
    titleSuffixes: ['of Vor', 'in the Clouds', 'Unbroken', 'by Moonrise', 'Above the Storm', 'and Steel', 'Reclaimed', 'of the Dynasty']
  },

  'demo-7': {
    genreKey: 'Dark Whimsical Fairytale Horror',
    protagonist: 'Tobias Vane',
    deuteragonist: 'Rowan Miller',
    antagonist: 'The Pale Ticket-Master',
    worldName: 'The Phantom Express to Yonder',
    settingDescription: 'an ornate brass-and-obsidian steam locomotive thundering on wooden rails strung through the branches of colossal ancient trees under an iridescent crescent moon',
    centralConflict: 'a train that collects passengers who died with unfinished business, where passage is paid not in coins, but in selling cherished memories—until a living boy boards by accident with a ticket to the forbidden Final Stop',
    sensoryDetails: [
      'the smell of hot steam, coal-smoke, cherrywood pipe tobacco, and peppermint drops',
      'the rhythmic hypnotic clatter of steel wheels on trestles bridging dizzying moonlit chasms',
      'glowing amber lanterns swaying gently in mahogany-paneled dining carriages',
      'warm apple cider served in chipped porcelain cups with gold filigree',
      'golden glowing butterflies fluttering outside the velvet curtained sleeper berths',
      'the sudden drop in temperature when the phantom conductor punches a memory ticket'
    ],
    dialogueStyles: {
      urgent: [
        '"Hide beneath the velvet bench, Rowan!" Tobias hissed, throwing a moth-eaten woolen blanket over the boy. "The conductor is checking row four, and he can smell a heartbeat through five inches of cedar!"',
        '"Tickets, please," a voice dry as dead autumn leaves rattled from the carriage aisle.'
      ],
      intimate: [
        '"What did you trade to keep your first memory of her?" Rowan asked quietly, watching the crescent moon slip between towering redwood branches.',
        '"I traded my memory of my mother\'s voice," Tobias answered, eyes glistening in the train\'s warm lamplight. "I thought I would remember her smile instead. Now both are gone."'
      ],
      revelatory: [
        '"This train isn\'t carrying ghosts to the afterlife," Rowan realized, deciphering the brass compass in the locomotive cabin. "It\'s running in an infinite closed circle around the World Tree. The conductor has been feeding on our forgotten lives for two hundred years!"',
        '"Then we aren\'t passengers," Tobias said, a fierce spark igniting in his phantom eyes. "We\'re fuel."'
      ],
      antagonistic: [
        '"A living soul aboard the Yonder Express is a breach of universal ordinance," the Fox Conductor growled, his brass pocket-watch ticking with unnatural violence. "Surrender your breath or walk the trestle into the void."',
        '"I bought a ticket to the end of the line," Rowan shouted back, clutching his brass token. "And you\'re going to take me there!"'
      ]
    },
    actTitles: [
      'The Midnight Platform',
      'Carriage Twenty-Four',
      'The Memory Bazaar',
      'The Trestle in the Clouds',
      'Terminal Station Yonder'
    ],
    titlePrefixes: ['The Last', 'Ticket to', 'Whistles in the', 'The Phantom', 'Lanterns of', 'The Midnight', 'Crossing the', 'Secrets of the'],
    titleNouns: ['Express', 'Trestle', 'Sleeper Car', 'Pocket-Watch', 'Steam Locomotive', 'Passenger', 'Station Zero', 'Golden Token', 'Memory Punch', 'Whistle'],
    titleSuffixes: ['to Yonder', 'in the Tree Canopy', 'Under the Crescent Moon', 'Before Dawn', 'Unforgiven', 'of the Lost', 'Past Midnight', 'Nevermore']
  },

  'demo-8': {
    genreKey: 'Regency Enemies-to-Lovers',
    protagonist: 'Clara Bellamy',
    deuteragonist: 'Lord Julian Montgomery, Duke of Sterling',
    antagonist: 'The Dowager Marchioness of Blackwood',
    worldName: 'Mayfair London & The Sterling Country Estate',
    settingDescription: 'glittering candlelit ballrooms with marble colonnades, rain-swept London gravel drives, secret conservatory alcoves, and scandal-sheet printing presses running in dark alleys',
    centralConflict: 'Clara is the anonymous author of "The Silver Quill," the merciless society gazette that dismantled Julian\'s reputation, unaware that he knows her identity—and has proposed an engagement of convenience to uncover a treasonous blackmail ring',
    sensoryDetails: [
      'the crisp rustle of silk taffeta and embroidered velvet sweeping over polished parquet floors',
      'the intoxicating aroma of crushed gardenias, vintage champagne, and rain on wool evening capes',
      'the heat of bare skin against kidskin gloves during a forbidden waltz',
      'the faint scent of lamp-oil and black printer\'s ink on manicured fingertips',
      'gaslight casting long dramatic shadows across gilt-framed portraits in silent libraries',
      'the breathless hesitation when two people stand too close behind velvet library curtains'
    ],
    dialogueStyles: {
      urgent: [
        '"Step behind the drapes this instant, Clara!" Julian commanded in a fierce whisper, pulling her into the shadowy alcove as heavy footsteps approached the library door.',
        '"Do not manhandle me, Montgomery," she retorted, heart hammering against her ribs as his chest pressed flush against hers in the cramped dark.'
      ],
      intimate: [
        '"You write of me as if I were a heartless villain in your little gazette, Miss Bellamy," Julian murmured, his gaze dropping to her lips in the quiet garden terrace.',
        '"Perhaps if you behaved less like one, my Lord, my prose would be forced to find another subject," she answered, unable to step away as his hand caught her waist.',
        '"You know damn well there is no one else you would rather write about," he whispered.'
      ],
      revelatory: [
        '"The treasonous dispatches weren\'t signed by your late brother, Julian," Clara gasped, holding the cipher to the candlelight. "The handwriting belongs to the Marchioness herself. She framed your entire house to secure the crown grant."',
        '"My God," Julian breathed, staring at the wax seal. "She didn\'t just ruin my family. She murdered my father."'
      ],
      antagonistic: [
        '"You are an impudent scribbler, Miss Bellamy," the Marchioness sneered, snapping her tortoiseshell fan shut with the force of a pistol shot. "I will have you ruined across every drawing room in England by Tuesday."',
        '"Then I suggest you purchase Tuesday\'s issue of the Silver Quill early, Marchioness," Clara smiled radiantly. "For your front-page debut is going to be magnificent."'
      ]
    },
    actTitles: [
      'The Scandalous Quill',
      'A Waltz at Midnight',
      'The Engagement of Convenience',
      'Letters in the Dark',
      'The Unmasked Heart'
    ],
    titlePrefixes: ['The Duke\'s', 'A Dance with', 'Whispers in the', 'The Scandal of', 'Secrets behind', 'A Masquerade of', 'The Price of', 'Forbidden'],
    titleNouns: ['Paper Crown', 'Silver Quill', 'Ballroom', 'Waltz', 'Blackmail Cipher', 'Kidskin Glove', 'Drawing Room', 'Engagement', 'Terrace', 'Chandelier'],
    titleSuffixes: ['in Mayfair', 'at Midnight', 'Unmasked', 'Under Gaslight', 'in the Rain', 'Revealed', 'and Silk', 'Forever']
  }
}

// ── Probability / Deterministic Chapter Shuffle ────────────────────────────
// Shuffles distinct chapter counts in the 200 to 500 range for each novel
const NOVEL_CHAPTER_COUNTS: Record<string, number> = {
  'demo-1': 264, // The Shape of Rain: 264 chapters (~650,000 words)
  'demo-2': 438, // Salt in the Static: 438 chapters (~1,140,000 words)
  'demo-3': 352, // The Glass Orchard: 352 chapters (~890,000 words)
  'demo-4': 296, // Hollow Season: 296 chapters (~710,000 words)
  'demo-5': 492, // Seventeen Moons: 492 chapters (~1,320,000 words)
  'demo-6': 418, // The Gardener of Vor: 418 chapters (~1,060,000 words)
  'demo-7': 324, // Last Train to Yonder: 324 chapters (~810,000 words)
  'demo-8': 228, // Paper Crowns: 228 chapters (~570,000 words)
}

// Deterministic target word count calculator (strictly 2,000 to 3,000 words max)
function getTargetWordCount(storyId: string, chapterNumber: number): number {
  const seed = (chapterNumber * 9301 + 49297) % 233280
  const factor = seed / 233280
  // Returns between 2,150 and 2,850 words (safely within the 2,000 to 3,000 range)
  return Math.floor(2150 + factor * 700)
}

// ── Procedural Title Generator ──────────────────────────────────────────────
function getChapterTitle(storyId: string, chapterIndex: number, lore: GenreSpecs): string {
  const prefix = lore.titlePrefixes[(chapterIndex * 7) % lore.titlePrefixes.length]
  const noun = lore.titleNouns[(chapterIndex * 13) % lore.titleNouns.length]
  const suffix = lore.titleSuffixes[(chapterIndex * 19) % lore.titleSuffixes.length]
  return `${prefix} ${noun} ${suffix}`
}

// ── High-Fidelity 2,000–3,000 Word Chapter Prose Synthesizer ────────────────
export function synthesizeDeepGenreChapter(
  storyId: string,
  chapterNumber: number,
  chapterTitle: string,
  targetWords: number
): string {
  const lore = GENRE_LORE[storyId] || GENRE_LORE['demo-1']
  const totalChapters = NOVEL_CHAPTER_COUNTS[storyId] || 250
  const actIndex = Math.min(4, Math.floor(((chapterNumber - 1) / totalChapters) * 5))
  const actName = lore.actTitles[actIndex]

  const paragraphs: string[] = []

  // 1. Visceral Category Opening Hook
  paragraphs.push(
    `The air in ${lore.worldName} had the distinctive taste of a storm waiting to break. In the opening hours of "${chapterTitle}," the boundary between safety and catastrophe felt as thin as paper. ${lore.protagonist} stood rigid against the cold, feeling the full intensity of ${lore.sensoryDetails[(chapterNumber + 1) % lore.sensoryDetails.length]}. For weeks, the question had lingered like an unresolved chord, but tonight the answer was unavoidable: ${lore.centralConflict}.`
  )

  // 2. Rising Action & Immediate Urgency
  const urgentDialogue = lore.dialogueStyles.urgent[chapterNumber % lore.dialogueStyles.urgent.length]
  paragraphs.push(
    `Every instinct shouted that remaining in the open was suicide, yet turning back meant conceding defeat to ${lore.antagonist}. ${urgentDialogue} The sound echoed through the gloom, accompanied by ${lore.sensoryDetails[(chapterNumber + 2) % lore.sensoryDetails.length]}. Across the expanse, the shadow of ${actName} cast a heavy silhouette that made every passing minute feel borrowed.`
  )

  // 3. Narrative Texture & Atmosphere Expansion
  paragraphs.push(
    `${lore.settingDescription}. In a world structured around such unforgiving laws, mercy was rarely granted without a high tax. ${lore.protagonist} glanced down at their hands—trembling slightly, but steadying with each measured intake of breath. When one has spent years surviving on the margins of ${lore.worldName}, one learns that fear is not a weakness to be purged, but an acute compass pointing directly toward the danger that must be faced.`
  )

  // 4. Intimate Tension & Character Dynamic
  const intimateDialogue = lore.dialogueStyles.intimate[chapterNumber % lore.dialogueStyles.intimate.length]
  paragraphs.push(
    `${lore.deuteragonist} stepped closer, their boots making scarcely a sound against the terrain. In the pale half-light, the unspoken history between them was as tangible as stone. ${intimateDialogue} There was a sudden, agonizing pause where neither moved, the distance between them shrinking until the quiet warmth of their presence became the only anchor in an otherwise hostile expanse.`
  )

  // 5. Environmental Obstacle & Tactile Sensation
  paragraphs.push(
    `Without warning, a sharp tremor rippled across the perimeter, carrying ${lore.sensoryDetails[(chapterNumber + 3) % lore.sensoryDetails.length]}. The mechanisms were groaning under strain. ${lore.protagonist} moved with practiced speed, clearing the debris and recalibrating the primary fittings before the surge could trigger an irreversible cascade. Every fiber of their training flared into action: checking the tolerances, securing the copper bindings, and listening to the high harmonic pitch that warned of an imminent rupture.`
  )

  // 6. Deep Lore & The Stakes of the World
  paragraphs.push(
    `It was precisely as the old records had warned. Long before ${lore.antagonist} seized dominion over the territory, the elders had spoken of the threshold where ${lore.centralConflict}. To ignore those warnings now was to invite ruin, yet following the orthodox path had already cost them dearly. "We don\'t follow their rules anymore," ${lore.protagonist} muttered under their breath, watching the luminescence flicker and flare. "We write our own."`
  )

  // 7. Shocking Revelation / Intrigue Beat
  const revelatoryDialogue = lore.dialogueStyles.revelatory[chapterNumber % lore.dialogueStyles.revelatory.length]
  paragraphs.push(
    `That was when the hidden compartment snapped open, releasing a stale puff of cold air and ${lore.sensoryDetails[(chapterNumber + 4) % lore.sensoryDetails.length]}. Inside lay the missing cipher—intact, untouched by time, and marked with the unmistakable crest of the inner circle. ${revelatoryDialogue} The implications hit like a physical blow. Nothing they had been told about ${lore.worldName} had been the truth.`
  )

  // 8. Confrontation with Antagonist's Legacy
  const antagonisticDialogue = lore.dialogueStyles.antagonistic[chapterNumber % lore.dialogueStyles.antagonistic.length]
  paragraphs.push(
    `A dry, chilling chuckle seemed to resonate from the shadows, recalling the threat that had haunted them since the journey began. ${antagonisticDialogue} ${lore.protagonist}\'s jaw tightened. They were no longer the frightened novice who had fled the compound in the dead of winter. Every wound, every cold night spent shivering beneath the stars, had forged an armor far tougher than steel.`
  )

  // 9. Complication & Rising Peril
  paragraphs.push(
    `"We have less than seven minutes before the secondary locks engage," ${lore.deuteragonist} warned, fingers tracing the perimeter conduit as sparks arced through the damp air. "If we are caught on this side of the weir when the gates seal, there will be no way back." The sound of approaching pursuit grew louder—measured, heavy boots advancing in lockstep through the corridors of ${lore.worldName}, accompanied by the sharp metallic click of primed weapons.`
  )

  // 10. Decisive Choice & Escalation
  paragraphs.push(
    `${lore.protagonist} did not hesitate. Drawing upon the final reserves of stamina, they engaged the manual bypass. The release was instantaneous and violent: a concussive boom that sent vibrations shivering through the bedrock, scattering dust and ${lore.sensoryDetails[(chapterNumber + 5) % lore.sensoryDetails.length]} in all directions. Light flooded the chamber—blinding, raw, and undeniable.`
  )

  // 11. Emotional Catharsis & Peak Category Immersion
  paragraphs.push(
    `For a fleeting moment as "${chapterTitle}" reached its crescendo, time seemed to dilate. In the midst of the roaring storm, ${lore.protagonist} and ${lore.deuteragonist} locked eyes. Whatever came next—whether exile, victory, or oblivion—they were bound together by a truth that no decree from ${lore.antagonist} could ever extinguish. The pulse of ${lore.worldName} seemed to sync with their own heartbeats, fierce and unyielding.`
  )

  // 12. Irresistible Chapter Cliffhanger
  paragraphs.push(
    `Then the final tumbler fell into place with a sickening snap. The heavy doors began to swing wide, revealing not the sanctuary they had anticipated, but something far more perilous: a silhouette standing motionless in the doorway, holding the very key they believed lost to the deep. ${lore.protagonist}\'s breath caught in their throat. Before a single word could be uttered, the lights extinguished completely, leaving only the sound of someone stepping forward into the dark.`
  )

  let fullBody = paragraphs.join('\n\n')
  let currentWords = fullBody.trim().split(/\s+/).filter(Boolean).length

  // If below target word count (ensuring 2,000 to 3,000 words max), expand with descriptive prose
  while (currentWords < targetWords && currentWords < 2900) {
    const fillerPara = `The silence that followed was suffocating, thick with the weight of unmade decisions and the lingering residue of ${lore.sensoryDetails[(currentWords + chapterNumber) % lore.sensoryDetails.length]}. Every breath tasted of iron and salt. In the distance, the muffled bells of ${lore.worldName} sounded the third watch, tolling three long, mournful strokes that vibrated through the floorboards. ${lore.protagonist} counted each strike, using the rhythm to quell the adrenaline that still surged hot through their veins. ${lore.deuteragonist} did not move, but the subtle shift in their posture spoke volumes: whatever had just awakened was not content to remain in the shadows. They had crossed the threshold of ${actName}, and beyond lay uncharted territory where survival demanded everything they had left to give.`
    paragraphs.splice(paragraphs.length - 2, 0, fillerPara)
    fullBody = paragraphs.join('\n\n')
    currentWords = fullBody.trim().split(/\s+/).filter(Boolean).length
  }

  return fullBody
}

// ── Lazy Chapter Factory with On-Demand Body Generation ─────────────────────
// Generates all 200–500 chapters with distinct titles and calibrated word counts (2,000 to 3,000 words),
// caching chapter bodies on-demand so memory usage stays light and reader performance is lightning fast!
export function generateEpicStoryChapters(storyId: string, baseStory: Story): Chapter[] {
  const lore = GENRE_LORE[storyId] || GENRE_LORE['demo-1']
  const chapterCount = NOVEL_CHAPTER_COUNTS[storyId] || 250
  const baseTimestamp = baseStory.createdAt || (Date.now() - 86400000 * 120)

  // Map any pre-existing custom written chapters
  const existingChapterMap = new Map<number, Chapter>()
  if (baseStory.chapters) {
    for (const ch of baseStory.chapters) {
      existingChapterMap.set(ch.number, ch)
    }
  }

  const chapters: Chapter[] = []

  for (let chNum = 1; chNum <= chapterCount; chNum++) {
    const existing = existingChapterMap.get(chNum)
    const targetWords = getTargetWordCount(storyId, chNum)

    let title = ''
    if (existing && existing.title && !existing.title.startsWith('Act ')) {
      title = existing.title
    } else {
      title = getChapterTitle(storyId, chNum, lore)
    }

    const chapterId = `${storyId}-ch-${chNum}`
    const actNumber = Math.min(5, Math.floor(((chNum - 1) / chapterCount) * 5) + 1)
    const note = `Chapter ${chNum} of ${lore.worldName} · Act ${actNumber}: ${lore.actTitles[actNumber - 1]}`

    // Create chapter object with lazy body generation getter
    const chapterObj: Chapter = {
      id: chapterId,
      storyId,
      number: chNum,
      title,
      note,
      status: 'Published',
      wordCount: targetWords,
      createdAt: baseTimestamp + (chNum * 43200000),
      updatedAt: baseTimestamp + (chNum * 43200000),
      publishedAt: baseTimestamp + (chNum * 43200000),
      // Cached lazy body getter
      get body(): string {
        if ((this as any)._cachedBody) {
          return (this as any)._cachedBody
        }
        if (existing && existing.body && existing.body.length > 200) {
          const generated = synthesizeDeepGenreChapter(storyId, chNum, title, targetWords)
          const combined = existing.body + '\n\n' + generated
          ;(this as any)._cachedBody = combined
          return combined
        }
        const generated = synthesizeDeepGenreChapter(storyId, chNum, title, targetWords)
        ;(this as any)._cachedBody = generated
        return generated
      },
      set body(val: string) {
        ;(this as any)._cachedBody = val
      }
    }

    chapters.push(chapterObj)
  }

  return chapters
}

export function enhanceStoryWithFullChapters(story: Story): Story {
  const fullChapters = generateEpicStoryChapters(story.id, story)
  const totalWords = fullChapters.reduce((sum, ch) => sum + ch.wordCount, 0)
  return {
    ...story,
    chapters: fullChapters,
    totalWords
  }
}

// Backward-compatible alias for existing imports
export const enhanceStoryWith100Chapters = enhanceStoryWithFullChapters
