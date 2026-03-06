class InputManager {
    constructor() {
        this.keys = {};
        this.justPressed = {};
        this._prev = {};

        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
    }

    update() {
        for (const code in this.keys) {
            this.justPressed[code] = this.keys[code] && !this._prev[code];
        }
        Object.assign(this._prev, this.keys);
    }

    isDown(code) { return !!this.keys[code]; }
    wasPressed(code) { return !!this.justPressed[code]; }

    get left()   { return this.isDown('ArrowLeft') || this.isDown('KeyA'); }
    get right()  { return this.isDown('ArrowRight') || this.isDown('KeyD'); }
    get up()     { return this.isDown('ArrowUp') || this.isDown('KeyW'); }
    get down()   { return this.isDown('ArrowDown') || this.isDown('KeyS'); }
    get jump()   { return this.wasPressed('ArrowUp') || this.wasPressed('KeyW') || this.wasPressed('Space'); }
    get attack() { return this.wasPressed('KeyX') || this.wasPressed('KeyJ'); }
    get switchWeaponNext() { return this.wasPressed('KeyE') || this.wasPressed('Period'); }
    get switchWeaponPrev() { return this.wasPressed('KeyQ') || this.wasPressed('Comma'); }
    get pause()  { return this.wasPressed('Escape') || this.wasPressed('KeyP'); }
    get enter()  { return this.wasPressed('Enter'); }
}
