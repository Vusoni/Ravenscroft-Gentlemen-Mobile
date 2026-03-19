export type ArticleCategory =
  | 'Stoicism'
  | 'Culture'
  | 'Philosophy'
  | 'Style'
  | 'Literature'
  | 'Travel'
  | 'Grooming'
  | 'Fitness'
  | 'Watches';

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
    id: 'discipline-of-morning',
    category: 'Stoicism',
    date: '06 Mar 2026',
    readTime: '8 min',
    title: 'The Discipline of Morning: How Great Men Begin Their Day.',
    image: 'https://images.unsplash.com/photo-1484627147104-f5197bcd6651?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
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
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80',
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
    id: 'cold-exposure',
    category: 'Fitness',
    date: '28 Feb 2026',
    readTime: '8 min',
    title: 'The Cold and the Composed: On Discomfort as a Daily Practice.',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'The Stoics practised voluntary discomfort — sleeping on hard floors, wearing thin cloaks in winter — not as asceticism but as preparation. The man who has already been cold is not afraid of the cold.',
    body: [
      'The Stoics practised voluntary discomfort — sleeping on hard floors, wearing thin cloaks in winter, fasting periodically — not as asceticism but as inoculation. The man who has already been cold is not afraid of the cold. He has removed the power it held over him.',
      'Cold exposure — whether in the form of cold showers, cold water immersion, or simply time spent outdoors in winter without excess insulation — is one of the most efficient methods of building physiological and psychological resilience available without specialist equipment.',
      'The mechanism is straightforward: the body responds to cold stress by activating its adaptive systems. Norepinephrine increases. Brown adipose tissue is recruited. Over time, the threshold of what the system regards as threatening rises. What was once intolerable becomes manageable. What was manageable becomes unremarkable.',
      'But the more important adaptation is psychological. The cold shower is a microcosm of every difficult thing you will be asked to do today. You do not want to do it. You do it anyway. You survive it. The accumulated experience of doing things you do not want to do builds a specific kind of self-knowledge: the knowledge that the wanting and the doing are separate, and that you control the second regardless of the first.',
      'Start with thirty seconds. End every shower cold. Add time gradually. The practice costs nothing and teaches everything that matters about the relationship between discomfort and discipline.',
    ],
    summary: [
      'Voluntary discomfort is inoculation — the man who has been cold is not afraid of the cold.',
      'Cold exposure builds resilience at both the physiological and psychological level simultaneously.',
      'The cold shower is a daily rehearsal of a fundamental lesson: the wanting and the doing are separate.',
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
    id: 'epictetus-freedom',
    category: 'Stoicism',
    date: '12 Feb 2026',
    readTime: '9 min',
    title: 'Epictetus and the Paradox of Freedom: How a Slave Became the Freest Man in Rome.',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Epictetus was owned by a man who broke his leg for sport. He responded not with rage but with equanimity — and in doing so demonstrated a freedom that his master could never possess.',
    body: [
      'Epictetus was owned by a man who broke his leg for sport. The story goes that as his master twisted his leg, Epictetus said calmly: "You are going to break it." When it broke, he observed: "Did I not tell you that you would break it?" He responded not with rage but with equanimity — and in doing so demonstrated a freedom his master could never possess.',
      'The Stoic distinction between what is "up to us" and what is "not up to us" is the engine of all Stoic philosophy. Epictetus frames it in the first paragraph of the Enchiridion: our opinions, impulses, desires, and aversions are up to us. Everything else — body, property, reputation, command — is not. This is not resignation. It is radical liberation.',
      'The man who ties his emotional state to external outcomes has handed his freedom to external events. The promotion, the opinion of others, the behaviour of his competitors — he has made himself hostage to all of it. The man who understands the Stoic distinction has withdrawn his consent to be governed by what he cannot control.',
      'This is the most demanding philosophy ever articulated. It asks you to feel fully while remaining unmoved by what you feel. Not suppression — that is the amateur\'s misreading. Processing, evaluating, and choosing how to respond is the practice. Emotion is acknowledged; it simply does not drive the car.',
      'Read the Enchiridion. It is fifty-three paragraphs. You can read it in an hour. Return to it every year. The paragraphs you underline will change with each decade of your life.',
    ],
    summary: [
      'Epictetus\'s philosophy emerged from the most constrained circumstances imaginable — and produced the most radical freedom.',
      'The Stoic distinction between what is and is not "up to us" is not resignation — it is the mechanism of genuine liberation.',
      'Stoic practice is not the suppression of emotion. It is the choice of how to respond to emotion, made after honest evaluation.',
    ],
  },
  {
    id: 'florence-beauty',
    category: 'Travel',
    date: '05 Feb 2026',
    readTime: '12 min',
    title: 'Florence and the Education of the Eye: What the Renaissance Still Teaches.',
    image: 'https://images.unsplash.com/photo-1541430870741-e1d0b7b5e3b1?auto=format&fit=crop&w=800&q=80',
    excerpt:
      'Florence is not a museum. It is an argument — a six-hundred-year case study in what human beings are capable of when patronage, ambition, and genius align in the same city at the same time.',
    body: [
      'Florence is not a museum. It is an argument — a six-hundred-year case study in what human beings are capable of when patronage, ambition, and genius align in the same city at the same moment in history. Walking its streets is not tourism. It is education.',
      'The Uffizi contains more masterworks per square metre than any other building on earth. But the correct approach is not to attempt its totality. Choose five paintings. Sit in front of each for ten minutes. Botticelli\'s Primavera alone contains enough visual information to occupy an attentive man for an afternoon. The error is to try to see everything and end up seeing nothing.',
      'The Renaissance gentleman was a specific archetype — the uomo universale — the man who pursued excellence across multiple domains simultaneously. Painting, poetry, mathematics, philosophy, horsemanship, music. Not because he wanted to be impressive, but because he believed that beauty and truth were related, and that the pursuit of either required a broadly cultivated intelligence.',
      'That archetype is available to us. The domains have changed — the modern equivalents of horsemanship and Latin are different — but the underlying philosophy, that a man should develop himself across multiple dimensions of excellence, remains the most complete vision of a lived human life.',
      'Go to Florence before you go anywhere else. Go before you think you are ready. The city will educate you faster than any curriculum.',
    ],
    summary: [
      'Florence is an argument about what human ambition, at its best, can produce — not a museum to be passively consumed.',
      'The Renaissance uomo universale pursued excellence across multiple domains — and this archetype remains available to us.',
      'Go before you think you are ready. The city educates faster than any formal curriculum.',
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
