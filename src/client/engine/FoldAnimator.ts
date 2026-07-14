export class FoldAnimator {
  animateFold(scene: Phaser.Scene, onUpdate: (progress: number) => void, fromProgress: number = 0): Promise<void> {
    return new Promise((resolve) => {
      const state = { progress: fromProgress };

      scene.tweens.add({
        targets: state,
        progress: 1,
        duration: 380,
        ease: 'Sine.easeInOut',
        onUpdate: () => {
          onUpdate(state.progress);
        },
        onComplete: () => {
          onUpdate(1);
          resolve();
        },
      });
    });
  }
}

export const foldAnimator = new FoldAnimator();