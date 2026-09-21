// ── Draftwell Writing Masterclasses ─────────────────────────────────────────
// Comprehensive, master-level craft guides with theory, examples, and interactive studio prompts.

export interface Masterclass {
  id: string
  title: string
  subtitle: string
  category: 'Structure' | 'Dialogue' | 'Worldbuilding' | 'Plot' | 'Pacing' | 'Revision'
  readTime: number // in minutes
  level: 'Foundational' | 'Intermediate' | 'Master'
  instructor: string
  instructorRole: string
  quote: string
  overview: string
  corePrinciples: {
    title: string
    description: string
    example?: string
  }[]
  craftBreakdown: string[]
  exercise: {
    title: string
    prompt: string
    targetWords: number
    suggestedChapterTitle: string
  }
}

export const MASTERCLASSES: Masterclass[] = [
  {
    id: 'mc-pacing-hook',
    title: 'The Architecture of Narrative Pacing',
    subtitle: 'Hooking readers in the opening 500 words & sustaining tension across chapters',
    category: 'Pacing',
    readTime: 12,
    level: 'Master',
    instructor: 'Mara Ellison',
    instructorRole: 'Author of "The Shape of Rain"',
    quote: 'Pacing is not speed. Pacing is the deliberate manipulation of reader expectation — knowing when to linger on a breath and when to drop the floor.',
    overview: 'Too many novels stall because authors mistake backstory for stakes. A great opening does not explain the world; it disrupts a status quo that will never be restored.',
    corePrinciples: [
      {
        title: 'Begin with the Disturbance, Not the Routine',
        description: 'Do not start with an alarm clock, the weather report, or a mirror reflection. Drop the protagonist at the moment their normal life slips out of calibration.',
        example: '"At four seventeen, every window on Marrow Street blinked gold, as if the houses were remembering how to breathe."'
      },
      {
        title: 'Scene vs. Summary Calibration',
        description: 'Expand high-impact emotional collisions into real-time sensory experiences. Compress travel, waiting, and transitional actions into swift summary sentences.',
      },
      {
        title: 'The Micro-Cliffhanger at Chapter Breaks',
        description: 'Never end a chapter when a question has been fully answered or when all characters go to sleep. End on a discovery, a spoken lie, or a sudden knocking at the door.',
        example: '"She picked up the transmitter and clicked it on. \'I found your station,\' she said. From somewhere in the building above her came footsteps on metal stairs."'
      }
    ],
    craftBreakdown: [
      'Establish what the character stands to lose within the first three paragraphs.',
      'Control sentence cadence: use shorter, staccato clauses when danger or tension escalates.',
      'Leave at least one open loop at the end of every chapter that compels the reader to turn the page.'
    ],
    exercise: {
      title: 'The Concealed Secret Scene',
      prompt: 'Write an opening scene (300–500 words) where two characters share an ordinary morning coffee, but one of them has packed a suitcase hidden under the stairs. Neither character is allowed to mention leaving.',
      targetWords: 400,
      suggestedChapterTitle: 'Chapter 1: The Coffee Cup'
    }
  },
  {
    id: 'mc-dialogue-subtext',
    title: 'Character Voice & Dialogue Subtext',
    subtitle: 'Making speech dynamic, distinctive, and loaded with unspoken motive',
    category: 'Dialogue',
    readTime: 14,
    level: 'Intermediate',
    instructor: 'Ari Okafor',
    instructorRole: 'Author of "Salt in the Static"',
    quote: 'Real people never speak to inform the audience. They speak to conceal vulnerability, negotiate status, or test how much truth the other person can bear.',
    overview: 'If you can swap dialogue lines between two characters and neither sounds wrong, neither has a voice. Learn to craft idiolects, emotional friction, and subtext that burns between lines.',
    corePrinciples: [
      {
        title: 'The Subtext Law: Speak the Indirect',
        description: 'Characters with strong feelings rarely state them directly. An argument about a misplaced radio frequency is really about whether one person is abandoning the other.',
        example: '"You don\'t have to stay," she said. "I know." "The roads will clear by tomorrow." "Probably."'
      },
      {
        title: 'Eliminate Tag Clutter with Physical Beats',
        description: 'Purge adverbs like "she replied angrily" or "he stated firmly". Anchor lines with purposeful physical actions that reveal inner tension.',
        example: 'Instead of: "I don\'t trust him," she whispered nervously.\nUse: She set down her mug very carefully. "I know where Fell is."'
      },
      {
        title: 'Rhythmic Idiolects',
        description: 'Vary rhythm, vocabulary, and sentence structure according to character background, age, and defense mechanisms.'
      }
    ],
    craftBreakdown: [
      'Each character must enter a conversation wanting something concrete from the other person.',
      'Use interruptions and trailing thoughts: people rarely speak in perfectly rounded paragraphs.',
      'Leave conversational silences on the page — what is ignored is as loud as what is spoken.'
    ],
    exercise: {
      title: 'The Terminal Encounter',
      prompt: 'Write a dialogue exchange of 25–30 lines between an estranged mentor and student meeting unexpectedly in a busy train station. Neither is allowed to mention why their partnership dissolved.',
      targetWords: 450,
      suggestedChapterTitle: 'Chapter 1: Platform Four'
    }
  },
  {
    id: 'mc-worldbuilding-living',
    title: 'Atmospheric Worldbuilding & Sensory Layering',
    subtitle: 'Weaving secondary worlds through the pores of your characters, without info-dumps',
    category: 'Worldbuilding',
    readTime: 15,
    level: 'Master',
    instructor: 'Sylvie Marchetti',
    instructorRole: 'Author of "The Gardener of Vor"',
    quote: 'A reader does not fall in love with an encyclopedia entry. They fall in love with the smell of wet gravel in the courtyard and how the queen drinks her tea when she is afraid.',
    overview: 'Worldbuilding is most intoxicating when it is treated as casual reality by the people who live in it. Avoid textbook prologues; anchor novelty in everyday sensory truth.',
    corePrinciples: [
      {
        title: 'The Rule of Three Senses',
        description: 'Whenever a character enters a new environment, evoke at least one non-visual sense (smell, texture, or ambient sound) before detailing the visuals.',
        example: '"The canal district smelled of iron and old water... somewhere below her she could hear the old broadcasting tower\'s hum, a vibration felt in the sternum."'
      },
      {
        title: 'The Iceberg Technique: 10% Visible, 90% Beneath',
        description: 'You should know the dynasty history and legal tax codes of your city, but only show what rubs against your character\'s immediate task.',
      },
      {
        title: 'Domesticate the Extraordinary',
        description: 'Magic or hyper-technology should have mundane chores, domestic messes, and economic consequences attached to it.'
      }
    ],
    craftBreakdown: [
      'Show social laws by having someone subtly violate them in public.',
      'Use local slang and colloquial idioms derived from the geography or mythology of the world.',
      'Contrast high grandeur with industrial dirt or domestic wear-and-tear.'
    ],
    exercise: {
      title: 'The Disguised Market Walk',
      prompt: 'Describe a crowded market or bazaar in your fictional world from the perspective of a fugitive trying to blend into the crowd. Evoke at least three distinct senses without using the word "magic" or "technology".',
      targetWords: 350,
      suggestedChapterTitle: 'Chapter 1: Market of Shadows'
    }
  },
  {
    id: 'mc-twists-foreshadowing',
    title: 'Plot Twists, Foreshadowing & Narrative Payoffs',
    subtitle: 'Planting clues in plain sight for twists that feel shocking yet inevitable',
    category: 'Plot',
    readTime: 13,
    level: 'Master',
    instructor: 'Demi Park',
    instructorRole: 'Author of "Hollow Season"',
    quote: 'A cheap twist relies on withholding what the point-of-view character knows. A masterful twist puts all the evidence in the shop window and lets the reader misinterpret it until the trap snaps.',
    overview: 'Audiences love surprises, but they revere inevitability. Master the psychological art of selective misdirection and fair-play clues.',
    corePrinciples: [
      {
        title: 'Dual-Purpose Clues',
        description: 'Every clue must serve a plausible emotional or plot purpose on first reading so the reader does not catalogue it as a murder weapon or trap.',
        example: 'In Hollow Season, the detective keeps the unsolved case file in a kitchen drawer next to dish towels — not as a hidden secret, but as an emblem of domestic denial.'
      },
      {
        title: 'The Rule of Three Clues',
        description: 'One clue for the sharpest readers, one clue for the re-readers, and one clue that clicks into place in the final confrontation.',
      },
      {
        title: 'The Emotional Pivot',
        description: 'A twist must not just change the plot facts; it must invert the emotional balance of the protagonist\'s dearest belief.'
      }
    ],
    craftBreakdown: [
      'Never lie to the reader from an omniscient or honest first-person viewpoint.',
      'Use the character\'s emotional bias or blind spot to interpret the clue incorrectly in front of the reader.',
      'When the reveal lands, the reader should want to immediately reread chapter one.'
    ],
    exercise: {
      title: 'The Gift with Two Meanings',
      prompt: 'Write a 400-word flashback where a narrator describes an heirloom or gift given to them by an ally. Plant two subtle details that, in retrospect, prove the giver was working for the opposition all along.',
      targetWords: 400,
      suggestedChapterTitle: 'Chapter 1: The Silver Compass'
    }
  },
  {
    id: 'mc-scene-economy',
    title: 'Scene Economy & Tension Compression',
    subtitle: 'Cutting narrative drag and ensuring every paragraph alters the balance of power',
    category: 'Structure',
    readTime: 11,
    level: 'Intermediate',
    instructor: 'Nia Vale',
    instructorRole: 'Author of "The Glass Orchard"',
    quote: 'Enter late, leave early. If a scene begins with people saying hello or ends with people agreeing to meet tomorrow, you have left dead skin on the manuscript.',
    overview: 'Prose energy dies in transitions. Learn how to launch readers directly into the conflict vortex and exit before the tension dissipates.',
    corePrinciples: [
      {
        title: 'The Scene Pivot Mandate',
        description: 'Every scene must have a turning point: a shift from positive to negative valence, or from illusion to hard truth.',
      },
      {
        title: 'Muscular Verbs Over Adverbial Padding',
        description: 'Replace "walked slowly and tiredly" with "trudged", "dragged", or "shuffled". Strong verbs propel sentence energy.',
      },
      {
        title: 'The 10-Percent Prune',
        description: 'After finishing any chapter, immediately trim 10% of total word count by cutting connective tissue, throat-clearing, and redundant thoughts.'
      }
    ],
    craftBreakdown: [
      'Cut the first two paragraphs of every first draft scene to see if the scene actually starts on line three.',
      'Check sentence lengths: mix short 4-word punches with 20-word cascading rhythms.',
      'End scenes on maximum tension: a door opening, an unanswered question, a weapon drawn.'
    ],
    exercise: {
      title: 'The 250-Word Confrontation',
      prompt: 'Take a high-stakes disagreement between two rivals over a locked safe. Write the entire confrontation in under 250 words without losing emotional weight or physical clarity.',
      targetWords: 250,
      suggestedChapterTitle: 'Chapter 1: The Vault Key'
    }
  },
  {
    id: 'mc-revision-polish',
    title: 'The Revision Crucible & Line-Level Polish',
    subtitle: 'Transforming a messy first draft into publishing-grade literature',
    category: 'Revision',
    readTime: 16,
    level: 'Foundational',
    instructor: 'Jade Nwosu',
    instructorRole: 'Author of "Paper Crowns"',
    quote: 'The first draft is simply you shoveling sand into a box so you can build sandcastles later. Masterful writing is 10% inspiration and 90% merciless revision.',
    overview: 'A complete manuscript is only half the journey. Learn the professional three-pass revision methodology: Architectural, Scene Dynamics, and Line Polish.',
    corePrinciples: [
      {
        title: 'Pass 1: Story Architecture Check',
        description: 'Examine character arcs, plot holes, timeline discrepancies, and pacing valleys before touching sentence-level commas.',
      },
      {
        title: 'Pass 2: Voice & Rhythm Polish',
        description: 'Read the manuscript aloud or use speech playback to identify dialogue stumbling blocks and rhythmic monotony.',
      },
      {
        title: 'Pass 3: The Filter Word Purge',
        description: 'Search and eliminate filter words: "she noticed", "he felt", "she heard", "he saw", "seemed to", "started to".'
      }
    ],
    craftBreakdown: [
      'Eliminate filter words so the reader experiences the world directly rather than watching someone experience it.',
      'Vary paragraph lengths: use single-line paragraphs for high-impact emotional blows.',
      'Examine every dialogue line: does it advance plot or reveal character? If neither, strike it.'
    ],
    exercise: {
      title: 'The Filter-Word Surgical Strike',
      prompt: 'Write a 300-word passage describing a character escaping through a rainy alleyway at night. You are strictly forbidden from using "saw", "heard", "felt", "noticed", or "seemed".',
      targetWords: 300,
      suggestedChapterTitle: 'Chapter 1: The Blind Alley'
    }
  }
]
