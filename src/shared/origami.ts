export type OrigamiDifficulty = 1 | 2 | 3 | 4;

export type OrigamiModelSummary = {
  id: string;
  name: string;
  difficulty: OrigamiDifficulty;
  unlockDay: number;
  estimatedTime: number;
  thumbnail?: string;
};

export type OrigamiManifest = {
  models: OrigamiModelSummary[];
};

export type OrigamiPaper = {
  shape: string;
  size: number;
};

export type OrigamiStep = {
  id: number;
  instruction: string;
  foldType?: 'valley' | 'mountain';
  line: {
    from: [number, number];
    to: [number, number];
  };
};

export type OrigamiModel = OrigamiModelSummary & {
  points: number;
  paper: OrigamiPaper;
  steps: OrigamiStep[];
};