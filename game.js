// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Game state
let snake = [
    { x: 10, y: 10 }
];
let velocityX = 0;
let velocityY = 0;
let food = { x: 15, y: 15 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let gameSpeed = 100;

// UI Elements
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const restartBtn = document.getElementById('restartBtn');

// Initialize
highScoreElement.textContent = highScore;

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);
restartBtn.addEventListener('click', () => {
    gameOverScreen.classList.remove('show');
    resetGame();
    startGame();
});

document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    // Prevent default arrow key scrolling
    if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }

    // Don't allow reversing direction
    switch(e.key) {
        case 'ArrowUp':
            if (velocityY !== 1) {
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case 'ArrowDown':
            if (velocityY !== -1) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case 'ArrowLeft':
            if (velocityX !== 1) {
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case 'ArrowRight':
            if (velocityX !== -1) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
        case ' ':
            togglePause();
            break;
    }
}

function startGame() {
    if (gameLoop) return;

    if (isGameOver) {
        resetGame();
    }

    gameLoop = setInterval(update, gameSpeed);
    startBtn.textContent = 'Running...';
    startBtn.disabled = true;
}

function togglePause() {
    if (!gameLoop) return;

    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

function resetGame() {
    clearInterval(gameLoop);
    gameLoop = null;

    snake = [{ x: 10, y: 10 }];
    velocityX = 0;
    velocityY = 0;
    score = 0;
    isPaused = false;
    isGameOver = false;

    scoreElement.textContent = score;
    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
    pauseBtn.textContent = 'Pause';

    generateFood();
    draw();
}

function update() {
    if (isPaused) return;

    // Move snake
    const head = { x: snake[0].x + velocityX, y: snake[0].y + velocityY };

    // Check wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        endGame();
        return;
    }

    // Check self collision
    for (let segment of snake) {
        if (head.x === segment.x && head.y === segment.y) {
            endGame();
            return;
        }
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;

        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        generateFood();

        // Increase speed slightly
        if (score % 5 === 0 && gameSpeed > 50) {
            gameSpeed -= 5;
            clearInterval(gameLoop);
            gameLoop = setInterval(update, gameSpeed);
        }
    } else {
        snake.pop();
    }

    draw();
}

function generateFood() {
    let newFood;
    let validPosition = false;

    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };

        validPosition = true;
        for (let segment of snake) {
            if (newFood.x === segment.x && newFood.y === segment.y) {
                validPosition = false;
                break;
            }
        }
    }

    food = newFood;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#27ae60';
        } else {
            // Body - gradient effect
            const opacity = 1 - (index / snake.length) * 0.5;
            ctx.fillStyle = `rgba(46, 204, 113, ${opacity})`;
        }

        ctx.fillRect(
            segment.x * GRID_SIZE + 1,
            segment.y * GRID_SIZE + 1,
            GRID_SIZE - 2,
            GRID_SIZE - 2
        );

        // Draw eyes on head
        if (index === 0) {
            ctx.fillStyle = 'white';
            const eyeSize = 3;
            const eyeOffsetX = GRID_SIZE / 4;
            const eyeOffsetY = GRID_SIZE / 4;

            // Left eye
            ctx.fillRect(
                segment.x * GRID_SIZE + eyeOffsetX,
                segment.y * GRID_SIZE + eyeOffsetY,
                eyeSize,
                eyeSize
            );

            // Right eye
            ctx.fillRect(
                segment.x * GRID_SIZE + GRID_SIZE - eyeOffsetX - eyeSize,
                segment.y * GRID_SIZE + eyeOffsetY,
                eyeSize,
                eyeSize
            );
        }
    });
}

function endGame() {
    clearInterval(gameLoop);
    gameLoop = null;
    isGameOver = true;

    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('show');

    startBtn.textContent = 'Start Game';
    startBtn.disabled = false;
}

// Initial draw
draw();
