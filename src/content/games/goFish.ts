import type { Game } from '../../types/game';

export const goFishGame: Game = {
  id: 'game-go-fish',
  slug: 'go-fish',
  accessionCode: 'OC-004',
  name: 'Go Fish',
  alternativeNames: ['Fish Pond'],
  category: 'Card Games',
  secondaryCategories: ['Indoor Games', 'Group Games'],
  shortSummary:
    'A classic multiplayer card game where players ask opponents for matching ranks, draw from the fish pond when told "Go Fish!", and collect sets of four cards called books.',
  description:
    'A multiplayer card-collecting game in which players ask opponents for ranks already held in their hand, draw from the central fish pond when told "Go Fish!", and lay down four-of-a-kind books until all 13 books are claimed.',
  coverImage: {
    src: '/src/assets/images/go_fish_cards_1795686554533.jpg',
    alt: 'Four 7 playing cards (7 of Spades, 7 of Hearts, 7 of Diamonds, and 7 of Clubs) laid face up together as a completed book beside a face-down deck on a sunlit oak kitchen table',
    caption:
      'Illustrative photograph: Four 7s laid out as a completed book beside a face-down draw pile (fish pond). Not an archival family photograph.',
    isIllustrative: true,
  },
  status: 'published',
  featured: true,
  playerCount: '2 or more players',
  equipment: ['One standard 52-card playing deck (no Jokers)', 'A flat playing surface'],
  difficulty: 'Easy to learn',
  duration: '15–25 minutes per round',
  spaceRequired: 'Flat tabletop or floor area',
  objective:
    'Collect as many four-card sets of matching rank (books) as possible by asking opponents for ranks you hold or drawing from the central draw pile. The player with the most books at the end wins.',
  setup: [
    {
      type: 'paragraph',
      text: 'Use one standard 52-card playing deck with Jokers removed, seated around a flat playing surface with at least two players.',
    },
    {
      type: 'table',
      caption: 'Number of cards dealt per player at the start of the game',
      headers: ['Number of Players', 'Cards Per Player'],
      rows: [
        ['2–3 players', '7 cards'],
        ['4 or more players', '5 cards'],
      ],
    },
    {
      type: 'ordered-list',
      items: [
        {
          title: 'Choose a dealer and shuffle',
          text: 'Select a dealer and shuffle the 52-card deck thoroughly.',
        },
        {
          title: 'Deal opening hands',
          text: 'Deal 7 cards each for 2–3 players, or 5 cards each for 4 or more players. Players keep their cards hidden from opponents.',
        },
        {
          title: 'Form the fish pond (draw pile)',
          text: 'Place all remaining cards face down in the centre to form the draw pile, also known as the fish pond.',
        },
        {
          title: 'Begin clockwise play',
          text: 'The player to the left of the dealer starts, and play proceeds clockwise.',
        },
      ],
    },
  ],
  sections: [
    {
      id: 'how-to-play',
      title: 'How to Play',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'Players take turns asking one opponent at a time for a card rank they already hold in their hand.',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Step 1 — Ask for a card rank',
              text: 'Choose one opponent, select a rank you already have at least one card of in your hand, and ask that opponent for all cards of that rank (for example: "I have two 7s. Do you have any 7s?"). You may only ask for a rank you already hold.',
            },
            {
              title: 'Step 2 — If the opponent has the cards',
              text: 'The opponent must hand over all cards of that rank from their hand. Add them to your hand, check whether you now hold all four cards of that rank to lay down as a book, and take another turn.',
            },
            {
              title: 'Step 3 — If the opponent says "Go Fish!"',
              text: 'If the opponent does not hold the requested rank, they say "Go Fish!" Draw one card from the top of the draw pile, add it to your hand, and check whether it completes a book.',
            },
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Drawing What You Asked For',
          text: 'If the card drawn from the fish pond is the exact rank you requested, show it to the other players, keep it in your hand, and take another turn. If it is a different rank, keep it and play passes to the next player.',
        },
      ],
    },
    {
      id: 'collecting-books',
      title: 'Collecting Books',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'A book consists of all four cards of the same rank. There are 13 possible books in a standard 52-card deck.',
        },
        {
          type: 'card-example',
          title: 'Example Completed Book (Four 7s)',
          description:
            'Whenever a player collects all four suits of a rank, they immediately lay the book face up in front of them and remove those cards from their hand.',
          cards: [
            { rank: '7', suit: 'hearts', label: '7♥', highlight: true },
            { rank: '7', suit: 'diamonds', label: '7♦', highlight: true },
            { rank: '7', suit: 'clubs', label: '7♣', highlight: true },
            { rank: '7', suit: 'spades', label: '7♠', highlight: true },
          ],
          caption: 'Fig. 1 — A completed book of 7s laid face up to increase the player’s book count by one.',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Lay the four cards face up',
              text: 'Place all four matching cards face up in front of you immediately upon completing the set.',
            },
            {
              title: 'Update hand and book count',
              text: 'Remove the completed book from your active hand and increase your book count by one.',
            },
            {
              title: 'Continue the turn',
              text: 'Play continues according to the active turn outcome.',
            },
          ],
        },
      ],
    },
    {
      id: 'empty-hand-and-winning',
      title: 'Empty Hand Rules & Winning the Game',
      verification: 'documented-version',
      blocks: [
        {
          type: 'unordered-list',
          items: [
            'Empty hand replenishment: If a player runs out of cards while cards remain in the draw pile, they commonly draw 5 new cards (or all remaining cards if fewer than 5 are left).',
            'Empty draw pile: If the draw pile is empty, a player with no cards cannot draw additional cards and cannot ask for a rank until they receive cards.',
            'End of the game: Play continues until all 13 books have been collected, or until the draw pile is empty and all players have no cards remaining.',
            'Determining the winner: Count and compare each player’s collected books. The highest total wins; equal highest totals end in a tie unless players agreed on a tie-break rule beforehand.',
          ],
        },
      ],
    },
    {
      id: 'example-round',
      title: 'Example Round',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'Suppose three players (Player 1, Player 2, and Player 3) are playing, and Player 1 starts with two 8s in hand:',
        },
        {
          type: 'table',
          caption: 'Step-by-step example turn sequence in a three-player game of Go Fish',
          headers: ['Action', 'Result'],
          rows: [
            ['Player 1 asks Player 2 for 8s', 'Player 2 has one 8'],
            ['Player 2 gives Player 1 the 8', 'Player 1 now has three 8s'],
            ['Player 1 asks Player 3 for an 8', 'Player 3 has no 8s'],
            ['Player 3 says "Go Fish!"', 'Player 1 draws one card'],
            ['Player 1 draws the fourth 8', 'Player 1 completes a book'],
            ['Player 1 lays down all four 8s', 'Player 1 earns one book'],
          ],
        },
        {
          type: 'paragraph',
          text: 'Because the drawn card matched the requested rank (8), Player 1 gets another turn.',
        },
      ],
    },
    {
      id: 'rules-summary',
      title: 'Rules Summary',
      verification: 'documented-version',
      blocks: [
        {
          type: 'table',
          caption: 'Quick reference for standard Go Fish situations',
          headers: ['Situation', 'What Happens?'],
          rows: [
            ['Ask an opponent for a rank you hold', 'They must give you all cards of that rank if they have them'],
            ['Opponent has the requested rank', 'You get their cards and another turn'],
            ['Opponent does not have the rank', 'They say "Go Fish!"'],
            ['Draw the requested rank', 'Keep the card and take another turn'],
            ['Draw a different rank', 'Keep the card and end your turn'],
            ['Collect four cards of one rank', 'Lay them down as a book'],
            ['Run out of cards', 'Draw a new hand if the draw pile has cards'],
            ['Game ends', 'Player with the most books wins'],
          ],
        },
      ],
    },
  ],
  variations: [
    {
      id: 'different-hand-sizes-var',
      name: 'Different Hand Sizes',
      summary: 'Some groups deal five cards to every player regardless of player count.',
      verification: 'documented-version',
      details: [
        'Replaces the 7-card deal for 2–3 players with a uniform 5-card opening hand.',
      ],
    },
    {
      id: 'single-card-empty-hand-var',
      name: 'Single-Card Empty Hand Draw',
      summary: 'Some households require a player whose hand empties to draw only one card.',
      verification: 'documented-version',
      details: [
        'Alternative to drawing up to 5 cards from the fish pond when running out of cards.',
      ],
    },
    {
      id: 'turn-after-book-var',
      name: 'Turn After Completing a Book',
      summary: 'Some groups grant an extra turn upon laying down a book, while others do not.',
      verification: 'documented-version',
      details: [
        'Clarify before starting whether completing a book alone extends a turn if the drawn card was not the requested rank.',
      ],
    },
    {
      id: 'shared-book-pile-var',
      name: 'Shared Book Collection Area',
      summary: 'Some players place completed books in a shared area rather than in front of each player.',
      verification: 'documented-version',
      details: [
        'Useful when playing for shared completion or tracking totals separately.',
      ],
    },
    {
      id: 'empty-pond-game-end-var',
      name: 'End When Draw Pile Empties',
      summary: 'Some groups end the round immediately once the fish pond runs out instead of playing out remaining hands.',
      verification: 'documented-version',
      details: [
        'Shortens the endgame compared with playing until all 13 books are completed.',
      ],
    },
  ],
  culturalNotes: [
    {
      title: 'Cultural Preservation Note',
      text: 'Go Fish is a widely played card game enjoyed by children and families across different communities. Our Childhood documents the game to preserve how people learned and played it, while allowing players to contribute family-specific rules, alternative ways of playing, and childhood memories.',
      verification: 'documented-version',
    },
    {
      title: 'Household Rules Side by Side',
      text: 'Whether a household dealt five cards or seven, drew five cards or one on an empty hand, or ended when the fish pond emptied, these variations are recorded together so every community tradition remains visible.',
      verification: 'community-recollection',
    },
  ],
  relatedGames: ['sevens', 'porridge', 'red-or-black'],
  lastUpdated: '2026-11-26',
  seo: {
    title: 'Go Fish Card Game Rules & Variations – Our Childhood Archive',
    description:
      'Learn how to play Go Fish, including dealing, asking for ranks, drawing from the fish pond, collecting four-card books, empty-hand rules, and household variations.',
  },
};
