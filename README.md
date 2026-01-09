# Advanced Dino Runner

An enhanced version of the classic Chrome Dino game, built with vanilla HTML5 Canvas and JavaScript.

## Features

- **Modular Codebase**: Split into ES6 modules for better maintainability.
- **Enhanced Visuals**:
  - Custom pixel-art sprites for Dino, Cacti, and Birds.
  - Parallax scrolling background (Mountains, Clouds, Ground, Foreground).
  - Dynamic Day/Night cycle with gradient sky and twinkling stars.
  - Particle effects for running and jumping.
  - "Juice" effects: Screen shake on impact, wind lines, and score pulse.
- **Improved Gameplay**:
  - Ducking mechanic (Down Arrow).
  - Collectible Golden Stars for bonus points.
  - Procedural Sound Effects (Web Audio API).
  - Progressive difficulty.

## How to Play

1. Open `index.html` in a web browser.
2. Press **Space** or **Up Arrow** to Jump.
3. Press **Down Arrow** to Duck.
4. Avoid Obstacles (Cacti, Birds).
5. Collect **Stars** for bonus points!

## Development

To run locally without CORS issues (due to ES6 modules), serve the directory with a local server:

```bash
npx http-server .
```
## Credits

Created by [Prem759-0](https://github.com/Prem759-0).
