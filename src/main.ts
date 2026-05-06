import { createApp } from './app';
import { loadAssets } from './assets/assets';
import { HomeScene } from './scenes/HomeScene';

async function main() {
  const app = await createApp();

  // Preload all assets before mounting the scene
  await loadAssets();

  const scene = new HomeScene(app);
  app.stage.addChild(scene);
}

main().catch(console.error);
