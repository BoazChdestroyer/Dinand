class Level {
    constructor(levelData, levelNum) {
        this.num = levelNum;
        this.tiles = levelData.tiles;
        this.width = this.tiles[0].length;
        this.height = this.tiles.length;
        this.spawnX = (levelData.spawn?.[0] || 2) * TILE;
        this.spawnY = (levelData.spawn?.[1] || (this.height - 3)) * TILE;
        this.bgColor = levelData.bgColor || COLORS.sky;

        this.enemies = [];
        this.collectibles = [];
        this.enemyProjectiles = [];
        this.finishZone = null;

        this.initEntities(levelData, levelNum);
    }

    initEntities(data, levelNum) {
        if (data.enemies) {
            for (const e of data.enemies) {
                this.enemies.push(new Enemy(e[0] * TILE, e[1] * TILE, e[2], levelNum));
            }
        }
        if (data.collectibles) {
            for (const c of data.collectibles) {
                this.collectibles.push(new Collectible(c[0] * TILE + 10, c[1] * TILE + 10, c[2]));
            }
        }
        if (data.finish) {
            this.finishZone = {
                x: data.finish[0] * TILE,
                y: data.finish[1] * TILE,
                w: TILE,
                h: TILE * 2
            };
        }
    }

    getTile(col, row) {
        if (col < 0 || col >= this.width || row < 0 || row >= this.height) return 0;
        return this.tiles[row][col];
    }

    isSolidTile(col, row) {
        const t = this.getTile(col, row);
        return t === TILE_TYPES.GROUND || t === TILE_TYPES.BRICK || t === TILE_TYPES.STONE;
    }

    isSolid(x, y, w, h) {
        const startCol = Math.floor(x / TILE);
        const endCol = Math.floor((x + w - 1) / TILE);
        const startRow = Math.floor(y / TILE);
        const endRow = Math.floor((y + h - 1) / TILE);
        for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
                if (this.isSolidTile(c, r)) return true;
            }
        }
        return false;
    }

    update(player, particles) {
        // enemies
        this.enemies = this.enemies.filter(e => {
            e.update(this, player, this.enemyProjectiles);
            return !e.dead;
        });

        // enemy projectiles
        this.enemyProjectiles = this.enemyProjectiles.filter(p => {
            p.update(this);
            return !p.dead;
        });

        // collectibles
        for (const c of this.collectibles) {
            c.update();
            if (!c.collected && rectOverlap(player.getRect(), c.getRect())) {
                c.pickup(player, particles);
            }
        }

        // player melee vs enemies
        for (const attack of player.meleeAttacks) {
            for (const enemy of this.enemies) {
                if (!attack.hitEnemies.has(enemy) && rectOverlap(attack.getRect(), enemy.getRect())) {
                    enemy.takeDamage(attack.damage, particles);
                    attack.hitEnemies.add(enemy);
                    if (enemy.dead) player.score += enemy.scoreValue;
                }
            }
        }

        // player projectiles vs enemies
        for (const proj of player.projectiles) {
            if (proj.exploded) {
                // grenade explosion
                for (const enemy of this.enemies) {
                    const d = dist(
                        proj.x + proj.w / 2, proj.y + proj.h / 2,
                        enemy.x + enemy.w / 2, enemy.y + enemy.h / 2
                    );
                    if (d < proj.explosionRadius) {
                        enemy.takeDamage(proj.damage, particles);
                        if (enemy.dead) player.score += enemy.scoreValue;
                    }
                }
                particles.emit(proj.x, proj.y, 30, COLORS.explosion, 5, 40, 5);
                particles.emit(proj.x, proj.y, 15, '#FFD700', 4, 30, 4);
            } else if (proj.type !== 'grenade') {
                for (const enemy of this.enemies) {
                    if (rectOverlap(proj.getRect(), enemy.getRect())) {
                        enemy.takeDamage(proj.damage, particles);
                        proj.dead = true;
                        if (enemy.dead) player.score += enemy.scoreValue;
                        break;
                    }
                }
            }
        }

        // enemy collision with player
        for (const enemy of this.enemies) {
            if (rectOverlap(player.getRect(), enemy.getRect())) {
                player.takeDamage(enemy.damage);
            }
        }

        // enemy projectiles vs player
        for (const proj of this.enemyProjectiles) {
            if (rectOverlap(player.getRect(), proj.getRect())) {
                player.takeDamage(proj.damage);
                proj.dead = true;
            }
        }
    }

    draw(ctx, camera) {
        const off = camera.getOffset();

        // background
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // parallax bg layer
        this.drawBackground(ctx, camera);

        // tiles
        const startCol = Math.max(0, Math.floor(camera.x / TILE) - 1);
        const endCol = Math.min(this.width, Math.ceil((camera.x + CANVAS_W) / TILE) + 1);
        const startRow = Math.max(0, Math.floor(camera.y / TILE) - 1);
        const endRow = Math.min(this.height, Math.ceil((camera.y + CANVAS_H) / TILE) + 1);

        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const tile = this.tiles[row][col];
                if (tile === TILE_TYPES.EMPTY) continue;

                const dx = col * TILE + off.x;
                const dy = row * TILE + off.y;

                switch (tile) {
                    case TILE_TYPES.GROUND:
                        drawRect(ctx, dx, dy, TILE, TILE, COLORS.ground);
                        // surface detail
                        if (row > 0 && this.tiles[row - 1][col] === TILE_TYPES.EMPTY) {
                            drawRect(ctx, dx, dy, TILE, 4, '#228B22');
                        }
                        break;
                    case TILE_TYPES.BRICK:
                        drawRect(ctx, dx, dy, TILE, TILE, COLORS.brick);
                        ctx.strokeStyle = '#8B6914';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(dx + 0.5, dy + 0.5, TILE - 1, TILE / 2 - 1);
                        ctx.strokeRect(dx + TILE / 2 + 0.5, dy + TILE / 2 + 0.5, TILE / 2 - 1, TILE / 2 - 1);
                        ctx.strokeRect(dx + 0.5, dy + TILE / 2 + 0.5, TILE / 2 - 1, TILE / 2 - 1);
                        break;
                    case TILE_TYPES.STONE:
                        drawRect(ctx, dx, dy, TILE, TILE, COLORS.stone);
                        drawRect(ctx, dx + 1, dy + 1, TILE - 2, TILE - 2, '#707070');
                        break;
                    case TILE_TYPES.PLATFORM:
                        drawRect(ctx, dx, dy, TILE, 8, COLORS.platform);
                        drawRect(ctx, dx, dy, TILE, 3, '#6B8E23');
                        break;
                    case TILE_TYPES.SPIKE:
                        // triangle spikes
                        ctx.fillStyle = COLORS.spike;
                        for (let i = 0; i < 3; i++) {
                            ctx.beginPath();
                            const sx = dx + i * (TILE / 3);
                            ctx.moveTo(sx, dy + TILE);
                            ctx.lineTo(sx + TILE / 6, dy + 8);
                            ctx.lineTo(sx + TILE / 3, dy + TILE);
                            ctx.fill();
                        }
                        break;
                }
            }
        }

        // collectibles
        for (const c of this.collectibles) c.draw(ctx, off.x, off.y);

        // enemies
        for (const e of this.enemies) e.draw(ctx, off.x, off.y);

        // enemy projectiles
        for (const p of this.enemyProjectiles) p.draw(ctx, off.x, off.y);

        // finish zone
        if (this.finishZone) {
            const fz = this.finishZone;
            const fx = fz.x + off.x;
            const fy = fz.y + off.y;
            // flag pole
            drawRect(ctx, fx + fz.w / 2 - 2, fy, 4, fz.h, '#AAA');
            // flag
            const flagPhase = Math.sin(Date.now() / 300) * 2;
            ctx.fillStyle = COLORS.finish;
            ctx.beginPath();
            ctx.moveTo(fx + fz.w / 2 + 2, fy);
            ctx.lineTo(fx + fz.w / 2 + 22 + flagPhase, fy + 10);
            ctx.lineTo(fx + fz.w / 2 + 2, fy + 20);
            ctx.fill();
        }
    }

    drawBackground(ctx, camera) {
        // layered parallax mountains/hills
        const off = camera.getOffset();
        ctx.fillStyle = 'rgba(100, 160, 100, 0.3)';
        for (let i = 0; i < 6; i++) {
            const bx = (i * 300 + off.x * 0.2) % (CANVAS_W + 300) - 150;
            ctx.beginPath();
            ctx.moveTo(bx, CANVAS_H);
            ctx.lineTo(bx + 100, CANVAS_H - 120 - i * 10);
            ctx.lineTo(bx + 200, CANVAS_H);
            ctx.fill();
        }
        ctx.fillStyle = 'rgba(80, 130, 80, 0.3)';
        for (let i = 0; i < 8; i++) {
            const bx = (i * 200 + off.x * 0.4) % (CANVAS_W + 200) - 100;
            ctx.beginPath();
            ctx.moveTo(bx, CANVAS_H);
            ctx.lineTo(bx + 60, CANVAS_H - 60 - i * 5);
            ctx.lineTo(bx + 120, CANVAS_H);
            ctx.fill();
        }
    }
}

// ============================================================
// LEVEL GENERATOR - generates levels from templates and scaling
// ============================================================

function generateLevelData(levelNum) {
    const cols = 60 + Math.floor(levelNum * 2.5);
    const rows = 14;
    const tiles = [];

    for (let r = 0; r < rows; r++) {
        tiles.push(new Array(cols).fill(TILE_TYPES.EMPTY));
    }

    // ground layer
    const groundRow = rows - 1;
    const subGroundRow = rows - 2;
    for (let c = 0; c < cols; c++) {
        tiles[groundRow][c] = TILE_TYPES.GROUND;
        tiles[subGroundRow][c] = TILE_TYPES.GROUND;
    }

    // create gaps (pits) - more gaps in later levels
    const gapCount = 2 + Math.floor(levelNum / 5);
    const gaps = [];
    for (let g = 0; g < gapCount; g++) {
        const gapStart = randInt(8 + g * Math.floor(cols / gapCount), 10 + g * Math.floor(cols / gapCount));
        const gapWidth = 2 + Math.floor(levelNum / 15);
        for (let c = gapStart; c < gapStart + gapWidth && c < cols - 5; c++) {
            tiles[groundRow][c] = TILE_TYPES.EMPTY;
            tiles[subGroundRow][c] = TILE_TYPES.EMPTY;
            gaps.push(c);
        }
    }

    // platforms
    const platCount = 5 + Math.floor(levelNum / 3);
    for (let p = 0; p < platCount; p++) {
        const pc = randInt(5, cols - 10);
        const pr = randInt(4, rows - 4);
        const pw = randInt(2, 4);
        for (let i = 0; i < pw; i++) {
            if (pc + i < cols) {
                tiles[pr][pc + i] = TILE_TYPES.PLATFORM;
            }
        }
    }

    // brick/stone obstacles on ground
    const obstacleCount = 3 + Math.floor(levelNum / 4);
    for (let o = 0; o < obstacleCount; o++) {
        const oc = randInt(6, cols - 8);
        if (gaps.includes(oc) || gaps.includes(oc + 1)) continue;
        const oh = randInt(1, 2 + Math.floor(levelNum / 15));
        const ow = randInt(1, 3);
        for (let r = 0; r < oh; r++) {
            for (let c = 0; c < ow; c++) {
                const row = groundRow - 2 - r;
                const col = oc + c;
                if (row >= 0 && col < cols) {
                    tiles[row][col] = Math.random() > 0.5 ? TILE_TYPES.BRICK : TILE_TYPES.STONE;
                }
            }
        }
    }

    // spikes in later levels
    if (levelNum > 3) {
        const spikeCount = Math.floor(levelNum / 4);
        for (let s = 0; s < spikeCount; s++) {
            const sc = randInt(8, cols - 6);
            if (!gaps.includes(sc) && tiles[groundRow][sc] !== TILE_TYPES.EMPTY) {
                tiles[groundRow - 2][sc] = TILE_TYPES.SPIKE;
            }
        }
    }

    // enemies
    const enemies = [];
    const enemyCount = 3 + Math.floor(levelNum * 0.8);
    const availableTypes = [ENEMY_TYPES.WALKER];
    if (levelNum >= 3) availableTypes.push(ENEMY_TYPES.JUMPER);
    if (levelNum >= 6) availableTypes.push(ENEMY_TYPES.FLYER);
    if (levelNum >= 10) availableTypes.push(ENEMY_TYPES.TURRET);
    if (levelNum >= 15) availableTypes.push(ENEMY_TYPES.BRUTE);

    for (let e = 0; e < enemyCount; e++) {
        const ec = randInt(10, cols - 8);
        const er = groundRow - 3;
        const type = availableTypes[randInt(0, availableTypes.length - 1)];
        enemies.push([ec, type === ENEMY_TYPES.FLYER ? randInt(3, 7) : er, type]);
    }

    // collectibles
    const collectibles = [];
    // coins everywhere
    const coinCount = 10 + levelNum;
    for (let i = 0; i < coinCount; i++) {
        const cc = randInt(4, cols - 4);
        const cr = randInt(3, groundRow - 3);
        collectibles.push([cc, cr, COLLECTIBLE_TYPES.COIN]);
    }

    // health packs
    const heartCount = 1 + Math.floor(levelNum / 5);
    for (let i = 0; i < heartCount; i++) {
        collectibles.push([randInt(10, cols - 10), groundRow - 3, COLLECTIBLE_TYPES.HEART]);
    }

    // ammo
    if (levelNum >= 2) {
        collectibles.push([randInt(15, 25), groundRow - 3, COLLECTIBLE_TYPES.AMMO_MG]);
    }
    if (levelNum >= 5) {
        collectibles.push([randInt(20, 35), groundRow - 3, COLLECTIBLE_TYPES.AMMO_SG]);
    }
    if (levelNum >= 8) {
        collectibles.push([randInt(25, cols - 15), groundRow - 3, COLLECTIBLE_TYPES.AMMO_GR]);
    }

    // weapon pickups at specific levels
    if (levelNum === 1) {
        collectibles.push([15, groundRow - 3, COLLECTIBLE_TYPES.WEAPON_WHIP]);
    }
    if (levelNum === 2) {
        collectibles.push([20, groundRow - 3, COLLECTIBLE_TYPES.WEAPON_MACHINEGUN]);
    }
    if (levelNum === 4) {
        collectibles.push([25, groundRow - 3, COLLECTIBLE_TYPES.WEAPON_SHOTGUN]);
    }
    if (levelNum === 7) {
        collectibles.push([30, groundRow - 3, COLLECTIBLE_TYPES.WEAPON_GRENADE]);
    }

    // life pickup every 10 levels
    if (levelNum % 10 === 0) {
        collectibles.push([Math.floor(cols / 2), 3, COLLECTIBLE_TYPES.LIFE]);
    }

    // bg colors cycle
    const bgColors = [
        '#4a90d9', '#3a7abf', '#2d6b96', '#1a4a6e',
        '#4a6a3a', '#3a5a2a', '#6a4a3a', '#4a3a5a',
        '#2a3a5a', '#5a3a3a'
    ];

    return {
        tiles: tiles,
        spawn: [2, groundRow - 3],
        finish: [cols - 3, groundRow - 3],
        enemies: enemies,
        collectibles: collectibles,
        bgColor: bgColors[(levelNum - 1) % bgColors.length],
    };
}

// Pre-built level definitions for the first few levels (hand-crafted)
// Later levels fall back to the generator.
// You can replace or extend this array with custom JSON data.
const LEVEL_DEFS = [];

function getLevelData(levelNum) {
    if (LEVEL_DEFS[levelNum - 1]) {
        return LEVEL_DEFS[levelNum - 1];
    }
    return generateLevelData(levelNum);
}
