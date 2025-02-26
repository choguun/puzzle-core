# React Puzzle Game

A simple puzzle game built with React and Phaser 3. This project demonstrates how to integrate Phaser with React to create a 2D puzzle game.

## Features

- Drag-and-drop puzzle pieces
- Automatic snapping of pieces when close to correct position
- Completion detection and animation
- Responsive layout
- Reset button to start over

## Technologies Used

- React 18
- TypeScript
- Phaser 3
- Vite
- Styled Components

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/puzzle-game.git
   cd puzzle-game
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

## Gameplay

- Click and drag puzzle pieces to move them
- When a piece is close to its correct position, it will snap into place
- Complete the puzzle by placing all pieces in their correct positions
- Click the "Reset Puzzle" button to shuffle the pieces and start over

## Customizing the Puzzle

To use your own image:

1. Place your image in the `src/assets/images` directory
2. Update the `preload` method in `src/game/scenes/PuzzleScene.ts` to load your image:
   ```typescript
   preload() {
     this.load.image('puzzle', 'src/assets/images/your-image.jpg');
   }
   ```

3. You can also adjust the grid size by changing the `gridSize` and `demoGridSize` variables in the PuzzleScene.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Phaser 3](https://phaser.io) - The game framework used
- [React](https://reactjs.org) - The web framework used
- [Vite](https://vitejs.dev) - Frontend build tool
