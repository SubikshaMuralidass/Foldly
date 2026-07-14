import Phaser, { Scene, GameObjects } from 'phaser';
import { OrigamiModelSummary } from '../../shared/origami';
import { modelManager } from '../managers/ModelManager';

type LoadState = 'loading' | 'ready' | 'error';

type LevelCard = {
  model: OrigamiModelSummary;
  container: GameObjects.Container;
  background: GameObjects.Rectangle;
  nameText: GameObjects.Text;
  difficultyText: GameObjects.Text;
  timeText: GameObjects.Text;
  lockText: GameObjects.Text;
  baseY: number;
};

export class LevelSelect extends Scene {
  private background: GameObjects.Image | null = null;
  private overlay: GameObjects.Rectangle | null = null;
  private title: GameObjects.Text | null = null;
  private statusText: GameObjects.Text | null = null;
  private streakText: GameObjects.Text | null = null;
  private cards: LevelCard[] = [];
  private models: OrigamiModelSummary[] = [];
  private loadState: LoadState = 'loading';
  private readonly currentStreak = 0;
  private readonly currentPoints = 30;

  constructor() {
    super('LevelSelect');
  }

  init(): void {
    this.scale.off('resize', this.handleResize, this);

    this.background = null;
    this.overlay = null;
    this.title = null;
    this.statusText = null;
    this.streakText = null;
    this.cards = [];
    this.models = [];
    this.loadState = 'loading';
  }

  create(): void {
    this.refreshBackground();
    this.refreshHeader();
    this.refreshStatus();
    this.layoutCards();

    this.scale.on('resize', this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.onShutdown, this);

    void this.loadModels();
  }

  private onShutdown(): void {
    this.scale.off('resize', this.handleResize, this);
  }

  private handleResize(): void {
    this.refreshBackground();
    this.refreshHeader();
    this.refreshStatus();
    this.layoutCards();
  }

  private async loadModels(): Promise<void> {
    try {
      this.models = await modelManager.getModels();
      this.loadState = 'ready';
      this.createCards();
      this.layoutCards();
      this.playCardEntranceAnimation();
    } catch (error) {
      console.error(error);
      this.models = [];
      this.loadState = 'error';
      this.clearCards();
    }

    this.refreshStatus();
  }

  private refreshBackground(): void {
    const { width, height } = this.scale;

    //this.cameras.resize(width, height);

    if (!this.background) {
      this.background = this.add.image(0, 0, 'background').setOrigin(0.5).setDepth(-2);
    }

    const bg = this.background;
    bg.setPosition(width / 2, height / 2);

    const bgScale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(bgScale);

    if (!this.overlay) {
      // Darken background, but keep cards bright/legible
      this.overlay = this.add.rectangle(0, 0, 0, 0, 0x000000, 0.12);
    }


    this.overlay
      .setPosition(width / 2, height / 2)
      .setSize(width, height)
      .setDepth(-1);
  }

  private refreshHeader(): void {
    const { width, height } = this.scale;
    const uiScale = Math.min(width / 1080, height / 1920);
    const titleSize = Phaser.Math.Clamp(54 * uiScale, 28, 60);
    const subtitleSize = Phaser.Math.Clamp(20 * uiScale, 14, 22);

    if (!this.title) {
      this.title = this.add.text(0, 0, 'Choose an Origami', {
        fontFamily: 'Trebuchet MS',
        color: '#ffffff',
        fontSize: `${titleSize}px`,
        stroke: '#000000',
        strokeThickness: 6,
      });
      this.title.setOrigin(0.5);
      this.title.setShadow(0, 3, '#000000', 8, true, true);
    }

    this.title
      .setFontSize(titleSize)
      .setPosition(width * 0.5, height * 0.2)
      .setDepth(2);

    if (!this.streakText) {
      this.streakText = this.add.text(0, 0, '', {
        fontFamily: 'Arial Black',
        color: '#f8fafc',
        align: 'right',
      });
      this.streakText.setOrigin(1, 0);
    }

    this.streakText
      .setText(`🔥 ${this.currentStreak} Days\n⭐ ${this.currentPoints} Points`)
      .setFontSize(subtitleSize)
      .setLineSpacing(Phaser.Math.Clamp(8 * uiScale, 4, 12))
      .setPosition(width * 0.94, height * 0.05)
      .setDepth(2);
  }

  private refreshStatus(): void {
    const { width, height } = this.scale;
    const uiScale = Math.min(width / 1080, height / 1920);
    const subtitleSize = Phaser.Math.Clamp(20 * uiScale, 14, 22);
    const statusY = this.title
      ? this.title.y + this.title.height + height * 0.03
      : height * 0.2;

    if (!this.statusText) {
      this.statusText = this.add.text(0, 0, '', {
        fontFamily: 'Arial',
        color: '#e2e8f0',
      });
      this.statusText.setOrigin(0.5);
    }

    if (this.loadState === 'loading') {
      this.statusText
        .setText('Loading...')
        .setVisible(true)
        .setFontSize(subtitleSize)
        .setPosition(width * 0.5, statusY)
        .setDepth(2);
    } else if (this.loadState === 'error') {
      this.statusText
        .setText('Unable to load models')
        .setVisible(true)
        .setFontSize(subtitleSize)
        .setPosition(width * 0.5, statusY)
        .setDepth(2);
    } else {
      this.statusText.setVisible(false);
    }
  }

  private createCards(): void {
    this.clearCards();

    if (this.loadState !== 'ready' || this.models.length === 0) {
      return;
    }

    this.models.forEach((model, index) => {
      const unlocked = this.currentStreak >= model.unlockDay;

      const container = this.add.container(0, 0);
      container.setDepth(2);

      const cardBackground = this.add.rectangle(
       0,
       0,
       600,
       110,
       unlocked ? 0xffffff : 0x9ca3af,
       1
      );
      cardBackground.setStrokeStyle(2, 0xffffff, unlocked ? 0.25 : 0.18);

      const nameText = this.add.text(
        0,
        0,
        '',
        {
          fontFamily: 'Arial Black',
          color: unlocked ? '#111827' : '#4b5563',
        }
      );
      nameText.setOrigin(0, 0.5);

      const difficultyText = this.add.text(
        0,
        0,
        '',
        {
          fontFamily: 'Arial',
          color: unlocked ? '#334155' : '#6b7280',
        }
      );
      difficultyText.setOrigin(0, 0.5);

      const timeText = this.add.text(
        0,
        0,
        '',
        {
          fontFamily: 'Arial',
          color: unlocked ? '#334155' : '#6b7280',
        }
      );
      timeText.setOrigin(1, 0.5);

      const lockText = this.add.text(0, 0, `Unlock Day ${model.unlockDay}`, {
        fontFamily: 'Arial',
        color: '#6b7280',
      });
      lockText.setOrigin(1, 0.5);

      container.add([cardBackground, nameText, difficultyText, timeText, lockText]);

      if (unlocked) {
        cardBackground.setInteractive({ useHandCursor: true });

        cardBackground.on('pointerover', () => {
          this.tweens.killTweensOf(container);
          this.tweens.add({
            targets: container,
            scaleX: 1.05,
            scaleY: 1.05,
            y: this.getCardBaseY(model.id) - 4,
            duration: 120,
          });
        });

        cardBackground.on('pointerout', () => {
          this.tweens.killTweensOf(container);
          this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            y: this.getCardBaseY(model.id),
            duration: 120,
          });
        });

        cardBackground.on('pointerdown', () => {
          this.tweens.killTweensOf(container);
          this.tweens.add({
            targets: container,
            scaleX: 0.98,
            scaleY: 0.98,
            duration: 80,
            yoyo: true,
            onComplete: () => {
              this.scene.start('PaperSelect', {
                modelId: model.id,
              });
            },
          });
        });
      } else {
        cardBackground.disableInteractive();
      }

      this.cards.push({
        model,
        container,
        background: cardBackground,
        nameText,
        difficultyText,
        timeText,
        lockText,
        baseY: 0,
      });
    });

    this.layoutCards();
  }

  private layoutCards(): void {
    if (this.cards.length === 0) {
      return;
    }

    const { width, height } = this.scale;
    const uiScale = Math.min(width / 1024, height / 768);

    const bodySize = 30 * uiScale;
    const subtitleSize = 18 * uiScale;

    const cardWidth = Math.min(width * 0.8, 600 * uiScale);

    const listAreaTop = this.title
      ? this.title.y + this.title.height + height * 0.05
      : height * 0.2;
    const listAreaBottom = height * 0.9;
    const availableHeight = listAreaBottom - listAreaTop;

    let cardHeight = 110 * uiScale;
    let cardGap = height * 0.02;

    const baseTotalHeight = this.cards.length * cardHeight
      + (this.cards.length - 1) * cardGap;

    if (baseTotalHeight > availableHeight) {
      const compression = availableHeight / baseTotalHeight;
      cardHeight *= compression;
      cardGap *= compression;
    }

    const cardsTotalHeight = this.cards.length * cardHeight
      + (this.cards.length - 1) * cardGap;
    const startCenterY = listAreaTop
      + (availableHeight - cardsTotalHeight) / 2
      + cardHeight / 2;

    this.cards.forEach((card, index) => {
      const y = startCenterY + index * (cardHeight + cardGap);
      const unlocked = this.currentStreak >= card.model.unlockDay;

      card.baseY = y;

      card.container
        .setPosition(width * 0.5, y)
        .setScale(1)
        .setAlpha(1);

      card.background
        .setSize(cardWidth, cardHeight)
        .setFillStyle(unlocked ? 0xffffff : 0x9ca3af, unlocked ? 1 : 0.45)
        .setStrokeStyle(2, 0xffffff, unlocked ? 0.25 : 0.18);

      // Keep rectangle background aligned with responsive sizing
      card.nameText.setOrigin(0, 0.5);
      card.lockText.setOrigin(1, 0.5);

      card.nameText
        .setText(`${unlocked ? '⛵ ' : ''}${card.model.name}`)
        .setFontSize(bodySize)
        .setPosition(-cardWidth * 0.42, -cardHeight * 0.22)
        .setColor(unlocked ? '#111827' : '#4b5563');

      // Ensure the rectangle card is responsive to the same computed size each layout pass

      // White outline for the card name (unlocked state)
      card.nameText
        .setStroke('#ffffff', unlocked ? 4 : 0);



      card.difficultyText
        .setText(this.getDifficultyLabel(card.model.difficulty))
        .setFontSize(subtitleSize)
        .setPosition(-cardWidth * 0.42, cardHeight * 0.20)
        .setColor(unlocked ? '#334155' : '#6b7280');

      card.timeText
        .setText(unlocked ? `⏱ ${card.model.estimatedTime} min` : '')
        .setFontSize(subtitleSize)
        .setPosition(cardWidth * 0.42, cardHeight * 0.20)
        .setColor(unlocked ? '#334155' : '#6b7280');

      card.lockText
        .setText(`Unlock Day ${card.model.unlockDay}`)
        .setFontSize(subtitleSize)
        .setPosition(cardWidth * 0.42, -cardHeight * 0.22)
        .setVisible(!unlocked);
    });
  }

  private playCardEntranceAnimation(): void {
    this.cards.forEach((card, index) => {
      card.container.setAlpha(0);
      card.container.setY(card.baseY + 40);

      this.tweens.add({
        targets: card.container,
        alpha: 1,
        y: card.baseY,
        duration: 350,
        ease: 'Back.Out',
        delay: index * 70,
      });
    });
  }

  private getCardBaseY(modelId: string): number {
    const card = this.cards.find((entry) => entry.model.id === modelId);
    return card ? card.baseY : 0;
  }

  private clearCards(): void {
    this.cards.forEach((card) => {
      card.container.destroy(true);
    });

    this.cards = [];
  }

  private getDifficultyLabel(difficulty: OrigamiModelSummary['difficulty']): string {
    switch (difficulty) {
      case 1:
        return 'Easy';
      case 2:
        return 'Medium';
      case 3:
        return 'Hard';
      case 4:
        return 'Expert';
      default:
        return 'Unknown';
    }
  }
}