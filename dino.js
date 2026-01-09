import { Particle } from './particle.js';

export class Dino {
    constructor(ctx, config, game) {
        this.ctx = ctx;
        this.config = config;
        this.game = game;
        this.width = 44;
        this.height = 47;
        this.x = 50;
        this.y = this.config.groundY - this.height;

        // Physics
        this.dy = 0;
        this.jumpForce = 12; // Adjusted for better feel
        this.gravity = 0.6;
        this.grounded = true;
        this.isDucking = false;

        // Animation
        this.timer = 0;
        this.runFrame = 0;
    }

    update(input) {
        // Jump
        if (input.keys['Space'] || input.keys['ArrowUp']) {
            this.jump();
        }

        // Duck
        if ((input.keys['ArrowDown'] || input.keys['KeyS']) && this.grounded) {
            this.isDucking = true;
            this.height = 30; // Shrink
        } else {
            this.isDucking = false;
            this.height = 47; // Stand up
        }

        // Apply Gravity
        this.dy += this.gravity;
        this.y += this.dy;

        // Ground Collision
        if (this.y + this.height > this.config.groundY) {
            this.y = this.config.groundY - this.height;
            this.dy = 0;
            if (!this.grounded) {
                // Landed, emit dust
                for (let i = 0; i < 5; i++) {
                    this.game.particles.push(new Particle(this.game, this.x + this.width / 2, this.y + this.height));
                }
            }
            this.grounded = true;
        } else {
            this.grounded = false;
        }

        // Running Dust
        if (this.grounded && this.runFrame === 0 && this.timer % 10 === 0) {
            this.game.particles.push(new Particle(this.game, this.x + 10, this.y + this.height));
        }

        // Animation Timer
        this.timer++;
        if (this.timer % 10 === 0) {
            this.runFrame = (this.runFrame + 1) % 2;
        }
    }

    jump() {
        if (this.grounded) {
            this.dy = -this.jumpForce;
            this.grounded = false;
            // Jump dust
            for (let i = 0; i < 3; i++) {
                this.game.particles.push(new Particle(this.game, this.x + this.width / 2, this.y + this.height));
            }
            this.game.sound.playJump();
        }
    }

    draw() {
        const color = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
        const eyeColor = getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
        const x = Math.floor(this.x);
        const y = Math.floor(this.y);

        // Shadow
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + this.width / 2, y + this.height + 2, this.width / 2, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = color;

        if (this.isDucking) {
            // Ducking Shape
            // Head
            this.ctx.fillRect(x + 40, y, 15, 10);
            this.ctx.fillRect(x + 40, y - 5, 5, 5); // Ear/Horn
            // Body
            this.ctx.fillRect(x, y + 10, 55, 15);
            // Tail
            this.ctx.fillRect(x - 5, y + 10, 5, 5);
        } else {
            // Standing Shape
            // Head
            this.ctx.fillRect(x + 20, y, 20, 15);
            this.ctx.fillRect(x + 20, y - 5, 5, 5); // Ear/Horn
            this.ctx.fillRect(x + 40, y + 8, 10, 5); // Snout
            // Body
            this.ctx.fillRect(x + 10, y + 15, 25, 20);
            this.ctx.fillRect(x, y + 15, 10, 10); // Tail
            // Arm
            this.ctx.fillRect(x + 30, y + 20, 5, 5);
        }

        // Eye
        if (this.game.gameOver) {
            // Dead Eyes (X)
            this.ctx.strokeStyle = eyeColor;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();

            let eyeX = x + 30;
            let eyeY = y + 2;
            if (this.isDucking) {
                eyeX = x + 45;
            }

            this.ctx.moveTo(eyeX - 3, eyeY - 3);
            this.ctx.lineTo(eyeX + 3, eyeY + 3);
            this.ctx.moveTo(eyeX + 3, eyeY - 3);
            this.ctx.lineTo(eyeX - 3, eyeY + 3);
            this.ctx.stroke();

        } else {
            this.ctx.fillStyle = eyeColor;
            if (this.isDucking) {
                this.ctx.fillRect(x + 45, y + 2, 2, 2);
            } else {
                this.ctx.fillRect(x + 30, y + 2, 2, 2);
            }
        }

        // Legs (animation)
        this.ctx.fillStyle = color;
        if (this.grounded) {
            if (this.runFrame === 0) {
                this.ctx.fillRect(x + 12, y + 35, 5, 5); // Left
                this.ctx.fillRect(x + 22, y + 35, 5, 2); // Right up using
            } else {
                this.ctx.fillRect(x + 12, y + 35, 5, 2); // Left up
                this.ctx.fillRect(x + 22, y + 35, 5, 5); // Right
            }
        } else {
            // Jumping pose
            this.ctx.fillRect(x + 12, y + 32, 5, 5);
            this.ctx.fillRect(x + 22, y + 35, 5, 5);
        }
    }

    getHitbox() {
        return {
            x: this.x + 5, // Tighten hitbox slightly
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }
}
