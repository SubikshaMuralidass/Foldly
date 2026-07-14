import { Scene, GameObjects, Math as PhaserMath } from 'phaser';

export class Journey extends Scene {
  private backgroundOverlay: GameObjects.Rectangle | null = null;

  private cardBg: GameObjects.Graphics | null = null;
  private cardShadow: GameObjects.Graphics | null = null;

  private titleText: GameObjects.Text | null = null;
  private streakText: GameObjects.Text | null = null;
  private pointsText: GameObjects.Text | null = null;
  private modelsCompletedText: GameObjects.Text | null = null;

  private streakTracker: {
    container: GameObjects.Container;
    nodes: GameObjects.Graphics[];
  } | null = null;

  private progressLabel: GameObjects.Text | null = null;
  private progressBarBg: GameObjects.Graphics | null = null;
  private progressBarFill: GameObjects.Graphics | null = null;
  private progressMessage: GameObjects.Text | null = null;

  private backBtnBg: GameObjects.Graphics | null = null;
  private backBtnHit: GameObjects.Rectangle | null = null;
  private backBtnIcon: GameObjects.Text | null = null;
  private backBtnText: GameObjects.Text | null = null;

  private tapToReturnText: GameObjects.Text | null = null;

  // bound at runtime in create()
  private resizeBound: (() => void) | null = null;


  constructor() {
    super('Journey');
  }

  create() {
    this.cameras.main.setBackgroundColor('#0f172a');

    // Visual only: keep internal tap-to-return behavior exactly as-is.
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

  }

  private buildUI(): void {
    // Overlay behind card for glassmorphism contrast
    if (!this.backgroundOverlay) {
      const { width, height } = this.scale;
      this.backgroundOverlay = this.add
        .rectangle(width / 2, height / 2, width, height, 0x000000, 0.15)
        .setDepth(-1);
    }

    // Card + shadow
    this.cardShadow = this.add.graphics().setDepth(2);
    this.cardBg = this.add.graphics().setDepth(3);

    // Title
    this.titleText = this.add
      .text(0, 0, '🗺️ Journey', {
        fontFamily: 'Trebuchet MS',
        fontSize: '56px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);
    this.titleText.setShadow(0, 6, '#000000', 14, true, true);

    // Stat rows
    this.streakText = this.add.text(0, 0, '🔥 Current Streak: Day 0', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#fbbf24',
    });
    this.streakText.setOrigin(0.5, 0.5);

    this.pointsText = this.add.text(0, 0, '⭐ Total Points: 0', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#e2e8f0',
    });
    this.pointsText.setOrigin(0.5, 0.5);

    this.modelsCompletedText = this.add.text(0, 0, '📜 Models Completed: 0', {
      fontFamily: 'Arial',
      fontSize: '36px',
      color: '#e2e8f0',
    });
    this.modelsCompletedText.setOrigin(0.5, 0.5);

    // Streak tracker (7 days)
    const container = this.add.container(0, 0).setDepth(4);
    const nodes: GameObjects.Graphics[] = [];
    for (let i = 0; i < 7; i++) {
      const g = this.add.graphics();
      container.add(g);
      nodes.push(g);
    }
    this.streakTracker = { container, nodes };

    // Progress bar
    this.progressLabel = this.add
      .text(0, 0, 'Progress to Next Reward', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#e2e8f0',
      })
      .setOrigin(0.5, 0);

    this.progressBarBg = this.add.graphics().setDepth(4);
    this.progressBarFill = this.add.graphics().setDepth(5);

    this.progressMessage = this.add
      .text(0, 0, 'Keep folding every day to maintain your streak!', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#cbd5e1',
        align: 'center',
      })
      .setOrigin(0.5);

    // Back button (tap anywhere still returns to menu)
    this.backBtnBg = this.add.graphics().setDepth(3);
    this.backBtnHit = this.add
      .rectangle(0, 0, 1, 1, 0xffffff, 0.001)
      .setDepth(10)
      .setInteractive({ useHandCursor: true });

    this.backBtnIcon = this.add
      .text(0, 0, '←', { fontFamily: 'Arial', fontSize: '26px', color: '#111827' })
      .setOrigin(0.5);

    this.backBtnText = this.add
      .text(0, 0, 'Back', { fontFamily: 'Arial', fontSize: '30px', color: '#111827' })
      .setOrigin(0.5);

    this.backBtnHit.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });

    // Optional: keep existing instruction text but visually subdued (tap behavior remains)
    this.tapToReturnText = this.add
      .text(0, 0, 'Tap anywhere to return', {
        fontFamily: 'Arial',
        fontSize: '22px',
        color: '#94a3b8',
      })
      .setOrigin(0.5);
  }

  private layoutUI = (): void => {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.resize(w, h);

    if (this.backgroundOverlay) {
      this.backgroundOverlay.setPosition(w / 2, h / 2).setSize(w, h);
    }

    const uiScale = Math.min(w / 1080, h / 1920);
    const centerX = w / 2;

    const cardW = PhaserMath.Clamp(w * 0.84, 320, 820);
    const cardPad = PhaserMath.Clamp(cardW * 0.06, 20, 34);
    const cardR = Math.round(22 * uiScale);

    const cardH = PhaserMath.Clamp(h * 0.72, 520, 820);
    const cardTop = h * 0.10;

    // Card
    this.cardShadow?.clear();
    this.cardShadow?.fillStyle(0x000000, 0.25);
    this.cardShadow?.fillRoundedRect(centerX - cardW / 2, cardTop + 10, cardW, cardH, cardR);

    this.cardBg?.clear();
    this.cardBg?.fillStyle(0xffffff, 0.10);
    this.cardBg?.fillRoundedRect(centerX - cardW / 2, cardTop, cardW, cardH, cardR);
    this.cardBg?.lineStyle(Math.max(1.5, 2 * uiScale), 0xe2e8f0, 0.5);
    this.cardBg?.strokeRoundedRect(centerX - cardW / 2, cardTop, cardW, cardH, cardR);

    // Section spacing 24–32px
    const spacing = PhaserMath.Clamp(30 * uiScale, 24, 32);

    // Title sizes
    const titleSize = PhaserMath.Clamp(54 * uiScale, 48, 56);
    const headingSize = PhaserMath.Clamp(30 * uiScale, 28, 32);
    const valueSize = PhaserMath.Clamp(38 * uiScale, 36, 40);
    const smallSize = PhaserMath.Clamp(22 * uiScale, 20, 24);

    // Title
    if (this.titleText) {
      this.titleText.setFontSize(`${titleSize}px`).setPosition(centerX, cardTop + cardPad);
    }

    // Values
    const statY1 = this.titleText!.y + headingSize / 2 + spacing * 0.9;
    const statY2 = statY1 + spacing * 1.15;
    const statY3 = statY2 + spacing * 1.15;

    this.streakText?.setFontSize(`${valueSize}px`).setPosition(centerX, statY1);
    this.pointsText?.setFontSize(`${valueSize}px`).setPosition(centerX, statY2);
    this.modelsCompletedText?.setFontSize(`${valueSize}px`).setPosition(centerX, statY3);

    // Streak tracker
    const trackerTop = statY3 + spacing * 1.05;
    const trackerY = trackerTop + spacing * 0.7;
    const nodeR = PhaserMath.Clamp(22 * uiScale, 16, 26);
    const nodeGap = PhaserMath.Clamp(cardW * 0.80 / 7, 18, 44);
    const trackerW = nodeGap * 6;

    if (this.streakTracker) {
      this.streakTracker.container.setPosition(centerX, trackerY);
      this.streakTracker.container.setScale(1);

      // Fake data since existing scene doesn’t have real data.
      // Day 0 is current.
      for (let i = 0; i < 7; i++) {
        const g = this.streakTracker.nodes[i];
        if (!g) continue;
        g.clear();


        const completed = i < 1;
        const current = i === 0;

        const fill = completed ? 0xfbbf24 : 0xffffff;
        const alpha = completed ? 1 : 0.25;
        const stroke = current ? 0xf59e0b : 0xe2e8f0;
        const strokeA = current ? 1 : 0.45;

        g.fillStyle(fill, alpha);
        g.fillCircle(-trackerW / 2 + i * nodeGap, 0, nodeR);
        g.lineStyle(Math.max(2, 2 * uiScale), stroke, strokeA);
        g.strokeCircle(-trackerW / 2 + i * nodeGap, 0, nodeR);

        if (current) {
          // Glow effect via outer stroke
          g.lineStyle(Math.max(2, 4 * uiScale), 0xfbbf24, 0.35);
          g.strokeCircle(-trackerW / 2 + i * nodeGap, 0, nodeR + 4 * uiScale);
        }
      }
    }

    // Progress section
    const progressLabelY = trackerY + spacing * 2.0;
    this.progressLabel?.setFontSize(`${smallSize}px`).setPosition(centerX, progressLabelY);

    const barY = progressLabelY + smallSize + spacing * 0.55;
    const barH = PhaserMath.Clamp(18 * uiScale, 14, 22);
    const barW = PhaserMath.Clamp(cardW * 0.78, 240, 660);
    const barX = centerX - barW / 2;

    this.progressBarBg?.clear();
    this.progressBarBg?.fillStyle(0xffffff, 0.12);
    this.progressBarBg?.fillRoundedRect(barX, barY, barW, barH, Math.round(barH / 2));
    this.progressBarBg?.lineStyle(Math.max(1.5, 2 * uiScale), 0xe2e8f0, 0.35);
    this.progressBarBg?.strokeRoundedRect(barX, barY, barW, barH, Math.round(barH / 2));

    const progress = 0.1; // placeholder since Journey scene currently has no dynamic logic
    const fillW = barW * progress;
    this.progressBarFill?.clear();
    this.progressBarFill?.fillStyle(0xfbbf24, 0.9);
    this.progressBarFill?.fillRoundedRect(barX, barY, fillW, barH, Math.round(barH / 2));

    // Message
    const msgY = barY + barH + spacing * 1.0;
    this.progressMessage?.setFontSize(`${smallSize}px`).setPosition(centerX, msgY);

    // Back button bottom
    const btnW = PhaserMath.Clamp(cardW * 0.78, 260, 600);
    const btnH = PhaserMath.Clamp(64 * uiScale, 56, 96);
    const btnR = Math.round(22 * uiScale);
    const btnCenterY = cardTop + cardH - cardPad - btnH;

    // Draw button
    this.backBtnBg?.clear();
    this.backBtnBg?.fillStyle(0xffffff, 0.18);
    this.backBtnBg?.fillRoundedRect(centerX - btnW / 2, btnCenterY, btnW, btnH, btnR);
    this.backBtnBg?.lineStyle(Math.max(1.5, 2 * uiScale), 0xe2e8f0, 0.55);
    this.backBtnBg?.strokeRoundedRect(centerX - btnW / 2, btnCenterY, btnW, btnH, btnR);
    this.backBtnBg?.fillStyle(0x000000, 0.20);
    this.backBtnBg?.fillRoundedRect(centerX - btnW / 2, btnCenterY + 8, btnW, btnH, btnR);

    // Hit
    this.backBtnHit?.setPosition(centerX, btnCenterY + btnH / 2).setSize(btnW, btnH);
    // Icon + text
    const iconX = centerX - btnW * 0.25;
    const iconSize = PhaserMath.Clamp(26 * uiScale, 22, 30);
    this.backBtnIcon?.setFontSize(`${iconSize}px`).setPosition(iconX, btnCenterY + btnH / 2);

    const backTextSize = PhaserMath.Clamp(32 * uiScale, 28, 40);
    this.backBtnText?.setFontSize(`${backTextSize}px`).setPosition(centerX, btnCenterY + btnH / 2);

    // Tap instruction (subtle, centered)
    const tapY = btnCenterY + btnH + spacing * 0.75;
    this.tapToReturnText?.setFontSize(`${PhaserMath.Clamp(22 * uiScale, 20, 26)}px`).setPosition(centerX, tapY);
  };
}

