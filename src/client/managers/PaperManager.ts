import { PaperAsset, PaperManifest, PaperSummary } from '../../shared/paper';

export class PaperManager {
  private manifestPromise: Promise<PaperManifest> | null = null;

  async getPapers(): Promise<PaperSummary[]> {
    const manifest = await this.getManifest();
    return manifest.papers;
  }

  async getPaper(paperId: string): Promise<PaperAsset> {
    const papers = await this.getPapers();
    const paper = papers.find((entry) => entry.id === paperId);

    if (!paper) {
      throw new Error(`Unknown paper: ${paperId}`);
    }

    return {
      ...paper,
      texturePath: paper.texture ?? `/papers/${paper.id}.png`,
    };
  }

  private async getManifest(): Promise<PaperManifest> {
    if (!this.manifestPromise) {
      this.manifestPromise = this.fetchManifest().catch((error) => {
        this.manifestPromise = null;
        throw error;
      });
    }

    return this.manifestPromise;
  }

  private async fetchManifest(): Promise<PaperManifest> {
    const response = await fetch('/data/papers.json');

    if (!response.ok) {
      throw new Error(`Failed to load paper manifest: ${response.status}`);
    }

    return (await response.json()) as PaperManifest;
  }
}

export const paperManager = new PaperManager();