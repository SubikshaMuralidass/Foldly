import { OrigamiManifest, OrigamiModel, OrigamiModelSummary } from '../../shared/origami';

export class ModelManager {
  private manifestPromise: Promise<OrigamiManifest> | null = null;
  private modelPromises = new Map<string, Promise<OrigamiModel>>();

  async getModels(): Promise<OrigamiModelSummary[]> {
    const manifest = await this.getManifest();
    return manifest.models;
  }

  async getModel(modelId: string): Promise<OrigamiModel> {
    const cachedModel = this.modelPromises.get(modelId);

    if (cachedModel) {
      return cachedModel;
    }

    const modelPromise = this.fetchModel(modelId).catch((error) => {
      this.modelPromises.delete(modelId);
      throw error;
    });

    this.modelPromises.set(modelId, modelPromise);
    return modelPromise;
  }

  private async getManifest(): Promise<OrigamiManifest> {
    if (!this.manifestPromise) {
      this.manifestPromise = this.fetchManifest().catch((error) => {
        this.manifestPromise = null;
        throw error;
      });
    }

    return this.manifestPromise;
  }

  private async fetchManifest(): Promise<OrigamiManifest> {
    const response = await fetch('/data/manifest.json');

    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }

    return (await response.json()) as OrigamiManifest;
  }

  private async fetchModel(modelId: string): Promise<OrigamiModel> {
    const response = await fetch(`/models/${modelId}.json`);

    if (!response.ok) {
      throw new Error(`Failed to load model ${modelId}: ${response.status}`);
    }

    return (await response.json()) as OrigamiModel;
  }
}

export const modelManager = new ModelManager();