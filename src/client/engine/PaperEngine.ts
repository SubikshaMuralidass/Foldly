import { OrigamiModel, OrigamiStep } from '../../shared/origami';
import { Line, Point, Polygon, toLine } from './Geometry';
import { FoldAnimator } from './FoldAnimator';
import { FoldRenderer } from './FoldRenderer';
import { foldValidator } from './FoldValidator';
import { FoldPreview, PaperMesh } from './PaperMesh';

export class PaperEngine {
  private scene: Phaser.Scene;
  private paperMesh: PaperMesh;
  private renderer: FoldRenderer;
  private animator: FoldAnimator;
  private model: OrigamiModel;
  private currentStepIndex: number = 0;
  private isAnimating: boolean = false;
  private isDragging: boolean = false;
  private dragStart: Point | null = null;
  private activePreview: FoldPreview | null = null;
  private dragProgress: number = 0;

  private readonly paperOffsetX: number;
  private readonly paperOffsetY: number;

  constructor(scene: Phaser.Scene, model: OrigamiModel, animator: FoldAnimator) {
    this.scene = scene;
    this.model = model;
    this.animator = animator;
    this.paperMesh = new PaperMesh(model.paper.size);
    const { width, height } = scene.scale;

    const topUI = height * 0.25;

    const paperCenterX = width * 0.5;
    const paperCenterY = topUI + (height - topUI) * 0.45;

    this.paperOffsetX = paperCenterX - model.paper.size / 2;
    this.paperOffsetY = paperCenterY - model.paper.size / 2;
    this.renderer = new FoldRenderer(scene, this.paperOffsetX, this.paperOffsetY);
  }

  getCurrentStep(): OrigamiStep | null {
    return this.model.steps[this.currentStepIndex] ?? null;
  }

  getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  render(): void {
    const foldLine = this.getCurrentFoldLine();
    this.renderer.render(this.paperMesh.getPolygons(), foldLine);
  }

  beginDrag(pointerX: number, pointerY: number): boolean {
    if (this.isAnimating || this.isDragging) {
      return false;
    }

    const step = this.getCurrentStep();

    if (!step) {
      return false;
    }

    const foldLine = toLine(step.line);

    if (!foldValidator.validate({ expectedLine: foldLine, actualLine: foldLine })) {
      return false;
    }

    this.activePreview = this.paperMesh.previewFold(foldLine);
    this.dragStart = { x: pointerX, y: pointerY };
    this.dragProgress = 0;
    this.isDragging = true;
    this.renderer.renderFoldPreview(this.activePreview, 0);
    return true;
  }

  updateDrag(pointerX: number, pointerY: number): void {
    if (!this.isDragging || !this.activePreview || !this.dragStart) {
      return;
    }

    const normal = this.getNormal(this.activePreview.line);
    const dx = pointerX - this.dragStart.x;
    const dy = pointerY - this.dragStart.y;
    const projected = Math.abs(dx * normal.x + dy * normal.y);
    const progress = Math.min(projected / (this.model.paper.size * 0.75), 1);

    this.dragProgress = progress;
    this.renderer.renderFoldPreview(this.activePreview, progress);
  }

  async endDrag(): Promise<boolean> {
    if (!this.isDragging || !this.activePreview) {
      return false;
    }

    const preview = this.activePreview;
    this.isDragging = false;
    this.dragStart = null;
    this.activePreview = null;
    this.isAnimating = true;

    await this.animator.animateFold(this.scene, (progress: number) => {
      this.renderer.renderFoldPreview(preview, progress);
    }, this.dragProgress);

    this.paperMesh.commitFold(preview.final);
    this.currentStepIndex += 1;
    this.isAnimating = false;
    this.dragProgress = 0;
    this.render();
    return true;
  }

  cancelDrag(): void {
    if (!this.isDragging) {
      return;
    }

    this.isDragging = false;
    this.dragStart = null;
    this.activePreview = null;
    this.dragProgress = 0;
    this.render();
  }

  async requestFold(): Promise<boolean> {
    if (!this.beginDrag(0, 0)) {
      return false;
    }

    return this.endDrag();
  }

  getPolygons(): Polygon[] {
    return this.paperMesh.getPolygons();
  }

  getCurrentFoldLine(): Line | null {
    const step = this.getCurrentStep();

    if (!step) {
      return null;
    }

    return toLine(step.line);
  }

  getPaperCenter(): { x: number; y: number } {
    return {
      x: this.paperOffsetX + this.model.paper.size / 2,
      y: this.paperOffsetY + this.model.paper.size / 2,
    };
  }

  getPaperSize(): number {
    return this.model.paper.size;
  }

  isDraggingFold(): boolean {
    return this.isDragging;
  }

  private getNormal(line: Line): { x: number; y: number } {
    const dx = line.to.x - line.from.x;
    const dy = line.to.y - line.from.y;
    const length = Math.hypot(dx, dy) || 1;

    return {
      x: -dy / length,
      y: dx / length,
    };
  }
}