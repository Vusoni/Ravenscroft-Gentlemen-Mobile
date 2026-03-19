export type ArticleCategory =
  | 'Stoicism'
  | 'Culture'
  | 'Philosophy'
  | 'Style'
  | 'Literature'
  | 'Travel'
  | 'Grooming'
  | 'Fitness'
  | 'Watches'
  | 'Business'
  | 'Mindset'
  | 'Wealth'
  | 'Strategy';

export interface Article {
  id: string;
  category: ArticleCategory;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  image: string;
  body: string[];
  summary: string[];
}

export const ARTICLES: Article[] = [
  {
    id: 'well-dressed-mind',
    category: 'Style',
    date: '20 Feb 2026',
    readTime: '10 min',
    title: 'The Well-Dressed Mind: On Books, Tailoring, and the Art of Being.',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-C_QAc_bfea8?auto=format&fit=crop&w=800&q=80',
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
    id: 'art-of-the-suit',
    category: 'Style',
    date: '17 Mar 2026',
    readTime: '11 min',
    title: 'The Anatomy of a Perfect Suit: What Savile Row Still Gets Right.',
    image: 'https://images.unsplash.com/photo-1449247709967-d4461a6a6103?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'A suit is not clothing. It is architecture — a structure built around the specific geometry of one man. Understanding this distinction is the beginning of dressing well.',
    body: [
      'A suit is not clothing. It is architecture — a structure built around the specific geometry of one man, calibrated to his shoulders, his posture, the particular way he holds himself in a room. Understanding this distinction is the beginning of dressing well.',
      'The Savile Row tradition insists on basting — a preliminary fitting of a loosely assembled garment that reveals how the cloth will behave on a live body. No amount of measurement substitutes for this. The body is not a static object. It breathes, moves, and reveals itself in ways no tape can capture.',
      'Three things determine whether a jacket fits: the shoulder, the chest, and the collar. Everything else can be altered. The shoulder cannot. This is why a bespoke suit begins its existence at the shoulder — all else is downstream.',
      'The lapel roll, the drape of the chest, the suppression at the waist — these are not decorative details. They are functional decisions that determine how the garment moves with the body. A suit that fights its wearer has already failed, regardless of its fabric.',
      'Invest once, invest correctly. The economics of bespoke are better than they appear. A well-made suit worn for forty years costs less per wearing than a mediocre suit replaced every five. Time, as always, rewards quality.',
    ],
    summary: [
      'A suit is architecture — structure built around the specific geometry of one man.',
      'The shoulder is the foundation of fit. Every other element is downstream.',
      'The economics of quality favour patience: a bespoke suit worn for decades is cheaper per wearing than its lesser alternatives.',
    ],
  },
  {
    id: 'barber-ritual',
    category: 'Grooming',
    date: '14 Mar 2026',
    readTime: '7 min',
    title: 'The Barbershop as Ritual: On Craft, Conversation, and the Weekly Reset.',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'There is a reason men have gathered in barbershops for centuries. It is not merely about the hair. It is about a moment of deliberate pause in a life that rarely permits them.',
    body: [
      'There is a reason men have gathered in barbershops for centuries. It is not merely about the hair. It is about a moment of deliberate pause in a life that rarely permits it — a sanctioned hour of stillness in which a man can think, or not think, without apology.',
      'The straight razor shave is the closest thing the modern world offers to the ancient ritual of ablution — a ceremonial preparation of the self before re-entering society. The heat of the towel, the lather, the clean geometry left behind: these are not affectations. They are calibration.',
      'A good barber is also a particular kind of confidant. Unlike the therapist or the priest, the barber offers counsel without agenda and without judgement. The conversation is lateral — between equals — and something about the mirror, the cape, and the intimacy of the setting permits a candour rarely found elsewhere.',
      'Grooming is not vanity. It is respect — for your own presentation and for the people you encounter. The man who attends to his appearance communicates that he takes the encounter seriously, that he has prepared for it, that the other person is worth that preparation.',
      'Establish a weekly ritual. Find a barber whose eye you trust. Return consistently. The relationship, over time, becomes one of the quietly sustaining ones — the kind you do not notice until it is no longer there.',
    ],
    summary: [
      'The barbershop is one of the few remaining spaces of unhurried, agenda-free male conversation.',
      'Grooming is not vanity — it is respect for yourself and for the people you encounter.',
      'Rituals of physical maintenance are also rituals of mental reset. The two are inseparable.',
    ],
  },
  {
    id: 'discipline-of-training',
    category: 'Fitness',
    date: '11 Mar 2026',
    readTime: '9 min',
    title: 'Iron and Intention: Why the Gym Is the Last Honest Arena.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'The weight does not negotiate. It does not respond to charm, seniority, or social capital. In this, the gym is one of the most democratic and most honest places a man can spend his time.',
    body: [
      'The weight does not negotiate. It does not respond to charm, seniority, or social capital. It will not be impressed by your title or your contacts. You either lift it or you do not. In this, the gym is one of the most democratic and most honest places a man can spend his time.',
      'The Stoics understood the body as a tool of the rational soul. Epictetus, who was a slave, trained his body with the same rigour he applied to his philosophy. The connection was not incidental — he understood that mastery of the physical was both preparation for and expression of mastery of the interior.',
      'There is a specific quality of mind that only vigorous physical training produces. It is not merely energy or endurance. It is a kind of earned equanimity — the calm that comes from having been uncomfortable on purpose and having chosen to continue anyway. This cannot be acquired by reading about it.',
      'The man who trains consistently, who shows up on the mornings he does not feel like showing up, who adds weight incrementally and records his progress honestly — this man is building a habit of integrity. The gym is where you practise keeping promises to yourself. Every other domain benefits.',
      'Establish non-negotiable training sessions. Three times per week, minimum. The specifics of the programme matter less than the consistency of the practice. Show up. That is the discipline. Everything else is detail.',
    ],
    summary: [
      'Physical training is the most immediate and honest feedback mechanism available to a man.',
      'The Stoics trained the body as seriously as the mind — mastery of one reinforces mastery of the other.',
      'Consistent training builds a habit of integrity: the practice of keeping promises to yourself.',
    ],
  },
  {
    id: 'watch-philosophy',
    category: 'Watches',
    date: '09 Mar 2026',
    readTime: '10 min',
    title: 'A Watch Is Not About Time: The Philosophy of the Mechanical Timepiece.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'In an age of perfect digital timekeeping, the mechanical watch has no practical justification. That is precisely what makes it interesting — it is a deliberate act of choosing beauty over efficiency.',
    body: [
      'In an age of perfect digital timekeeping, the mechanical watch has no practical justification. Your phone is more accurate, more legible, and more functional in every measurable way. And yet the mechanical watch endures, and its appeal is growing. That is precisely what makes it interesting.',
      'The mechanical watch is a deliberate act of choosing beauty over efficiency — the arrangement of several hundred hand-finished components to accomplish something a quartz crystal does for two dollars. It is, in the most literal sense, a luxury — something entirely unnecessary and entirely worthwhile.',
      'A good watch connects you to a tradition of craft that predates the industrial age. The watchmaker\'s art was refined before the factory existed. Every component in a mechanical movement is the product of specialised knowledge accumulated across centuries by craftsmen who passed their techniques through apprenticeship, not manuals.',
      'The watch you choose communicates something about your values. A dress watch worn with a suit says that occasion matters, that you believe in appropriate formality, that you are aware of the history of the objects you carry. This is different from — and not interchangeable with — wearing an Apple Watch.',
      'Buy one exceptional watch rather than several mediocre ones. Learn its calibre. Understand its service requirements. A watch maintained properly will outlive its owner and become part of the family record. Very few objects can make that claim.',
    ],
    summary: [
      'The mechanical watch is a deliberate act of valuing beauty over efficiency — a true luxury in the philosophical sense.',
      'Choosing a watch is communicating values: of craft, occasion, and the tradition of hand-made things.',
      'One exceptional watch, properly maintained, will outlive its owner and become part of the family record.',
    ],
  },
  {
    id: 'seneca-letters',
    category: 'Literature',
    date: '02 Mar 2026',
    readTime: '11 min',
    title: 'The Letters of Seneca: Philosophy as Personal Correspondence.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Seneca wrote 124 letters to his friend Lucilius in the last years of his life. They were not composed for posterity — they were working documents of a man thinking in real time about how to live.',
    body: [
      'Seneca wrote 124 letters to his friend Lucilius in the last years of his life. They were not composed for posterity — they were working documents of a man actively thinking about how to live well, under pressure, with death approaching. That urgency is palpable on every page.',
      'Unlike the formal treatises of most ancient philosophy, the Letters have the texture of genuine conversation. Seneca digresses, qualifies, contradicts himself, admits confusion. He is modelling the process of thinking, not presenting the conclusions of thought already completed.',
      '"Recede in te ipse" — retire into yourself — is a phrase that recurs in various forms across the Letters. For Seneca, the external world is a place of constant distraction from the only project that genuinely matters: the cultivation of a rational and virtuous interior life.',
      'Letter I opens with the most powerful statement of philosophical urgency in all of ancient writing: "Ita fac, mi Lucili: vindica te tibi." — Do this, my Lucilius: claim yourself for yourself. The verb vindicare means to assert legal ownership. He is telling his friend to treat his own time and attention as property belonging to no one else.',
      'Read one letter per day. They are short — most run to a single page. But they repay slow reading. Seneca compresses more usable philosophy into a paragraph than most modern writers manage in a chapter.',
    ],
    summary: [
      'The Letters of Seneca are working documents of a man thinking in real time about how to live — not polished doctrine.',
      '"Claim yourself for yourself" — Seneca\'s most urgent instruction remains the most difficult to execute.',
      'One letter per day is the right pace. They reward slow reading and are best returned to over years.',
    ],
  },
  {
    id: 'classical-music',
    category: 'Culture',
    date: '22 Feb 2026',
    readTime: '10 min',
    title: 'Why Every Serious Man Should Know His Way Around a Concert Hall.',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Classical music is not difficult. It has been made to seem difficult by a culture of intimidation that serves nobody. The rewards of genuine engagement are immediate and compound over a lifetime.',
    body: [
      'Classical music is not difficult. It has been made to seem difficult by a culture of gatekeeping and false mystique that serves nobody. The rewards of genuine engagement are immediate — and they compound over a lifetime in ways that other cultural experiences do not.',
      'Begin with the late string quartets of Beethoven. They are commonly regarded as among the most complex pieces of music ever written, but they are also among the most emotionally direct. You do not need theory to feel them. You need attention, and silence, and enough courage to sit with something that does not yield its full meaning on first encounter.',
      'The concert hall disciplines attention in a way that almost nothing in contemporary culture does. There is no phone. There is no option to skip forward. The music proceeds at its own pace, and you either meet it where it is or you do not. This is not a deprivation — it is a rare luxury: the luxury of being required to be fully present.',
      'Develop a relationship with one orchestra, one conductor, one composer. Follow their work across seasons. Read the programme notes — not for the historical dates, but for the context of what the composer was attempting to solve. Great music is always a problem solved beautifully.',
      'Culture is cumulative. The twentieth concert is nothing like the first. Trust the investment.',
    ],
    summary: [
      'Classical music is not difficult — it has been made to seem so by false mystique. The rewards are immediate.',
      'The concert hall provides one of the few remaining spaces that demands genuine, uninterrupted attention.',
      'Develop a relationship with one composer. Culture is cumulative — the twentieth encounter is nothing like the first.',
    ],
  },
  {
    id: 'skin-investment',
    category: 'Grooming',
    date: '18 Feb 2026',
    readTime: '7 min',
    title: 'The Gentleman\'s Skin: A Practical Case for Daily Investment.',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Skin care is not vanity. It is maintenance — the same rational approach a man applies to his leather goods, his watch, and his vehicle. The skin is the largest organ of the body. Neglecting it is a choice, not a default.',
    body: [
      'Skin care is not vanity. It is maintenance — the same rational approach a man applies to his leather goods, his watch, and his vehicle. The skin is the largest organ of the body and the most visible indicator of how a man is living. Neglecting it is a choice, not a default.',
      'The fundamentals require less than four minutes per day and fewer than four products. Cleanser — to remove the environmental debris that accumulates on exposed skin. Moisturiser with SPF — to retain hydration and address the single largest driver of accelerated ageing. Retinol, three nights per week — to maintain cellular turnover. That is the programme. Everything else is optional.',
      'Sun protection is the only anti-ageing intervention with overwhelming scientific consensus behind it. The dermatological literature is not ambiguous: UV radiation is responsible for approximately eighty percent of visible skin ageing. SPF 30 daily, applied correctly, addresses most of this. The cost is negligible. The return, over twenty years, is considerable.',
      'The discipline is the practice: doing the same four steps every morning without exception. A man who has maintained a consistent skincare routine for a decade will look like a man a decade younger. This is not an advertisement — it is the straightforward output of consistent maintenance.',
      'Start simple. The most sophisticated routine is the one you actually do.',
    ],
    summary: [
      'Skin care is maintenance, not vanity — the rational approach to the most visible indicator of how a man is living.',
      'Four products, four minutes — the fundamentals require no more.',
      'SPF daily is the single most impactful anti-ageing intervention available. The science is unambiguous.',
    ],
  },
  {
    id: 'writing-by-hand',
    category: 'Philosophy',
    date: '29 Jan 2026',
    readTime: '7 min',
    title: 'The Lost Art of Writing by Hand: On Slowness, Clarity, and the Examined Life.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Every great thinker before the twentieth century wrote by hand. This was not a limitation — it was a feature. The constraint of slowness forced a quality of prior thought that typing has largely abolished.',
    body: [
      'Every great thinker before the twentieth century wrote by hand. This was not a limitation — it was a feature. The constraint of slowness forced a quality of prior thought that typing has largely abolished. You cannot write fast enough by hand to transcribe your stream of consciousness. You must think, choose, and commit.',
      'The research on handwriting and cognition is consistent: writing by hand activates different neural processes than typing. The engagement is more physical, more deliberate, and produces greater retention and comprehension. The philosopher who writes by hand is also thinking differently — the medium shapes the thought.',
      'There is also the matter of the object. A notebook filled with handwritten observation is an artefact. It carries the physical record of a mind in motion — the crossed-out sentences, the marginal additions, the shifts in pressure and pace that tell you something about the emotional state in which the words were written. A word document does not do this.',
      'Marcus Aurelius wrote the Meditations by hand, in Greek, not Latin — his private language. He was writing for himself, not for an audience, in a medium that forced him to choose every word. That is why every word counts.',
      'Buy a good notebook. Buy a pen worth holding. Write for twenty minutes before you open your phone. What you put on the page in that twenty minutes will be the most honest thinking you do all day.',
    ],
    summary: [
      'Handwriting is slow — and that slowness is the feature, not the limitation. It forces prior thought.',
      'A filled notebook is an artefact of a mind in motion. It carries information that no digital document can.',
      'Twenty minutes of handwritten reflection before the phone opens is the most productive discipline available.',
    ],
  },
  {
    id: 'london-patience',
    category: 'Travel',
    date: '08 Feb 2026',
    readTime: '9 min',
    title: 'What London Taught Me About Patience, Craft, and Measured Ambition.',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
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
  'Grooming',
  'Fitness',
  'Watches',
];

export const LIVE_ARTICLE_CATEGORIES: ArticleCategory[] = [
  'Business',
  'Mindset',
  'Wealth',
  'Strategy',
];

export const ALL_FEED_CATEGORIES: ArticleCategory[] = [
  ...ARTICLE_CATEGORIES,
  ...LIVE_ARTICLE_CATEGORIES,
];
