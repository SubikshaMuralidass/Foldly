export type PaperSummary = {
  id: string;
  name: string;
  texture?: string;
};

export type PaperManifest = {
  papers: PaperSummary[];
};

export type PaperAsset = PaperSummary & {
  texturePath: string;
};