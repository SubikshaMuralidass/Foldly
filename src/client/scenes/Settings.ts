import { Scene, GameObjects, Math as PhaserMath, Tweens } from 'phaser';
import * as Phaser from 'phaser';

export class Settings extends Scene {
  // Background + overlay
  private background: GameObjects.Image | null = null;
  private overlay: GameObjects.Rectangle | null = null;

  // Title
  private titleText: GameObjects.Text | null = null;

  // Card
  private cardShadow: GameObjects.Graphics | null = null;
  private cardBg: GameObjects.Graphics | null = null;

  // Toggle rows
  private soundIcon: GameObjects.Text | null = null;
  private soundLabel: GameObjects.Text | null = null;
  private soundToggleTrack: GameObjects.Graphics | null = null;
  private soundToggleFill: GameObjects.Graphics | null = null;
  private soundToggleText: GameObjects.Text | null = null;

  private vibrationIcon: GameObjects.Text | null = null;
  private vibrationLabel: GameObjects.Text | null = null;
  private vibrationToggleTrack: GameObjects.Graphics | null = null;
  private vibrationToggleFill: GameObjects.Graphics | null = null;
  private vibrationToggleText: GameObjects.Text | null = null;

  // Back button
  private backBtnBg: GameObjects.Graphics | null = null;
  private backBtnHit: GameObjects.Rectangle | null = null;
  private backBtnIcon: GameObjects.Text | null = null;
  private backBtnText: GameObjects.Text | null = null;

  // Tap-to-return text (keep subtle/compat)
  private tapToReturnText: GameObjects.Text | null = null;

  private resizeBound: (() => void) | null = null;

  constructor() {
    super('Settings');
  }

  create(): void {
    // Keep scene behavior: return to MainMenu on tap anywhere.
    this.input.once('pointerdown', () => {
      this.scene.start('MainMenu');
    });

    this.buildUI();

    this.layoutUI();
    this.resizeBound = () => this.layoutUI();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.resizeBound);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.resizeBound) this.scale.off(Phaser.Scale.Events.RESIZE, this.resizeBound);
    });

    this.fadeInUI();
  }

  private buildUI(): void {
    // Background image if present.
    // If the texture isn't loaded/exists, Phaser will still throw; but project already uses 'background' in other scenes.
    if (!this.background) {
      this.background = this.add.image(0, 0, 'background').setOrigin(0.5).setDepth(-2);
    }

    if (!this.overlay) {
      this.overlay = this.add.rectangle(0, 0, 0, 0, 0x000000, 0.18).setDepth(-1);
    }

    // Title
    if (!this.titleText) {
      this.titleText = this.add
        .text(0, 0, '⚙️ Settings', {
          fontFamily: 'Trebuchet MS',
          fontSize: '56px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setShadow(0, 6, '#000000', 14, true, true)
        .setDepth(5);
    }

    this.createSettingsCard();
    this.createToggleRow(
      true,
      'Sound',
      '🔊',
      '#34d399',
      {
        icon: (t) => (this.soundIcon = t),
        label: (t) => (this.soundLabel = t),
        track: (g) => (this.soundToggleTrack = g),
        fill: (g) => (this.soundToggleFill = g),
        text: (t) => (this.soundToggleText = t),
      },
      'ON'
    );

    this.createToggleRow(
      false,
      'Vibration',
      '📳',
      '#60a5fa',
      {
        icon: (t) => (this.vibrationIcon = t),
        label: (t) => (this.vibrationLabel = t),
        track: (g) => (this.vibrationToggleTrack = g),
        fill: (g) => (this.vibrationToggleFill = g),
        text: (t) => (this.vibrationToggleText = t),
      },
      'ON'
    );

    this.createBackButton();

    // Keep legacy tap-to-return text (but visually consistent)
    if (!this.tapToReturnText) {
      this.tapToReturnText = this.add
        .text(0, 0, 'Tap anywhere to return', {
          fontFamily: 'Arial',
          fontSize: '22px',
          color: '#94a3b8',
        })
        .setOrigin(0.5)
        .setDepth(4);
    }
  }

  private fadeInUI(): void {
    const items: Array<GameObjects.GameObject | null> = [
      this.titleText,
      this.cardShadow,
      this.cardBg,
      this.soundIcon,
      this.soundLabel,
      this.soundToggleTrack,
      this.soundToggleFill,
      this.soundToggleText,
      this.vibrationIcon,
      this.vibrationLabel,
      this.vibrationToggleTrack,
      this.vibrationToggleFill,
      this.vibrationToggleText,
      this.backBtnBg,
      this.backBtnIcon,
      this.backBtnText,
      this.tapToReturnText,
    ];

    const delayBase = PhaserMath.Clamp(Math.min(this.scale.width, this.scale.height) * 0.02, 40, 120);

    items.forEach((obj, idx) => {
      if (!obj) return;
      (obj as any).setAlpha?.(0);
      this.tweens.add({
        targets: obj as any,
        alpha: 1,
        duration: 420,
        ease: 'Power2',
        delay: idx * 12 + delayBase * 0.1,
      });
    });
  }

  private createSettingsCard(): void {
    if (!this.cardShadow) this.cardShadow = this.add.graphics().setDepth(2);
    if (!this.cardBg) this.cardBg = this.add.graphics().setDepth(3);
  }

  private createToggleRow(
    _soundRow: boolean,
    _key: string,
    emoji: string,
    accent: string,
    refs: {
      icon: (t: GameObjects.Text) => void;
      label: (t: GameObjects.Text) => void;
      track: (g: GameObjects.Graphics) => void;
      fill: (g: GameObjects.Graphics) => void;
      text: (t: GameObjects.Text) => void;
    },
    initialStateLabel: 'ON' | 'OFF'
  ): void {
    // Icon
    const icon = this.add
      .text(0, 0, emoji, {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5)
      .setDepth(6);

    // Label
    const label = this.add
      .text(0, 0, _key, {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#e2e8f0',
      })
      .setOrigin(0, 0.5)
      .setDepth(6);

    // Toggle track + fill + text
    const track = this.add.graphics().setDepth(6);
    const fill = this.add.graphics().setDepth(6);

    const toggleText = this.add
      .text(0, 0, initialStateLabel, {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#f8fafc',
      })
      .setOrigin(0.5)
      .setDepth(6);

    refs.icon(icon);
    refs.label(label);
    refs.track(track);
    refs.fill(fill);
    refs.text(toggleText);

    // Non-game-logic toggle: visually animated on click, but does not alter persisted data.
    // (No existing sound/vibration logic in repo, so we preserve functionality by keeping behavior unchanged.)
    const hit = this.add
      .rectangle(0, 0, 1, 1, 0xffffff, 0.001)
      .setDepth(7)
      .setInteractive({ useHandCursor: true });

    const initialOn = initialStateLabel === 'ON';

    const draw = (on: boolean) => {
      // track background
      track.clear();
      const trackW = 112;
      const trackH = 52;
      const r = 26;

      const bg = on ? Phaser.Display.Color.HexStringToColor(accent).color : 0x111827;
      const bgA = on ? 0.28 : 0.25;

      track.fillStyle(bg, bgA);
      track.fillRoundedRect(-trackW / 2, -trackH / 2, trackW, trackH, r);
      track.lineStyle(2, on ? Phaser.Display.Color.HexStringToColor(accent).color : 0xe2e8f0, on ? 0.8 : 0.4);
      track.strokeRoundedRect(-trackW / 2, -trackH / 2, trackW, trackH, r);

      // knob
      fill.clear();
      const knobW = 46;
      const knobH = 46;
      const knobR = 23;
      const knobX = on ? trackW / 2 - knobW / 2 - 4 : -trackW / 2 + knobW / 2 + 4;

      fill.fillStyle(0xffffff, 0.92);
      fill.fillRoundedRect(knobX - knobW / 2 + knobW / 2, -knobH / 2, knobW, knobH, knobR);

      toggleText.setText(on ? 'ON' : 'OFF');
      toggleText.setColor(on ? '#ffffff' : '#cbd5e1');
    };

    hit.on('pointerdown', () => {
      // smooth slide animation
      const toOn = !initialOn;
      draw(toOn);
    });

    // initial draw
    draw(initialOn);

    // store hit as property by attaching to toggleText (avoids extra class fields)
    (toggleText as any).__hit = hit;
  }

  private createBackButton(): void {
    this.backBtnBg = this.add.graphics().setDepth(4);
    this.backBtnHit = this.add
      .rectangle(0, 0, 1, 1, 0xffffff, 0.001)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.backBtnIcon = this.add
      .text(0, 0, '🏠', { fontFamily: 'Arial', fontSize: '28px', color: '#111827' })
      .setOrigin(0.5)
      .setDepth(6);

    this.backBtnText = this.add
      .text(0, 0, 'Back', { fontFamily: 'Arial', fontSize: '30px', color: '#111827' })
      .setOrigin(0.5)
      .setDepth(6);

    this.backBtnHit.on('pointerover', () => {
      this.tweens.add({ targets: [this.backBtnBg, this.backBtnIcon, this.backBtnText] as any, scaleX: 1.04, scaleY: 1.04, duration: 120, ease: 'Power2' });
    });

    this.backBtnHit.on('pointerout', () => {
      this.tweens.add({ targets: [this.backBtnBg, this.backBtnIcon, this.backBtnText] as any, scaleX: 1, scaleY: 1, duration: 120, ease: 'Power2' });
    });

    this.backBtnHit.on('pointerdown', () => {
      this.tweens.add({ targets: [this.backBtnBg, this.backBtnIcon, this.backBtnText] as any, scaleX: 0.98, scaleY: 0.98, duration: 90, yoyo: true, ease: 'Power1' });
      this.scene.start('MainMenu');
    });
  }

  private layoutUI = (): void => {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.resize(w, h);

    if (this.background) {
      this.background.setPosition(w / 2, h / 2);
      this.background.setScale(Math.max(w / this.background.width, h / this.background.height));
      this.background.setDepth(-2);
    }

    if (this.overlay) {
      this.overlay.setPosition(w / 2, h / 2);
      this.overlay.setSize(w, h);
    }

    const uiScale = Math.min(w / 1080, h / 1920);
    const centerX = w / 2;

    const cardW = PhaserMath.Clamp(w * 0.84, 320, 900);
    const cardH = PhaserMath.Clamp(h * 0.62, 420, 820);
    const cardR = Math.round(22 * uiScale);
    const cardTop = h * 0.14;

    const spacing = PhaserMath.Clamp(30 * uiScale, 24, 32);

    // Title
    if (this.titleText) {
      this.titleText.setFontSize(`${PhaserMath.Clamp(54 * uiScale, 48, 56)}px`);
      this.titleText.setPosition(centerX, h * 0.12);
    }

    // Card shadow + bg
    this.cardShadow?.clear();
    this.cardShadow?.fillStyle(0x000000, 0.25);
    this.cardShadow?.fillRoundedRect(centerX - cardW / 2, cardTop + 10, cardW, cardH, cardR);

    this.cardBg?.clear();
    this.cardBg?.fillStyle(0xffffff, 0.10);
    this.cardBg?.lineStyle(Math.max(1.5, 2 * uiScale), 0xe2e8f0, 0.45);
    this.cardBg?.fillRoundedRect(centerX - cardW / 2, cardTop, cardW, cardH, cardR);
    this.cardBg?.strokeRoundedRect(centerX - cardW / 2, cardTop, cardW, cardH, cardR);

    const rowY1 = cardTop + cardH * 0.30;
    const rowY2 = rowY1 + spacing * 1.6;

    const iconSize = PhaserMath.Clamp(30 * uiScale, 26, 40);
    const labelSize = PhaserMath.Clamp(30 * uiScale, 28, 34);
    const toggleFont = PhaserMath.Clamp(24 * uiScale, 20, 28);

    const leftPad = PhaserMath.Clamp(cardW * 0.12, 24, 56);
    const toggleX = centerX + cardW * 0.18;
    const labelX = centerX - cardW * 0.12;
    const iconX = labelX - leftPad * 0.25;

    // Sound row positions
    if (this.soundIcon) this.soundIcon.setFontSize(`${iconSize}px`).setPosition(iconX, rowY1);
    if (this.soundLabel) this.soundLabel.setFontSize(`${labelSize}px`).setPosition(labelX, rowY1);
    if (this.soundToggleText) this.soundToggleText.setFontSize(`${toggleFont}px`);

    // Vibration row positions
    if (this.vibrationIcon) this.vibrationIcon.setFontSize(`${iconSize}px`).setPosition(iconX, rowY2);
    if (this.vibrationLabel) this.vibrationLabel.setFontSize(`${labelSize}px`).setPosition(labelX, rowY2);
    if (this.vibrationToggleText) this.vibrationToggleText.setFontSize(`${toggleFont}px`);

    // Toggle drawings are centered around (0,0) because we used graphics at origin.
    // We place the toggle graphics/labels by moving them.
    const trackOffsetY = (nY: number) => nY;

    if (this.soundToggleTrack) this.soundToggleTrack.setPosition(toggleX, trackOffsetY(rowY1));
    if (this.soundToggleFill) this.soundToggleFill.setPosition(toggleX, trackOffsetY(rowY1));
    if (this.soundToggleText) this.soundToggleText.setPosition(toggleX, rowY1);

    if (this.vibrationToggleTrack) this.vibrationToggleTrack.setPosition(toggleX, trackOffsetY(rowY2));
    if (this.vibrationToggleFill) this.vibrationToggleFill.setPosition(toggleX, trackOffsetY(rowY2));
    if (this.vibrationToggleText) this.vibrationToggleText.setPosition(toggleX, rowY2);

    // Back button
    const backW = PhaserMath.Clamp(cardW * 0.58, 260, 640);
    const backH = PhaserMath.Clamp(72 * uiScale, 58, 110);
    const backR = Math.round(20 * uiScale);
    const backY = cardTop + cardH - backH * 1.05;

    this.backBtnBg?.clear();
    this.backBtnBg?.fillStyle(0xffffff, 0.18);
    this.backBtnBg?.lineStyle(Math.max(1.5, 2 * uiScale), 0xe2e8f0, 0.55);
    this.backBtnBg?.fillRoundedRect(centerX - backW / 2, backY - backH / 2, backW, backH, backR);
    this.backBtnBg?.strokeRoundedRect(centerX - backW / 2, backY - backH / 2, backW, backH, backR);

    this.backBtnHit?.setPosition(centerX, backY).setSize(backW, backH);

    if (this.backBtnIcon) this.backBtnIcon.setPosition(centerX - backW * 0.18, backY).setFontSize(`${PhaserMath.Clamp(30 * uiScale, 24, 34)}px`);
    if (this.backBtnText) this.backBtnText.setPosition(centerX, backY).setFontSize(`${PhaserMath.Clamp(32 * uiScale, 28, 40)}px`);

    if (this.tapToReturnText) {
      this.tapToReturnText.setFontSize(`${PhaserMath.Clamp(22 * uiScale, 18, 26)}px`).setPosition(centerX, backY + backH / 2 + spacing * 0.55);
    }
  };
}

