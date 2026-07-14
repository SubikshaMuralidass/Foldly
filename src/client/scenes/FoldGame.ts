import Phaser, { GameObjects, Scene } from 'phaser';
import { GameSession } from '../../shared/session';
import { modelManager } from '../managers/ModelManager';
import { paperManager } from '../managers/PaperManager';
import { OrigamiModel } from '../../shared/origami';

type StepData = {
  id: number;
  instruction: string;
};

export class FoldGame extends Scene {
  private session: GameSession | null = null;

  private model: OrigamiModel | null = null;
  private steps: StepData[] = [];
  private currentStepIndex = 0;
  private paperId: string | null = null;
  private paperName = '';

  // Background + UI
  private background: GameObjects.Image | null = null;
  private overlay: GameObjects.Rectangle | null = null;

  private modelNameText: GameObjects.Text | null = null;
  private paperNameText: GameObjects.Text | null = null;
  private stepText: GameObjects.Text | null = null;
  private instructionText: GameObjects.Text | null = null;
  private foldHintText: GameObjects.Text | null = null;
  private completionText: GameObjects.Text | null = null;

  // PNG paper
  private paperImage: GameObjects.Image | null = null;

  // Interaction + state
  private isFolding = false;
  private dragStarted = false;
  private dragPointerId: number | null = null;

  // Animation state
  private targetBaseScale = 1;
  private idleStarted = false;
  private currentFoldTween?: Phaser.Tweens.Tween;

  private resizeHandler?: () => void;

  constructor() {
    super('FoldGame');
  }

  init(data: { session: GameSession }): void {
    this.session = data.session;
  }

  create(): void {
    void this.loadSession();
  }

  private async loadSession(): Promise<void> {
    this.createUI();

    if (!this.session) {
      this.showError('Invalid Session');
      return;
    }

    const { modelId, paperId } = this.session;
    this.paperId = paperId;

    try {
      this.model = await modelManager.getModel(modelId);
      this.steps = (this.model.steps ?? []).map((s) => ({
        id: s.id,
        instruction: s.instruction,
      }));
      this.currentStepIndex = 0;

      const paper = await paperManager.getPaper(paperId);
      this.paperName = paper.name;

      this.createPaperImage();
      this.updateStepUI();
      this.layoutUI();

      this.resizeHandler = () => this.layoutUI();
      this.scale.on('resize', this.resizeHandler);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        if (this.resizeHandler) this.scale.off('resize', this.resizeHandler);
      });
    } catch (e) {
      console.error(e);
      this.showError('Failed to load model');
    }
  }

  private showError(message: string): void {
    if (!this.completionText) return;
    this.completionText.setText(message);
    this.completionText.setVisible(true);
    this.input.enabled = false;
  }

  private createUI(): void {
    const { width, height } = this.scale;

    // Background (same key used by other scenes)
    if (!this.background) {
      this.background = this.add.image(width / 2, height / 2, 'background').setDepth(-2);
    }

    if (!this.overlay) {
      this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.18).setDepth(-1);
    }

    const uiScale = Math.min(width / 1024, height / 768);
    const titleSize = Phaser.Math.Clamp(42 * uiScale, 22, 54);
    const metaSize = Phaser.Math.Clamp(22 * uiScale, 14, 28);
    const bodySize = Phaser.Math.Clamp(20 * uiScale, 14, 26);
    const hintSize = Phaser.Math.Clamp(18 * uiScale, 14, 24);

    if (!this.modelNameText) {
      this.modelNameText = this.add
        .text(0, 0, '', {
          fontFamily: 'Arial Black',
          fontSize: `${metaSize}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 6,
        })
        .setOrigin(0.5);
    }

    if (!this.paperNameText) {
      this.paperNameText = this.add
        .text(0, 0, '', {
          fontFamily: 'Arial',
          fontSize: `${metaSize}px`,
          color: '#e2e8f0',
        })
        .setOrigin(0.5);
    }

    if (!this.stepText) {
      this.stepText = this.add
        .text(0, 0, '', {
          fontFamily: 'Trebuchet MS',
          fontSize: `${titleSize}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 5,
        })
        .setOrigin(0.5);
    }

    if (!this.instructionText) {
      this.instructionText = this.add
        .text(0, 0, '', {
          fontFamily: 'Arial',
          fontSize: `${bodySize}px`,
          color: '#f8fafc',
          align: 'center',
          wordWrap: { width: 600 },
        })
        .setOrigin(0.5);
    }

    if (!this.foldHintText) {
      this.foldHintText = this.add
        .text(0, 0, 'Drag on the paper to fold', {
          fontFamily: 'Arial',
          fontSize: `${hintSize}px`,
          color: '#e2e8f0',
        })
        .setOrigin(0.5);
    }

    if (!this.completionText) {
      this.completionText = this.add
        .text(width / 2, height / 2, '', {
          fontFamily: 'Arial Black',
          fontSize: '64px',
          color: '#ffffff',
        })
        .setOrigin(0.5)
        .setDepth(20)
        .setVisible(false);
    }

    // Ensure overlay UI is above overlay
    this.background?.setDepth(-2);
    this.overlay?.setDepth(-1);

  }

  private createPaperImage(): void {
    if (!this.steps.length) return;

    if (this.paperImage) {
      this.paperImage.destroy();
      this.paperImage = null;
    }

    const stepKey = this.getStepTextureKey(this.currentStepIndex);
    this.paperImage = this.add.image(this.scale.width / 2, this.scale.height / 2, stepKey).setDepth(2);

    this.paperImage.setInteractive({ useHandCursor: true });
    this.paperImage.setRotation(0);
    this.paperImage.setAlpha(1);

    // Drag interaction: move/rotate slightly during drag (image-based only)
    this.paperImage.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isFolding) return;
      if (!this.paperImage) return;

      this.dragStarted = true;
      this.dragPointerId = pointer.id;

      // Freeze any idle tween effects
      this.currentFoldTween?.stop();

      this.paperImage.setAlpha(0.95);
    });

    this.paperImage.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isFolding) return;
      if (!this.paperImage) return;
      if (!this.dragStarted) return;
      if (this.dragPointerId !== pointer.id) return;

      // Subtle translation towards pointer; keep centered/layout-driven otherwise
      const dx = pointer.x - this.paperImage.x;
      const dy = pointer.y - this.paperImage.y;
      const max = 24;
      const mx = Phaser.Math.Clamp(dx, -max, max);
      const my = Phaser.Math.Clamp(dy, -max, max);

      this.paperImage.setPosition(this.paperImage.x + mx * 0.02, this.paperImage.y + my * 0.02);

      // NO polygon/engine; only small visual rotation.
      const rot = Phaser.Math.Clamp(mx * 0.002, -0.08, 0.08);
      this.paperImage.setRotation(rot);
    });

    const release = () => {
      if (this.isFolding) return;
      if (!this.dragStarted) return;

      this.dragStarted = false;
      this.dragPointerId = null;
      void this.completeFold();
    };

    this.paperImage.on('pointerup', release);
    this.paperImage.on('pointerupoutside', release);

    // Layout will set responsive scale/position
  }

  private getStepTextureKey(index: number): string {
    return `boat-step-${index}`;
  }

  private async completeFold(): Promise<void> {
    if (this.isFolding) return;
    if (!this.paperImage) return;
    if (!this.steps.length) return;

    const lastIndex = this.steps.length - 1;
    if (this.currentStepIndex >= lastIndex) {
      this.showCompletionAndExit();
      return;
    }

    this.isFolding = true;

    // Switch texture from X -> X+1 (during tween)
    const fromKey = this.getStepTextureKey(this.currentStepIndex);
    const toKey = this.getStepTextureKey(this.currentStepIndex + 1);

    this.paperImage.setTexture(fromKey);

    const img = this.paperImage;
    const baseScale = this.targetBaseScale || img.scaleX || 1;

    // Short fold animation: scale + slight rotation
    const foldRot = -Phaser.Math.DegToRad(5);

    // Stop idle movement
    this.currentFoldTween?.stop();

    this.currentFoldTween = this.tweens.add({
      targets: img,
      scale: baseScale * 1.06,
      rotation: foldRot,
      x: img.x + 6,
      y: img.y + 4,
      alpha: 0.9,
      duration: 140,
      ease: 'Cubic.easeOut',
      yoyo: true,
      onYoyo: () => {
        // After fold motion midpoint, ensure texture switches
      },
      onComplete: () => {
        // Restore rotation, alpha and position near center (layoutUI keeps it centered)
        img.setRotation(0);
        img.setAlpha(1);
        this.layoutUI();
      },
    });

    // Switch texture slightly after motion starts
    this.time.delayedCall(90, () => {
      img.setTexture(toKey);
    });

    // Finish step
    this.time.delayedCall(220, () => {
      this.currentStepIndex += 1;
      this.updateStepUI();
      this.isFolding = false;

      if (this.currentStepIndex >= lastIndex) {
        this.showCompletionAndExit();
      }

      // Small UI/visual bounce after PNG switch
      const bounceTween = this.tweens.add({
        targets: img,
        scale: baseScale * 1.02,
        duration: 90,
        ease: 'Back.Out',
        yoyo: true,
        repeat: 0,
      });
      bounceTween.on('complete', () => {
        bounceTween.stop();
      });
    });
  }

  private showCompletionAndExit(): void {
    if (!this.completionText) return;

    this.completionText.setText('Boat Completed!');
    this.completionText.setVisible(true);

    // disable interaction during completion
    this.input.enabled = false;

    this.tweens.add({
      targets: this.completionText,
      scale: 1.06,
      duration: 180,
      ease: 'Back.Out',
      yoyo: true,
      repeat: 0,
    });

    this.time.delayedCall(1050, () => {
      this.scene.start('Result');
    });
  }

  private updateStepUI(): void {
    const modelName = this.model?.name ?? 'Boat';
    const paperName = this.paperName || this.paperId || 'Paper';

    if (this.modelNameText) this.modelNameText.setText(modelName);
    if (this.paperNameText) this.paperNameText.setText(paperName);

    const totalSteps = this.steps.length;
    const current = this.steps[this.currentStepIndex];

    if (this.stepText) this.stepText.setText(`Step ${this.currentStepIndex + 1} / ${totalSteps}`);
    if (this.instructionText) this.instructionText.setText(current?.instruction ?? '');

    if (this.foldHintText) {
      const last = this.currentStepIndex >= totalSteps - 1;
      this.foldHintText.setText(last ? 'Done!' : 'Drag on the paper to fold');
    }

    // Ensure PNG matches current step
    if (this.paperImage) {
      const key = this.getStepTextureKey(this.currentStepIndex);
      if (this.paperImage.texture?.key !== key) {
        this.paperImage.setTexture(key);
      }
    }
  }

  private layoutUI(): void {
    const { width, height } = this.scale;

    this.cameras.resize(width, height);

    if (this.background) {
      this.background.setPosition(width / 2, height / 2);
      const bgScale = Math.max(width / this.background.width, height / this.background.height);
      this.background.setScale(bgScale);
      this.background.setDepth(-2);
    }

    if (this.overlay) {
      this.overlay.setPosition(width / 2, height / 2);
      this.overlay.setSize(width, height);
      this.overlay.setDepth(-1);
    }

    const uiScale = Math.min(width / 1024, height / 768);

    const topPad = Math.round(18 * uiScale);
    const titleX = width / 2;

    const metaSize = Phaser.Math.Clamp(22 * uiScale, 14, 28);
    const stepSize = Phaser.Math.Clamp(42 * uiScale, 22, 54);
    const bodySize = Phaser.Math.Clamp(20 * uiScale, 14, 26);
    const hintSize = Phaser.Math.Clamp(18 * uiScale, 14, 24);

    if (this.modelNameText) {
      this.modelNameText.setFontSize(`${metaSize}px`);
      this.modelNameText.setPosition(titleX, topPad + 8);
    }

    if (this.paperNameText) {
      this.paperNameText.setFontSize(`${metaSize}px`);
      this.paperNameText.setPosition(titleX, topPad + 8 + 30 * uiScale);
    }

    if (this.stepText) {
      this.stepText.setFontSize(`${stepSize}px`);
      this.stepText.setPosition(titleX, topPad + 8 + 58 * uiScale);
    }

    const instructionTop = topPad + 8 + 100 * uiScale;

    if (this.instructionText) {
      this.instructionText.setFontSize(`${bodySize}px`);
      this.instructionText.setPosition(titleX, instructionTop);
      this.instructionText.setWordWrapWidth(Phaser.Math.Clamp(width * 0.84, 280, 900));
    }

    if (this.foldHintText) {
      this.foldHintText.setFontSize(`${hintSize}px`);
      this.foldHintText.setPosition(titleX, height - (topPad + 58 * uiScale));
    }

    if (this.completionText) {
      this.completionText.setFontSize(`${Phaser.Math.Clamp(64 * uiScale, 36, 80)}px`);
      this.completionText.setPosition(width / 2, height / 2);
    }

    // Responsive centered paper PNG
    if (!this.paperImage) return;

    const topOccupied = instructionTop + 80 * uiScale;
    const bottomOccupied = height - (topPad + 70 * uiScale);
    const availableH = Math.max(120, bottomOccupied - topOccupied);
    const availableW = Math.max(120, width * 0.86);

    const texW = this.paperImage.width || 1;
    const texH = this.paperImage.height || 1;

    const scale = Math.min(availableW / texW, availableH / texH);
    this.targetBaseScale = scale;

    this.paperImage.setScale(scale);
    this.paperImage.setRotation(0);
    this.paperImage.setPosition(width / 2, topOccupied + availableH / 2);
  }
}

