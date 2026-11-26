import type { Game } from '../../types/game';

export const omoGame: Game = {
  id: 'game-omo',
  slug: 'omo',
  accessionCode: 'OC-005',
  name: 'OMO',
  category: 'Board Games',
  secondaryCategories: ['Indoor Games', 'Group Games'],
  shortSummary:
    'A competitive grid-based word-building game where players place O and M letters to form horizontal, vertical, and diagonal OMO combinations, reuse letters, and earn bonus turns.',
  description:
    'A strategic grid-based paper-and-board game in which players take turns placing the letters O and M into empty cells to build consecutive O-M-O patterns, score multiple intersecting combinations, and chain bonus turns until the grid is full.',
  coverImage: {
    src: '/src/assets/images/omo_grid_game_1795688993597.jpg',
    alt: 'Hand-drawn square grid in a notebook showing handwritten O and M letters forming intersecting O-M-O combinations beside a pencil and fountain pen on a sunlit oak table',
    caption:
      'Illustrative photograph: Hand-drawn grid filled with O and M letters showing intersecting OMO combinations. Not an archival family photograph.',
    isIllustrative: true,
  },
  status: 'published',
  featured: true,
  playerCount: '2 or more players',
  equipment: [
    'A square or rectangular grid (paper or digital board)',
    'Two letters only: O and M',
  ],
  difficulty: 'Strategic',
  duration: '10–25 minutes per round',
  spaceRequired: 'Tabletop, notebook page, or flat playing surface',
  objective:
    'Score more OMO combinations than your opponents by placing O or M into empty grid cells to form consecutive O-M-O sequences horizontally, vertically, or diagonally. Every newly completed OMO earns 1 point and an immediate bonus turn; the highest score when the grid fills wins.',
  setup: [
    {
      type: 'paragraph',
      text: 'OMO is played on an empty grid whose row and column dimensions are chosen before the match begins. The grid should be large enough to allow multiple intersecting OMO patterns, while keeping maximum dimensions suited to the playing surface or device screen size.',
    },
    {
      type: 'ordered-list',
      items: [
        {
          title: 'Choose grid dimensions',
          text: 'Select the number of rows and columns before starting. In digital versions, maximum grid dimensions scale automatically by device so mobile screens keep comfortable touch targets while desktop displays support larger boards.',
        },
        {
          title: 'Use only O and M',
          text: 'Players place only the letters O and M into empty cells—no other letters are used, and players do not need to alternate between O and M.',
        },
        {
          title: 'Agree on starting order',
          text: 'Decide which player places the first letter, then alternate turns unless a player earns a bonus turn by completing an OMO.',
        },
      ],
    },
    {
      type: 'table',
      caption:
        'Example partially completed OMO board showing horizontal, vertical, and intersecting placements',
      headers: ['Col 1', 'Col 2', 'Col 3', 'Col 4', 'Col 5', 'Col 6', 'Col 7', 'Col 8'],
      rows: [
        ['O', '', '', '', '', '', '', ''],
        ['O', 'M', 'O', '', '', '', '', ''],
        ['', '', 'O', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', 'M', 'O', 'M', '', '', ''],
        ['', '', '', 'M', '', '', '', ''],
        ['', '', '', 'O', '', '', '', ''],
      ],
    },
  ],
  sections: [
    {
      id: 'letters-and-placement',
      title: 'Letters & Placement Rules',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'On your turn, choose any empty cell on the grid and place either an O or an M. You may choose whichever letter gives the best tactical advantage on that turn.',
        },
        {
          type: 'ordered-list',
          items: [
            {
              title: 'Empty cells only',
              text: 'A letter may only be placed into an unoccupied cell.',
            },
            {
              title: 'Free choice of O or M',
              text: 'Players can choose either O or M on any turn; there is no requirement to alternate letters.',
            },
            {
              title: 'Permanent placement',
              text: 'Once placed, a letter cannot be moved, removed, or changed.',
            },
            {
              title: 'No overwriting',
              text: 'Players cannot overwrite an existing O or M placed by any player.',
            },
            {
              title: 'One letter per turn',
              text: 'Each placement adds a single letter unless a bonus turn is earned.',
            },
          ],
        },
      ],
    },
    {
      id: 'creating-an-omo',
      title: 'Creating an OMO & Reusing Letters',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'A valid OMO consists of three consecutive cells in a straight line containing O → M → O without gaps, read in either direction along the line.',
        },
        {
          type: 'table',
          caption: 'All valid straight-line directions for an O-M-O combination',
          headers: ['Direction', 'Alignment Pattern'],
          rows: [
            ['Horizontal', 'Left to right or right to left across 3 adjacent cells (O | M | O)'],
            ['Vertical', 'Top to bottom or bottom to top across 3 adjacent cells'],
            ['Diagonal', 'Any of the 4 straight diagonal directions across 3 adjacent cells'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Important: Letters Are Never Consumed',
          text: 'Once an OMO is scored, all three letters remain permanently on the grid and can be reused to build additional OMOs in other directions. A single M in a diagonal OMO can also serve as the centre of a horizontal or vertical OMO, allowing intersecting patterns to multiply points.',
        },
      ],
    },
    {
      id: 'scoring-and-bonus-turns',
      title: 'Scoring System & Bonus Turn Mechanic',
      verification: 'documented-version',
      blocks: [
        {
          type: 'paragraph',
          text: 'Every newly completed unique OMO combination earns 1 point for the player who placed the completing letter. Previously scored OMO combinations are tracked so they cannot score twice.',
        },
        {
          type: 'unordered-list',
          items: [
            'Multiple OMOs on one move: If placing a single O or M simultaneously completes horizontal, vertical, and diagonal OMOs, the player receives 1 point for every newly completed combination (for example, 3 points for 3 new OMOs).',
            'Immediate bonus turn: Completing at least one new OMO rewards the active player with an immediate bonus turn to place another letter.',
            'Consecutive streaks: A player continues receiving bonus turns for as long as each new placement completes at least one new OMO.',
            'Single bonus turn per scoring placement: Creating multiple OMOs from one placement increases your score for all of them, but grants one bonus turn rather than multiple stacked placements.',
            'Ending the turn: When a placement creates no new OMO, no points are scored and play passes to the next player.',
          ],
        },
      ],
    },
    {
      id: 'turn-sequence-and-winning',
      title: 'Turn Sequence & Winning the Game',
      verification: 'documented-version',
      blocks: [
        {
          type: 'ordered-list',
          items: [
            { title: 'Identify the active player', text: 'Confirm whose turn it is to place a letter.' },
            { title: 'Select an empty cell', text: 'Choose any open square on the grid.' },
            { title: 'Choose O or M', text: 'Decide whether to place an O or an M.' },
            { title: 'Place the letter', text: 'Commit the letter into the selected cell.' },
            {
              title: 'Check all OMO lines',
              text: 'Inspect every straight horizontal, vertical, and diagonal 3-cell line passing through the newly placed cell.',
            },
            {
              title: 'Award points',
              text: 'Add 1 point for each previously uncounted O-M-O combination completed by that placement.',
            },
            {
              title: 'Resolve turn continuation',
              text: 'Take a bonus turn if at least one new OMO was completed; otherwise pass the turn to the next player.',
            },
          ],
        },
        {
          type: 'table',
          caption: 'Turn outcome summary after placing a letter',
          headers: ['Result', 'What Happens'],
          rows: [
            ['No new OMO', 'Turn passes to the next player'],
            ['One new OMO', 'Player scores 1 point and gets a bonus turn'],
            ['Multiple new OMOs', 'Player scores for every new OMO and gets one bonus turn'],
          ],
        },
        {
          type: 'callout',
          variant: 'note',
          title: 'Winning & Draws',
          text: 'The game ends when no empty cells remain on the grid. The player with the highest total OMO points wins (displaying the winner, final scores, total OMOs per player, score difference, and final completed grid). Equal highest scores end in a draw.',
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
          caption: 'Quick reference for OMO rules',
          headers: ['Rule', 'Description'],
          rows: [
            ['Letters', 'O and M only'],
            ['Placement', 'One letter per placement'],
            ['Valid word', 'OMO'],
            ['Directions', 'Horizontal, vertical and diagonal'],
            ['Letter reuse', 'Allowed'],
            ['Overwriting', 'Not allowed'],
            ['Scoring', '1 point per unique OMO'],
            ['Multiple OMOs', 'All newly created combinations score'],
            ['Bonus turn', 'Earned when at least one new OMO is created'],
            ['Turn ends', 'When a placement creates no new OMO'],
            ['Game ends', 'When the grid is full'],
            ['Winner', 'Player with the most points'],
          ],
        },
      ],
    },
    {
      id: 'design-considerations',
      title: 'Digital Design & Implementation Considerations',
      verification: 'documented-version',
      blocks: [
        {
          type: 'unordered-list',
          items: [
            'Grid responsiveness: Support configurable rows and columns, enforce device-appropriate maximum grid limits so mobile cells remain touch-friendly, allow contained board scrolling/panning when needed, and prevent full-page horizontal overflow.',
            'OMO detection: Check consecutive 3-cell horizontal, vertical, and diagonal sequences through the newly placed letter, allow letter reuse across combinations, deduplicate scored combinations by cell coordinates, and detect multi-OMO placements.',
            'Bonus turns: Keep the active player in control across consecutive scoring placements, grant exactly one bonus turn per scoring move regardless of how many OMOs were formed, and pass only when zero new OMOs are created.',
            'Visual feedback: Highlight newly completed OMO lines, display points earned per move, indicate bonus turns clearly, identify the active player, and keep player scores visible throughout play.',
          ],
        },
      ],
    },
  ],
  culturalNotes: [
    {
      title: 'Rule Philosophy & Pattern Strategy',
      text: 'OMO rewards strategic foresight, pattern recognition, and spatial awareness across the grid. Because letters are never removed when scored, players look to build intersecting patterns where one placement completes multiple lines and unlocks consecutive bonus turns.',
      verification: 'documented-version',
    },
    {
      title: 'Preserving Local Grid Traditions',
      text: 'Different households and schoolyard groups often adapt grid dimensions or scoring conventions—such as 5×5 quick rounds versus larger tabletop grids. Sharing your preferred board sizes or house rules helps expand the archive honestly.',
      verification: 'community-recollection',
    },
  ],
  relatedGames: ['sevens', 'porridge', 'red-or-black', 'go-fish'],
  lastUpdated: '2026-11-26',
  seo: {
    title: 'OMO Grid Word-Building Game Rules & Documentation – Our Childhood Archive',
    description:
      'Learn how to play OMO, the strategic O and M grid word-building game with letter reuse, intersecting horizontal/vertical/diagonal scoring, and bonus turns.',
  },
};
