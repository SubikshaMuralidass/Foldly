import { GameObjects, Scene, Math as PhaserMath } from 'phaser';
import { GameSession } from '../../shared/session';
import { paperManager } from '../managers/PaperManager';
import {
  Scale,
  Scenes,
} from 'phaser';
type PaperSelectData = {
  modelId: string;
};

type PaperCard = {
  paperId: string;
  name: string;
  available: boolean;
  container: GameObjects.Container;
  background: GameObjects.Rectangle;
  nameText: GameObjects.Text;
  baseY: number;
};

export class PaperSelect extends Scene {
  private background: GameObjects.Image | null = null;

  private overlay: GameObjects.Rectangle | null = null;

  private titleText: GameObjects.Text | null = null;
  private subtitleText: GameObjects.Text | null = null;
  private instructionText: GameObjects.Text | null = null;

  private paperCards: PaperCard[] = [];
  private modelId: string | null = null;

  constructor() {
    super('PaperSelect');
  }

  init(data: PaperSelectData): void {
    this.modelId = data.modelId;
    this.paperCards = [];
  }

  create(): void {
    this.layoutUI();

    this.scale.on(Scale.Events.RESIZE, this.layoutUI, this);
    this.events.once(Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Scale.Events.RESIZE, this.layoutUI, this);
    });

    void this.loadPapers();
  }

  private layoutUI = (): void => {
    const { width, height } = this.scale;

    // Resize camera (keeps rendering consistent)
    this.cameras.resize(width, height);

    // Background (cover)
    if (!this.background) {
      this.background = this.add
        .image(width / 2, height / 2, 'background')
        .setDepth(-2);
    }

    const bg = this.background;
    bg.setPosition(width / 2, height / 2);

    const bgScale = Math.max(width / bg.width, height / bg.height);
    bg.setScale(bgScale);

    // Overlay (cover full viewport)
    if (!this.overlay) {
      // Match existing look from MainMenu/LevelSelect: subtle dark overlay
      this.overlay = this.add
        .rectangle(width / 2, height / 2, width, height, 0x000000, 0.18)
        .setDepth(-1);
    }

    this.overlay.setPosition(width / 2, height / 2).setSize(width, height);

    // UI scale based on design resolution (1024x768)
    const uiScale = Math.min(width / 1024, height / 768);

    // Titles
    const titleSize = PhaserMath.Clamp(54 * uiScale, 28, 60);
    const subtitleSize = PhaserMath.Clamp(22 * uiScale, 16, 24);
    const instructionSize = PhaserMath.Clamp(20 * uiScale, 14, 24);

    if (!this.titleText) {
      this.titleText = this.add
        .text(0, 0, 'Choose Your Paper', {
          fontFamily: 'Trebuchet MS',
          fontSize: `${titleSize}px`,
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setShadow(0, 3, '#000000', 8, true, true);
    }

    this.titleText
      .setFontSize(titleSize)
      .setPosition(width * 0.5, height * 0.1);

    if (!this.subtitleText) {
      this.subtitleText = this.add
        .text(0, 0, 'Select a paper style for your origami', {
          fontFamily: 'Arial',
          fontSize: `${subtitleSize}px`,
          color: '#f8fafc',
        })
        .setOrigin(0.5);
    }

    this.subtitleText
      .setFontSize(subtitleSize)
      .setPosition(width * 0.5, height * 0.18);

    // Instruction near bottom
    if (!this.instructionText) {
      this.instructionText = this.add
        .text(0, 0, 'Tap a paper to continue', {
          fontFamily: 'Arial',
          fontSize: `${instructionSize}px`,
          color: '#f8fafc',
        })
        .setOrigin(0.5);
    }

    this.instructionText
      .setFontSize(instructionSize)
      .setPosition(width * 0.5, height * 0.92);

    // Cards layout (update positions/sizes only)
    if (this.paperCards.length === 0) return;

    const availableIds = new Set(['white', 'gold', 'sakura', 'bamboo']);

    const listTop = this.titleText
      ? this.titleText.y + this.titleText.height + height * 0.05
      : height * 0.25;
    const listBottom = height * 0.88; // keep instruction visible
    const availableHeight = Math.max(0, listBottom - listTop);

    const cardWidthBase = PhaserMath.Clamp(width * 0.82, 260, 720);

    // Card sizing must work both portrait and landscape.
    // We'll compute height from uiScale and then compress if needed.
    let cardHeight = PhaserMath.Clamp(95 * uiScale, 70, 120);
    let cardGap = height * 0.02;

    const baseTotalHeight =
      this.paperCards.length * cardHeight +
      (this.paperCards.length - 1) * cardGap;

    if (baseTotalHeight > availableHeight) {
      const compression = availableHeight / baseTotalHeight;
      cardHeight *= compression;
      cardGap *= compression;
    }

    const cardsTotalHeight =
      this.paperCards.length * cardHeight +
      (this.paperCards.length - 1) * cardGap;

    const startCenterY = listTop + (availableHeight - cardsTotalHeight) / 2;

    const nameFontSize = PhaserMath.Clamp(28 * uiScale, 18, 36);
    const cardPaddingX = cardWidthBase * 0.07;
    const cardTextLeftX = -cardWidthBase / 2 + cardPaddingX;

    const bgStroke = 2;

    this.paperCards.forEach((card, index) => {
      // Keep internal availability consistent even if cards were created earlier
      card.available = availableIds.has(card.paperId);

      const unlocked = card.available;
      const y = startCenterY + index * (cardHeight + cardGap) + cardHeight / 2;
      card.baseY = y;

      card.container.setPosition(width * 0.5, y);

      card.background
        .setSize(cardWidthBase, cardHeight)
        .setFillStyle(
          unlocked ? 0xffffff : 0x9ca3af,
          unlocked ? 0.95 : 0.45
        )
        .setStrokeStyle(bgStroke, 0xe5e7eb);

      card.nameText
        .setFontSize(nameFontSize)
        .setColor(unlocked ? '#111827' : '#4b5563')
        .setPosition(cardTextLeftX, 0);

      // Ensure text stays vertically centered
      card.nameText.setOrigin(0, 0.5);
    });
  };

  private async loadPapers(): Promise<void> {
    try {
      const papers = await paperManager.getPapers();
      this.renderPapers(papers);
    } catch (error) {
      console.error('Failed to load papers:', error);
      this.renderFallbackPapers();
    }
  }

  private renderPapers(papers: Array<{ id: string; name: string }>): void {
    // Create once; layoutUI() handles resizing.
    this.paperCards.forEach((c) => c.container.destroy(true));
    this.paperCards = [];

    const { width } = this.scale;

    papers.forEach((paper) => {
      const available = ['white', 'gold', 'sakura', 'bamboo'].includes(paper.id);

      const container = this.add.container(width / 2, 0).setDepth(2);

      // Placeholder size; will be updated in layoutUI()
      const bg = this.add
        .rectangle(0, 0, 600, 100, available ? 0xffffff : 0x9ca3af, available ? 0.95 : 0.45)
        .setStrokeStyle(2, 0xe5e7eb);

      const nameText = this.add
        .text(-260, 0, paper.name, {
          fontFamily: 'Arial Black',
          fontSize: '28px',
          color: available ? '#111827' : '#4b5563',
        })
        .setOrigin(0, 0.5);

      container.add([bg, nameText]);

      if (available) {
        // Make entire card area clickable
        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
          this.tweens.add({
            targets: container,
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 120,
          });
        });

        bg.on('pointerout', () => {
          this.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            duration: 120,
          });
        });

        bg.on('pointerdown', () => {
          this.startGameWithPaper(paper.id);
        });
      } else {
        bg.disableInteractive();
      }

      this.paperCards.push({
        paperId: paper.id,
        name: paper.name,
        available,
        container,
        background: bg,
        nameText,
        baseY: 0,
      });
    });

    this.layoutUI();
  }

  private renderFallbackPapers(): void {
    this.renderPapers([
      { id: 'white', name: 'White' },
      { id: 'sakura', name: 'Sakura' },
      { id: 'gold', name: 'Golden' },
      { id: 'bamboo', name: 'Bamboo' },
    ]);
  }

  private startGameWithPaper(paperId: string): void {
    if (!this.modelId) {
      throw new Error('PaperSelect requires a modelId');
    }

    const session: GameSession = {
      modelId: this.modelId,
      paperId,
    };

    this.scene.start('FoldGame', { session });
  }
}

