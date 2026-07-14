// import { Scene, GameObjects } from 'phaser';

// export class MainMenu extends Scene {
//   background: GameObjects.Image | null = null;
//   title: GameObjects.Text | null = null;
//   startButton: GameObjects.Text | null = null;
//   journeyButton: GameObjects.Text | null = null;
//   settingsButton: GameObjects.Text | null = null;

//   constructor() {
//     super('MainMenu');
//   }

//   init(): void {
//     this.background = null;
//     this.title = null;
//     this.startButton = null;
//     this.journeyButton = null;
//     this.settingsButton = null;
//   }

//   create(): void {
//     this.refreshLayout();

//     this.scale.on('resize', () => {
//       this.refreshLayout();
//     });
//   }

//   private refreshLayout(): void {
//     const { width, height } = this.scale;

//     // Resize camera
//     this.cameras.resize(width, height);

//     // ------------------------
//     // Background
//     // ------------------------
//     if (!this.background) {
//       this.background = this.add.image(0, 0, 'background');
//     }

//     const bg = this.background;

//     bg.setOrigin(0.5);
//     bg.setPosition(width / 2, height / 2);

//     // Fill the viewport while maintaining aspect ratio
//     const bgScale = Math.max(
//       width / bg.width,
//       height / bg.height
//     );

//     bg.setScale(bgScale);
//     bg.setDepth(-1);

//     // ------------------------
//     // Responsive font sizes
//     // ------------------------
//     const uiScale = Math.min(width / 1080, height / 1920);

//     const titleSize = Math.max(30, Math.round(48 * uiScale));
//     const buttonSize = Math.max(22, Math.round(30 * uiScale));

//     // ------------------------
//     // Title
//     // ------------------------
//     if (!this.title) {
//       this.title = this.add.text(0, 0, 'Foldly', {
//         fontFamily: 'Trebuchet MS',
//         fontSize: `${titleSize}px`,
//         color: '#ffffff',
//         stroke: '#000000',
//         strokeThickness: 8,
//         align: 'center',
//       }).setOrigin(0.5);
//     }

//     this.title
//       .setFontSize(titleSize)
//       .setPosition(width / 2, height * 0.25);

//     // ------------------------
//     // Start Button
//     // ------------------------
//     if (!this.startButton) {
//       this.startButton = this.add.text(0, 0, 'Start Folding', {
//         fontFamily: 'Arial',
//         fontSize: `${buttonSize}px`,
//         color: '#ffffff',
//       })
//       .setOrigin(0.5)
//       .setInteractive({ useHandCursor: true });

//       this.startButton.on('pointerdown', () => {
//         this.scene.start('LevelSelect');
//       });
//     }

//     this.startButton
//       .setFontSize(buttonSize)
//       .setPosition(width / 2, height * 0.52);

//     // ------------------------
//     // Journey Button
//     // ------------------------
//     if (!this.journeyButton) {
//       this.journeyButton = this.add.text(0, 0, 'Journey', {
//         fontFamily: 'Arial',
//         fontSize: `${buttonSize}px`,
//         color: '#ffffff',
//       })
//       .setOrigin(0.5)
//       .setInteractive({ useHandCursor: true });

//       this.journeyButton.on('pointerdown', () => {
//         this.scene.start('Journey');
//       });
//     }

//     this.journeyButton
//       .setFontSize(buttonSize)
//       .setPosition(width / 2, height * 0.62);

//     // ------------------------
//     // Settings Button
//     // ------------------------
//     if (!this.settingsButton) {
//       this.settingsButton = this.add.text(0, 0, 'Settings', {
//         fontFamily: 'Arial',
//         fontSize: `${buttonSize}px`,
//         color: '#ffffff',
//       })
//       .setOrigin(0.5)
//       .setInteractive({ useHandCursor: true });

//       this.settingsButton.on('pointerdown', () => {
//         this.scene.start('Settings');
//       });
//     }

//     this.settingsButton
//       .setFontSize(buttonSize)
//       .setPosition(width / 2, height * 0.72);
//   }
// }
import { Scene, GameObjects } from 'phaser';

export class MainMenu extends Scene {
  background: GameObjects.Image | null = null;

  startButton: GameObjects.Text | null = null;
  journeyButton: GameObjects.Text | null = null;
  settingsButton: GameObjects.Text | null = null;

  constructor() {
    super('MainMenu');
  }

  init(): void {
    this.background = null;

    this.startButton = null;
    this.journeyButton = null;
    this.settingsButton = null;
  }

  create(): void {
    this.refreshLayout();

    this.scale.on('resize', () => {
      this.refreshLayout();
    });
  }

  private refreshLayout(): void {
    const { width, height } = this.scale;

    // Resize camera
    this.cameras.resize(width, height);

    // ==========================
    // Background
    // ==========================
    if (!this.background) {
      this.background = this.add.image(0, 0, 'background');
    }

    const bg = this.background;

    bg.setOrigin(0.5);
    bg.setPosition(width / 2, height / 2);

    // Cover the whole screen while preserving aspect ratio
    const bgScale = Math.max(
      width / bg.width,
      height / bg.height
    );

    bg.setScale(bgScale);
    bg.setDepth(-1);

    // ==========================
    // Responsive font size
    // ==========================
    const uiScale = Math.min(width / 1080, height / 1920);
    const buttonSize = Math.max(26, Math.round(34 * uiScale));

    // ==========================
    // Start Folding
    // ==========================
    if (!this.startButton) {
      this.startButton = this.add
        .text(0, 0, 'START FOLDING', {
          fontFamily: 'Arial Black',
          fontSize: `${buttonSize}px`,
          color: '#00FF66',
          stroke: '#fffdfd',
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      this.startButton.on('pointerdown', () => {
        this.scene.start('LevelSelect');
      });

      this.startButton.on('pointerover', () => {
        this.startButton!.setScale(1.08);
      });

      this.startButton.on('pointerout', () => {
        this.startButton!.setScale(1);
      });
    }

    this.startButton
      .setFontSize(buttonSize)
      .setPosition(width / 2, height * 0.45);

    // ==========================
    // Journey
    // ==========================
    if (!this.journeyButton) {
      this.journeyButton = this.add
        .text(0, 0, 'JOURNEY', {
          fontFamily: 'Arial Black',
          fontSize: `${buttonSize}px`,
          color: '#FFD700',
          stroke: '#fffdfd',
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      this.journeyButton.on('pointerdown', () => {
        this.scene.start('Journey');
      });

      this.journeyButton.on('pointerover', () => {
        this.journeyButton!.setScale(1.08);
      });

      this.journeyButton.on('pointerout', () => {
        this.journeyButton!.setScale(1);
      });
    }

    this.journeyButton
      .setFontSize(buttonSize)
      .setPosition(width / 2, height * 0.58);

    // ==========================
    // Settings
    // ==========================
    if (!this.settingsButton) {
      this.settingsButton = this.add
        .text(0, 0, 'SETTINGS', {
          fontFamily: 'Arial Black',
          fontSize: `${buttonSize}px`,
          color: '#00D9FF',
          stroke: '#fffdfd',
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

      this.settingsButton.on('pointerdown', () => {
        this.scene.start('Settings');
      });

      this.settingsButton.on('pointerover', () => {
        this.settingsButton!.setScale(1.08);
      });

      this.settingsButton.on('pointerout', () => {
        this.settingsButton!.setScale(1);
      });
    }

    this.settingsButton
      .setFontSize(buttonSize)
      .setPosition(width / 2, height * 0.71);
  }
}