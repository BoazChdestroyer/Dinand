class HUD {
    draw(ctx, player, levelNum) {
        // semi-transparent HUD background
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, CANVAS_W, 50);

        // lives
        for (let i = 0; i < player.lives; i++) {
            drawRect(ctx, 10 + i * 22, 8, 18, 18, '#FF3366');
            drawText(ctx, '♥', 12 + i * 22, 9, 14, '#FFF', 'left');
        }

        // health bar
        const hpBarX = 90;
        const hpBarY = 10;
        const hpBarW = 150;
        const hpBarH = 14;
        drawRect(ctx, hpBarX, hpBarY, hpBarW, hpBarH, '#333');
        const hpPct = player.hp / player.maxHp;
        const hpColor = hpPct > 0.5 ? '#33CC33' : hpPct > 0.25 ? '#CCCC33' : '#CC3333';
        drawRect(ctx, hpBarX, hpBarY, hpBarW * hpPct, hpBarH, hpColor);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(hpBarX, hpBarY, hpBarW, hpBarH);
        drawText(ctx, `${player.hp}/${player.maxHp}`, hpBarX + 4, hpBarY + 1, 11, '#FFF', 'left');

        // weapon info
        const wpn = player.weapon;
        const wpnX = 260;
        drawRect(ctx, wpnX, 6, 130, 22, 'rgba(255,255,255,0.1)');
        drawText(ctx, wpn.name, wpnX + 5, 9, 12, '#FFF', 'left');
        if (wpn.needsAmmo) {
            const ammoCount = player.ammo[wpn.ammoKey] || 0;
            drawText(ctx, `Munitie: ${ammoCount}`, wpnX + 5, 22, 10, ammoCount > 0 ? '#0F0' : '#F44', 'left');
        } else {
            drawText(ctx, '∞', wpnX + 110, 9, 14, '#0F0', 'left');
        }

        // Q/E weapon switch hint
        drawText(ctx, 'Q ◄ ► E', wpnX + 5, 35, 9, '#888', 'left');

        // score
        drawText(ctx, `Score: ${player.score}`, 560, 10, 14, COLORS.coin, 'left');

        // coins
        drawCircle(ctx, 570, 36, 6, COLORS.coin);
        drawText(ctx, `x${player.coins}`, 580, 30, 12, '#FFF', 'left');

        // level
        drawText(ctx, `Level ${levelNum}/${TOTAL_LEVELS}`, CANVAS_W - 10, 10, 14, '#FFF', 'right');

        // ammo overview
        const ammoY = 30;
        drawText(ctx, `MG:${player.ammo.mg}`, 650, ammoY, 10, '#0C6', 'left');
        drawText(ctx, `SG:${player.ammo.sg}`, 720, ammoY, 10, '#F80', 'left');
        drawText(ctx, `GR:${player.ammo.gr}`, 790, ammoY, 10, '#363', 'left');
    }
}
