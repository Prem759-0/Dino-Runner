import { Game } from './game.js';

window.addEventListener('load', () => {
    const canvas = document.getElementById('game-canvas');
    // Set actual canvas size to match resolution
    canvas.width = 900;
    canvas.height = 300;

    const game = new Game(canvas);

    console.log("Advanced Dino Game Initialized");
});
