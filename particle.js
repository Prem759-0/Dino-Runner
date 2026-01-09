export class Particle {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 2;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * -1 - 0.5;
        this.markedForDeletion = false;
        this.color = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
    }
    update() {
        this.x -= this.game.gameSpeed; // Move with the world
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= 0.95; // Searchink
        if (this.size < 0.5) this.markedForDeletion = true;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
