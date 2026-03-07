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

function checkScore() {



    