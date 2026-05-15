import { Application } from 'pixi.js';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export async function createApp(): Promise<Application> {
  const app = new Application();

  await app.init({
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: 0x1a0a00,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });

  document.body.appendChild(app.canvas);

  // Scale canvas to fit viewport while preserving aspect ratio
  function resize() {
    const scaleX = window.innerWidth / GAME_WIDTH;
    const scaleY = window.innerHeight / GAME_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const canvas = app.canvas as HTMLCanvasElement;
    canvas.style.width = `${GAME_WIDTH * scale}px`;
    canvas.style.height = `${GAME_HEIGHT * scale}px`;
    canvas.style.position = 'absolute';
    canvas.style.left = `${(window.innerWidth - GAME_WIDTH * scale) / 2}px`;
    canvas.style.top = `${(window.innerHeight - GAME_HEIGHT * scale) / 2}px`;
  }

  resize();
  window.addEventListener('resize', resize);

  return app;
}
