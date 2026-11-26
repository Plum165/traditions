import type { Game } from '../../types/game';

export const redOrBlackGame: Game = {
  id: 'game-red-or-black',
  slug: 'red-or-black',
  accessionCode: 'OC-003',
  name: 'Red or Black',
  alternativeNames: ['The Four Questions'],
  category: 'Card Games',
  secondaryCategories: ['Indoor Games', 'Group Games'],
  shortSummary:
    'A four-question card-guessing game where players predict colour, higher or lower, inside or outside, and suit—played either as a challenge or a card-collection house rule.',
  description:
    'A classic card-guessing game where players predict each card before it is turned over across four questions in sequence: Red or Black, Higher or Lower, Inside or Outside, and Suit.',
  coverImage: {
    src: '/src/assets/images/red_or_black_cards_1795675690935.jpg',
    alt: 'Four playing cards (8 of Hearts, Jack of Diamonds, 7 of Diamonds, and 10 of Clubs) laid face up in sequence beside a face-down deck on a wooden kitchen table',
    caption:
      'Illustrative photograph: Four cards revealed in sequence beside a standard 52-card deck. Not an archival family photograph.',
    isIllustrative: true,
  },
  status: 'published',
  featured: true,
  playerCount: '2 or more players',
  equipment: ['One standard 52-card playing deck', 'A flat playing surface'],
  difficulty: 'Easy to learn',
  duration: '10–20 minutes per round',
  spaceRequired: 'Flat tabletop or floor area',
  objective:
    'Predict cards accurately before they are revealed across four sequential questions (Colour, Higher/Lower, Inside/Outside, and Suit)—or collect the most cards under the Card Collection house rule.',
  setup: [
    {
      type: 'paragraph',
      text: 'Prepare one standard 52-card playing deck with at least two players seated around a flat playing surface.',
    },
    {
      type: 'ordered-list',
      items: [
        {
          title: 'Shuffle the deck',
          text: 'Thoroughly shuffle a standard 52-card playing deck.',
        },
        {
          title: 'Choose the first question-asker',
          text: 'Select one player to hold and manage the deck and ask the questions first.',
        },
        {
          title: 'Prepare the answering turn',
          text: 'The answering player attempts to predict cards across the four questions. With more than two players, take turns asking and answering.',
        },
        {
          title: 'Set the direction of play',
          text: 'Agree whether turns move clockwise or anticlockwise around the group.',
        },
      ],
    },
    {
      type: 'table',
      caption: 'Initial card value ranking (Ace treated as highest by default)',
      headers: ['Card', 'Value'],
      rows: [
        ['2–10', 'Face value (2–10)'],
        ['Jack (J)', '11'],
        ['Queen (Q)', '12'],
        ['King (K)', '13'],
        ['Ace (A)', '14 (highest; adjustable per household)'],
      ],
    },
    {
      type: 'table',
      caption: 'Card colour groupings used across Question 1 and suits',
      headers: ['Colour', 'Suits'],
      rows: [
        ['Red', 'Hearts ♥ and Diamonds ♦'],
        ['Black', 'Clubs ♣ and Spades ♠'],
      ],
    },
  ],
  sections: [
    {
      id: 'the-four-questions',
      title: 'The Four Questions',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'Before each card is revealed from the deck, the answering player must state their prediction. The four questions follow a fixed sequence:',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Question 1 — Red or Black?',
              text: 'Choose Red or Black before the first card is revealed. If correct, proceed to Question 2; if incorrect, the sequence ends.',
            },
            {
              title: 'Question 2 — Higher or Lower?',
              text: 'Choose Higher or Lower compared with the first card. Equal values are treated as incorrect unless a house rule specifies otherwise.',
            },
            {
              title: 'Question 3 — Inside or Outside?',
              text: 'Predict whether the third card’s value falls strictly between the first two card values (Inside) or lower than both / higher than both (Outside). Matching either boundary is incorrect unless agreed otherwise.',
            },
            {
              title: 'Question 4 — Guess the Suit',
              text: 'Choose Hearts ♥, Diamonds ♦, Clubs ♣, or Spades ♠. Guessing correctly completes the four-question sequence; guessing wrongly ends it.',
            },
          ],
        },
        {
          type: 'card-example',
          title: 'Questions 1 & 2 Examples',
          description:
            'On Question 1, guessing Red when 8♥ appears succeeds. On Question 2, after opening with 5♠, guessing Higher succeeds when J♦ is revealed.',
          cards: [
            { rank: '8', suit: 'hearts', label: 'Q1: Red (8♥)', highlight: true },
            { rank: '5', suit: 'spades', label: 'First card: 5♠' },
            { rank: 'J', suit: 'diamonds', label: 'Q2: Higher (J♦)', highlight: true },
          ],
          caption: 'Fig. 1 — Correct Colour prediction followed by a Higher rank comparison.',
        },
        {
          type: 'table',
          caption: 'Question 3 example when the first two cards are 4♥ (4) and 10♣ (10)',
          headers: ['Third Card', 'Result'],
          rows: [
            ['7♦', 'Inside (strictly between 4 and 10)'],
            ['2♠', 'Outside (lower than both 4 and 10)'],
            ['K♥', 'Outside (higher than both 4 and 10)'],
          ],
        },
        {
          type: 'card-example',
          title: 'Question 3 Boundary Example (4♥ and 10♣)',
          description:
            'With 4♥ and 10♣ as boundaries, 7♦ sits Inside, while 2♠ and K♥ fall Outside.',
          cards: [
            { rank: '4', suit: 'hearts', label: 'Boundary: 4♥' },
            { rank: '10', suit: 'clubs', label: 'Boundary: 10♣' },
            { rank: '7', suit: 'diamonds', label: '7♦ — Inside', highlight: true },
            { rank: '2', suit: 'spades', label: '2♠ — Outside' },
            { rank: 'K', suit: 'hearts', label: 'K♥ — Outside' },
          ],
          caption: 'Fig. 2 — Strictly between vs. outside the two opening boundary cards.',
        },
      ],
    },
    {
      id: 'four-questions-challenge',
      title: 'Version One: Four Questions Challenge',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'In the baseline Four Questions Challenge, a player must answer all four questions correctly in one uninterrupted sequence to succeed.',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Reveal cards one by one',
              text: 'The question-asking player draws and reveals cards one at a time after each spoken prediction.',
            },
            {
              title: 'Answer all four in order',
              text: 'The answering player progresses from Colour to Higher/Lower, Inside/Outside, and finally Suit.',
            },
            {
              title: 'End on a miss and pass the turn',
              text: 'An incorrect prediction at any stage ends the attempt, and the next player takes their turn at the four questions.',
            },
          ],
        },
        {
          type: 'unordered-list',
          items: [
            'Race format: The first player to complete all four questions wins.',
            'Turn-based challenge: Players take turns until someone completes the sequence.',
            'Multi-round points: Players earn points for completed sequences across rounds (agree on the winning format before starting).',
          ],
        },
      ],
    },
    {
      id: 'card-collection-house-rule',
      title: 'Version Two: House Rule – Card Collection',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'Under the Card Collection house rule, players do not need to finish all four questions at once to score. Every correct answer earns the answering player the revealed card, and the player with the most collected cards at the end wins.',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Begin from Question 1',
              text: 'One player asks Question 1 (Red or Black?) while the answering player predicts.',
            },
            {
              title: 'Correct answer — collect and restart at Question 1',
              text: 'If the answer is right, the answering player takes the revealed card, the sequence restarts immediately from Question 1 (Red or Black?), and the same player keeps answering.',
            },
            {
              title: 'Incorrect answer — asker collects and deck passes',
              text: 'If the answer is wrong, the question-asking player collects the revealed card, the answering player’s turn ends, and the deck passes to the next player to become the new question-asker.',
            },
            {
              title: 'Count collected cards at the end',
              text: 'When the game ends, each player counts their collected cards and the highest total wins. Equal highest totals end in a tie unless a tie-breaker was agreed beforehand.',
            },
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Key Difference in Card Collection',
          text: 'Every correct guess awards the revealed card to the answering player and immediately resets the question list back to Question 1 (Red or Black?) rather than advancing through Higher/Lower, Inside/Outside, and Suit.',
        },
        {
          type: 'table',
          caption: 'Worked Card Collection example (Player 1 asking, Player 2 answering)',
          headers: ['Round', 'Question', 'Player 2 Answer', 'Result'],
          rows: [
            ['1', 'Red or Black?', 'Red', 'Correct — Player 2 collects card'],
            ['2', 'Red or Black?', 'Black', 'Correct — Player 2 collects card'],
            ['3', 'Red or Black?', 'Red', 'Incorrect — Player 1 collects card; deck passes'],
          ],
        },
      ],
    },
    {
      id: 'rules-comparison',
      title: 'Rules Comparison',
      verification: 'documented-version',
      blocks: [
        {
          type: 'table',
          caption: 'Comparison between the Four Questions Challenge and Card Collection House Rule',
          headers: ['Rule', 'Four Questions Challenge', 'Card Collection House Rule'],
          rows: [
            ['Four questions', 'Required in sequence', 'Repeated sequence (resets on correct guess)'],
            ['Correct answer', 'Continue to next question', 'Collect revealed card'],
            ['Incorrect answer', 'Attempt ends', 'Question-asking player collects card'],
            ['Restart questions', 'New attempt', 'After every correct answer'],
            ['Deck passes', 'According to turn order', 'After an incorrect answer'],
            ['Winner', 'First to complete all four', 'Most collected cards'],
          ],
        },
      ],
    },
  ],
  variations: [
    {
      id: 'four-questions-challenge-var',
      name: 'Four Questions Challenge',
      summary:
        'Players must predict Red/Black, Higher/Lower, Inside/Outside, and Suit consecutively to win or score a completed sequence.',
      verification: 'documented-version',
      details: [
        'Any missed prediction ends the current attempt immediately.',
        'Can be played as a first-to-finish race, turn-based challenge, or multi-round points game.',
      ],
    },
    {
      id: 'card-collection-var',
      name: 'Card Collection (House Rule)',
      summary:
        'Players earn every card they guess correctly and restart from Question 1 after each hit; the asker keeps missed cards and passes the deck.',
      verification: 'documented-version',
      details: [
        'Player with the most collected cards at the end wins (equal totals tie).',
        'Correct answers restart immediately from Question 1 (Red or Black?).',
      ],
    },
  ],
  unconfirmedQuestions: [
    'Ace value: Is Ace always high, or can it be low?',
    'Equal cards: What happens when two consecutive cards have the same rank?',
    'Inside/Outside boundaries: Are cards equal to either boundary considered inside or outside? The documented default is neither.',
    'Deck management: Are revealed cards removed from the playing deck permanently?',
    'Exhausted deck: What happens if the deck runs out before a player completes their turn?',
    'Number of players: Is the game traditionally played with two players, or can a larger group participate?',
    'Game ending: Does the card-collection version end when the deck runs out, or after a fixed number of rounds?',
  ],
  culturalNotes: [
    {
      title: 'Household Variations & Local Names',
      text: 'Red or Black (also called The Four Questions) is remembered across families with differing rankings for Ace, equal-card tie rules, deck-exhaustion procedures, and round limits. Both variations documented here reflect recorded accounts rather than one universal rulebook.',
      verification: 'documented-version',
    },
    {
      title: 'Sharing Your Family Version',
      text: 'If your household used a different name, scoring method, or boundary rule when playing Red or Black, sharing those details helps preserve the full variety of community versions in the archive.',
      verification: 'community-recollection',
    },
  ],
  relatedGames: ['sevens', 'porridge'],
  lastUpdated: '2026-11-25',
  seo: {
    title: 'Red or Black (The Four Questions) Rules & Variations – Our Childhood Archive',
    description:
      'Learn how to play Red or Black (The Four Questions), documenting the four-question card-guessing challenge and the Card Collection house rule in the Our Childhood archive.',
  },
};
