class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 28;
        this.h = 40;
        this.vx = 0;
        this.vy = 0;
        this.facing = 1; // 1 = right, -1 = left
        this.onGround = false;
        this.hp = PLAYER_MAX_HP;
        this.maxHp = PLAYER_MAX_HP;
        this.lives = PLAYER_START_LIVES;
        this.invincibleTimer = 0;
        this.dead = false;
        this.score = 0;
        this.coins = 0;

        this.ammo = { mg: 0, sg: 0, gr: 0 };

        this.weapons = [new Weapon(WEAPON_TYPES.SWORD)];
        this.currentWeaponIdx = 0;

        this.meleeAttacks = [];
        this.projectiles = [];

        // animation state
        this.animTimer = 0;
        this.attackAnimTimer = 0;
        this.duckTimer = 0;
        this.isDucking = false;
    }

    get weapon() {
        return this.weapons[this.currentWeaponIdx];
    }

    hasWeapon(type) {
        return this.weapons.some(w => w.type === type);
    }

    addWeapon(type) {
        if (!this.hasWeapon(type)) {
            this.weapons.push(new Weapon(type));
        }
    }

    switchWeapon(dir) {
        this.currentWeaponIdx = (this.currentWeaponIdx + dir + this.weapons.length) % this.weapons.length;
    }

    takeDamage(amount) {
        if (this.invincibleTimer > 0) return;
        this.hp -= amount;
        this.invincibleTimer = INVINCIBLE_TIME;
        if (this.hp <= 0) {
            this.hp = 0;
            this.loseLife();
        }
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.dead = true;
        } else {
            this.hp = this.maxHp;
            this.invincibleTimer = INVINCIBLE_TIME;
        }
    }

    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
    }

    update(input, level, particles) {
        // ducking
        this.isDucking = input.down && this.onGround;
        if (this.isDucking) {
            this.h = 24;
        } else {
            if (this.h === 24) {
                this.y -= 16;
            }
            this.h = 40;
        }

        // horizontal movement
        if (input.left) {
            this.vx = -PLAYER_SPEED;
            this.facing = -1;
        } else if (input.right) {
            this.vx = PLAYER_SPEED;
            this.facing = 1;
        } else {
            this.vx *= 0.7;
            if (Math.abs(this.vx) < 0.3) this.vx = 0;
        }

        // jumping
        if (input.jump && this.onGround) {
            this.vy = PLAYER_JUMP;
            this.onGround = false;
        }

        // gravity
        this.vy += GRAVITY;
        if (this.vy > MAX_FALL) this.vy = MAX_FALL;

        // move x with collision
        this.x += this.vx;
        this.resolveCollisionX(level);

        // move y with collision
        this.y += this.vy;
        this.onGround = false;
        this.resolveCollisionY(level);

        // fall into pit
        if (this.y > level.height * TILE + 100) {
            this.loseLife();
            if (!this.dead) {
                this.respawn(level);
            }
        }

        // weapon switching
        if (input.switchWeaponNext) this.switchWeapon(1);
        if (input.switchWeaponPrev) this.switchWeapon(-1);

        // attack
        if (input.attack) {
            const results = this.weapon.fire(this, this.ammo);
            for (const r of results) {
                if (r instanceof MeleeAttack) {
                    this.meleeAttacks.push(r);
                    this.attackAnimTimer = 15;
                } else if (r instanceof Projectile) {
                    this.projectiles.push(r);
                    this.attackAnimTimer = 10;
                }
            }
        }

        // update weapon cooldown
        for (const w of this.weapons) w.update();

        // update melee attacks
        this.meleeAttacks = this.meleeAttacks.filter(a => { a.update(); return !a.dead; });

        // update projectiles
        this.projectiles = this.projectiles.filter(p => { p.update(level); return !p.dead; });

        // invincibility
        if (this.invincibleTimer > 0) this.invincibleTimer -= 16;

        // animation
        this.animTimer++;
        if (this.attackAnimTimer > 0) this.attackAnimTimer--;

        // keep within level bounds horizontally
        if (this.x < 0) this.x = 0;
        if (this.x + this.w > level.width * TILE) this.x = level.width * TILE - this.w;
    }

    resolveCollisionX(level) {
        const tileRect = this.getRect();
        const startCol = Math.floor(tileRect.x / TILE);
        const endCol = Math.floor((tileRect.x + tileRect.w) / TILE);
        const startRow = Math.floor(tileRect.y / TILE);
        const endRow = Math.floor((tileRect.y + tileRect.h - 1) / TILE);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (level.isSolidTile(col, row)) {
                    const tileX = col * TILE;
                    const tileY = row * TILE;
                    if (rectOverlap(tileRect, { x: tileX, y: tileY, w: TILE, h: TILE })) {
                        if (this.vx > 0) {
                            this.x = tileX - this.w;
                        } else if (this.vx < 0) {
                            this.x = tileX + TILE;
                        }
                        this.vx = 0;
                        return;
                    }
                }
            }
        }
    }

    resolveCollisionY(level) {
        const tileRect = this.getRect();
        const startCol = Math.floor(tileRect.x / TILE);
        const endCol = Math.floor((tileRect.x + tileRect.w - 1) / TILE);
        const startRow = Math.floor(tileRect.y / TILE);
        const endRow = Math.floor((tileRect.y + tileRect.h) / TILE);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const tileType = level.getTile(col, row);
                const tileX = col * TILE;
                const tileY = row * TILE;

                if (tileType === TILE_TYPES.PLATFORM) {
                    // one-way: only collide from above when falling
                    if (this.vy > 0 && !this.isDucking) {
                        const prevBottom = this.y + this.h - this.vy;
                        if (prevBottom <= tileY + 4) {
                            if (rectOverlap(tileRect, { x: tileX, y: tileY, w: TILE, h: TILE })) {
                                this.y = tileY - this.h;
                                this.vy = 0;
                                this.onGround = true;
                                return;
                            }
                        }
                    }
                } else if (level.isSolidTile(col, row)) {
                    if (rectOverlap(tileRect, { x: tileX, y: tileY, w: TILE, h: TILE })) {
                        if (this.vy > 0) {
                            this.y = tileY - this.h;
                            this.vy = 0;
                            this.onGround = true;
                        } else if (this.vy < 0) {
                            this.y = tileY + TILE;
                            this.vy = 0;
                        }
                        return;
                    }
                }

                // spikes
                if (tileType === TILE_TYPES.SPIKE) {
                    if (rectOverlap(tileRect, { x: tileX + 4, y: tileY + 8, w: TILE - 8, h: TILE - 8 })) {
                        this.takeDamage(30);
                    }
                }
            }
        }
    }

    respawn(level) {
        this.x = level.spawnX;
        this.y = level.spawnY;
        this.vx = 0;
        this.vy = 0;
        this.invincibleTimer = INVINCIBLE_TIME;
    }

    getRect() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    draw(ctx, ox, oy) {
        const blinking = this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 80) % 2 === 0;
        if (blinking) return;

        const dx = this.x + ox;
        const dy = this.y + oy;

        // body
        const bodyColor = this.invincibleTimer > 0 ? COLORS.playerHurt : COLORS.player;
        drawRect(ctx, dx, dy, this.w, this.h, bodyColor);

        // eyes
        const eyeX = this.facing === 1 ? dx + 18 : dx + 4;
        drawRect(ctx, eyeX, dy + 8, 6, 6, '#FFF');
        drawRect(ctx, this.facing === 1 ? eyeX + 2 : eyeX, dy + 10, 3, 3, '#000');

        // weapon visual when attacking
        if (this.attackAnimTimer > 0) {
            const w = this.weapon;
            if (w.isMelee) {
                const wLen = w.type === WEAPON_TYPES.WHIP ? 60 : 30;
                const wx = this.facing === 1 ? dx + this.w : dx - wLen;
                const wy = dy + this.h / 2 - 3;
                drawRect(ctx, wx, wy, wLen, 6, w.color);
            } else {
                const gx = this.facing === 1 ? dx + this.w : dx - 12;
                drawRect(ctx, gx, dy + 14, 12, 6, '#666');
            }
        }

        // draw melee hitboxes
        for (const a of this.meleeAttacks) a.draw(ctx, ox, oy);
        // draw projectiles
        for (const p of this.projectiles) p.draw(ctx, ox, oy);
    }
}
