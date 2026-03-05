class Enemy {
    constructor(x, y, type, levelNum) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = 0;
        this.vy = 0;
        this.dead = false;
        this.facing = -1;
        this.animTimer = 0;
        this.attackCooldown = 0;
        this.scoreValue = 100;

        const scale = 1 + (levelNum - 1) * 0.06;
        this.configure(type, scale);
    }

    configure(type, scale) {
        switch (type) {
            case ENEMY_TYPES.WALKER:
                this.w = 30;
                this.h = 36;
                this.hp = Math.floor(30 * scale);
                this.maxHp = this.hp;
                this.speed = 1.2;
                this.damage = Math.floor(10 * scale);
                this.color = '#CC3333';
                this.scoreValue = 100;
                break;
            case ENEMY_TYPES.JUMPER:
                this.w = 26;
                this.h = 32;
                this.hp = Math.floor(25 * scale);
                this.maxHp = this.hp;
                this.speed = 1.5;
                this.damage = Math.floor(12 * scale);
                this.color = '#CC9933';
                this.jumpTimer = 60;
                this.scoreValue = 150;
                break;
            case ENEMY_TYPES.FLYER:
                this.w = 32;
                this.h = 24;
                this.hp = Math.floor(20 * scale);
                this.maxHp = this.hp;
                this.speed = 1.8;
                this.damage = Math.floor(8 * scale);
                this.color = '#9933CC';
                this.floatOffset = 0;
                this.baseY = this.y;
                this.scoreValue = 200;
                break;
            case ENEMY_TYPES.TURRET:
                this.w = 30;
                this.h = 30;
                this.hp = Math.floor(50 * scale);
                this.maxHp = this.hp;
                this.speed = 0;
                this.damage = Math.floor(15 * scale);
                this.color = '#666666';
                this.shootCooldown = 90;
                this.shootTimer = 90;
                this.scoreValue = 250;
                break;
            case ENEMY_TYPES.BRUTE:
                this.w = 40;
                this.h = 48;
                this.hp = Math.floor(80 * scale);
                this.maxHp = this.hp;
                this.speed = 0.8;
                this.damage = Math.floor(20 * scale);
                this.color = '#993333';
                this.scoreValue = 300;
                break;
        }
        this.onGround = false;
    }

    takeDamage(amount, particles) {
        this.hp -= amount;
        if (particles) {
            particles.emit(this.x + this.w / 2, this.y + this.h / 2, 5, '#FF0000');
        }
        if (this.hp <= 0) {
            this.dead = true;
            if (particles) {
                particles.emit(this.x + this.w / 2, this.y + this.h / 2, 15, this.color, 4, 40);
            }
        }
    }

    update(level, player, enemyProjectiles) {
        this.animTimer++;

        switch (this.type) {
            case ENEMY_TYPES.WALKER:
            case ENEMY_TYPES.BRUTE:
                this.aiPatrol(level);
                break;
            case ENEMY_TYPES.JUMPER:
                this.aiJumper(level, player);
                break;
            case ENEMY_TYPES.FLYER:
                this.aiFlyer(player);
                break;
            case ENEMY_TYPES.TURRET:
                this.aiTurret(player, enemyProjectiles);
                break;
        }

        if (this.type !== ENEMY_TYPES.FLYER) {
            this.vy += GRAVITY;
            if (this.vy > MAX_FALL) this.vy = MAX_FALL;

            this.x += this.vx;
            this.collideX(level);
            this.y += this.vy;
            this.onGround = false;
            this.collideY(level);
        }

        // fall into pit
        if (this.y > level.height * TILE + 200) {
            this.dead = true;
        }
    }

    aiPatrol(level) {
        this.vx = this.speed * this.facing;
        // turn around at edges or walls
        const aheadCol = Math.floor((this.x + (this.facing === 1 ? this.w + 2 : -2)) / TILE);
        const footRow = Math.floor((this.y + this.h + 4) / TILE);
        const wallRow = Math.floor((this.y + this.h / 2) / TILE);

        if (!level.isSolidTile(aheadCol, footRow) || level.isSolidTile(aheadCol, wallRow)) {
            this.facing *= -1;
        }
    }

    aiJumper(level, player) {
        this.vx = this.speed * this.facing;
        const dx = player.x - this.x;
        this.facing = dx > 0 ? 1 : -1;

        this.jumpTimer--;
        if (this.jumpTimer <= 0 && this.onGround) {
            this.vy = -10;
            this.jumpTimer = randInt(40, 80);
        }
    }

    aiFlyer(player) {
        this.floatOffset += 0.05;
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const d = dist(this.x, this.y, player.x, player.y);
        if (d > 20) {
            this.x += (dx / d) * this.speed;
            this.y += (dy / d) * this.speed + Math.sin(this.floatOffset) * 0.5;
        }
        this.facing = dx > 0 ? 1 : -1;
    }

    aiTurret(player, enemyProjectiles) {
        this.shootTimer--;
        const dx = player.x - this.x;
        this.facing = dx > 0 ? 1 : -1;

        if (this.shootTimer <= 0 && dist(this.x, this.y, player.x, player.y) < 400) {
            this.shootTimer = this.shootCooldown;
            const bx = this.facing === 1 ? this.x + this.w : this.x - 8;
            const by = this.y + this.h / 2;
            enemyProjectiles.push(new Projectile(bx, by, 5 * this.facing, 0, this.damage, 8, 4, '#FF4444'));
        }
    }

    collideX(level) {
        const r = this.getRect();
        const startCol = Math.floor(r.x / TILE);
        const endCol = Math.floor((r.x + r.w) / TILE);
        const startRow = Math.floor(r.y / TILE);
        const endRow = Math.floor((r.y + r.h - 1) / TILE);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (level.isSolidTile(col, row)) {
                    const tx = col * TILE;
                    const ty = row * TILE;
                    if (rectOverlap(r, { x: tx, y: ty, w: TILE, h: TILE })) {
                        if (this.vx > 0) this.x = tx - this.w;
                        else if (this.vx < 0) this.x = tx + TILE;
                        this.vx = 0;
                        this.facing *= -1;
                        return;
                    }
                }
            }
        }
    }

    collideY(level) {
        const r = this.getRect();
        const startCol = Math.floor(r.x / TILE);
        const endCol = Math.floor((r.x + r.w - 1) / TILE);
        const startRow = Math.floor(r.y / TILE);
        const endRow = Math.floor((r.y + r.h) / TILE);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (level.isSolidTile(col, row)) {
                    const tx = col * TILE;
                    const ty = row * TILE;
                    if (rectOverlap(r, { x: tx, y: ty, w: TILE, h: TILE })) {
                        if (this.vy > 0) {
                            this.y = ty - this.h;
                            this.vy = 0;
                            this.onGround = true;
                        } else if (this.vy < 0) {
                            this.y = ty + TILE;
                            this.vy = 0;
                        }
                        return;
                    }
                }
            }
        }
    }

    getRect() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }

    draw(ctx, ox, oy) {
        const dx = this.x + ox;
        const dy = this.y + oy;

        drawRect(ctx, dx, dy, this.w, this.h, this.color);

        // eye
        const eyeX = this.facing === 1 ? dx + this.w - 10 : dx + 4;
        drawRect(ctx, eyeX, dy + 6, 5, 5, '#FFF');
        drawRect(ctx, this.facing === 1 ? eyeX + 2 : eyeX, dy + 7, 3, 3, '#000');

        // HP bar
        if (this.hp < this.maxHp) {
            const barW = this.w;
            const barH = 4;
            const barX = dx;
            const barY = dy - 8;
            drawRect(ctx, barX, barY, barW, barH, '#333');
            drawRect(ctx, barX, barY, barW * (this.hp / this.maxHp), barH, '#FF3333');
        }

        // type indicators
        if (this.type === ENEMY_TYPES.FLYER) {
            // small wings
            const wingPhase = Math.sin(this.animTimer * 0.15) * 4;
            drawRect(ctx, dx - 6, dy + 4 + wingPhase, 8, 4, this.color);
            drawRect(ctx, dx + this.w - 2, dy + 4 - wingPhase, 8, 4, this.color);
        }
        if (this.type === ENEMY_TYPES.TURRET) {
            const gunLen = 14;
            const gx = this.facing === 1 ? dx + this.w : dx - gunLen;
            drawRect(ctx, gx, dy + this.h / 2 - 3, gunLen, 6, '#444');
        }
        if (this.type === ENEMY_TYPES.BRUTE) {
            // shoulder armor look
            drawRect(ctx, dx - 3, dy, 5, 12, '#664444');
            drawRect(ctx, dx + this.w - 2, dy, 5, 12, '#664444');
        }
    }
}
