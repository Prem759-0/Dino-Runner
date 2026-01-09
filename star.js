export class Star {
    constructor(game) {
        this.game = game;
        this.width = 25;
        this.height = 25;
        this.x = game.width;
        // Spawn at varying heights usually jumpable
        this.y = game.height - 80 - Math.random() * 80;
        this.markedForDeletion = false;
        this.angle = 0;
    }

    update() {
        this.x -= this.game.gameSpeed;
        if (this.x < -this.width) this.markedForDeletion = true;
        this.angle += 0.1;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);

        ctx.fillStyle = "#FFD700"; // Gold
        ctx.strokeStyle = "#FFA500"; // Orange edge
        ctx.lineWidth = 2;

        // Draw Star Shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(Math.cos((18 + i * 72) * Math.PI / 180) * 12,
                -Math.sin((18 + i * 72) * Math.PI / 180) * 12);
            ctx.lineTo(Math.cos((54 + i * 72) * Math.PI / 180) * 5,
                -Math.sin((54 + i * 72) * Math.PI / 180) * 5);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
