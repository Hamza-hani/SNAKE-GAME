const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.querySelector('.game-over');
const finalScoreElement = document.getElementById('finalScore');

let snake = [{x: 10, y: 10}];
let food = {x: 15, y: 15};
let direction = 'right';
let score = 0;
let gameLoop;
let particleSystem = [];
const CELL_SIZE = 20;
const SNAKE_SPEED = 100;

// Canvas Resizing
function resizeCanvas() {
    const container = document.querySelector('.game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

// Particle System
function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
        particleSystem.push({
            x: x * CELL_SIZE + CELL_SIZE/2,
            y: y * CELL_SIZE + CELL_SIZE/2,
            radius: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            alpha: 1,
            velocity: {
                x: (Math.random() - 0.5) * 5,
                y: (Math.random() - 0.5) * 5
            }
        });
    }
}

function updateParticles() {
    particleSystem = particleSystem.filter(particle => {
        particle.x += particle.velocity.x;
        particle.y += particle.velocity.y;
        particle.alpha -= 0.03;
        return particle.alpha > 0;
    });
}

function drawParticles() {
    particleSystem.forEach(particle => {
        ctx.globalAlpha = particle.alpha;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

// Game Logic
function generateFood() {
    food.x = Math.floor(Math.random() * (canvas.width / CELL_SIZE));
    food.y = Math.floor(Math.random() * (canvas.height / CELL_SIZE));
    if (snake.some(segment => segment.x === food.x && segment.y === food.y)) {
        generateFood();
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let i = 0; i < canvas.width; i += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += CELL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        const gradient = ctx.createLinearGradient(
            segment.x * CELL_SIZE,
            segment.y * CELL_SIZE,
            (segment.x + 1) * CELL_SIZE,
            (segment.y + 1) * CELL_SIZE
        );
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(1, '#00ff44');
        
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 10;
        ctx.fillStyle = gradient;
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE - 2, CELL_SIZE - 2);
    });

    // Draw food
    ctx.shadowColor = '#ff5555';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff5555';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE/2,
        food.y * CELL_SIZE + CELL_SIZE/2,
        CELL_SIZE/2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();

    drawParticles();
}

function updateGame() {
    const head = {...snake[0]};
    switch(direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
    }

    // Collision detection
    if (head.x < 0 || head.x >= canvas.width / CELL_SIZE ||
        head.y < 0 || head.y >= canvas.height / CELL_SIZE ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        createParticles(food.x, food.y);
        generateFood();
    } else {
        snake.pop();
    }
}

function gameOver() {
    clearInterval(gameLoop);
    finalScoreElement.textContent = score;
    gameOverScreen.style.display = 'block';
}

function restartGame() {
    snake = [{x: 10, y: 10}];
    direction = 'right';
    score = 0;
    scoreElement.textContent = '0';
    gameOverScreen.style.display = 'none';
    generateFood();
    gameLoop = setInterval(() => {
        updateGame();
        updateParticles();
        drawGame();
    }, SNAKE_SPEED);
}

// Event Listeners
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
    }
});

// Mobile controls
['up', 'down', 'left', 'right'].forEach(dir => {
    document.getElementById(dir).addEventListener('click', () => {
        const oppositeDirections = {
            up: 'down',
            down: 'up',
            left: 'right',
            right: 'left'
        };
        if (direction !== oppositeDirections[dir]) {
            direction = dir;
        }
    });
});

// Initialize game
generateFood();
restartGame();