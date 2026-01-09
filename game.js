import { Dino } from './dino.js';
import { Obstacle } from './obstacle.js';
import { Background } from './background.js';
import { Particle } from './particle.js';
import { Sound } from './sound.js';
import { Star } from './star.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.sound = new Sound();

        this.config = {
            groundY: this.height - 20, // Ground level coordinate
            canvasWidth: this.width
        };

        this.input = {
            keys: {}
        };

        this.reset();
        this.setupInputs();
    }

    reset() {
        this.dino = new Dino(this.ctx, this.config, this);
        this.background = new Background(this);
        this.obstacles = [];
        this.stars = [];
        this.particles = [];
        this.gameSpeed = 5;
        this.score = 0;
        this.highScore = localStorage.getItem('dinoAdvancedHighScore') || 0;
        this.gameOver = false;
        this.playing = false;
        this.frame = 0;
        this.spawnTimer = 0;
        this.shakeTimer = 0;

        // Wind Lines
        this.windLines = [];
        for (let i = 0; i < 5; i++) {
            this.windLines.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.6,
                length: Math.random() * 50 + 20,
                speed: Math.random() * 5 + 2
            });
        }
    }

    setupInputs() {
        window.addEventListener('keydown', e => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyS') {
                this.input.keys[e.code] = true;
            }
            if (e.code === 'Space' && !this.playing && !this.gameOver) {
                this.start();
            }
            if (e.code === 'Space' && this.gameOver) {
                this.reset();
                this.start(); // Auto restart
                // Hide game over screen via callback or event (handled in script.js loop mostly)
                document.getElementById('game-over-screen').classList.add('hidden');
                document.getElementById('start-screen').classList.add('hidden');
            }
        });

        window.addEventListener('keyup', e => {
            if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyS') {
                this.input.keys[e.code] = false;
            }
        });
    }

    start() {
        this.playing = true;
        this.animate();
        document.getElementById('start-screen').classList.add('hidden');
    }

    spawnObstacles() {
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
            const types = ['cactusSmall', 'cactusBig', 'bird'];
            // Increase bird chance as speed increases
            const type = types[Math.floor(Math.random() * types.length)];

            // Only spawn birds if speed is high enough for variation
            const finalType = (type === 'bird' && this.score < 200) ? 'cactusBig' : type;

            this.obstacles.push(new Obstacle(this.ctx, this.config, finalType));

            // Randomize next spawn time based on speed
            const minGap = 60 - this.gameSpeed * 2;
            const maxGap = 120 - this.gameSpeed * 3;
            this.spawnTimer = Math.max(40, Math.random() * (maxGap - minGap) + minGap);
        }

        // Spawn Stars (Activity)
        if (Math.random() < 0.005) { // Rare spawn
            this.stars.push(new Star(this));
        }
    }

    checkCollisions() {
        const dinoBox = this.dino.getHitbox();

        // Star Collisions
        this.stars.forEach(s => {
            if (!s.markedForDeletion) {
                // Simple box collision
                if (
                    dinoBox.x < s.x + s.width &&
                    dinoBox.x + dinoBox.width > s.x &&
                    dinoBox.y < s.y + s.height &&
                    dinoBox.y + dinoBox.height > s.y
                ) {
                    s.markedForDeletion = true;
                    this.score += 50; // Bonus score
                    this.sound.playCollect();
                    // Pulse Effect
                    const scoreEl = document.getElementById('score');
                    scoreEl.style.color = "#FFD700";
                    setTimeout(() => scoreEl.style.color = "inherit", 200);
                }
            }
        });

        for (const obs of this.obstacles) {
            const obsBox = obs.getHitbox();

            if (
                dinoBox.x < obsBox.x + obsBox.width &&
                dinoBox.x + dinoBox.width > obsBox.x &&
                dinoBox.y < obsBox.y + obsBox.height &&
                dinoBox.y + dinoBox.height > obsBox.y
            ) {
                this.gameOver = true;
                this.playing = false;
                this.shakeTimer = 20; // Shake for 20 frames
                this.sound.playHit();
                this.updateHighScore();
                document.getElementById('game-over-screen').classList.remove('hidden');
            }
        }
    }

    updateHighScore() {
        if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('dinoAdvancedHighScore', this.highScore);
        }
    }

    animate() {
        // Always clear frame (and prepare gradient)
        // this.ctx.clearRect(0, 0, this.width, this.height); // Replaced by fillRect with gradient

        // Sky Gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);

        if (document.body.classList.contains('night-mode')) {
            gradient.addColorStop(0, '#0f0c29');
            gradient.addColorStop(0.5, '#302b63');
            gradient.addColorStop(1, '#24243e');
        } else {
            // Day / Sunset (Simulated by score roughly)
            // Simple day:
            gradient.addColorStop(0, '#87CEEB'); // Sky Blue
            gradient.addColorStop(1, '#E0F7FA'); // Light Cyan
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Screen Shake Logic
        this.ctx.save(); // Save default state
        if (this.shakeTimer > 0) {
            const dx = Math.random() * 10 - 5;
            const dy = Math.random() * 10 - 5;
            this.ctx.translate(dx, dy);
            this.shakeTimer--;
        }

        if (this.playing || this.gameOver) { // Keep drawing if game over (for shake)
            // ... logic continues

            // Update Global Speed
            this.gameSpeed += 0.001; // Slow acceleration

            // Spawn Objects
            this.spawnObstacles();

            // Update Entities
            this.background.update();
            this.dino.update(this.input);

            this.obstacles.forEach(o => o.update(this.gameSpeed));
            this.obstacles = this.obstacles.filter(o => !o.markedForDeletion);

            this.stars.forEach(s => s.update());
            this.stars = this.stars.filter(s => !s.markedForDeletion);

            this.particles.forEach(p => p.update());
            this.particles = this.particles.filter(p => !p.markedForDeletion);

            // Draw Entities
            // Background
            this.background.draw(this.ctx);

            // Ground Line
            this.ctx.beginPath();
            this.ctx.moveTo(0, this.config.groundY);
            this.ctx.lineTo(this.width, this.config.groundY);
            this.ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Ground Texture (Simple dots scrolling)
            const groundColor = getComputedStyle(document.body).getPropertyValue('--text-color').trim();
            this.ctx.fillStyle = groundColor;
            const groundOffset = -(this.frame * this.gameSpeed) % this.width; // Scrolling offset
            // Draw static pattern repeated 
            for (let i = 0; i < this.width; i += 50) {
                if (i % 100 === 0) this.ctx.fillRect((i + groundOffset + this.width) % this.width, this.config.groundY + 5, 4, 2);
                else this.ctx.fillRect((i + groundOffset + this.width) % this.width, this.config.groundY + 2, 2, 2);
            }

            this.obstacles.forEach(o => o.draw());
            this.stars.forEach(s => s.draw(this.ctx));
            this.dino.draw();

            this.particles.forEach(p => p.draw(this.ctx));

            // Collisions
            this.checkCollisions();

            // Score
            this.score += 0.1;
            if (Math.floor(this.score) % 100 === 0 && Math.floor(this.score) > 0 && !this.scoreSoundPlayed) {
                this.sound.playScore();
                this.scoreSoundPlayed = true;
                // Add pulse class to score
                const scoreEl = document.getElementById('score');
                scoreEl.style.transform = "scale(1.5)";
                scoreEl.style.color = "#FFD700"; // Gold
                setTimeout(() => {
                    scoreEl.style.transform = "scale(1)";
                    scoreEl.style.color = "inherit";
                }, 200);
            }
            if (Math.floor(this.score) % 100 !== 0) this.scoreSoundPlayed = false;

            // Day/Night Cycle
            if (Math.floor(this.score) % 500 === 0 && Math.floor(this.score) > 0) {
                const isNight = Math.floor(this.score / 500) % 2 !== 0;
                if (isNight) document.body.classList.add('night-mode');
                else document.body.classList.remove('night-mode');
                // Map to css class 
                if (isNight) {
                    document.body.classList.remove('light-mode');
                    document.body.style.backgroundColor = '#202124';
                } else {
                    document.body.classList.add('light-mode');
                    document.body.style.backgroundColor = '#f7f7f7';
                }
            }

            this.frame++;

            // Update UI
            document.getElementById('score').innerText = `Score: ${Math.floor(this.score)}`;
            document.getElementById('high-score').innerText = `HI: ${Math.floor(this.highScore)}`;

            // Wind Lines (Speed Effect)
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.windLines.forEach(w => {
                // Update
                w.x -= (this.gameSpeed * w.speed);
                if (w.x < -w.length) {
                    w.x = this.width + Math.random() * 200;
                    w.y = Math.random() * this.height * 0.6;
                }
                // Draw
                this.ctx.moveTo(w.x, w.y);
                this.ctx.lineTo(w.x + w.length, w.y);
            });
            this.ctx.stroke();

            // Draw Foreground (on top of everything)
            this.background.drawForeground(this.ctx);

            if (this.playing) {
                requestAnimationFrame(() => this.animate());
            } else if (this.shakeTimer > 0) {
                // Keep animating for shake even if not playing logic
                requestAnimationFrame(() => this.animate());
            }
        }
        this.ctx.restore(); // Restore from shake
    }
}
