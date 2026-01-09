export class Obstacle {
    constructor(ctx, config, type) {
        this.ctx = ctx;
        this.config = config;
        this.type = type; // 'cactusSmall', 'cactusBig', 'bird'
        this.x = config.canvasWidth + 50;
        this.markedForDeletion = false;

        this.width = 0;
        this.height = 0;
        this.y = 0;

        this.initType();
    }

    initType() {
        switch (this.type) {
            case 'cactusSmall':
                this.width = 20;
                this.height = 35;
                this.y = this.config.groundY - this.height;
                break;
            case 'cactusBig':
                this.width = 30;
                this.height = 50;
                this.y = this.config.groundY - this.height;
                break;
            case 'bird':
                this.width = 40;
                this.height = 25;
                // Randomize bird height: low, med, high
                const heights = [30, 60, 90];
                const offset = heights[Math.floor(Math.random() * heights.length)];
                this.y = this.config.groundY - offset;
                break;
        }
    }

    update(speed) {
        this.x -= speed;
        if (this.x < -this.width) {
            this.markedForDeletion = true;
        }
    }

    draw() {
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        // Adjust shadow width based on type
        let shadowWidth = this.width / 2;
        if (this.type === 'bird') shadowWidth = 15;
        this.ctx.ellipse(x + this.width / 2, y + this.height + 2, shadowWidth, 3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-color').trim();

        if (this.type === 'bird') {
            // Bird Shape
            // Body
            this.ctx.fillRect(x, y + 5, 40, 15);
            // Head
            this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
            this.ctx.fillRect(x + 30, y - 2, 12, 12);
            // Beak
            this.ctx.fillRect(x + 40, y + 2, 8, 4);

            // Wing (flap animation roughly based solely on x position as lazy timer)
            this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
            if (Math.floor(Date.now() / 150) % 2 === 0) {
                this.ctx.fillRect(x + 10, y - 5, 10, 10); // Wing Up
            } else {
                this.ctx.fillRect(x + 10, y + 10, 10, 10); // Wing Down
            }
        } else {
            // Cactus
            if (this.type === 'cactusSmall') {
                // Main stem (rounded top simulation)
                this.ctx.fillRect(x + 6, y, 8, 35);
                this.ctx.fillRect(x + 7, y - 2, 6, 2); // Top cap
                // Left Arm
                this.ctx.fillRect(x, y + 10, 4, 2); // Connector
                this.ctx.fillRect(x, y + 5, 4, 10); // Arm up
                // Right Arm
                this.ctx.fillRect(x + 14, y + 15, 4, 2); // Connector
                this.ctx.fillRect(x + 16, y + 8, 4, 10); // Arm up
            } else {
                // Big Cactus
                // Main stem
                this.ctx.fillRect(x + 10, y, 12, 50);
                this.ctx.fillRect(x + 11, y - 2, 10, 2); // Cap

                // Left Arm
                this.ctx.fillRect(x, y + 20, 8, 4);
                this.ctx.fillRect(x, y + 5, 6, 20);

                // Right Arm
                this.ctx.fillRect(x + 22, y + 25, 8, 4);
                this.ctx.fillRect(x + 24, y + 10, 6, 20);

                // Texture dots
                this.ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
                this.ctx.fillRect(x + 14, y + 10, 2, 2);
                this.ctx.fillRect(x + 12, y + 30, 2, 2);
            }
        }
    }

    getHitbox() {
        return {
            x: this.x + 2,
            y: this.y + 2,
            width: this.width - 4,
            height: this.height - 4
        };
    }
}
