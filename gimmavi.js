const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

/* speler-vis */
const player = {
    x: WIDTH / 2,
    y: HEIGHT / 2,
    size: 20,
    speed: 3,
    color: 'blue',
    dir: 0, /* kijkrichting in radialen, 0 = naar rechts */
    collisionRadius: 20 * 0.8 /* botsingscirkel, iets kleiner dan lijf */
};

let score = 0;
let gameOver = false;
/* interval-id voor vissen spawnen, zodat we die kunnen stoppen en opnieuw starten */
let spawnIntervalId = null;

/* herstartknop maken, maar verbergen tot game over */
const restartBtn = document.createElement('button');
restartBtn.textContent = 'Play Again';
restartBtn.style.position = 'absolute';
restartBtn.style.padding = '10px 20px';
restartBtn.style.fontSize = '20px';
restartBtn.style.display = 'none';
restartBtn.style.cursor = 'pointer';
restartBtn.style.zIndex = '10';
document.body.appendChild(restartBtn);
restartBtn.addEventListener('click', () => resetGame());
function positionRestartButton() {
    const rect = canvas.getBoundingClientRect();
    const btnWidth = restartBtn.offsetWidth;

    /* horizontaal in het midden van de canvas */
    restartBtn.style.left = rect.left + rect.width / 2 - btnWidth / 2 + 'px';

    /* precies onder de “Final Score”tekst */
    const centerY = rect.top + rect.height / 2;
    restartBtn.style.top = centerY + 50 + 'px';
}
/* resize */
window.addEventListener('resize', () => {
    if (restartBtn.style.display === 'block') {
        positionRestartButton();
    }
});

/* andere random vissen */
const fishes = [];

/* toetsen die ingedrukt zijn */
const keys = {};

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

/* klasse voor andere vissen */
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

/* vissen spawnen (klein/groen of groot/rood) */
function spawnFish() {
    /* 30% kans op kleine groene vis, 70% kans op grote rode vis */
    let size, color;
    if (Math.random() < 0.3) {
        /* kleine groene vis: grootte kleiner dan speler maar minstens 5 */
        size = rand(5, Math.max(5, player.size - 1));
        color = 'green';
    } else {
        /* grote rode vis: minstens zo groot als speler, maar niet te groot (max 60) */
        size = rand(Math.min(60, player.size + 1), 60);
        color = 'red';
    }

  /* kies een random rand waar de vis buiten spawnt */
    const side = Math.floor(Math.random() * 4);

    if (side === 0) {          /* links buiten scherm */
        x = -size;
        y = rand(0, HEIGHT);
        dir = rand(-Math.PI / 4, Math.PI / 4); /* richting rechts */
    } else if (side === 1) {   /* rechts buiten scherm */
        x = WIDTH + size;
        y = rand(0, HEIGHT);
        dir
    } else if (side === 2) {   /* boven buiten scherm */
        x = rand(0, WIDTH);
        y = -size;
        dir = rand(Math.PI / 4, (3 * Math.PI) / 4); /* richting naar beneden */
    } else {                   /* onder buiten scherm */    
        x = rand(0, WIDTH);
        y = HEIGHT + size;
        dir = rand((5 * Math.PI) / 4, (7 * Math.PI) / 4); /* richting naar boven */
    }
    const speed = rand(0.5, 2);

    fishes.push(new Fish(x, y, size, speed, color, dir));
}

/* starten met vissen spawnen elke seconde, en vorige interval stoppen als die er nog is */
function startSpawningFish() {
    if (spawnIntervalId !== null) {
        clearInterval(spawnIntervalId);
    }
    spawnIntervalId = setInterval(spawnFish, 1000);
}

/* alle toetsen-resetten, zodat er geen 'vast' ingedrukte richting blijft na restart */
function resetKeys() {
    for (const k in keys) {
        keys[k] = false;
    }
}

/* zet het spel terug naar beginwaarden */
function resetGame() {
    score = 0;
    gameOver = false;
    fishes.length = 0; /* bestaande vissen verwijderen */
    player.x = WIDTH / 2;
    player.y = HEIGHT / 2;
    player.size = 20;
    player.speed = 3;
    player.dir = 0;
    player.collisionRadius = player.size * 0.8;

    resetKeys(); /* toetsen leegmaken */
    restartBtn.style.display = 'none'; /* herstartknop verbergen */

    startSpawningFish(); /* weer vissen spawnen */
    gameLoop(); /* game loop opnieuw starten */
    
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
function circleCollision(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    return dist < r1 + r2;
}
function updateFishColors() {
    fishes.forEach(f => {
        if (f.size < player.size) {
            f.color = 'green'; /*eetbaar*/
        } else {
            f.color = 'red'; /*gevaarlijk*/
        }
    });
}

function checkCollisions() {
    for (let i = fishes.length - 1; i >= 0; i--) {
        const f = fishes[i];

        /* BODY hitbox */
        const bodyHit = circleCollision(
            player.x,
            player.y,
            player.collisionRadius,
            f.x,
            f.y,
            f.size * 0.55
        );

        /* STAART hitbox (achter de vis) */
        const tailX = f.x - Math.cos(f.dir) * f.size;
        const tailY = f.y - Math.sin(f.dir) * f.size;

        const tailHit = circleCollision(
            player.x,
            player.y,
            player.collisionRadius,
            tailX,
            tailY,
            f.size * 0.25
        );

        if (bodyHit || tailHit) {

            if (f.size < player.size) {
                fishes.splice(i, 1);

                score += Math.floor(f.size);

                player.size += f.size * 0.08;

                player.collisionRadius = player.size * 0.55;

            } else {

                gameOver = true;

                if (spawnIntervalId !== null) {
                    clearInterval(spawnIntervalId);
                }
            }
        }
    }
}
/* helper om een vis te tekenen met een simpel lijfje, staart en oog */
function drawFish(x, y, size, color, dir) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(dir);

    /* lijf */
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
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 60);
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

    /* laat de herstartknop zien en goed positioneren */
    restartBtn.style.display = 'block';
    positionRestartButton();
}

function gameLoop() {
    if (gameOver) {
        drawGameOver();
        return;
    }

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    updatePlayer();

    updateFishColors(); /* kleur aanpassen op basis van nieuwe grootte */

fishes.forEach(f => {
    f.update();
    f.draw();
});

    drawPlayer();
    drawScore();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

/* key events */
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

/* start: vissen spawnen en game loop starten */
startSpawningFish();
gameLoop();
