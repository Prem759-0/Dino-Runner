export class Layer {
    constructor(game, width, height, speedModifier, image) {
        this.game = game;
        this.width = width;
        this.height = height;
        this.speedModifier = speedModifier;
        this.image = image; // Can be an actual Image object or 'cloud' type
        this.x = 0;
        this.y = 0;
    }
    update() {
        if (this.x < -this.width) this.x = 0;
        this.x -= this.game.gameSpeed * this.speedModifier;
    }
    draw(ctx) {
        // Implement simple repetitive drawing
        if (this.image === 'cloud') {
            // Draw clouds logic managed by Background class mostly, this is a placeholder structure
            // But for simple clouds, we can just manage a list of cloud objects in Background class
        }
    }
}

export class Background {
    constructor(game) {
        this.game = game;
        this.width = 900;
        this.height = 300;
        this.clouds = [];
        this.mountains = [];
        this.stars = []; // New
        this.foreground = []; // New
        this.addCloud();
        this.cloudTimer = 0;

        // Init mountains
        for (let i = 0; i < 3; i++) {
            this.addMountain(i * 400);
        }

        // Init Stars
        for (let i = 0; i < 50; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.6,
                size: Math.random() * 2,
                alpha: Math.random(),
                twinkleSpeed: Math.random() * 0.05
            });
        }
    }

    addCloud() {
        this.clouds.push({
            x: this.width + Math.random() * 200,
            y: Math.random() * 150,
            width: 60,
            height: 30,
            speed: 0.5 + Math.random() * 0.5
        });
    }

    addMountain(offset_x) {
        const width = 300 + Math.random() * 200;
        const height = 50 + Math.random() * 80;
        const peaks = Math.floor(Math.random() * 3) + 1;

        // Pre-calculate peak points to avoid jitter
        const points = [];
        const step = width / (peaks * 2);
        for (let i = 0; i < peaks; i++) {
            // Peak
            points.push({
                x: step * (i * 2 + 1),
                y: -height + (Math.random() * 20 - 10)
            });
            // Valley
            points.push({
                x: step * (i * 2 + 2),
                y: 0
            });
        }

        this.mountains.push({
            x: offset_x,
            y: this.height - 20,
            width: width,
            height: height,
            peaks: peaks,
            points: points
        });
    }

    update() {
        // Update Clouds
        this.clouds.forEach(c => {
            c.x -= this.game.gameSpeed * c.speed;
        });
        this.clouds = this.clouds.filter(c => c.x > -100);

        this.cloudTimer++;
        if (this.cloudTimer > 100 && Math.random() < 0.02) {
            this.addCloud();
            this.cloudTimer = 0;
        }

        // Update Mountains (Parallax: Slower than ground, faster than clouds)
        this.mountains.forEach(m => {
            m.x -= this.game.gameSpeed * 0.2; // 0.2 speed factor
        });

        // Loop mountains
        if (this.mountains.length > 0 && this.mountains[0].x + this.mountains[0].width < 0) {
            this.mountains.shift();
            // Add new mountain to the end
            const lastM = this.mountains[this.mountains.length - 1];
            this.addMountain(lastM.x + lastM.width - 50); // Overlap slightly
        }

        // Update Foreground (Very fast parallax)
        this.foreground.forEach(f => {
            f.x -= this.game.gameSpeed * 1.5; // Faster than game speed
        });
        this.foreground = this.foreground.filter(f => f.x > -50);

        if (Math.random() < 0.02) { // Random spawn
            this.foreground.push({
                x: this.width + 50,
                y: this.height - 10,
                type: Math.random() > 0.5 ? 'grass' : 'rock'
            });
        }

        // Update Stars
        this.stars.forEach(s => {
            s.alpha += s.twinkleSpeed;
            if (s.alpha > 1 || s.alpha < 0) s.twinkleSpeed *= -1;
        });
    }

    draw(ctx) {
        const color = getComputedStyle(document.body).getPropertyValue('--text-color').trim();

        // Draw Stars (only if night)
        if (document.body.classList.contains('night-mode')) {
            ctx.fillStyle = "white";
            this.stars.forEach(s => {
                ctx.globalAlpha = Math.abs(s.alpha);
                ctx.fillRect(s.x, s.y, s.size, s.size);
            });
            ctx.globalAlpha = 1.0;
        }

        // Draw Mountains (Furthest back)
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2; // Faint
        this.mountains.forEach(m => {
            this.drawMountainShape(ctx, m);
        });

        // Draw Clouds
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5;
        this.clouds.forEach(c => {
            this.drawCloudShape(ctx, c.x, c.y);
        });
        ctx.globalAlpha = 1.0;
    }

    // Call this AFTER drawing everything else in Game.js
    drawForeground(ctx) {
        // Draw Foreground elements (Grass/Rocks) - blurred slightly manually? No, just dark silhouettes
        ctx.fillStyle = "#000"; // Always dark for contrast or match text color?
        // Let's match text color but darker/opaque
        const color = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
        ctx.fillStyle = color;

        this.foreground.forEach(f => {
            if (f.type === 'grass') {
                ctx.beginPath();
                ctx.moveTo(f.x, f.y);
                ctx.lineTo(f.x + 5, f.y - 15);
                ctx.lineTo(f.x + 10, f.y);
                ctx.fill();
            } else {
                // Rock
                ctx.beginPath();
                ctx.arc(f.x, f.y, 8, Math.PI, 0);
                ctx.fill();
            }
        });
    }

    drawCloudShape(ctx, x, y) {
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.arc(x + 10, y - 10, 15, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    drawMountainShape(ctx, m) {
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);

        // Use cached points
        for (const p of m.points) {
            ctx.lineTo(m.x + p.x, m.y + p.y);
        }

        ctx.lineTo(m.x + m.width, m.y);
        ctx.fill();
    }
}
