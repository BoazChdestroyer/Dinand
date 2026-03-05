class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.w = 20;
        this.h = 20;
        this.type = type;
        this.collected = false;
        this.floatOffset = Math.random() * Math.PI * 2;
        this.configure(type);
    }

    configure(type) {
        switch (type) {
            case COLLECTIBLE_TYPES.COIN:
                this.color = COLORS.coin;
                this.w = 16; this.h = 16;
                this.value = 10;
                break;
            case COLLECTIBLE_TYPES.HEART:
                this.color = COLORS.healthPack;
                this.healAmount = 25;
                break;
            case COLLECTIBLE_TYPES.LIFE:
                this.color = COLORS.lifePack;
                this.w = 24; this.h = 24;
                break;
            case COLLECTIBLE_TYPES.AMMO_MG:
                this.color = COLORS.ammo;
                this.ammoKey = 'mg';
                this.ammoAmount = 30;
                break;
            case COLLECTIBLE_TYPES.AMMO_SG:
                this.color = '#FF8C00';
                this.ammoKey = 'sg';
                this.ammoAmount = 8;
                break;
            case COLLECTIBLE_TYPES.AMMO_GR:
                this.color = COLORS.grenade;
                this.ammoKey = 'gr';
                this.ammoAmount = 3;
                break;
            case COLLECTIBLE_TYPES.WEAPON_WHIP:
                this.color = COLORS.weaponBox;
                this.weaponType = WEAPON_TYPES.WHIP;
                this.w = 28; this.h = 28;
                break;
            case COLLECTIBLE_TYPES.WEAPON_MACHINEGUN:
                this.color = COLORS.weaponBox;
                this.weaponType = WEAPON_TYPES.MACHINEGUN;
                this.w = 28; this.h = 28;
                break;
            case COLLECTIBLE_TYPES.WEAPON_SHOTGUN:
                this.color = COLORS.weaponBox;
                this.weaponType = WEAPON_TYPES.SHOTGUN;
                this.w = 28; this.h = 28;
                break;
            case COLLECTIBLE_TYPES.WEAPON_GRENADE:
                this.color = COLORS.weaponBox;
                this.weaponType = WEAPON_TYPES.GRENADE;
                this.w = 28; this.h = 28;
                break;
        }
    }

    pickup(player, particles) {
        if (this.collected) return;
        this.collected = true;
        particles.emit(this.x + this.w / 2, this.y + this.h / 2, 8, this.color, 2, 20);

        switch (this.type) {
            case COLLECTIBLE_TYPES.COIN:
                player.score += this.value;
                player.coins++;
                break;
            case COLLECTIBLE_TYPES.HEART:
                player.heal(this.healAmount);
                break;
            case COLLECTIBLE_TYPES.LIFE:
                player.lives++;
                break;
            case COLLECTIBLE_TYPES.AMMO_MG:
            case COLLECTIBLE_TYPES.AMMO_SG:
            case COLLECTIBLE_TYPES.AMMO_GR:
                player.ammo[this.ammoKey] = (player.ammo[this.ammoKey] || 0) + this.ammoAmount;
                break;
            case COLLECTIBLE_TYPES.WEAPON_WHIP:
            case COLLECTIBLE_TYPES.WEAPON_MACHINEGUN:
            case COLLECTIBLE_TYPES.WEAPON_SHOTGUN:
            case COLLECTIBLE_TYPES.WEAPON_GRENADE:
                player.addWeapon(this.weaponType);
                break;
        }
    }

    update() {
        this.floatOffset += 0.04;
    }

    draw(ctx, ox, oy) {
        if (this.collected) return;
        const floatY = Math.sin(this.floatOffset) * 3;
        const dx = this.x + ox;
        const dy = this.y + oy + floatY;

        if (this.type === COLLECTIBLE_TYPES.COIN) {
            drawCircle(ctx, dx + this.w / 2, dy + this.h / 2, this.w / 2, this.color);
            drawText(ctx, '$', dx + 3, dy + 2, 12, '#AA8800', 'left');
        } else if (this.type === COLLECTIBLE_TYPES.HEART) {
            drawRect(ctx, dx, dy, this.w, this.h, this.color);
            drawText(ctx, '+', dx + 3, dy + 2, 16, '#FFF', 'left');
        } else if (this.type === COLLECTIBLE_TYPES.LIFE) {
            drawRect(ctx, dx, dy, this.w, this.h, this.color);
            drawText(ctx, '♥', dx + 4, dy + 4, 16, '#FFF', 'left');
        } else if (this.weaponType) {
            drawRect(ctx, dx, dy, this.w, this.h, this.color);
            drawRect(ctx, dx + 2, dy + 2, this.w - 4, this.h - 4, '#2a1a4a');
            drawText(ctx, 'W', dx + 6, dy + 6, 14, '#FFF', 'left');
        } else {
            // ammo
            drawRect(ctx, dx, dy, this.w, this.h, this.color);
            drawText(ctx, 'A', dx + 4, dy + 3, 13, '#FFF', 'left');
        }
    }

    getRect() {
        return { x: this.x, y: this.y, w: this.w, h: this.h };
    }
}
