# Tetris Game

A modern implementation of the classic Tetris game using HTML5 Canvas and JavaScript.

## Features

- Classic Tetris gameplay mechanics
- Score tracking and level progression
- Next piece preview
- Special gravity effect: blocks fall when lines are cleared
- Responsive controls
- Modern, clean UI

## Controls

- ← → : Move piece left/right
- ↑ : Rotate piece
- ↓ : Soft drop
- Space : Hard drop
- P : Pause game
- Enter : Restart game (after game over)

## How to Play

1. Clone this repository
2. Open `index.html` in your web browser
   - For the best experience, serve the files using a local server:
     ```bash
     python -m http.server 8000
     ```
   Then visit `http://localhost:8000`

3. Start playing!

## Game Mechanics

- Standard Tetris rules apply
- Score increases based on number of lines cleared
- Game speed increases with level
- Blocks will fall down when lines are cleared beneath them
- Game ends when pieces stack up to the top

## Technical Details

- Built with vanilla JavaScript
- Uses HTML5 Canvas for rendering
- No external dependencies
- Responsive design 