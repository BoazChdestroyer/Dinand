

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
    color: 'blue',
    dir: 0 /* kijkrichting in radialen, 0 = naar rechts */,
    collisionRadius: 20 * 0.8 /* iets kleiner dan echt lijf */
};

let score = 0;
let gameOver = false;

/* knop om opnieuw te spelen */
const restartBtn = document.createElement('button');
restartBtn.textContent = 'Play Again';
restartBtn.style.position = 'absolute';
restartBtn.style.left = '50%';
restartBtn.style.top = '60%';
restartBtn.style.transform = 'translate(-50%, -50%)';
restartBtn.style.padding = '10px 20px';
restartBtn.style.fontSize = '20px';
restartBtn.style.display = 'none';
document.body.appendChild(restartBtn);

restartBtn.addEventListener('click', () => {
    resetGame();
});

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
        this.collisionRadius = size * 0.8;
    }

    update() {
        /* bewegen in huidige richting */
        this.x += Math.cos(this.dir) * this.speed;
        this.y += Math.sin(this.dir) * this.speed;
        /* terugkomen aan de andere kant als je de rand passeert */
        if (this.x < -this.size) this.x = WIDTH + this.size;
        if (this.x > WIDTH + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = HEIGHT + this.size;
        if (this.y > HEIGHT + this.size) this.y = -this.size;
    }

    draw() {
        drawFish(this.x, this.y, this.size, this.color, this.dir);
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

/* zet het spel terug naar beginwaarden */
function resetGame() {
    score = 0;
    gameOver = false;
    fishes.length = 0; /* leeg array */
    player.x = WIDTH / 2;
    player.y = HEIGHT / 2;
    player.size = 20;
    player.speed = 3;
    player.dir = 0;
    player.collisionRadius = player.size * 0.8;
    restartBtn.style.display = 'none';
    gameLoop(); /* start de animatie opnieuw */
}

function updatePlayer() {
    /* beweging en oriëntatie bijhouden */
    let dx = 0, dy = 0;
    if (keys['ArrowUp'] || keys['w']) dy -= player.speed;
    if (keys['ArrowDown'] || keys['s']) dy += player.speed;
    if (keys['ArrowLeft'] || keys['a']) dx -= player.speed;
    if (keys['ArrowRight'] || keys['d']) dx += player.speed;

    if (dx !== 0 || dy !== 0) {
        player.dir = Math.atan2(dy, dx);
    }

    player.x += dx;
    player.y += dy;

    /* binnen canvas houden */
    player.x = Math.max(player.size, Math.min(WIDTH - player.size, player.x));
    player.y = Math.max(player.size, Math.min(HEIGHT - player.size, player.y));
}

function checkCollisions() {
    for (let i = fishes.length - 1; i >= 0; i--) {
        const f = fishes[i];
        const dx = f.x - player.x;
        const dy = f.y - player.y;
        const dist = Math.hypot(dx, dy);
        // gebruik kleinere straal voor botsing
        if (dist < f.collisionRadius + player.collisionRadius) {
            /*botsing */
            if (f.size < player.size) {
                /* eet de vis */
                fishes.splice(i, 1);
                score += Math.floor(f.size);
                /* groei een beetje*/
                player.size += f.size * 0.05;
                player.collisionRadius = player.size * 0.8;
            } else {
                /* gegeten door grotere vis */
                gameOver = true;
            }
        }
    }
}

/* helper om een vis te tekenen met een simpel lijfje, staart en oog */
function drawFish(x, y, size, color, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(dir);

    /* lijf (ellips) */
    ctx.beginPath();
    ctx.ellipse(0, 0, size, size / 1.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    /* staart */
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(-size - size / 2, -size / 2);
    ctx.lineTo(-size - size / 2, size / 2);
    ctx.closePath();
    ctx.fill();

    /* oog */
    ctx.beginPath();
    ctx.arc(size * 0.4, -size * 0.2, size * 0.1, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size * 0.4, -size * 0.2, size * 0.05, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();

    ctx.restore();
}

function drawPlayer() {
    drawFish(player.x, player.y, player.size, player.color, player.dir);
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
    /* laat de herstartknop zien */
    restartBtn.style.display = 'block';
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
