import { Scene, GameObjects, Math as PhaserMath } from 'phaser';
import * as Phaser from 'phaser';

export class Result extends Scene {
  // Background + overlay
  private background: GameObjects.Image | null = null;
  private overlay: GameObjects.Rectangle | null = null;

  // Headings
  private titleText: GameObjects.Text | null = null;
  private subtitleText: GameObjects.Text | null = null;


  // Reward panel
  private rewardPanel: GameObjects.Graphics | null = null;
  private rewardText: GameObjects.Text | null = null;

  // Buttons
  private foldBtnBg: GameObjects.Graphics | null = null;
  private foldBtnHit: GameObjects.Rectangle | null = null;
  private foldBtnIcon: GameObjects.Text | null = null;
  private foldBtnText: GameObjects.Text | null = null;

  private menuBtnBg: GameObjects.Graphics | null = null;
  private menuBtnHit: GameObjects.Rectangle | null = null;
  private menuBtnIcon: GameObjects.Text | null = null;
  private menuBtnText: GameObjects.Text | null = null;

  private readonly hoverScale = 1.05;

  private foldBtnHoverTween?: Phaser.Tweens.Tween;
  private foldBtnClickTween?: Phaser.Tweens.Tween;
  private menuBtnHoverTween?: Phaser.Tweens.Tween;
  private menuBtnClickTween?: Phaser.Tweens.Tween;

  constructor() {
    super('Result');
  }

  create(): void {
    this.layoutUI();

    this.scale.on(Phaser.Scale.Events.RESIZE, this.layoutUI, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.layoutUI, this);
    });

    this.playFadeIn();
  }

  private playFadeIn(): void {
    const items: Array<GameObjects.GameObject | null> = [
      this.titleText,
      this.rewardPanel,
      this.rewardText,
      this.foldBtnBg,
      this.foldBtnIcon,
      this.foldBtnText,
      this.menuBtnBg,
      this.menuBtnIcon,
      this.menuBtnText,
    ];

    const delayBase = PhaserMath.Clamp(Math.min(this.scale.width, this.scale.height) * 0.03, 60, 120);

    items.forEach((obj, idx) => {
      if (!obj) return;
      (obj as any).setAlpha?.(0);
      this.tweens.add({ targets: obj as any, alpha: 1, duration: 420, ease: 'Power2', delay: delayBase * Math.min(idx, 5) });
    });
  }

  private layoutUI = (): void => {
    const width = this.scale.width;
    const height = this.scale.height;

    this.cameras.resize(width, height);

    // Background (shared)
    if (!this.background) {
      this.background = this.add.image(width / 2, height / 2, 'background').setDepth(-2);
    }
    this.background.setPosition(width / 2, height / 2);
    this.background.setScale(Math.max(width / this.background.width, height / this.background.height));

    // Overlay (shared)
    if (!this.overlay) {
      this.overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.18).setDepth(-1);
    }
    this.overlay.setPosition(width / 2, height / 2).setSize(width, height);

    const uiScale = Math.min(width / 1080, height / 1920);
    const centerX = width / 2;

    // Consistent 24–32px section spacing
    const spacing = PhaserMath.Clamp(30 * uiScale, 24, 32);

    const safeTop = height * 0.07;
    const safeBottom = height * 0.94;

    // Typography
    const titleSize = PhaserMath.Clamp(54 * uiScale, 48, 56);
    const subtitleSize = PhaserMath.Clamp(28 * uiScale, 26, 32);
    const rewardTextSize = PhaserMath.Clamp(26 * uiScale, 24, 28);
    const buttonTextSize = PhaserMath.Clamp(30 * uiScale, 28, 32);

    // Square preview card
    const previewSide = PhaserMath.Clamp(height * 0.24, 170, 320);
    const previewRadius = Math.round(previewSide * 0.18);
    const previewPadding = PhaserMath.Clamp(previewSide * 0.12, 18, 36);
    const boatMaxSize = previewSide - previewPadding * 2;

    // Buttons
    const buttonW = PhaserMath.Clamp(width * 0.62, 280, 560);
    const buttonH = PhaserMath.Clamp(height * 0.09, 64, 96);
    const buttonRadius = Math.round(buttonH * 0.22);

    // --- Title ---
    if (!this.titleText) {
      this.titleText = this.add
        .text(0, 0, '🎉 Congratulations!', {
          fontFamily: 'Trebuchet MS',
          fontSize: `${titleSize}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setDepth(5);
      this.titleText.setShadow(0, 6, '#000000', 14, true, true);
    }
    this.titleText.setFontFamily('Trebuchet MS').setFontSize(titleSize).setPosition(centerX, safeTop);

    // --- Subtitle ---
    if (!this.subtitleText) {
      this.subtitleText = this.add
        .text(0, 0, 'Boat Completed!', {
          fontFamily: 'Arial',
          fontSize: `${subtitleSize}px`,
          color: '#f8fafc',
          stroke: '#000000',
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setDepth(5);
      this.subtitleText.setShadow(0, 4, '#000000', 10, true, true);
    }
    this.subtitleText.setFontFamily('Arial').setFontSize(subtitleSize);
    this.subtitleText.setPosition(centerX, this.titleText.y + this.titleText.height / 2 + this.subtitleText.height / 2 + spacing);


    // --- Reward panel ---
    const rewardTop =
        this.subtitleText.y +
        this.subtitleText.height / 2 +
        spacing;
    const rewardH = PhaserMath.Clamp(height * 0.11, 76, 128);

    if (!this.rewardPanel) this.rewardPanel = this.add.graphics().setDepth(4);
    if (!this.rewardText) {
      this.rewardText = this.add
        .text(0, 0, '⭐ +25 Points\n🔥 Streak Increased', {
          fontFamily: 'Arial',
          fontSize: `${rewardTextSize}px`,
          color: '#f8fafc',
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(6);
    }
    this.rewardText.setFontFamily('Arial').setFontSize(rewardTextSize);

    const rewardX = centerX - buttonW / 2;
    this.drawGlassRect(this.rewardPanel, rewardX, rewardTop, buttonW, rewardH, buttonRadius, 0xffffff, 0.15, 0xe2e8f0, 0.35);
    this.rewardText.setPosition(centerX, rewardTop + rewardH / 2);

    // --- Buttons (equal width/height/margins) ---
    const foldCenterY = rewardTop + rewardH + spacing + buttonH / 2;
    const menuCenterY = foldCenterY + spacing + buttonH;

    this.drawButton('fold', {
      bg: this.foldBtnBg,
      hit: this.foldBtnHit,
      icon: this.foldBtnIcon,
      text: this.foldBtnText,
      set: (b, h, i, t) => {
        this.foldBtnBg = b;
        this.foldBtnHit = h;
        this.foldBtnIcon = i;
        this.foldBtnText = t;
      },
      centerX,
      centerY: foldCenterY,
      w: buttonW,
      h: buttonH,
      r: buttonRadius,
      iconText: '↻',
      label: 'Fold Again',
      onClick: () => this.scene.start('LevelSelect'),
      buttonTextSize,
    });

    this.drawButton('menu', {
      bg: this.menuBtnBg,
      hit: this.menuBtnHit,
      icon: this.menuBtnIcon,
      text: this.menuBtnText,
      set: (b, h, i, t) => {
        this.menuBtnBg = b;
        this.menuBtnHit = h;
        this.menuBtnIcon = i;
        this.menuBtnText = t;
      },
      centerX,
      centerY: menuCenterY,
      w: buttonW,
      h: buttonH,
      r: buttonRadius,
      iconText: '🏠',
      label: 'Main Menu',
      onClick: () => this.scene.start('MainMenu'),
      buttonTextSize,
    });

    // Prevent overlap (shift stack up if needed)
    const stackBottom = menuCenterY + buttonH / 2;
    if (stackBottom > safeBottom) {
      const delta = stackBottom - safeBottom;
      this.shiftStackUp(delta);
    }
 
  };

  private shiftStackUp(delta: number): void {
    const dy = -delta;
    if (this.subtitleText) this.subtitleText.y += dy;
    if (this.titleText) this.titleText.y += dy;
    if (this.rewardPanel) (this.rewardPanel as any).y += dy;
    if (this.rewardText) this.rewardText.y += dy;
    if (this.foldBtnHit) this.foldBtnHit.y += dy;
    if (this.menuBtnHit) this.menuBtnHit.y += dy;
    if (this.foldBtnIcon) this.foldBtnIcon.y += dy;
    if (this.foldBtnText) this.foldBtnText.y += dy;
    if (this.menuBtnIcon) this.menuBtnIcon.y += dy;
    if (this.menuBtnText) this.menuBtnText.y += dy;
    if (this.foldBtnBg) (this.foldBtnBg as any).y += dy;
    if (this.menuBtnBg) (this.menuBtnBg as any).y += dy;
  }


  private drawGlassRect(
    g: GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fillColor: number,
    fillAlpha: number,
    strokeColor?: number,
    strokeAlpha?: number
  ): void {
    g.clear();
    g.fillStyle(fillColor, fillAlpha);
    g.fillRoundedRect(x, y, w, h, r);
    if (strokeColor !== undefined && strokeAlpha !== undefined) {
      g.lineStyle(Math.max(1.5, Math.round(r * 0.12)), strokeColor, strokeAlpha);
      g.strokeRoundedRect(x, y, w, h, r);
    }
  }

  private drawButton(
    key: 'fold' | 'menu',
    params: {
      bg: GameObjects.Graphics | null;
      hit: GameObjects.Rectangle | null;
      icon: GameObjects.Text | null;
      text: GameObjects.Text | null;
      set: (bg: GameObjects.Graphics, hit: GameObjects.Rectangle, icon: GameObjects.Text, text: GameObjects.Text) => void;
      centerX: number;
      centerY: number;
      w: number;
      h: number;
      r: number;
      iconText: string;
      label: string;
      onClick: () => void;
      buttonTextSize: number;
    }
  ): void {
    const { centerX, centerY, w, h, r, iconText, label, onClick, buttonTextSize } = params;

    const x = centerX - w / 2;
    const y = centerY - h / 2;

    let bg = params.bg;
    let hit = params.hit;
    let icon = params.icon;
    let text = params.text;

    if (!bg) bg = this.add.graphics().setDepth(4);
    if (!hit) hit = this.add.rectangle(0, 0, w, h, 0xffffff, 0.001).setDepth(6).setInteractive({ useHandCursor: true });
    if (!icon) icon = this.add.text(0, 0, iconText, { fontFamily: 'Arial', color: '#111827' }).setOrigin(0.5).setDepth(7);
    if (!text)
      text = this.add.text(0, 0, label, { fontFamily: 'Arial', color: '#111827' }).setOrigin(0.5).setDepth(7);

    params.set(bg, hit, icon, text);

    // Draw button (shadow + glass + border)
    bg.clear();
    bg.fillStyle(0x000000, 0.25);
    bg.fillRoundedRect(x, y + 6, w, h, r);

    bg.fillStyle(0xffffff, 0.18);
    bg.fillRoundedRect(x, y, w, h, r);

    bg.lineStyle(Math.max(1.5, Math.round(r * 0.12)), 0xe2e8f0, 0.6);
    bg.strokeRoundedRect(x, y, w, h, r);

    // Layout: icon left, text centered
    const iconSize = Math.floor(h * 0.42);
    const textSize = Math.floor(buttonTextSize);

    icon.setText(iconText);
    icon.setFontFamily('Arial').setFontSize(iconSize);
    icon.setPosition(x + w * 0.22, centerY);

    text.setText(label);
    text.setFontFamily('Arial').setFontSize(textSize);
    text.setPosition(centerX, centerY);

    // Hit area
    hit.setPosition(centerX, centerY).setSize(w, h);

    // Events once
    if (!(hit as any).__resultBtnBound) {
      (hit as any).__resultBtnBound = true;

      hit.on('pointerover', () => {
        this.tweens.killTweensOf(bg!);
        this.tweens.killTweensOf(text!);
        this.tweens.killTweensOf(icon!);

        const targets = [bg, text, icon] as any;
        if (key === 'fold') {
          this.foldBtnHoverTween = this.tweens.add({ targets, scaleX: this.hoverScale, scaleY: this.hoverScale, duration: 120, ease: 'Power2' });
        } else {
          this.menuBtnHoverTween = this.tweens.add({ targets, scaleX: this.hoverScale, scaleY: this.hoverScale, duration: 120, ease: 'Power2' });
        }
      });

      hit.on('pointerout', () => {
        this.tweens.killTweensOf(bg!);
        this.tweens.killTweensOf(text!);
        this.tweens.killTweensOf(icon!);

        const targets = [bg, text, icon] as any;
        if (key === 'fold') {
          this.foldBtnHoverTween = this.tweens.add({ targets, scaleX: 1, scaleY: 1, duration: 120, ease: 'Power2' });
        } else {
          this.menuBtnHoverTween = this.tweens.add({ targets, scaleX: 1, scaleY: 1, duration: 120, ease: 'Power2' });
        }
      });

      hit.on('pointerdown', () => {
        this.tweens.killTweensOf(bg!);
        this.tweens.killTweensOf(text!);
        this.tweens.killTweensOf(icon!);

        const targets = [bg, text, icon] as any;
        const tween = this.tweens.add({
          targets,
          scaleX: 0.98,
          scaleY: 0.98,
          duration: 90,
          yoyo: true,
          ease: 'Power1',
          onComplete: () => onClick(),
        });

        if (key === 'fold') this.foldBtnClickTween = tween;
        else this.menuBtnClickTween = tween;
      });
    }
  }
}

