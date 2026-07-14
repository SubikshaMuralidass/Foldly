import { Boot } from './scenes/Boot';
import { Journey } from './scenes/Journey';
import { Result } from './scenes/Result';
import { FoldGame } from './scenes/FoldGame';
import { LevelSelect } from './scenes/LevelSelect';
import { MainMenu } from './scenes/MainMenu';
import { PaperSelect } from './scenes/PaperSelect';
import * as Phaser from 'phaser';
import { AUTO, Game } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { Settings } from './scenes/Settings';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  backgroundColor: '#282829',
  scale: {
    // Keep a fixed game resolution but automatically scale it to fit within the available
    // web-view / device while maintaining aspect ratio.
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768,
  },
  scene: [Boot, Preloader, MainMenu, LevelSelect, PaperSelect, Journey, Settings, FoldGame, Result],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

document.addEventListener('DOMContentLoaded', () => {
  StartGame('game-container');
});
