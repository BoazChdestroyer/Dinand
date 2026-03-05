class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new InputManager();
        this.camera = new Camera(CANVAS_W, CANVAS_H);
        this.particles = new ParticleSystem();
        this.hud = new HUD();
        this.menu = new MenuSystem();

        this.state = GAME_STATES.MENU;
        this.currentLevel = 1;
        this.level = null;
        this.player = null;

        this.levelClearTimer = 0;
        this.gameOverTimer = 0;
        this.pauseSelected = 0;
    }

    start() {
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    loop() {
        this.input.update();
        this.update();
        this.draw();
        requestAnimationFrame(this.loop);
    }

    update() {
        switch (this.state) {
            case GAME_STATES.MENU:
                this.updateMenu();
                break;
            case GAME_STATES.PLAYING:
                this.updatePlaying();
                break;
            case GAME_STATES.PAUSED:
                this.updatePaused();
                break;
            case GAME_STATES.LEVEL_CLEAR:
                this.updateLevelClear();
                break;
            case GAME_STATES.GAME_OVER:
                this.updateGameOver();
                break;
            case GAME_STATES.WIN:
                this.updateWin();
                break;
        }
        this.particles.update();
    }

    draw() {
        this.ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        switch (this.state) {
            case GAME_STATES.MENU:
                this.menu.draw(this.ctx);
                break;
            case GAME_STATES.PLAYING:
            case GAME_STATES.PAUSED:
                this.drawGame();
                if (this.state === GAME_STATES.PAUSED) this.drawPause();
                break;
            case GAME_STATES.LEVEL_CLEAR:
                this.drawGame();
                this.drawLevelClear();
                break;
            case GAME_STATES.GAME_OVER:
                this.drawGameOver();
                break;
            case GAME_STATES.WIN:
                this.drawWin();
                break;
        }
    }

    // --- MENU ---
    updateMenu() {
        const result = this.menu.update(this.input);
        if (result === 'start') {
            this.startNewGame();
        }
    }

    // --- PLAYING ---
    startNewGame() {
        this.currentLevel = 1;
        this.player = new Player(0, 0);
        this.loadLevel(this.currentLevel);
        this.state = GAME_STATES.PLAYING;
    }

    loadLevel(num) {
        const data = getLevelData(num);
        this.level = new Level(data, num);
        this.player.x = this.level.spawnX;
        this.player.y = this.level.spawnY;
        this.player.vx = 0;
        this.player.vy = 0;
        this.player.invincibleTimer = INVINCIBLE_TIME;
        this.camera.x = this.player.x - CANVAS_W / 2;
        this.camera.y = this.player.y - CANVAS_H / 2;
    }

    updatePlaying() {
        if (this.input.pause) {
            this.state = GAME_STATES.PAUSED;
            this.pauseSelected = 0;
            return;
        }

        this.player.update(this.input, this.level, this.particles);
        this.level.update(this.player, this.particles);
        this.camera.follow(
            this.player,
            this.level.width * TILE,
            this.level.height * TILE
        );

        // check finish
        if (this.level.finishZone && rectOverlap(this.player.getRect(), this.level.finishZone)) {
            if (this.level.enemies.length === 0) {
                this.state = GAME_STATES.LEVEL_CLEAR;
                this.levelClearTimer = 120;
                this.player.score += 500;
            }
        }

        // check death
        if (this.player.dead) {
            this.state = GAME_STATES.GAME_OVER;
            this.gameOverTimer = 0;
            MenuSystem.saveHighscore(this.player.score, this.currentLevel);
        }
    }

    // --- PAUSED ---
    updatePaused() {
        if (this.input.pause) {
            this.state = GAME_STATES.PLAYING;
            return;
        }
        if (this.input.wasPressed('ArrowDown') || this.input.wasPressed('KeyS')) {
            this.pauseSelected = (this.pauseSelected + 1) % 2;
        }
        if (this.input.wasPressed('ArrowUp') || this.input.wasPressed('KeyW')) {
            this.pauseSelected = (this.pauseSelected + 1) % 2;
        }
        if (this.input.enter) {
            if (this.pauseSelected === 0) {
                this.state = GAME_STATES.PLAYING;
            } else {
                this.state = GAME_STATES.MENU;
                this.menu = new MenuSystem();
            }
        }
    }

    // --- LEVEL CLEAR ---
    updateLevelClear() {
        this.levelClearTimer--;
        if (this.levelClearTimer <= 0 || this.input.enter) {
            this.currentLevel++;
            if (this.currentLevel > TOTAL_LEVELS) {
                this.state = GAME_STATES.WIN;
                MenuSystem.saveHighscore(this.player.score, this.currentLevel - 1);
            } else {
                this.loadLevel(this.currentLevel);
                this.state = GAME_STATES.PLAYING;
            }
        }
    }

    // --- GAME OVER ---
    updateGameOver() {
        this.gameOverTimer++;
        if (this.gameOverTimer > 60 && this.input.enter) {
            this.state = GAME_STATES.MENU;
            this.menu = new MenuSystem();
        }
    }

    // --- WIN ---
    updateWin() {
        if (this.input.enter) {
            this.state = GAME_STATES.MENU;
            this.menu = new MenuSystem();
        }
    }

    // === DRAW METHODS ===

    drawGame() {
        this.level.draw(this.ctx, this.camera);
        const off = this.camera.getOffset();
        this.player.draw(this.ctx, off.x, off.y);
        this.particles.draw(this.ctx, off.x, off.y);
        this.hud.draw(this.ctx, this.player, this.currentLevel);
    }

    drawPause() {
        ctx_overlay(this.ctx, 'rgba(0,0,0,0.6)');
        drawTextWithShadow(this.ctx, 'PAUZE', CANVAS_W / 2, 160, 48, '#FFD700');

        const options = ['Doorgaan', 'Terug naar menu'];
        for (let i = 0; i < options.length; i++) {
            const y = 260 + i * 50;
            const sel = i === this.pauseSelected;
            const color = sel ? '#FFD700' : '#AAA';
            if (sel) {
                drawText(this.ctx, '►', CANVAS_W / 2 - 100, y, 20, '#FFD700', 'left');
            }
            drawTextWithShadow(this.ctx, options[i], CANVAS_W / 2, y, sel ? 22 : 18, color);
        }
    }

    drawLevelClear() {
        ctx_overlay(this.ctx, 'rgba(0,0,0,0.5)');
        drawTextWithShadow(this.ctx, 'LEVEL COMPLEET!', CANVAS_W / 2, 180, 40, '#00FF88');
        drawTextWithShadow(this.ctx, `+500 bonus punten`, CANVAS_W / 2, 240, 20, '#FFD700');
        drawTextWithShadow(this.ctx, `Score: ${this.player.score}`, CANVAS_W / 2, 280, 18, '#FFF');
    }

    drawGameOver() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        grad.addColorStop(0, '#1a0000');
        grad.addColorStop(1, '#000000');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        drawTextWithShadow(this.ctx, 'GAME OVER', CANVAS_W / 2, 140, 56, '#CC3333');
        drawTextWithShadow(this.ctx, `Score: ${this.player.score}`, CANVAS_W / 2, 240, 24, '#FFD700');
        drawTextWithShadow(this.ctx, `Level bereikt: ${this.currentLevel}`, CANVAS_W / 2, 280, 18, '#FFF');
        drawTextWithShadow(this.ctx, `Munten: ${this.player.coins}`, CANVAS_W / 2, 310, 16, COLORS.coin);

        if (this.gameOverTimer > 60) {
            drawTextWithShadow(this.ctx, 'Druk ENTER voor menu', CANVAS_W / 2, 400, 16, '#888');
        }
    }

    drawWin() {
        const grad = this.ctx.createLinearGradient(0, 0, 0, CANVAS_H);
        grad.addColorStop(0, '#001a00');
        grad.addColorStop(1, '#000a00');
        this.ctx.fillStyle = grad;
        this.ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        drawTextWithShadow(this.ctx, 'GEFELICITEERD!', CANVAS_W / 2, 100, 48, '#00FF88');
        drawTextWithShadow(this.ctx, 'Alle 50 levels voltooid!', CANVAS_W / 2, 170, 22, '#FFD700');
        drawTextWithShadow(this.ctx, `Eindscore: ${this.player.score}`, CANVAS_W / 2, 240, 28, '#FFD700');
        drawTextWithShadow(this.ctx, `Munten: ${this.player.coins}`, CANVAS_W / 2, 290, 18, COLORS.coin);
        drawTextWithShadow(this.ctx, 'Druk ENTER voor menu', CANVAS_W / 2, 400, 16, '#888');
    }
}

function ctx_overlay(ctx, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}
