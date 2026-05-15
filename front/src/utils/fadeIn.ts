import { Container, Ticker } from 'pixi.js';

export function fadeIn(target: Container, ticker: Ticker, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    let elapsedMs = 0;
    target.alpha = 0;

    const onTick = (tickData: { deltaMS: number }) => {
      elapsedMs += tickData.deltaMS;
      const fadeProgress = Math.min(elapsedMs / durationMs, 1);
      target.alpha = fadeProgress;

      if (fadeProgress >= 1) {
        ticker.remove(onTick as Parameters<typeof ticker.add>[0]);
        resolve();
      }
    };

    ticker.add(onTick as Parameters<typeof ticker.add>[0]);
  });
}
