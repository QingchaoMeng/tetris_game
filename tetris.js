// Constants
const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;
const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

// Tetromino shapes
const SHAPES = [
    [],
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
    [[2, 0, 0], [2, 2, 2], [0, 0, 0]], // J
    [[0, 0, 3], [3, 3, 3], [0, 0, 0]], // L
    [[4, 4], [4, 4]], // O
    [[0, 5, 5], [5, 5, 0], [0, 0, 0]], // S
    [[0, 6, 0], [6, 6, 6], [0, 0, 0]], // T
    [[7, 7, 0], [0, 7, 7], [0, 0, 0]]  // Z
];

// Game variables
let canvas = document.getElementById('tetris');
let ctx = canvas.getContext('2d');
let nextCanvas = document.getElementById('next-piece');
let nextCtx = nextCanvas.getContext('2d');
let scoreElement = document.getElementById('score');
let levelElement = document.getElementById('level');
let linesElement = document.getElementById('lines');

let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let paused = false;
let board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

// Piece object
const piece = {
    position: { x: 0, y: 0 },
    shape: null,
    color: null
};

// Next piece
let nextPiece = null;

// Initialize game
function init() {
    resetGame();
    spawnPiece();
    update();
}

// Reset game state
function resetGame() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    score = 0;
    level = 1;
    lines = 0;
    gameOver = false;
    updateScore();
}

// Create new piece
function spawnPiece() {
    if (!nextPiece) {
        nextPiece = createPiece();
    }
    
    piece.shape = nextPiece.shape;
    piece.color = nextPiece.color;
    piece.position.x = Math.floor(COLS / 2) - Math.floor(piece.shape[0].length / 2);
    piece.position.y = 0;

    nextPiece = createPiece();
    drawNextPiece();

    if (checkCollision()) {
        gameOver = true;
    }
}

// Create random piece
function createPiece() {
    const pieceType = Math.floor(Math.random() * 7) + 1;
    return {
        shape: SHAPES[pieceType],
        color: COLORS[pieceType]
    };
}

// Draw the next piece preview
function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    const shape = nextPiece.shape;
    const blockSize = 20;
    const offsetX = (nextCanvas.width - shape[0].length * blockSize) / 2;
    const offsetY = (nextCanvas.height - shape.length * blockSize) / 2;

    shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                nextCtx.fillStyle = COLORS[value];
                nextCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize - 1, blockSize - 1);
            }
        });
    });
}

// Check for collisions
function checkCollision() {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x] !== 0) {
                const boardX = piece.position.x + x;
                const boardY = piece.position.y + y;

                if (
                    boardX < 0 || 
                    boardX >= COLS || 
                    boardY >= ROWS ||
                    (boardY >= 0 && board[boardY][boardX])
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Check and clear complete lines
function checkLines() {
    let linesCleared = 0;
    let hasLineCleared = false;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
            linesCleared++;
            hasLineCleared = true;
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            y++;
        }
    }

    if (linesCleared > 0) {
        lines += linesCleared;
        score += calculateScore(linesCleared);
        level = Math.floor(lines / 10) + 1;
        dropInterval = 1000 - (level - 1) * 50;
        updateScore();
        
        // Only apply gravity if at least one line was cleared
        applyGravity();
    }
}

// Apply gravity to make floating blocks fall
function applyGravity() {
    let blocksFell;
    do {
        blocksFell = false;
        // Start from second-to-last row and move upwards
        for (let y = ROWS - 2; y >= 0; y--) {
            for (let x = 0; x < COLS; x++) {
                if (board[y][x] !== 0 && board[y + 1][x] === 0) {
                    // Move block down
                    board[y + 1][x] = board[y][x];
                    board[y][x] = 0;
                    blocksFell = true;
                }
            }
        }
    } while (blocksFell); // Continue until no blocks are falling
}

// Merge piece with board
function mergePiece() {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                const boardY = piece.position.y + y;
                if (boardY >= 0) {
                    board[boardY][piece.position.x + x] = value;
                }
            }
        });
    });
    checkLines();
    spawnPiece();
}

// Calculate score based on lines cleared
function calculateScore(linesCleared) {
    const basePoints = [40, 100, 300, 1200];
    return basePoints[linesCleared - 1] * level;
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// Move piece
function movePiece(direction) {
    piece.position.x += direction;
    if (checkCollision()) {
        piece.position.x -= direction;
    }
}

// Rotate piece
function rotatePiece() {
    const originalShape = piece.shape;
    const rotated = piece.shape[0].map((_, i) =>
        piece.shape.map(row => row[i]).reverse()
    );
    piece.shape = rotated;

    if (checkCollision()) {
        piece.shape = originalShape;
    }
}

// Drop piece
function dropPiece() {
    piece.position.y++;
    if (checkCollision()) {
        piece.position.y--;
        mergePiece();
    }
    dropCounter = 0;
}

// Hard drop
function hardDrop() {
    while (!checkCollision()) {
        piece.position.y++;
    }
    piece.position.y--;
    mergePiece();
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw board
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = COLORS[value];
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
            }
        });
    });

    // Draw current piece
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                ctx.fillStyle = piece.color;
                ctx.fillRect(
                    (piece.position.x + x) * BLOCK_SIZE,
                    (piece.position.y + y) * BLOCK_SIZE,
                    BLOCK_SIZE - 1,
                    BLOCK_SIZE - 1
                );
            }
        });
    });

    // Draw game over
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Press ENTER to restart', canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Game loop
function update(time = 0) {
    if (!gameOver) {
        const deltaTime = time - lastTime;
        lastTime = time;

        if (!paused) {
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                dropPiece();
            }
        }
    }
    
    draw();
    requestAnimationFrame(update);
}

// Event listeners
document.addEventListener('keydown', event => {
    if (gameOver && event.key === 'Enter') {
        resetGame();
        spawnPiece();
        return;
    }

    if (!gameOver && !paused) {
        switch (event.key) {
            case 'ArrowLeft':
                movePiece(-1);
                break;
            case 'ArrowRight':
                movePiece(1);
                break;
            case 'ArrowDown':
                dropPiece();
                break;
            case 'ArrowUp':
                rotatePiece();
                break;
            case ' ':
                hardDrop();
                break;
            case 'p':
                paused = !paused;
                break;
        }
    }
});

// Start the game
init(); 