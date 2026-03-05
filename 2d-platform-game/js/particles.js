class Particle {
    constructor(x, y, vx, vy, life, size, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.size = size;
        this.color = color;
        this.dead = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1;
        this.life--;
        if (this.life <= 0) this.dead = true;
    }

    draw(ctx, ox, oy) {
        const alpha = this.life / this.maxLife;
        ctx.globalAlpha = alpha;
        drawRect(ctx, this.x + ox, this.y + oy, this.size, this.size, this.color);
        ctx.globalAlpha = 1;
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    emit(x, y, count, color, spread = 3, life = 30, size = 3) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(
                x, y,
                randFloat(-spread, spread),
                randFloat(-spread, 0),
                randInt(life / 2, life),
                randInt(2, size),
                color
            ));
        }
    }

    update() {
        this.particles = this.particles.filter(p => {
            p.update();
            return !p.dead;
        });
    }

    draw(ctx, ox, oy) {
        for (const p of this.particles) {
            p.draw(ctx, ox, oy);
        }
    }
}
