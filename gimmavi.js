// simple canvas fish game where the player is a fish
// eat smaller fish to grow, avoid larger fish

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// player fish
const player = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    size: 20,
    speed: 3,
    color: 'blue'
};

let score = 0;
let gameOver = false;

// other fishes
const fishes = [];

// keyboard state
const keys = {};

// helpers
function rand(min, max) {
    return Math.random() * (max - min) + min;
}

class Fish {
    constructor(x, y, size, speed, color, direction) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.dir = direction; // angle in radians
    }

    update() {
        // move in the direction
        this.x += Math.cos(this.dir) * this.speed;
        this.y += Math.sin(this.dir) * this.speed;
        // bounce off walls
        if (this.x < -this.size) this.x = WIDTH + this.size;
        if (this.x > WIDTH + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = HEIGHT + this.size;
        if (this.y > HEIGHT + this.size) this.y = -this.size;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function spawnFish() {
    const size = rand(5, 60);
    // bigger fishes are red, smaller are green
    const color = size < player.size ? 'green' : 'red';
    const x = rand(0, WIDTH);
    const y = rand(0, HEIGHT);
    const speed = rand(0.5, 2);
    const dir = rand(0, Math.PI * 2);
    fishes.push(new Fish(x, y, size, speed, color, dir));
}

function updatePlayer() {
    if (keys['ArrowUp'] || keys['w']) player.y -= player.speed;
    if (keys['ArrowDown'] || keys['s']) player.y += player.speed;
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;

    // keep inside canvas
    player.x = Math.max(player.size, Math.min(WIDTH - player.size, player.x));
    player.y = Math.max(player.size, Math.min(HEIGHT - player.size, player.y));
}

function checkCollisions() {
    for (let i = fishes.length - 1; i >= 0; i--) {
        const f = fishes[i];
        const dx = f.x - player.x;
        const dy = f.y - player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < f.size + player.size) {
            // collision
            if (f.size < player.size) {
                // eat fish
                fishes.splice(i, 1);
                score += Math.floor(f.size);
                // grow a bit
                player.size += f.size * 0.05;
            } else {
                // eaten by big fish
                gameOver = true;
            }
        }
    }
}

function drawPlayer() {
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px sans-serif';
    ctx.fillText('Score: ' + score, 10, 30);
}

function drawGameOver() {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'white';
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', WIDTH / 2, HEIGHT / 2 - 20);
    ctx.font = '20px sans-serif';
    ctx.fillText('Final Score: ' + score, WIDTH / 2, HEIGHT / 2 + 20);
}

function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    updatePlayer();

    fishes.forEach(f => {
        f.update();
        f.draw();
    });

    drawPlayer();
    drawScore();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// input listeners
window.addEventListener('keydown', e => {
    keys[e.key] = true;
});
window.addEventListener('keyup', e => {
    keys[e.key] = false;
});

// spawn fish every second
setInterval(spawnFish, 1000);

// start the loop
gameLoop();
