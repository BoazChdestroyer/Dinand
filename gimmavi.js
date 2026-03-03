// gimmavi.js - Bewegende vis met pijltjestoetsen
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Toetsen
const keys = {};
document.addEventListener('keydown', e => keys[e.key] = true);
document.addEventListener('keyup', e => keys[e.key] = false);

// VIS
const vis = {
  x: 400,
  y: 250,
  size: 20,
  speed: 4,
  facingRight: true
};

function gameLoop() {
  // Scherm wissen
  ctx.clearRect(0, 0, 800, 500);
  
  // Bewegen
  if (keys['ArrowLeft']) {
    vis.x -= vis.speed;
    vis.facingRight = false;
  }
  if (keys['ArrowRight']) {
    vis.x += vis.speed;
    vis.facingRight = true;
  }
  if (keys['ArrowUp']) vis.y -= vis.speed;
  if (keys['ArrowDown']) vis.y += vis.speed;
  
  // Scherm grenzen
  vis.x = Math.max(vis.size, Math.min(800 - vis.size, vis.x));
  vis.y = Math.max(vis.size, Math.min(500 - vis.size, vis.y));
  
  // Vis tekenen
  ctx.save();
  ctx.translate(vis.x, vis.y);
  if (!vis.facingRight) ctx.scale(-1, 1);
  
  // Lichaam
  ctx.fillStyle = 'orange';
  ctx.beginPath();
  ctx.ellipse(0, 0, vis.size, vis.size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Staart
  ctx.fillStyle = '#ff8800';
  ctx.beginPath();
  ctx.moveTo(-vis.size * 0.8, 0);
  ctx.lineTo(-vis.size * 1.4, -vis.size * 0.4);
  ctx.lineTo(-vis.size * 1.2, 0);
  ctx.lineTo(-vis.size * 1.4, vis.size * 0.4);
  ctx.fill();
  
  // Oog
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(vis.size * 0.4, -vis.size * 0.2, vis.size * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(vis.size * 0.45, -vis.size * 0.22, vis.size * 0.06, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
  
  requestAnimationFrame(gameLoop);
}

gameLoop();
