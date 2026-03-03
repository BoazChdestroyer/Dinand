// gimmavi.js - Fish Game voor Game 2
// Werkt met jullie bestaande HTML setup

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Input (pijltjestoetsen)
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// Speler vis
const player = {
  x: 400,
  y: 250,
  size: 20,
  speed: 3
};

// Vijand vissen
const enemies = [];
for(let i = 0; i < 8; i++) {
  enemies.push({
    x: Math.random() * 800,
    y: Math.random() * 500,
    size: 10 + Math.random() * 20,
    speed: 1 + Math.random() * 2,
    dx: Math.random() < 0.5 ? 1 : -1
  });
}

let score = 0;
let gameOver = false;

// Game loop
function gameLoop() {
  // Scherm wissen
  ctx.clearRect(0, 0, 800, 500);
  
  // Speler bewegen
  if (keys['ArrowLeft']) player.x -= player.speed;
  if (keys['ArrowRight']) player.x += player.speed;
  if (keys['ArrowUp']) player.y -= player.speed;
  if (keys['ArrowDown']) player.y += player.speed;
  
  // Speler binnen scherm houden
  player.x = Math.max(player.size, Math.min(800 - player.size, player.x));
  player.y = Math.max(player.size, Math.min(500 - player.size, player.y));
  
  // Vissen bewegen
  enemies.forEach(enemy => {
    enemy.x += enemy.dx * enemy.speed;
    if (enemy.x < -30 || enemy.x > 830) {
      enemy.dx *= -1;
    }
  });
  
  // Speler tekenen (gele cirkel)
  ctx.fillStyle = 'yellow';
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
  ctx.fill();
  
  // Vijanden tekenen
  enemies.forEach(enemy => {
    ctx.fillStyle = enemy.size < player.size ? 'lime' : 'red';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
    ctx.fill();
  });
  
  // Score
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText('Score: ' + score, 20, 30);
  
  requestAnimationFrame(gameLoop);
}

// Start spel
gameLoop();

