class Projectile {
    constructor(x, y, vx, vy, damage, w, h, color, type = 'bullet') {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.damage = damage;
        this.w = w;
        this.h = h;
        this.color = color;
        this.type = type;
        this.dead = false;
        this.life = 120;
        // grenade-specific
        this.bounces = 0;
        this.fuseTimer = type === 'grenade' ? 60 : -1;
        this.exploded = false;
        this.explosionRadius = 80;
    }

    update(level) {
        if (this.type === 'grenade') {
            this.vy += GRAVITY * 0.5;
            this.fuseTimer--;
            if (this.fuseTimer <= 0 && !this.exploded) {
                this.exploded = true;
                this.dead = true;
                return;
            }
            // bounce off tiles
            this.x += this.vx;
            if (level && level.isSolid(this.x, this.y, this.w, this.h)) {
                this.vx *= -0.5;
                this.x += this.vx;
                this.bounces++;
            }
            this.y += this.vy;
            if (level && level.isSolid(this.x, this.y, this.w, this.h)) {
                this.vy *= -0.4;
                this.vx *= 0.8;
                this.y += this.vy;
            }
        } else {
            this.x += this.vx;
            this.y += this.vy;
            if (level && level.isSolidTile(
                Math.floor(this.x / TILE),
                Math.floor(this.y / TILE)
            )) {
                this.dead = true;
            }
        }
        this.life--;
        if (this.life <= 0) this.dead = true;
    }

    draw(ctx, ox, oy) {
        if (this.type === 'grenade') {
            drawCircle(ctx, this.x + ox + this.w / 2, this.y + oy + this.h / 2, 5, COLORS.grenade);
        } else {
            drawRect(ctx, this.x + ox, this.y + oy, this.w, this.h, this.color);
        }
    }

    getRect() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}

class MeleeAttack {
    constructor(x, y, w, h, damage, duration, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.damage = damage;
        this.timer = duration;
        this.maxTimer = duration;
        this.color = color;
        this.dead = false;
        this.hitEnemies = new Set();
    }

    update() {
        this.timer--;
        if (this.timer <= 0) this.dead = true;
    }

    draw(ctx, ox, oy) {
        const alpha = this.timer / this.maxTimer;
        ctx.globalAlpha = alpha * 0.7;
        drawRect(ctx, this.x + ox, this.y + oy, this.w, this.h, this.color);
        ctx.globalAlpha = 1;
    }

    getRect() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}

class Weapon {
    constructor(type) {
        this.type = type;
        this.cooldown = 0;
        this.configure(type);
    }

    configure(type) {
        switch (type) {
            case WEAPON_TYPES.SWORD:
                this.damage = 25;
                this.range = 45;
                this.height = 30;
                this.cooldownMax = 20;
                this.isMelee = true;
                this.attackDuration = 10;
                this.color = '#C0C0C0';
                this.name = 'Zwaard';
                this.needsAmmo = false;
                break;
            case WEAPON_TYPES.WHIP:
                this.damage = 18;
                this.range = 80;
                this.height = 12;
                this.cooldownMax = 12;
                this.isMelee = true;
                this.attackDuration = 8;
                this.color = COLORS.whipTrail;
                this.name = 'Zweep';
                this.needsAmmo = false;
                break;
            case WEAPON_TYPES.MACHINEGUN:
                this.damage = 8;
                this.speed = 10;
                this.cooldownMax = 6;
                this.isMelee = false;
                this.name = 'Machinegeweer';
                this.needsAmmo = true;
                this.ammoKey = 'mg';
                break;
            case WEAPON_TYPES.SHOTGUN:
                this.damage = 12;
                this.speed = 8;
                this.cooldownMax = 30;
                this.pellets = 5;
                this.spread = 0.3;
                this.isMelee = false;
                this.name = 'Shotgun';
                this.needsAmmo = true;
                this.ammoKey = 'sg';
                break;
            case WEAPON_TYPES.GRENADE:
                this.damage = 50;
                this.speed = 7;
                this.cooldownMax = 45;
                this.isMelee = false;
                this.name = 'Granaat';
                this.needsAmmo = true;
                this.ammoKey = 'gr';
                break;
        }
    }

    canFire(ammo) {
        if (this.cooldown > 0) return false;
        if (this.needsAmmo && (ammo[this.ammoKey] || 0) <= 0) return false;
        return true;
    }

    fire(player, ammo) {
        if (!this.canFire(ammo)) return [];
        this.cooldown = this.cooldownMax;

        const dir = player.facing;
        const cx = player.x + player.w / 2;
        const cy = player.y + player.h / 2;

        if (this.isMelee) {
            const ax = dir === 1 ? player.x + player.w : player.x - this.range;
            const ay = cy - this.height / 2;
            return [new MeleeAttack(ax, ay, this.range, this.height, this.damage, this.attackDuration, this.color)];
        }

        if (this.needsAmmo) ammo[this.ammoKey]--;

        switch (this.type) {
            case WEAPON_TYPES.MACHINEGUN: {
                const bx = dir === 1 ? player.x + player.w : player.x - 8;
                const by = cy - 2;
                return [new Projectile(bx, by, this.speed * dir, randFloat(-0.3, 0.3), this.damage, 8, 4, COLORS.bullet)];
            }
            case WEAPON_TYPES.SHOTGUN: {
                const projectiles = [];
                for (let i = 0; i < this.pellets; i++) {
                    const bx = dir === 1 ? player.x + player.w : player.x - 6;
                    const by = cy - 2;
                    const angle = randFloat(-this.spread, this.spread);
                    projectiles.push(new Projectile(
                        bx, by,
                        this.speed * dir * (0.8 + Math.random() * 0.4),
                        Math.sin(angle) * 4,
                        this.damage, 6, 4, '#FFA500'
                    ));
                }
                return projectiles;
            }
            case WEAPON_TYPES.GRENADE: {
                const bx = dir === 1 ? player.x + player.w : player.x - 10;
                const by = cy - 5;
                return [new Projectile(bx, by, this.speed * dir, -4, this.damage, 10, 10, COLORS.grenade, 'grenade')];
            }
        }
        return [];
    }

    update() {
        if (this.cooldown > 0) this.cooldown--;
    }
}
