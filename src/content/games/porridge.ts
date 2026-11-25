import type { Game } from '../../types/game';

export const porridgeGame: Game = {
  id: 'game-porridge',
  slug: 'porridge',
  accessionCode: 'OC-002',
  name: 'Porridge',
  alternativeNames: ['Sekaku'],
  category: 'Card Games',
  secondaryCategories: ['Indoor Games', 'Group Games'],
  shortSummary:
    'A fast-paced South African circle card game where players draw face-down cards into a central porridge pile and try to finish with the fewest cards.',
  description:
    'A lively card game—also known in some South African communities as Sekaku—played from a large face-down circle of cards. Players place cards into the central porridge pile one by one, aiming to avoid collecting the centre pile.',
  coverImage: {
    src: '/src/assets/images/porridge_circle_cards_1795629249581.jpg',
    alt: 'A 52-card playing deck spread face down in a circle on a wooden kitchen table around a small face-up central pile of cards',
    caption:
      'Illustrative photograph: A 52-card deck arranged in a face-down outer circle around the central porridge pile. Not an archival family photograph.',
    isIllustrative: true,
  },
  status: 'published',
  featured: true,
  interactiveExperiences: {
    playPath: '/games/porridge/play',
    playLabel: 'Play Porridge',
    rulesAnchorId: 'same-suit-porridge',
    rulesLabel: 'Read Full Rules',
  },
  playerCount: '2 or more players',
  equipment: ['One standard 52-card playing deck', 'A flat playing surface'],
  difficulty: 'Easy to learn',
  duration: '10–25 minutes per round',
  spaceRequired: 'Flat tabletop or floor area wide enough for a 52-card circle',
  objective:
    'Avoid collecting cards from the central porridge pile. When all face-down cards in the outer circle have been played, the player with the fewest collected cards wins.',
  setup: [
    {
      type: 'paragraph',
      text: 'Prepare a standard 52-card playing deck on a flat table or floor with enough space to spread all cards out in a circle around a clear centre.',
    },
    {
      type: 'ordered-list',
      items: [
        {
          title: 'Shuffle the deck thoroughly',
          text: 'Use one standard 52-card playing deck.',
        },
        {
          title: 'Spread the outer circle',
          text: 'Lay all the cards face down in a large circle, leaving an open space in the middle for the central pile, known as the porridge.',
        },
        {
          title: 'Decide turn order and direction',
          text: 'Agree on who plays first and choose whether turns move clockwise or anticlockwise around the group.',
        },
      ],
    },
  ],
  sections: [
    {
      id: 'same-suit-porridge',
      title: 'Version One: Same-Suit Porridge',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'In Same-Suit Porridge, players compare each newly drawn card against the card currently sitting on top of the central pile. Matching the suit forces a collection.',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Start the central pile',
              text: 'The first player randomly selects one face-down card from the outer circle, turns it face up, and places it in the centre to start the porridge pile.',
            },
            {
              title: 'Add a card from the circle',
              text: 'The next player selects a face-down card from the circle and places it face up on top of the central pile.',
            },
            {
              title: 'Compare the suits',
              text: 'Compare the newly played card’s suit with the suit of the card that was previously on top.',
            },
            {
              title: 'Collect on a suit match',
              text: 'If both cards share the same suit (Hearts ♥, Diamonds ♦, Clubs ♣, or Spades ♠), the player who placed the new card must collect the entire central pile into their personal collection.',
            },
            {
              title: 'Continue around the circle',
              text: 'If no match occurred, play moves to the next player. When a player collects the central pile, that collecting player selects a card from the circle to start the new central pile.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'The four standard suits compared in Same-Suit Porridge',
          headers: ['Suit', 'Symbol'],
          rows: [
            ['Hearts', '♥'],
            ['Diamonds', '♦'],
            ['Clubs', '♣'],
            ['Spades', '♠'],
          ],
        },
        {
          type: 'card-example',
          title: 'Same-Suit Collection Example',
          description:
            'Player 1 places 7♥ and Player 2 places 3♣ without a match. When Player 3 turns over K♣, it matches the 3♣ on top, so Player 3 collects the entire central pile.',
          cards: [
            { rank: '7', suit: 'hearts', label: 'Player 1: 7♥' },
            { rank: '3', suit: 'clubs', label: 'Player 2: 3♣ (No match)' },
            {
              rank: 'K',
              suit: 'clubs',
              label: 'Player 3: K♣ (Matches ♣ — collects pile)',
              highlight: true,
            },
          ],
          caption: 'Fig. 1 — Same-suit match triggers collection of the porridge pile.',
        },
      ],
    },
    {
      id: 'highest-colour-porridge',
      title: 'Version Two: Highest Colour (House Rule)',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'In this alternative version, players compare both colour and rank—collecting the central pile when they turn over a higher-ranked card of the same colour.',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Place the opening card',
              text: 'The first player selects a card from the outer circle and places it face up in the centre.',
            },
            {
              title: 'Turn over the next card',
              text: 'The next player selects another face-down card from the circle and places it on top of the central pile.',
            },
            {
              title: 'Compare against the first card in the pile',
              text: 'Compare the new card against the first card in the current central pile. If the new card is the same colour (Red or Black) and higher in rank than that first card, the player who placed it must collect the entire central pile.',
            },
            {
              title: 'Add to personal collection and continue',
              text: 'Collected cards go into that player’s personal pile, and the player who collected the pile selects a card from the outer circle to start the new central pile.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Card colours used in the Highest-Colour house rule',
          headers: ['Colour', 'Suits'],
          rows: [
            ['Red', 'Hearts ♥ and Diamonds ♦'],
            ['Black', 'Clubs ♣ and Spades ♠'],
          ],
        },
        {
          type: 'card-example',
          title: 'Highest-Colour Example (Starting with 5♥)',
          description:
            'Player 1 opens with 5♥ (Red). Player 2 plays 3♦ (Red, but lower than 5, so no collection). Player 3 plays 8♥ (Red and higher than 5), so Player 3 collects the entire central pile.',
          cards: [
            { rank: '5', suit: 'hearts', label: 'Player 1: 5♥ (Pile starter)' },
            { rank: '3', suit: 'diamonds', label: 'Player 2: 3♦ (Lower red — safe)' },
            {
              rank: '8',
              suit: 'hearts',
              label: 'Player 3: 8♥ (Higher red — collects pile)',
              highlight: true,
            },
          ],
          caption: 'Fig. 2 — 8♥ matches Red and beats the opening 5♥, forcing a collection.',
        },
        {
          type: 'callout',
          variant: 'unconfirmed',
          title: 'House-Rule Interpretation Note',
          text: 'In this version, the comparison is made against the first card in the current central pile, not necessarily the card played immediately before the new card. This reflects the rule as currently described and remains open for community confirmation.',
        },
      ],
    },
    {
      id: 'winning-and-summary',
      title: 'Winning the Game & Rules Summary',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'When every face-down card in the outer circle has been played and the round finishes, players count the cards they were forced to collect.',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Count personal collections',
              text: 'Each player counts the total number of cards in their collected pile.',
            },
            {
              title: 'Compare totals',
              text: 'The player holding the lowest number of collected cards wins the game.',
            },
            {
              title: 'Check for ties',
              text: 'If two or more players finish tied on the same lowest card count, the game ends in a tie unless the table agreed beforehand on a tie-break rule.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Side-by-side comparison of the two documented Porridge / Sekaku versions',
          headers: ['Rule', 'Same-Suit Version', 'Highest-Colour Version'],
          rows: [
            ['Starting arrangement', 'Face-down circle', 'Face-down circle'],
            ['Card selection', 'Random card from circle', 'Random card from circle'],
            ['Comparison target', 'Previous top card', 'First card in current pile'],
            ['Collection condition', 'Same suit', 'Same colour and higher rank'],
            ['Penalty', 'Collect entire centre pile', 'Collect entire centre pile'],
            ['Winner', 'Fewest collected cards', 'Fewest collected cards'],
          ],
        },
      ],
    },
  ],
  variations: [
    {
      id: 'same-suit-porridge-var',
      name: 'Same-Suit Porridge',
      summary: 'Players collect the central pile whenever a drawn card matches the suit of the previous top card.',
      verification: 'documented-version',
      details: [
        'Compares only the newly played card against the card directly beneath it on top of the porridge pile.',
        'Any match of Hearts ♥, Diamonds ♦, Clubs ♣, or Spades ♠ triggers collection.',
      ],
    },
    {
      id: 'highest-colour-porridge-var',
      name: 'Highest Colour (House Rule)',
      summary: 'Players collect the central pile when drawing a higher-ranked card of the same colour as the pile’s opening card.',
      verification: 'documented-version',
      details: [
        'Compares Red (♥, ♦) against Red and Black (♣, ♠) against Black.',
        'Uses the first card in the current central pile as the benchmark rank under the documented interpretation.',
      ],
    },
  ],
  unconfirmedQuestions: [
    'Card values: Is Ace low, high, or dependent on the version? What are the values of Jack, Queen and King?',
    'Highest-colour comparison: Does the comparison always use the first card in the pile, or the previous card played?',
    'After collecting: Here the player who collects the pile chooses a card to start the next central pile; confirm whether any communities instead pass to the next player.',
    'End of the circle: Does the game end as soon as all outer-circle cards are used, or are collected cards reshuffled for another round?',
    'Ties: What happens if two players finish with the same lowest number of cards?',
    'Number of decks: Is the full 52-card deck always used, or can a smaller deck be used?',
  ],
  culturalNotes: [
    {
      title: 'Porridge, Sekaku & Regional Differences',
      text: 'Known as Porridge in many households and as Sekaku in some South African communities, this game is remembered with different names, house rules, and tie-breakers between families and neighbourhoods. The rules recorded here represent the versions currently described rather than a single universal rulebook.',
      verification: 'documented-version',
    },
    {
      title: 'Preserving Community Variations',
      text: 'Because Porridge / Sekaku is passed down orally around tables and on floors, players are encouraged to share the exact rules, card-value rankings, and local names they grew up with so all community variations can be preserved together.',
      verification: 'community-recollection',
    },
  ],
  relatedGames: ['sevens'],
  lastUpdated: '2026-11-25',
  seo: {
    title: 'Porridge (Sekaku) Card Game Rules & Variations – Our Childhood Archive',
    description:
      'Learn how to play Porridge (Sekaku), a South African face-down circle card game with Same-Suit and Highest-Colour house rules documented in the Our Childhood archive.',
  },
};
