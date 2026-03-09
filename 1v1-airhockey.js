const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
 let p1 = {x: 100,y:200,r: 20,score: 0};
 let p2 = {x: 700,y:200,r: 20,score: 0};
 let puck = {x: 400,y:200,r: 10,vx: 0,vy: 0};
 let gameStarted = false;
 let countdown = 3;
 let countdownActive = false;


 let keys = {};

 document.addEventListener("keydown", e => keys[e.key] = true);
 document.addEventListener("keyup", e => keys[e.key] = false);
 document.addEventListener("keydown", e => {
    keys[e.key] = true;
    if(e.code === "Enter" && !gameStarted){
        startCountdown();
    }
});

const goalheight = 120;
const goalTop = (canvas.height - goalheight) / 2;
const goalBottom = (canvas.height + goalheight) / 2;


 function beweegPLayers() {
      const playerSpeed = 6.5;
    if(keys["w"]) p1.y -= playerSpeed;
    if(keys["s"]) p1.y += playerSpeed;
    if(keys["d"]) p1.x += playerSpeed;
    if(keys["a"]) p1.x -= playerSpeed;
    if(keys["i"]) p2.y -= playerSpeed;
    if(keys["k"]) p2.y += playerSpeed;
    if(keys["j"]) p2.x -= playerSpeed;
    if(keys["l"]) p2.x += playerSpeed;

    p1.y = Math.max(p1.r, Math.min(canvas.height - p1.r, p1.y));
    p1.x = Math.max(p1.r, Math.min(canvas.width - p1.r, p1.x));
    p2.y = Math.max(p2.r, Math.min(canvas.height - p2.r, p2.y));
    p2.x = Math.max(p2.r, Math.min(canvas.width - p2.r, p2.x));

    p1.x = Math.min(p1.x, canvas.width/2 - p1.r);
    p2.x = Math.max(p2.x, canvas.width/2 + p2.r);
 }

function beweegPuck() {
    puck.x += puck.vx;
    puck.y += puck.vy;
    puck.vx *= 0.99;
    puck.vy *= 0.99;

      if(puck.y < puck.r || puck.y > canvas.height-puck.r){
             puck.vy *= -1;
      }

      // linker muur
      if(puck.x - puck.r < 0) {

      if(puck.y < goalTop || puck.y > goalBottom) {
        puck.vx *= -1;
      }
      }

      // rechter muur
      if(puck.x + puck.r > canvas.width) {

      if(puck.y < goalTop || puck.y > goalBottom) {
            puck.vx *= -1;
      }
    
      }
}

function checkCollisions() {
      [p1, p2].forEach(player => {
            const dx = puck.x - player.x;
            const dy = puck.y - player.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if(dist < puck.r + player.r) {
                  const angle = Math.atan2(dy, dx);
                  const overlap = puck.r + player.r - dist;
                  puck.x += Math.cos(angle) * overlap;
                  puck.y += Math.sin(angle) * overlap;
                  const speed = Math.sqrt(puck.vx*puck.vx + puck.vy*puck.vy) + 2;               

                  puck.vx = Math.cos(angle) * speed;
                  puck.vy = Math.sin(angle) * speed;
            }
      });
}

function teken() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // middenlijn
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(canvas.width/2,0);
    ctx.lineTo(canvas.width/2,canvas.height);
    ctx.stroke();

    // middencirkel
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI * 2);
    ctx.stroke();

    // goals
    ctx.fillStyle = "red";
    ctx.fillRect(0, goalTop, 10, goalheight);
    ctx.fillRect(canvas.width - 10, goalTop, 10, goalheight);

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
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(p1.score, canvas.width/4, 40);
    ctx.fillText(p2.score, canvas.width*3/4, 40);
}

function checkScore() {

    // links goal
    if(puck.x < 0 && puck.y > goalTop && puck.y < goalBottom) {
        p2.score++;
        resetPuck();
        resetPlayers();
    }

    // rechts goal
    if(puck.x > canvas.width && puck.y > goalTop && puck.y < goalBottom) {
        p1.score++;
        resetPuck();
        resetPlayers();
    }

}

function resetPuck() {

    puck.x = canvas.width/2;
    puck.y = canvas.height/2;

    puck.vx = (Math.random() > 0.5 ? 4 : -4);
    puck.vy = (Math.random()*4) - 2;

}

function resetPlayers(){
      p1.x = 100;
      p1.y = canvas.height/2;
      p2.x = canvas.width - 100;
      p2.y = canvas.height/2;

}

function checkWin() {
      if(p1.score >= 7) {
            alert("Speler 1 wint!");
            resetGame();
            return true;
      }
      if(p2.score >= 7) {
            alert("Speler 2 wint!");
            resetGame();
            return true;
      }
      return false;
}

function resetGame() {
      p1.score = 0;
      p2.score = 0;
      resetPuck();
      resetPlayers();
}

function startCountdown() {
      countdownActive = true;
      let timer = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                  clearInterval(timer);
                  gameStarted = true;
                  countdownActive = false;
            }
      },1000);
}    

function tekenStartscherm() {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "black";
      ctx.font = "60px Arial";
      ctx.textAlign = "center";
      ctx.fillText("1v1 Airhockey", canvas.width/2, canvas.height/2 - 40);
      ctx.font = "30px Arial";
      ctx.fillText("Druk op ENTER om te starten", canvas.width/2, canvas.height/2 + 40);
}

function tekenCountdown() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "100px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      if (countdown >= 0) {
            ctx.fillText(countdown, canvas.width/2, canvas.height/2);
      }
}

function gameLoop() {
      if(!gameStarted && !countdownActive) {
            tekenStartscherm();
      } else if(countdownActive) {
            tekenCountdown();
      } else {
      beweegPLayers();
    beweegPuck();
    checkCollisions();
    checkScore();
    teken();
    if(!checkWin()){
        requestAnimationFrame(gameLoop);
    }
}
}

gameLoop();


    