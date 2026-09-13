// ── Draftwell demo stories — original fictional content ───────────────────
import type { Story } from './types'

export const DEMO_STORIES: Story[] = [
  {
    id: 'demo-1',
    userId: 'demo',
    title: 'The Shape of Rain',
    author: 'Mara Ellison',
    description: 'A quiet town remembers how to breathe before the storm arrives. Follow Mara through a story about memory, weather, and the things we carry home.',
    genre: 'Literary',
    tags: ['Literary', 'Mystery', 'Atmospheric'],
    status: 'Ongoing',
    coverColor: '#a95748',
    coverGradient: 'linear-gradient(145deg, #a95748, #5d3443 70%, #17354c)',
    isOwn: false,
    reads: 14200,
    rating: 4.7,
    ratingCount: 312,
    totalWords: 4800,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 2,
    chapters: [
      {
        id: 'demo-1-ch-1', storyId: 'demo-1', number: 1,
        title: 'The first light',
        note: 'Open with the town before the storm.',
        status: 'Published',
        wordCount: 312,
        createdAt: Date.now() - 86400000 * 30,
        updatedAt: Date.now() - 86400000 * 10,
        publishedAt: Date.now() - 86400000 * 10,
        body: `The town woke before the sun did.

At four seventeen, every window on Marrow Street blinked gold, one after another, as if the houses were remembering how to breathe. Mara watched from the kitchen floor, her back against the oven, and counted them twice.

By the time the last light came on, the rain had started.

She had lived in Hallow for thirty-one years and in that time she had catalogued its sounds the way other people catalogue regrets: the particular creak of the post office stairs, the way the river made a sound like tearing paper after heavy rain, the silence that settled over the whole town on Sunday mornings before anyone remembered to move.

She had not planned to stay. Nobody did. Hallow had a way of making plans feel like suggestions.

Her coffee was cold. She poured it out and made another, standing at the window this time, watching the rain come down in the kind of straight lines that meant it intended to stay all day.

The door behind her opened.

She didn't turn around.

"I thought you left," she said.

"I came back," said the voice.

She finally turned. He was standing in the doorway with rain on his shoulders and the same look he'd always had, the one that made her feel like she was a sentence he'd been trying to finish for years.

"The trains aren't running," he said. "Something on the line."

"Something's always on the line," Mara said, and turned back to the window.

Outside, Marrow Street was empty. The lights were still on in every house.`,
      },
      {
        id: 'demo-1-ch-2', storyId: 'demo-1', number: 2,
        title: 'A map of small things',
        note: 'Let the reader discover the house.',
        status: 'Published',
        wordCount: 278,
        createdAt: Date.now() - 86400000 * 20,
        updatedAt: Date.now() - 86400000 * 8,
        publishedAt: Date.now() - 86400000 * 8,
        body: `There were maps everywhere in the house, but none of them showed a place she recognised.

Mara had spent the morning moving through rooms that felt like someone else's memory — the shelves of her father's study still arranged exactly as he'd left them, the spines of his books faded to the same shade of dull amber, the smell of paper and something older underneath it, something mineral, like the inside of a clock.

She found the first map tucked inside a copy of a field guide to coastal birds. It was hand-drawn on graph paper, the lines precise and careful, every intersection labelled in a script too small to read without holding it to the light.

It wasn't Hallow. The scale was wrong, the distances impossible. It showed a town that had two river mouths and no roads leading out.

She put it back.

The second map was under a floorboard she'd tripped over as a child, the one in the corner of the kitchen that had always lifted slightly, as if the house were trying to show her something. This map was older, the paper soft as skin, the ink faded to the colour of a bruise.

She sat down on the kitchen floor with it spread across her knees.

It looked like Hallow. But the buildings were in the wrong order. The river curved differently. The church was on the east side of the square instead of the north.

She looked up at the window and the rain and tried to remember if she'd always trusted the map.`,
      },
      {
        id: 'demo-1-ch-3', storyId: 'demo-1', number: 3,
        title: 'The weather inside',
        note: 'The first honest conversation.',
        status: 'Published',
        wordCount: 224,
        createdAt: Date.now() - 86400000 * 10,
        updatedAt: Date.now() - 86400000 * 2,
        publishedAt: Date.now() - 86400000 * 2,
        body: `The weather had followed them in.

It sat between them at the kitchen table the way old arguments do — not mentioned, not gone. Mara had made soup. Daniel had eaten half of his and then set the spoon down at an angle that meant he was about to say something he'd been rehearsing.

"You don't have to stay," she said, before he could start.

"I know."

"The roads will clear by tomorrow."

"Probably."

She watched him look at his soup. He had always done this when he was working out how honest to be — looked at inanimate objects as if checking whether they would judge him.

"I was going to write you a letter," he said finally. "Fifteen drafts. I still have them."

"What did the fifteenth one say?"

"That I didn't know how to explain what happened without it sounding like an excuse."

"Was it an excuse?"

"I don't know." He looked up. "That's the honest version."

Mara nodded slowly. Outside the rain had eased to a fine mist that made the streetlights bloom. She thought about the maps upstairs, the town that looked like Hallow but wasn't.

"My father left notes," she said. "I've been finding them. In the books, under the floors." She paused. "I think he knew something was wrong with this place long before the rest of us did."

Daniel was quiet for a long time.

"Tell me," he said at last.

So she did.`,
      },
    ],
  },
  {
    id: 'demo-2',
    userId: 'demo',
    title: 'Salt in the Static',
    author: 'Ari Okafor',
    description: 'Two voices find each other across a city built on old radio signals. A science fiction love story about frequency, distance, and what survives the noise.',
    genre: 'Sci-Fi',
    tags: ['Sci-Fi', 'Romance', 'Urban'],
    status: 'Ongoing',
    coverColor: '#1a3a5c',
    coverGradient: 'linear-gradient(145deg, #1a3a5c, #0d2137 60%, #2a1f4a)',
    isOwn: false,
    reads: 28900,
    rating: 4.5,
    ratingCount: 547,
    totalWords: 5200,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 1,
    chapters: [
      {
        id: 'demo-2-ch-1', storyId: 'demo-2', number: 1,
        title: 'Signal, Lost',
        note: 'The city introduces itself.',
        status: 'Published',
        wordCount: 340,
        createdAt: Date.now() - 86400000 * 60,
        updatedAt: Date.now() - 86400000 * 60,
        publishedAt: Date.now() - 86400000 * 60,
        body: `The city of Cairn was built on the bones of a broadcasting tower that never stopped transmitting.

Nobody remembered what it had been trying to say. By the time the first buildings went up around its base — thin-walled apartments stacked like afterthoughts — the signal had degraded to a low-frequency hum that you felt more than heard, a vibration that lived in dental fillings and old scar tissue and the spaces between words.

Jessa had grown up tuning it out.

She worked the overnight shift at a relay station on the forty-second floor of a building with no name, just a number stencilled on the door and a view of the city's grid of light that made it look, on clear nights, like the circuit board of something that had once been alive.

Her job was to listen for interference and log it. Mostly it was silence. Sometimes it was feedback. Occasionally it was a voice.

She had heard the voice three times in the past month.

It always came at the same frequency — 91.7 on the old analogue band that nobody used anymore — and it said the same thing each time, in the same unhurried cadence, as if it had all the time in the world and wasn't sure how much she had left:

"Are you still there?"

The first time she'd assumed it was a test signal from another relay. The second time she'd run a trace and found nothing. The third time she'd answered.

"I'm here," she'd said, feeling slightly ridiculous.

The static had changed. Not words, exactly, but something warmer — a shift in texture, the way a room feels different when someone in it relaxes.

Then silence.

Jessa had written it up as anomalous atmospheric interference and filed it where reports go to be forgotten. But she'd also started coming in twenty minutes early, just to sit at the receiver and wait.`,
      },
      {
        id: 'demo-2-ch-2', storyId: 'demo-2', number: 2,
        title: 'Frequency',
        note: 'First real contact.',
        status: 'Published',
        wordCount: 298,
        createdAt: Date.now() - 86400000 * 45,
        updatedAt: Date.now() - 86400000 * 45,
        publishedAt: Date.now() - 86400000 * 45,
        body: `The fourth time, he spoke in full sentences.

"I've been trying to reach this station for a long time," the voice said. It was male, unhurried, with the cadence of someone used to talking into empty rooms. "I wasn't sure it was still manned."

Jessa looked around her booth. Through the glass she could see the empty relay floor, the inactive consoles, the red light above the server rack that blinked like a slow heartbeat. She pressed transmit.

"It's staffed. By one person. At two in the morning."

"That's better than nothing," he said.

"Debatable." She pulled up the trace window and ran it again — latitude, longitude, signal origin. The result came back the same as before. The signal was originating from inside the city. But the coordinates placed it somewhere in the canal district, deep in the infrastructure layer, a part of Cairn that had been decommissioned before she was born.

"Where are you transmitting from?" she asked.

A pause. "It's complicated."

"Most things are."

"Fifty-one Conduit Row," he said. "Sub-level three. Though I'm not sure how much of it still exists in the way you'd recognise."

She didn't know what that meant. She wrote the address down anyway, on the back of a log sheet, with the time and frequency.

"What's your name?" she said.

"Theo," he said. "What's yours?"

"Jessa."

"Jessa," he repeated, as if checking the weight of it. "Have you ever come down to the sub-levels?"

"No," she said. "They're sealed."

"Most of them," he agreed. "Not all."

The signal held for another three seconds. Then it faded into the ambient hum of the city, and she was alone again with the blinking red light.

She looked at the address she'd written. Her handwriting was neater than usual, she noticed, as if she'd wanted it to last.`,
      },
      {
        id: 'demo-2-ch-3', storyId: 'demo-2', number: 3,
        title: 'Sub-Level Three',
        note: 'She goes looking.',
        status: 'Published',
        wordCount: 310,
        createdAt: Date.now() - 86400000 * 30,
        updatedAt: Date.now() - 86400000 * 1,
        publishedAt: Date.now() - 86400000 * 1,
        body: `The canal district smelled of iron and old water.

Jessa had taken the early tram, when the city was still mostly shadow and the few people out moved with the particular purpose of those who hadn't slept. She'd brought her field kit out of habit — a handheld receiver, signal logger, spare batteries — and felt slightly absurd carrying it through streets that had nothing to do with work.

Fifty-one Conduit Row was a maintenance access building, its façade plastered with warning signs in three languages, its door sealed with a padlock that had rusted to the colour of dried blood.

The padlock was not locked.

She went in.

The sub-levels opened below her in a series of descending corridors, each one older than the last, the architecture shifting from steel-panelled utility to something rawer — bare concrete, exposed conduit, the smell of decades of dampness. Somewhere below her she could hear the old broadcasting tower's hum, closer and more physical now, a vibration that she felt in her sternum.

Sub-level three was lit by a series of amber work lights strung along the ceiling on rusted wire. The room at the end of the corridor was large and unexpectedly warm, packed with equipment from three different eras of technology — valves and circuit boards and modern transmitters all wired together in a configuration that should not have worked.

A chair. A desk. A mug of something still steaming.

Nobody there.

She walked to the transmitter. On the desk beside it was a logbook, handwritten, covering what looked like years of solo monitoring work. The last entry was dated this morning, forty minutes ago.

She picked up his transmitter and clicked it on.

"I found your station," she said.

A burst of static. Then, from somewhere in the building above her, footsteps on metal stairs.`,
      },
    ],
  },
  {
    id: 'demo-3',
    userId: 'demo',
    title: 'The Glass Orchard',
    author: 'Nia Vale',
    description: 'A tender return to a world that never stopped waiting. A fantasy about the magic that lives in ordinary places, and the girl who had to leave to find it.',
    genre: 'Fantasy',
    tags: ['Fantasy', 'Romance', 'Coming-of-age'],
    status: 'Completed',
    coverColor: '#2d5a3d',
    coverGradient: 'linear-gradient(145deg, #2d5a3d, #1a3828 60%, #3d4a2a)',
    isOwn: false,
    reads: 52300,
    rating: 4.9,
    ratingCount: 891,
    totalWords: 6100,
    createdAt: Date.now() - 86400000 * 120,
    updatedAt: Date.now() - 86400000 * 14,
    chapters: [
      {
        id: 'demo-3-ch-1', storyId: 'demo-3', number: 1,
        title: 'Return',
        note: 'She comes back after seven years.',
        status: 'Published',
        wordCount: 380,
        createdAt: Date.now() - 86400000 * 120,
        updatedAt: Date.now() - 86400000 * 120,
        publishedAt: Date.now() - 86400000 * 120,
        body: `The orchard was exactly as she'd left it.

Sera had prepared herself for change — had rehearsed it on the train, cataloguing the ways seven years might have reshaped the valley, the way memory always makes the world smaller and softer than it actually is. She'd expected the trees to be taller, the stone wall to have crumbled further, the glass to be gone.

The glass was still there.

It grew from the orchard floor the way it always had: not in sheets, but in formations, rising between the roots in columns and fans and delicate spirals, catching the afternoon light and throwing it back in fragments across the bark of the trees. Nobody had ever been able to explain it. The university had sent researchers twice. Both times they'd gone home with notebooks full of observations and no conclusions, the glass refusing to behave like glass at all — warm to the touch, faintly resonant, growing at a rate that was just too slow to observe directly but too fast to ignore.

Sera had grown up treating it like furniture.

She set down her bag at the gate and walked in. The grass was knee-high between the trees, and the smell of the place hit her the way smells always do — not gradually, but all at once, the full archive of childhood in a single breath: earth and overripe fruit and something electric, the particular scent of the glass doing whatever the glass did.

"You came back," said a voice from the far end of the orchard.

She looked up.

Standing on a ladder propped against the oldest tree, with a basket hooked over one arm and an expression she had spent years trying to forget, was Rowan.

"I heard you might," he said. He didn't climb down.

Sera picked up her bag. "Who told you?"

"Nobody had to tell me." He turned back to the tree and reached for a branch. "The glass went warm three days ago. It always does when someone's coming home."`,
      },
      {
        id: 'demo-3-ch-2', storyId: 'demo-3', number: 2,
        title: 'What the Glass Remembers',
        note: 'The history of the orchard revealed.',
        status: 'Published',
        wordCount: 344,
        createdAt: Date.now() - 86400000 * 100,
        updatedAt: Date.now() - 86400000 * 100,
        publishedAt: Date.now() - 86400000 * 100,
        body: `The house had not changed either, which was the more unsettling discovery.

Her mother's kitchen still smelled of cardamom. The same crack ran diagonally across the third step of the stairs. The shelf in the hall still held the same row of glass jars filled with dry seeds, each one labelled in her mother's fine script, though some of the labels had faded past reading.

Her mother was not in the kitchen. She was in the cellar, where she spent most of her time now, cataloguing.

"The glass has been growing faster," her mother said, without looking up from the ledger on the table. "Since the winter. I've been trying to map the new formations."

Sera sat down. "Has anyone else noticed?"

"The Fenwick boy. He says his sheep won't go near the south wall anymore." Her mother finally looked up. "You look tired."

"I feel tired."

"The city does that." Her mother said this with the certainty of someone who had visited exactly once and found it conclusive evidence. "Sit. I'll make tea."

Sera sat and looked out the cellar window, which gave a low view of the orchard — just the bottom few feet of tree trunks and the glass formations rising between them. In the late afternoon light they looked almost like frozen fire, amber and gold, absolutely still.

"Mum," she said. "What do you actually know about where it comes from?"

Her mother was quiet for a moment, spooning leaves into the pot.

"I know what my mother told me," she said carefully. "And what her mother told her. It isn't scientific."

"Tell me anyway."

Her mother brought the tea and sat across from her and folded her hands around her cup.

"The valley was a place where something was buried," she said. "A long time ago. Before anyone here was born. And the glass is the buried thing, trying to remember what it was."`,
      },
    ],
  },
  {
    id: 'demo-4',
    userId: 'demo',
    title: 'Hollow Season',
    author: 'Demi Park',
    description: 'A detective haunted by the case she never solved returns to a mountain town where the suspect has been living in plain sight for twenty years.',
    genre: 'Thriller',
    tags: ['Thriller', 'Crime', 'Mystery'],
    status: 'Ongoing',
    coverColor: '#2c2c3e',
    coverGradient: 'linear-gradient(145deg, #2c2c3e, #1a1a2e 60%, #16213e)',
    isOwn: false,
    reads: 37800,
    rating: 4.6,
    ratingCount: 623,
    totalWords: 5600,
    createdAt: Date.now() - 86400000 * 90,
    updatedAt: Date.now() - 86400000 * 3,
    chapters: [
      {
        id: 'demo-4-ch-1', storyId: 'demo-4', number: 1,
        title: 'Cold Case',
        note: 'She opens the file again.',
        status: 'Published',
        wordCount: 360,
        createdAt: Date.now() - 86400000 * 90,
        updatedAt: Date.now() - 86400000 * 90,
        publishedAt: Date.now() - 86400000 * 90,
        body: `Detective Inspector Yun had kept the file in her kitchen.

Not in a cabinet, not in a box under the bed — in a drawer between the dish towels and the takeaway menus, where she would encounter it regularly and have the choice to open it or not. She had found that this was better than hiding it. Hiding things gave them power. The kitchen drawer gave her the illusion of control.

She had not opened it in four months. A personal record.

The call came on a Thursday morning in November, while she was standing at her window watching the street below with the particular emptiness that comes after the second coffee and before any reason to move.

"We found him," said the voice on the phone. Her old partner, Marsh. She could hear road noise behind him — he was already in a car. "Took twenty years, but we found him."

Yun set down her mug very carefully. "Where?"

"Fell. It's a mountain town up in the—"

"I know where Fell is."

A pause. "Right. Of course you do."

She did. She had driven through it once, on the way to somewhere else, three years after the case closed and she'd been quietly reassigned to things that were easier to solve. She hadn't stopped. She'd been afraid that if she stopped she wouldn't leave.

"He's been there since the beginning," Marsh said. "Running a hardware shop. Two kids. Goes to the town council meetings."

Yun walked to the drawer. Opened it. The file was there between a folded cloth and a menu from a Thai place that had closed five years ago.

"Book me a room," she said.

"Already done," said Marsh. "Train leaves at eight."

She took the file out and put it on the table and stood over it without opening it, the way you stand at the edge of something you know you're going to jump into anyway.`,
      },
      {
        id: 'demo-4-ch-2', storyId: 'demo-4', number: 2,
        title: 'The Town of Fell',
        note: 'She arrives.',
        status: 'Published',
        wordCount: 295,
        createdAt: Date.now() - 86400000 * 75,
        updatedAt: Date.now() - 86400000 * 3,
        publishedAt: Date.now() - 86400000 * 3,
        body: `Fell sat at the end of a valley that the map suggested was wider than it actually was.

The train emptied out at the last proper station, a town called Graig with a supermarket and a cinema showing films six months after everyone else. From there it was a forty-minute bus ride on a road that became increasingly specific about its own importance — not a highway becoming a lane, but a lane asserting itself as the only way to anywhere that mattered.

Yun arrived at four in the afternoon when the light had already gone soft and the shops were lit from inside and the mountain above the town was dark against a sky that couldn't quite decide between grey and violet.

The hardware shop was on the main street. She walked past it once without stopping. Hand-painted sign, good quality. Clean windows. A display of tools arranged with care.

The man inside was not the man from her photograph. Of course not — twenty years. She knew this. She had updated her mental image more than once, had aged him forward using the software and her own imagination, had tried to account for what two decades of hardware and mountain air and council meetings might do to a face.

Still, she stood outside the post office across the street and looked through the window and tried to find something she recognised.

He was serving a woman with grey hair, showing her something small, a fitting of some kind. He was explaining it with patience. He was smiling.

Yun had arrested people who smiled like that. It didn't mean anything, she told herself.

She went to find her guesthouse.

She had time.`,
      },
    ],
  },
  {
    id: 'demo-5',
    userId: 'demo',
    title: 'Seventeen Moons',
    author: 'Calix Ren',
    description: 'On a generation ship three hundred years into its journey, a young engineer discovers the logs of someone who died before she was born — and falls in love with their words.',
    genre: 'Sci-Fi',
    tags: ['Sci-Fi', 'Romance', 'Space'],
    status: 'Ongoing',
    coverColor: '#0d1b3e',
    coverGradient: 'linear-gradient(145deg, #0d1b3e, #050d20 60%, #1a1040)',
    isOwn: false,
    reads: 21400,
    rating: 4.4,
    ratingCount: 389,
    totalWords: 4900,
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now() - 86400000 * 5,
    chapters: [
      {
        id: 'demo-5-ch-1', storyId: 'demo-5', number: 1,
        title: 'The Archive',
        note: 'Lena finds the logs.',
        status: 'Published',
        wordCount: 330,
        createdAt: Date.now() - 86400000 * 45,
        updatedAt: Date.now() - 86400000 * 45,
        publishedAt: Date.now() - 86400000 * 45,
        body: `The ship's archive was technically accessible to anyone with a crew pass, but in practice nobody came down here except the archivists, and the archivists were famously unsociable.

Lena had a legitimate reason: she was auditing the engineering logs from decades four through six, looking for maintenance records related to the cooling systems in the lower engine rooms. This was real work. She was not stalling. She was not hiding from the meeting she had declined to attend.

She was, however, also the only person in the archive, which was quiet in a way that the rest of the ship never quite managed to be.

The cooling records were found and catalogued in under an hour. She was about to go when her search threw up an adjacent record set — personal logs, cross-referenced with the same engineering subsystems, from a period sixty years earlier.

She didn't know why she opened them.

The first entry was dated Day 114 of Year 217 of the journey. The name attached was Kael Anso, Junior Engineer, Level 3. Deceased, Year 238. The archive notation added: logs donated to ship record by surviving family.

She read the first three sentences and then sat back in her chair and looked at the ceiling.

Then she read the rest of the first entry, and the second, and by the time she had read the fourth she had been in the archive for two and a half hours and the meeting she'd declined to attend was long over.

Kael Anso had written in the way that people write when they think nobody will ever read it — with honesty that costs something, with the kind of detail that means someone was paying very close attention to being alive.

She closed the file.

She opened it again immediately.`,
      },
    ],
  },
  {
    id: 'demo-6',
    userId: 'demo',
    title: 'The Gardener of Vor',
    author: 'Sylvie Marchetti',
    description: 'In a kingdom that runs on botanical magic, the royal gardener discovers that the palace flowers have been lying to everyone for a hundred years.',
    genre: 'Fantasy',
    tags: ['Fantasy', 'Magic', 'Historical'],
    status: 'Completed',
    coverColor: '#3d5a2a',
    coverGradient: 'linear-gradient(145deg, #3d5a2a, #2a3d1a 60%, #4a5a30)',
    isOwn: false,
    reads: 44100,
    rating: 4.8,
    ratingCount: 712,
    totalWords: 7200,
    createdAt: Date.now() - 86400000 * 180,
    updatedAt: Date.now() - 86400000 * 21,
    chapters: [
      {
        id: 'demo-6-ch-1', storyId: 'demo-6', number: 1,
        title: 'The Language of Petals',
        note: 'The palace garden reveals its secret.',
        status: 'Published',
        wordCount: 400,
        createdAt: Date.now() - 86400000 * 180,
        updatedAt: Date.now() - 86400000 * 180,
        publishedAt: Date.now() - 86400000 * 180,
        body: `Every flower in the palace gardens of Vor spoke a different truth.

The roses reported loyalty — or the performance of loyalty, which was mostly the same thing, except on the days it wasn't. The white chrysanthemums in the east courtyard catalogued grief, patient and specific, tracking each loss in the palace back to its source. The wisteria on the queen's walls measured longing, its blooms thickening or thinning with the seasons of the heart.

Petra had been the palace gardener for eleven years and she had learned to read all of them.

She had also learned which ones were lying.

It had taken her seven years to be certain enough to say it to herself, and another three to understand what the lie meant. The marigolds in the king's ceremonial garden, which were supposed to report truth as the palace botanists understood it — the marigolds had been saying one thing consistently for longer than anyone now living had been in the palace.

They said: *the succession is not what it appears.*

Every morning, Petra walked to the king's garden and read the marigolds and every morning they said the same thing, in the quiet floral language that only trained gardeners could fully interpret, patient as calendar pages.

She had told no one.

This was partly because she wasn't sure she had the translation right. Botanical communication operated in gradients, not sentences, and misreading a gradient had ended gardening careers before hers.

And partly because she knew what happened to people who said the wrong thing in the right place.

On the morning everything changed, she was doing her usual rounds, notebook open, when she reached the marigolds and found that something had shifted.

Not the message. The message was the same.

What had shifted was this: the marigolds were no longer content to wait for her to read them.

They turned toward her before she reached them.

That had never happened before.`,
      },
    ],
  },
  {
    id: 'demo-7',
    userId: 'demo',
    title: 'Last Train to Yonder',
    author: 'Tobias Vane',
    description: 'A ghost has been riding the same midnight train for fifty years. Tonight, someone finally buys a ticket for his stop.',
    genre: 'Horror',
    tags: ['Horror', 'Supernatural', 'Drama'],
    status: 'Completed',
    coverColor: '#1a1a1a',
    coverGradient: 'linear-gradient(145deg, #1a1a1a, #0d0d0d 60%, #2a1a2a)',
    isOwn: false,
    reads: 18700,
    rating: 4.3,
    ratingCount: 298,
    totalWords: 3800,
    createdAt: Date.now() - 86400000 * 75,
    updatedAt: Date.now() - 86400000 * 30,
    chapters: [
      {
        id: 'demo-7-ch-1', storyId: 'demo-7', number: 1,
        title: 'The Midnight Service',
        note: 'The train departs.',
        status: 'Published',
        wordCount: 360,
        createdAt: Date.now() - 86400000 * 75,
        updatedAt: Date.now() - 86400000 * 75,
        publishedAt: Date.now() - 86400000 * 75,
        body: `The midnight train ran whether anyone boarded it or not.

Marcus had tested this theory extensively over the course of fifty years, standing on the platform at Yonder in the cold dark and watching the doors open and close and the train pull away with its empty carriages and its lights moving down the track until they disappeared around the bend in the hill.

He was not alive, in the conventional sense. He understood this. He had come to terms with it sometime in the early nineteen-nineties, which was also when he'd stopped trying to speak to the stationmaster, whose expression of tolerant incomprehension had not changed across a series of different stationmasters spanning multiple decades.

Marcus occupied his afterlife with the focused curiosity of a man who had nothing else to do. He had catalogued the train's schedule down to the second. He had watched the platform's architecture shift over the years — the old wooden benches replaced by metal ones, the lamp posts updated, a coffee kiosk installed and then removed. He had read, over various shoulders, newspapers and novels and phone screens, and had in this way kept reasonably current.

He had not, until tonight, seen anyone else wait for the midnight service.

She was sitting on the far end of the second bench with a small bag at her feet and a ticket held in both hands, reading it as if it contained instructions she hadn't been given enough time to memorise.

He moved to the other end of her bench and sat down.

She did not look through him. People generally looked through him. Instead she looked at him, with the directness of someone who was either very tired or had decided to stop being startled by things.

"Are you a ghost?" she said.

"Yes," said Marcus, because fifty years had cured him of the impulse to equivocate.

"Good," she said. "I wasn't sure if I had the right train."`,
      },
    ],
  },
  {
    id: 'demo-8',
    userId: 'demo',
    title: 'Paper Crowns',
    author: 'Jade Nwosu',
    description: 'Two rival editors at a failing literary magazine discover they have been anonymously writing to each other for a year.',
    genre: 'Romance',
    tags: ['Romance', 'Contemporary', 'Comedy'],
    status: 'Ongoing',
    coverColor: '#7a3d5a',
    coverGradient: 'linear-gradient(145deg, #7a3d5a, #5a2a45 60%, #3d1a30)',
    isOwn: false,
    reads: 31500,
    rating: 4.6,
    ratingCount: 561,
    totalWords: 5400,
    createdAt: Date.now() - 86400000 * 55,
    updatedAt: Date.now() - 86400000 * 4,
    chapters: [
      {
        id: 'demo-8-ch-1', storyId: 'demo-8', number: 1,
        title: 'The Anonymous Column',
        note: 'The letters begin.',
        status: 'Published',
        wordCount: 350,
        createdAt: Date.now() - 86400000 * 55,
        updatedAt: Date.now() - 86400000 * 55,
        publishedAt: Date.now() - 86400000 * 55,
        body: `The magazine had a letters column that technically nobody read.

This was editorial knowledge — the letters page was a formality, a nod to tradition from the magazine's founding editor, who had believed that the relationship between reader and publication should have somewhere physical to live. In practice it received approximately four letters per issue, of which one was usually from the founding editor's sister, who was ninety-two and still typed her correspondence, and the rest were corrections.

Kit had been editing the column for two years and had not once considered it interesting.

Until the letter arrived.

It was not a correction. It was not from anyone she recognised. It was, as best she could describe it to herself, a piece of writing that had accidentally ended up in the wrong genre — an opinion piece masquerading as a letter, arguing with such precise and infuriating specificity against the magazine's recent coverage of debut fiction that she had to read it twice to be sure she hadn't imagined it.

She published it.

The following issue brought a response. From a different anonymous writer, apparently — different handwriting, different style — defending the editorial position with the kind of detailed intelligence that suggested either a very well-read reader or someone who worked in publishing.

She published that too.

By the third exchange she had begun to suspect that the two anonymous correspondents might be the same person. By the fifth she had abandoned the theory. They were too consistent in their differences. One was expansive and lateral, chasing implications across three paragraphs. The other was surgical, returning always to the specific word, the single sentence, the weight of a comma.

She looked forward to them.

She did not tell this to her colleague Marcus, who sat opposite her and held opinions about the letters column that he expressed regularly and without invitation.

She especially did not tell him that she had started writing back — anonymously, of course.`,
      },
    ],
  },
]

// ── Demo authors ──────────────────────────────────────────────────────────
export const DEMO_AUTHORS = [
  { id: 'author-1', name: 'Mara Ellison', bio: 'Literary fiction writer based in the north. Obsessed with weather, memory, and the architecture of grief.', stories: 3, followers: 1420, genre: 'Literary' },
  { id: 'author-2', name: 'Ari Okafor', bio: 'Science fiction. Interested in cities, signals, and the infrastructure of longing.', stories: 2, followers: 2890, genre: 'Sci-Fi' },
  { id: 'author-3', name: 'Nia Vale', bio: 'Fantasy. I write about magic that lives in soil and glass and old kitchens.', stories: 4, followers: 5230, genre: 'Fantasy' },
  { id: 'author-4', name: 'Demi Park', bio: 'Crime and thriller. Cold cases, mountain towns, and the patience of detectives.', stories: 2, followers: 3780, genre: 'Thriller' },
  { id: 'author-5', name: 'Calix Ren', bio: 'Space fiction and quiet love stories. Usually both at the same time.', stories: 2, followers: 2140, genre: 'Sci-Fi' },
  { id: 'author-6', name: 'Sylvie Marchetti', bio: 'Secondary-world fantasy. Botanical magic, unreliable courts, gardens that know things.', stories: 5, followers: 4410, genre: 'Fantasy' },
]

export const GENRES = ['All', 'Literary', 'Fantasy', 'Sci-Fi', 'Thriller', 'Romance', 'Horror', 'Drama', 'Historical', 'Comedy', 'Mystery']
