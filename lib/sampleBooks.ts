// Sample books for the Draftwell library to introduce users
// Family-friendly adventure, friendship, and discovery stories only.

export type SampleChapter = {
  chapter_number: number;
  title: string;
  content: string;
  is_premium: false;
  coin_cost: 0;
  star_cost: 0;
};

export type SampleNovel = {
  id: string;
  title: string;
  author_name: string;
  synopsis: string;
  cover_image_url: string;
  genre: string;
  status: string;
  chapters: SampleChapter[];
};

export const sampleNovels: SampleNovel[] = [
  {
    id: "sample-forest",
    title: "The Enchanted Forest Quest",
    author_name: "Mira Greenleaf",
    synopsis: "Two siblings and their loyal dog discover a hidden woodland where animals speak and ancient trees glow with gentle magic. Together with new woodland friends, they work to protect the forest’s heart from a mysterious shadow that seeks to dim its light.",
    cover_image_url: "/covers/enchanted-forest.jpg",
    genre: "Fantasy",
    status: "ONGOING",
    chapters: [
      {
        chapter_number: 1,
        title: "The Path That Wasn’t There Yesterday",
        content: `The morning sun filtered through the ordinary trees at the edge of Maplewood Park, but something felt different. Leo adjusted the strap of his messenger bag and glanced at his sister, Maya, who was already kneeling to tie her sneakers.\n\n“Did you hear that?” Maya whispered. “It sounded like someone humming.”\n\nTheir dog, Rusty, a golden retriever with ears that flopped like soft pancakes, suddenly bolted forward, nose to the ground. He didn’t bark. He just ran, tail wagging hard enough to stir the fallen leaves.\n\n“Rusty, wait!” Leo called, but the dog had already disappeared around a bend that neither of them remembered seeing before.\n\nThey followed. The path under their feet changed from packed dirt to soft moss. The air grew warmer, smelling of wildflowers and something sweet, like honey left in the sun. Ahead, the trees grew taller and closer together, their leaves shimmering with a pale green light that didn’t come from the sky.\n\n“This isn’t the park,” Maya said quietly. “The park ends at the fence.”\n\nThere was no fence. Only more trees, and a low, friendly voice that seemed to come from everywhere at once.\n\n“Welcome, young walkers. The forest has been waiting.”\n\nLeo and Maya stopped. Rusty sat between them, tongue out, looking entirely at home. An owl with bright yellow eyes blinked from a branch above them. A rabbit sat upright on a sun-dappled stone. A squirrel chattered from a knot in the trunk of an oak so wide that two of Leo could not have wrapped their arms around it.\n\n“Did… did that owl just talk?” Leo asked.\n\nThe owl ruffled its feathers. “Of course. We all do, when the forest chooses to open its doors. My name is Elder Hollow. You may call me Hollow. And you are needed.”\n\nMaya stepped forward, her backpack bouncing. “Needed for what?”\n\n“The Heartlight is dimming,” Hollow said. “Something is drinking the glow from the oldest trees. The animals can feel it, but we cannot fix it alone. Will you help?”\n\nRusty barked once, a clear yes. Leo looked at Maya. She nodded, eyes wide but determined.\n\n“We’ll help,” Leo said. “What do we do first?”\n\nHollow spread one wing toward a narrow trail that glowed faintly underfoot. “Follow the light. And stay together. The forest rewards those who listen.”\n\nThey walked. With every step the ordinary world felt farther away, and the enchanted one felt more like home.`,
        is_premium: false,
        coin_cost: 0,
        star_cost: 0
      }
    ]
  }
];

export function getSampleNovel(id: string): SampleNovel | undefined {
  return sampleNovels.find((n) => n.id === id);
}

export function getSampleChapter(novelId: string, chapterNum: number): SampleChapter | undefined {
  const novel = getSampleNovel(novelId);
  return novel?.chapters.find((c) => c.chapter_number === chapterNum);
}
