export type ArticleCategory =
  | 'Stoicism'
  | 'Culture'
  | 'Philosophy'
  | 'Style'
  | 'Literature'
  | 'Travel';

export interface Article {
  id: string;
  category: ArticleCategory;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  body: string[];
  summary: string[];
}

export const ARTICLES: Article[] = [
  {
    id: 'discipline-of-morning',
    category: 'Stoicism',
    date: '06 Mar 2026',
    readTime: '8 min',
    title: 'The Discipline of Morning: How Great Men Begin Their Day.',
    excerpt:
      'The Stoics were not simply philosophers. They were practitioners. Marcus Aurelius rose before dawn not because he wanted to, but because he chose to — and in that distinction lies everything.',
    body: [
      'The Stoics were not simply philosophers. They were practitioners. Marcus Aurelius rose before dawn not because he wanted to, but because he chose to — and in that distinction lies everything.',
      'Modern life conspires against the morning. Notifications, obligations, and the seductive pull of an extra hour in bed all conspire to delay the hour of genuine consciousness. The Stoics understood this was a battle to be fought daily.',
      'The morning represents a philosophical frontier. It is the one period in the day that remains largely uncontested by the demands of others — before the inbox, before the calls, before the machine of social obligation begins to grind. Squander it, and the day belongs to circumstance. Command it, and the day belongs to you.',
      'Marcus wrote to himself: "Begin the morning by saying to thyself, I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial." This was not pessimism. It was preparation — the same rational steeling that a soldier applies before entering the field.',
      'A morning practice does not require elaborate ritual. It requires only a moment of intentional silence before the noise begins. A single page of philosophy. Five minutes of stillness. The act of choosing how the day begins, rather than allowing the day to choose for you.',
    ],
    summary: [
      'Morning rituals are a form of philosophical practice, not mere productivity optimisation.',
      'Intentional early rising creates a window of uncontested solitude that primes the mind for clarity.',
      'The quality of a day is largely determined before the first obligation begins.',
    ],
  },
  {
    id: 'art-makers',
    category: 'Culture',
    date: '01 Mar 2026',
    readTime: '15 min',
    title: 'Art Makers and Rule Breakers for a Gentleman\'s Cultural Showcase.',
    excerpt:
      "A collision of worlds; a dance of contrasts — a harmonious disarray. Culture is not a passive inheritance — it is an active discipline that elevates every decision.",
    body: [
      "Culture is not something you inherit passively. It is something you engage, challenge, and ultimately contribute to — a discipline of perpetual refinement.",
      "The modern gentleman understands that to engage with art is to sharpen perception, expand empathy, and cultivate the kind of refined judgment that elevates every decision. It is not enough to consume culture; one must interrogate it.",
      "We are drawn to contradictions — the Art students who opened a Swiss Design Studio in the back of a Skate Shop. The Hemingway who wrote in cafés and lived in the wild. The philosopher-king who governed by day and wrote by night. It is in contradiction that character reveals itself.",
      "The gentleman who attends openings, reads criticism, and forms his own considered opinions is not performing sophistication. He is building the cognitive infrastructure that makes genuine original thought possible.",
      "Great art does not comfort us. It discomforts us productively — it presents the world at an angle we had not considered, and invites us to see ourselves more clearly as a result.",
    ],
    summary: [
      'Cultural engagement sharpens perception and cultivates the judgment that elevates everyday decisions.',
      'The gentleman engages with art not to perform sophistication but to develop original thought.',
      'Great culture discomforts productively — it presents the world at an angle we had not considered.',
    ],
  },
  {
    id: 'virtue-of-silence',
    category: 'Philosophy',
    date: '25 Feb 2026',
    readTime: '6 min',
    title: 'On the Virtue of Silence in a World That Rewards Noise.',
    excerpt:
      'In antiquity, silence was considered a mark of wisdom. Today we mistake verbosity for intelligence, and volume for confidence. The gentleman reacquaints himself with restraint.',
    body: [
      'In antiquity, silence was considered a mark of wisdom. Today we mistake verbosity for intelligence, and volume for confidence. The noise is everywhere — in meetings, on feeds, in conversations that mistake quantity of words for quality of thought.',
      'The Pythagoreans required students to observe five years of silence before they were permitted to speak in philosophical discourse. This was not cruelty. It was the recognition that most of what we say is noise dressed as signal.',
      'Consider the man who speaks least in the room. He is often assumed, incorrectly, to have least to offer. The experienced observer knows otherwise. The man who chooses his words is the man who has weighed them. His silence is not absence — it is active, disciplined attention to what is actually worth saying.',
      'Strategic reticence commands more respect than constant commentary. Speak when you have something to add. Hold your counsel when you do not. The discipline required is considerable. The returns are proportionate.',
      'One practice: before speaking in any significant context, pause for three seconds. Ask whether what you are about to say improves upon the silence. You will be surprised how often the answer is no.',
    ],
    summary: [
      'Silence is not passivity — it is active, disciplined attention to what is actually worth saying.',
      'The compulsive need to fill space with words signals insecurity, not authority.',
      'Strategic reticence commands more respect than constant commentary.',
    ],
  },
  {
    id: 'well-dressed-mind',
    category: 'Style',
    date: '20 Feb 2026',
    readTime: '10 min',
    title: 'The Well-Dressed Mind: On Books, Tailoring, and the Art of Being.',
    excerpt:
      'Dress is character made visible. But what of the interior? The man who attends to his wardrobe yet neglects his library presents a curious contradiction — appearance without substance.',
    body: [
      'Dress is character made visible. The choice of cloth, cut, and colour communicates something about our values, our discipline, and our relationship to aesthetics before a word has been spoken.',
      'But what of the interior wardrobe? The man who attends to his wardrobe yet neglects his library presents a curious contradiction. He has invested in the signal while ignoring the substance.',
      'The well-read man and the well-dressed man are not separate archetypes — they are expressions of a single integrated approach to life. Both require attention. Both reward discipline. Both communicate to the world that you take the matter of being human seriously.',
      'There is a reason the great tailors of London speak of "fit" with the same vocabulary that philosophers use to describe the alignment of character and action. The garment that fits its wearer is the life that fits its owner — tailored to specific contours, neither borrowed nor inherited wholesale from another.',
      'Build both wardrobes with equal care. Let your reading season your conversation. Let your dress reflect your values. The man who has done this rarely needs to announce himself.',
    ],
    summary: [
      'Personal style and intellectual cultivation are not separate pursuits — they are expressions of a single integrated identity.',
      'The gentleman understands that how he presents himself in dress and in thought are equally deliberate choices.',
      'Neglecting one domain while perfecting the other produces an imbalance others intuitively sense.',
    ],
  },
  {
    id: 'marcus-aurelius-2026',
    category: 'Literature',
    date: '14 Feb 2026',
    readTime: '12 min',
    title: 'Reading Marcus Aurelius in 2026: What the Emperor Still Teaches Us.',
    excerpt:
      "The Meditations were never meant to be published. They were private reminders from a man who held the fate of an empire — and still worried he wasn't doing enough. That honesty is what makes them timeless.",
    body: [
      "The Meditations were never meant to be published. Marcus Aurelius wrote them for himself — private reminders from a man who held the fate of an empire and still worried he wasn't good enough. That honesty is precisely what makes them timeless.",
      "Unlike most philosophy, the Meditations read not as doctrine but as struggle. Here is a man of enormous power and responsibility reminding himself, repeatedly, that anger is counterproductive, that others' opinions are not his concern, that everything will pass. The repetition is not accident — it is the record of a man fighting the same human tendencies we all face.",
      "Book II opens with one of the most remarkable passages in philosophical literature: 'Begin the morning by saying to thyself, I shall meet with the busy-body, the ungrateful, arrogant, deceitful, envious, unsocial.' This is not pessimism. It is preparation. It is equanimity engineered by advance acceptance.",
      "The genius of the Meditations is that they work as a daily practice rather than a treatise to be studied and set aside. Open any page. The passage will be applicable to something you experienced this week. That relevance, across nineteen centuries, is the mark of genuine philosophical insight.",
      "Read the Meditations with a pen. Mark what lands. Return to those passages. The book rewards re-reading precisely because you are a different reader at different points in your life.",
    ],
    summary: [
      'The Meditations offer a rare document of a powerful man holding himself accountable to his own values.',
      "Aurelius's recurring themes — impermanence, virtue, reason — are as urgent now as they were in 170 AD.",
      'Reading the Stoics is not historical study. It is applied philosophy for daily life.',
    ],
  },
  {
    id: 'london-patience',
    category: 'Travel',
    date: '08 Feb 2026',
    readTime: '9 min',
    title: 'What London Taught Me About Patience, Craft, and Measured Ambition.',
    excerpt:
      'London does not rush. The city has weathered centuries with a particular brand of unhurried confidence that the frenetic capitals of the new world have yet to cultivate.',
    body: [
      "London does not rush. The city has weathered centuries — plague, fire, war, financial crisis, political upheaval — with a particular brand of unhurried confidence that the frenetic capitals of the new world have yet to cultivate.",
      "There is something instructive in a city that has been building cathedrals for six hundred years and still adds to them. Patience is embedded in the stone. The gentleman who spends time in London absorbs this by proximity — a recalibration of timescale that is difficult to achieve through intention alone.",
      "The best craftsmen in London — the tailors of Savile Row, the boot makers of St James's, the publishers of Bloomsbury — share a common quality: they are in no hurry. Not because they lack ambition, but because they understand that quality requires time, and that rushing is the surest way to produce work that will not endure.",
      "Measured ambition is not modest ambition. It is ambitious in its targets and patient in its methods. The Savile Row suit takes a hundred hours to make. It is also the suit you will wear for forty years. The calculation is obvious in retrospect.",
      "Bring London home with you. Not as nostalgia, but as a recalibrated relationship with time. Ask of every project: what would this look like if I gave it the time it deserves?",
    ],
    summary: [
      'Cities carry philosophies — London embodies restraint, continuity, and earned authority.',
      'Patience is not inaction. It is the willingness to let quality compound over time rather than chase immediate recognition.',
      'The gentleman studies places as he studies books — for what they reveal about the longer arc of civilisation.',
    ],
  },
];

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  'Stoicism',
  'Culture',
  'Philosophy',
  'Style',
  'Literature',
  'Travel',
];
