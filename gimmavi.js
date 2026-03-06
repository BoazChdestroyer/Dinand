

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

/* vis ontwerpen */
const player = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    size: 20,
    speed: 3,
    color: 'blue'
};

let score = 0;
let gameOver = false;

/* andere random vissen */
const fishes = [];


const keys = {};


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
        this.dir = direction;
    }

    update() {
        /* bewegen in huidige richting */
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
    /* grote vissen rood, kleine groen */
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

    /*binnen cnavas houden */
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
            /*botsing */
            if (f.size < player.size) {
                /* eet de vis */
                fishes.splice(i, 1);
                score += Math.floor(f.size);
                /* groei een beetje*/
                player.size += f.size * 0.05;
            } else {
                /* gegeten door grotere vis */
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

window.addEventListener('keydown', e => {
    /* voorkom dat pijltoetsen scrollen */
    if ([
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        ' '
    ].includes(e.key)) {
        e.preventDefault();
    }
    keys[e.key] = true;
});
window.addEventListener('keyup', e => {
    keys[e.key] = false;
});

/* Spawn vis elke seconde */
setInterval(spawnFish, 1000);
 
gameLoop();
