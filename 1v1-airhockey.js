const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
 let p1 = {x: 100,y:200,r: 20,score: 0};
 let p2 = {x: 700,y:200,r: 20,score: 0};
 let puck = {x: 400,y:200,r: 10,vx: 0,vy: 0};

 let keys = {};

 document.addEventListener("keydown", e => keys[e.key] = true);
 document.addEventListener("keyup", e => keys[e.key] = false);

 function beweegPLayers() {
    if(keys["w"]) p1.y -= 5;
    if(keys["s"]) p1.y += 5;
    if(keys["d"]) p1.x += 5;
    if(keys["a"]) p1.x -= 5;
    if(keys["ArrowUp"]) p2.y -= 5;
    if(keys["ArrowDown"]) p2.y += 5;
    if(keys["ArrowLeft"]) p2.x -= 5;
    if(keys["ArrowRight"]) p2.x += 5;

    p1.y = Math.max(p1.r, Math.min(canvas.height - p1.r, p1.y));
    p1.x = Math.max(p1.r, Math.min(canvas.width - p1.r, p1.x));
    p2.y = Math.max(p2.r, Math.min(canvas.height - p2.r, p2.y));
    p2.x = Math.max(p2.r, Math.min(canvas.width - p2.r, p2.x));
 }

function beweegPuck() {
    puck.x += puck.vx;
    puck.y += puck.vy;

    if(puck.y < puck.r || puck.y > canvas.height - puck.r) {
          puck.vy *= -1;
    }

    if(puck.x < puck.r || puck.x > canvas.width - puck.r) {
            puck.vx *= -1;
}    
}

function checkCollisions() {
      [p1, p2].forEach(player => {
            const dx = puck.x - player.x;
            const dy = puck.y - player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if(dist < puck.r + player.r) {
                  const angle = Math.atan2(dy, dx);
                  const speed = Math.sqrt(puck.vx*puck.vx + puck.vy*puck.vy) + 2;               



                  puck.vx = Math.cos(angle) * speed;
                  puck.vy = Math.sin(angle) * speed;
            }
      });
}

function teken() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // middenlijn
    ctx.beginPath();
    ctx.moveTo(canvas.width/2,0);
    ctx.lineTo(canvas.width/2,canvas.height);
    ctx.stroke();

    // speler 1
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, p1.r, 0, Math.PI * 2);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    // speler 2
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, p2.r, 0, Math.PI * 2);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    // puck
    ctx.beginPath();
    ctx.arc(puck.x, puck.y, puck.r, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
    
    // score
    ctx.font = "30px Arial";
    ctx.fillText(p1.score, canvas.width/4, 40);
    ctx.fillText(p2.score, canvas.width*3/4, 40);
}

function gameLoop() {
    beweegPLayers();
    beweegPuck();
    checkCollisions();
    teken();
    requestAnimationFrame(gameLoop);
}

gameLoop();


    