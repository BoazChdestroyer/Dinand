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