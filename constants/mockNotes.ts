import { NoteSet } from '@/types/book';

const NOTES: Record<string, NoteSet[]> = {
  'OL45804W': [ // Meditations
    {
      insights: [
        'Marcus Aurelius distinguishes between what lies within our control — our judgements and impulses — and what does not, directing energy only toward the former.',
        'The practice of negative visualisation, imagining the loss of what one values, cultivates gratitude and steadies the mind against fortune\'s reversals.',
        'Every obstacle encountered on the path is not a barrier but material — the discipline of the will converts impediments into fuel for further action.',
      ],
      reflection: 'A man who has read the Meditations and not been changed by it has not truly read it. Aurelius wrote these lines not for posterity, but as private admonishment — a reminder that the virtuous life requires daily renewal, not a single conversion. The gentleman finds in these pages not comfort, but demand.',
      questions: [
        'Which of your daily frustrations would disappear entirely if you applied the dichotomy of control more honestly?',
        'What is the difference between enduring hardship with resignation and engaging it with active will?',
      ],
    },
    {
      insights: [
        'Aurelius returns repeatedly to impermanence — emperors and philosophers alike dissolve into time — using this not to despair but to clarify what matters in the moment.',
        'The rational faculty is the only faculty that can examine and correct itself; this self-reflexive capacity is both the burden and the dignity of the thinking man.',
        'Community is not optional for the Stoic: rational beings are constituted for cooperation, and withdrawal from society is a form of philosophical failure.',
      ],
      reflection: 'What strikes one most about Aurelius is that he was the most powerful man in the world and spent his private hours arguing with himself about humility. There is a lesson in that disproportion. Power without self-examination is mere machinery. The Meditations are the record of a man refusing to become a machine.',
      questions: [
        'In which domain of your life are you most prone to confusing your opinion with reality?',
        'How might you reframe the most persistent irritant in your daily life as a teacher rather than an adversary?',
      ],
    },
  ],

  'OL66768W': [ // The Old Man and the Sea
    {
      insights: [
        'Hemingway presents dignity as entirely separable from outcome — Santiago is defeated by circumstance but never by his own character, which is the only arena that counts.',
        'The marlin functions not merely as prey but as worthy adversary; in honouring the fish\'s strength, Santiago honours the standard by which he wishes to be measured.',
        'The sparse prose enacts the theme: Hemingway strips language to its bones just as the sea strips Santiago\'s catch, and what remains is essence.',
      ],
      reflection: 'There is a kind of man who is judged by the world as finished, and who knows better. Santiago is this man. His hands bleed, his back aches, his boat returns empty to shore — and yet he is, in the deepest sense, undefeated. The gentleman understands: the measure of a man is not what he carries home, but how he conducted himself at sea.',
      questions: [
        'Where in your own life are you fishing in deep water, with results that may never satisfy the audience on shore?',
        'What does it mean to you to be "born to do" something, even when the world offers little evidence you should continue?',
      ],
    },
  ],

  'OL18098W': [ // Man's Search for Meaning
    {
      insights: [
        'Frankl observes that the last human freedom — the freedom to choose one\'s attitude toward unavoidable suffering — cannot be taken by any external force.',
        'Meaning, not pleasure or power, is the primary motivational force in human beings; its absence produces an existential vacuum that no amount of comfort can fill.',
        'Love is identified as the highest goal a human being can aspire to: the perception of the beloved\'s essential self, as they are and as they might become.',
      ],
      reflection: 'Frankl wrote from the concentration camp, yet his pages carry no bitterness — only clear-eyed insistence that the human spirit is harder than circumstance. The man who reads this book and continues to complain about inconvenience must reckon with the implicit accusation in every line. We are capable of more than we allow ourselves to endure.',
      questions: [
        'What is the deepest source of meaning in your current life, and are you honouring it with your daily choices?',
        'Where are you suffering without yet finding a why — and what might that why be?',
      ],
    },
  ],

  'OL468431W': [ // The Great Gatsby
    {
      insights: [
        'Fitzgerald diagnoses the American Dream as structurally tragic: it requires an unattainable past for its fuel, and so it must always fail the man who pursues it most faithfully.',
        'Gatsby\'s tragedy is not that he loved Daisy, but that he loved an idea of her — a projection that no living woman could sustain, and that he refused to relinquish even as evidence mounted.',
        'Nick Carraway is morally compromised by his fascination; the novel implicates the reader in the same complicity — we are drawn to Gatsby\'s illusion even as we watch it destroy him.',
      ],
      reflection: 'The green light at the end of Daisy\'s dock is the most honest symbol in American fiction: it is the thing you want, and it is always across the water, and the moment you cross the water it moves again. Every gentleman must audit his own green lights. Not to abandon ambition, but to ensure he is pursuing a real future rather than an idealised past dressed in the costume of desire.',
      questions: [
        'Which of your ambitions is genuinely oriented toward the future, and which is secretly an attempt to recover something already gone?',
        'What is the difference between romantic aspiration, which ennobles, and romantic delusion, which destroys?',
      ],
    },
  ],

  'OL15404W': [ // Letters from a Stoic / Seneca
    {
      insights: [
        'Seneca insists that time is the only currency that cannot be replenished — it may be borrowed and squandered but never saved, making its husbandry the primary moral obligation.',
        'Friendship, properly conceived, requires that one become worthy of a friend before seeking one; the man who cultivates virtue attracts its like.',
        'Philosophy is not an ornament to be displayed but a medicine to be taken: it is the practice of examining one\'s life continually, not the possession of correct opinions.',
      ],
      reflection: 'Seneca wrote to Lucilius across the centuries but he wrote to us. "Reclaim yourself" — the phrase arrives without apology or softening. The gentleman\'s time is not to be surrendered to the trivial, the fashionable, or the merely loud. This is not misanthropy; it is an act of respect — for one\'s own life, and for those worthy of one\'s company.',
      questions: [
        'To whom have you lent your time most carelessly this past month, and what is the cost of that loan?',
        'What would change in your daily life if you treated each hour as a nonrenewable resource rather than an abundant supply?',
      ],
    },
  ],
};

const GENERIC_NOTES: NoteSet[] = [
  {
    insights: [
      'Great literature does not resolve life\'s central tensions — it renders them with such precision that the reader recognises himself in them and is altered by the recognition.',
      'The act of sustained reading is itself a form of practice: it trains the mind to inhabit another perspective completely, which is the precondition of genuine empathy.',
      'Every enduring work addresses questions that were urgent when it was written and remain urgent — the test of a book\'s worth is whether it is still asking you something after you close it.',
    ],
    reflection: 'The gentleman who reads widely does not collect facts but cultivates a broader self. Each serious book is a temporary habitation: you move in, live by its logic for a time, and when you leave you carry something of its structure in your thinking. The library of a man\'s reading is the autobiography of his mind.',
    questions: [
      'What did this book ask of you that you found most difficult to honestly answer?',
      'How has your understanding of this subject shifted since you began, and what caused that shift?',
    ],
  },
  {
    insights: [
      'The canon of serious literature represents a civilisation\'s ongoing conversation with itself about what it values — to read it is to participate in that conversation across time.',
      'A book\'s difficulty is not a defect to be overcome but a signal that what is being asked of the reader cannot be grasped without effort — the friction is the education.',
      'The characters in great fiction are more fully known than most people we encounter in life: we have access to their interiority, their self-deceptions, their moments of grace.',
    ],
    reflection: 'There is a particular kind of loneliness that only reading can address: the sense that one\'s inner life is too complex or contradictory to be understood. Literature does not cure this loneliness — it transforms it into solidarity. You discover that others have been here before you, have mapped this territory, and have left their maps.',
    questions: [
      'Which character in this book did you find most uncomfortably recognisable, and why?',
      'What is one idea from this book you intend to carry into how you conduct yourself this week?',
    ],
  },
];

export function getMockNotes(bookId: string, index: number = 0): NoteSet {
  const sets = NOTES[bookId] ?? GENERIC_NOTES;
  return sets[index % sets.length];
}

export function getMockNoteCount(bookId: string): number {
  return (NOTES[bookId] ?? GENERIC_NOTES).length;
}
