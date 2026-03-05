window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    const game = new Game(canvas);
    game.start();
});
