class Camera {
    constructor(canvasW, canvasH) {
        this.x = 0;
        this.y = 0;
        this.w = canvasW;
        this.h = canvasH;
        this.targetX = 0;
        this.targetY = 0;
        this.smoothing = 0.08;
        this.shakeTimer = 0;
        this.shakeIntensity = 0;
    }

    follow(target, levelWidth, levelHeight) {
        this.targetX = target.x + target.w / 2 - this.w / 2;
        this.targetY = target.y + target.h / 2 - this.h / 2;

        this.x = lerp(this.x, this.targetX, this.smoothing);
        this.y = lerp(this.y, this.targetY, this.smoothing);

        this.x = clamp(this.x, 0, Math.max(0, levelWidth - this.w));
        this.y = clamp(this.y, 0, Math.max(0, levelHeight - this.h));
    }

    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeTimer = duration;
    }

    getOffset() {
        let ox = -this.x;
        let oy = -this.y;
        if (this.shakeTimer > 0) {
            ox += randFloat(-this.shakeIntensity, this.shakeIntensity);
            oy += randFloat(-this.shakeIntensity, this.shakeIntensity);
            this.shakeTimer -= 16;
        }
        return { x: ox, y: oy };
    }

    isVisible(x, y, w, h) {
        return x + w > this.x && x < this.x + this.w &&
               y + h > this.y && y < this.y + this.h;
    }
}
