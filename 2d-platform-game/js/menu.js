class MenuSystem {
    constructor() {
        this.selectedOption = 0;
        this.menuOptions = ['Start Game', 'Highscores', 'Controls', 'Exit'];
        this.showHighscores = false;
        this.showControls = false;
        this.titlePulse = 0;
    }

    update(input) {
        this.titlePulse += 0.03;

        if (this.showHighscores || this.showControls) {
            if (input.enter || input.wasPressed('Escape')) {
                this.showHighscores = false;
                this.showControls = false;
            }
            return null;
        }

        if (input.wasPressed('ArrowDown') || input.wasPressed('KeyS')) {
            this.selectedOption = (this.selectedOption + 1) % this.menuOptions.length;
        }
        if (input.wasPressed('ArrowUp') || input.wasPressed('KeyW')) {
            this.selectedOption = (this.selectedOption - 1 + this.menuOptions.length) % this.menuOptions.length;
        }

        if (input.enter) {
            switch (this.selectedOption) {
                case 0: return 'start';
                case 1:
                    this.showHighscores = true;
                    return null;
                case 2:
                    this.showControls = true;
                    return null;
                case 3: 
                    window.location.href = "../index.html"; // Ga terug naar de startpagina
                    return null;
            }
        }
        return null;
    }

    draw(ctx) {
        // dark gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        grad.addColorStop(0, '#0a0a2e');
        grad.addColorStop(1, '#1a0a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // stars
        for (let i = 0; i < 60; i++) {
            const sx = (i * 97 + Math.sin(i + this.titlePulse) * 3) % CANVAS_W;
            const sy = (i * 47 + Math.cos(i * 1.3) * 2) % CANVAS_H;
            const alpha = 0.3 + Math.sin(this.titlePulse + i) * 0.3;
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            ctx.fillRect(sx, sy, 2, 2);
        }

        if (this.showHighscores) {
            this.drawHighscores(ctx);
            return;
        }
        if (this.showControls) {
            this.drawControls(ctx);
            return;
        }

        // title
        const titleSize = 44 + Math.sin(this.titlePulse) * 3;
        drawTextWithShadow(ctx, 'COMBAT PLATFORMER', CANVAS_W / 2, 80, titleSize, '#FF6633');
        drawTextWithShadow(ctx, '⚔ ARENA ⚔', CANVAS_W / 2, 135, 22, '#FFD700');

        // menu options
        for (let i = 0; i < this.menuOptions.length; i++) {
            const y = 240 + i * 50;
            const selected = i === this.selectedOption;
            const color = selected ? '#FFD700' : '#AAA';
            const size = selected ? 22 : 18;

            if (selected) {
                drawRect(ctx, CANVAS_W / 2 - 120, y - 4, 240, 34, 'rgba(255,215,0,0.1)');
                drawText(ctx, '►', CANVAS_W / 2 - 110, y, size, '#FFD700', 'left');
            }

            drawTextWithShadow(ctx, this.menuOptions[i], CANVAS_W / 2, y, size, color);
        }

        // footer
        drawText(ctx, 'Pijltjes/WASD = Bewegen  |  SPACE/W = Springen  |  X/J = Aanvallen',
            CANVAS_W / 2, CANVAS_H - 60, 11, '#666', 'center');
        drawText(ctx, 'Q/E = Wapen wisselen  |  ESC = Pauze',
            CANVAS_W / 2, CANVAS_H - 40, 11, '#666', 'center');
    }

    drawHighscores(ctx) {
        drawTextWithShadow(ctx, 'HIGHSCORES', CANVAS_W / 2, 60, 32, '#FFD700');

        const scores = this.getHighscores();
        if (scores.length === 0) {
            drawTextWithShadow(ctx, 'Nog geen scores!', CANVAS_W / 2, 180, 18, '#AAA');
        } else {
            for (let i = 0; i < Math.min(10, scores.length); i++) {
                const y = 120 + i * 35;
                const color = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#AAA';
                drawTextWithShadow(ctx, `${i + 1}. ${scores[i].score} pts - Level ${scores[i].level}`,
                    CANVAS_W / 2, y, 16, color);
            }
        }

        drawTextWithShadow(ctx, 'Druk ENTER om terug te gaan', CANVAS_W / 2, CANVAS_H - 50, 14, '#888');
    }

    drawControls(ctx) {
        drawTextWithShadow(ctx, 'BESTURING', CANVAS_W / 2, 50, 32, '#FFD700');

        const controls = [
            ['← → / A D', 'Lopen'],
            ['↑ / W / SPACE', 'Springen'],
            ['↓ / S', 'Bukken (val door platforms)'],
            ['X / J', 'Aanvallen'],
            ['Q / ,', 'Vorig wapen'],
            ['E / .', 'Volgend wapen'],
            ['ESC / P', 'Pauze'],
        ];

        for (let i = 0; i < controls.length; i++) {
            const y = 110 + i * 40;
            drawTextWithShadow(ctx, controls[i][0], CANVAS_W / 2 - 30, y, 15, '#FFD700', 'right');
            drawTextWithShadow(ctx, controls[i][1], CANVAS_W / 2 + 30, y, 15, '#CCC', 'left');
        }

        drawTextWithShadow(ctx, '--- WAPENS ---', CANVAS_W / 2, 410, 16, '#FF6633');
        const weapons = [
            'Zwaard: Altijd beschikbaar, melee aanval',
            'Zweep: Sneller, langere range melee',
            'Machinegeweer: Snelvuur, lage schade',
            'Shotgun: Breed schot, hoge schade dichtbij',
            'Granaat: Area of effect explosie',
        ];
        for (let i = 0; i < weapons.length; i++) {
            drawText(ctx, weapons[i], CANVAS_W / 2, 435 + i * 18, 11, '#AAA', 'center');
        }

        drawTextWithShadow(ctx, 'Druk ENTER om terug te gaan', CANVAS_W / 2, CANVAS_H - 20, 14, '#888');
    }

    getHighscores() {
        try {
            const data = localStorage.getItem('platformer_highscores');
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    static saveHighscore(score, level) {
        try {
            let scores = [];
            const data = localStorage.getItem('platformer_highscores');
            if (data) scores = JSON.parse(data);
            scores.push({ score, level, date: new Date().toISOString() });
            scores.sort((a, b) => b.score - a.score);
            scores = scores.slice(0, 10);
            localStorage.setItem('platformer_highscores', JSON.stringify(scores));
        } catch (e) {
            console.warn('Could not save highscore:', e);
        }
    }
}
