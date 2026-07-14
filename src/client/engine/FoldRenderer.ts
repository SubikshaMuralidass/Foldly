import * as Phaser from 'phaser';
import { lerpPolygon, Line, mirrorPolygonAcrossLine, Polygon } from './Geometry';
import { FoldPreview } from './PaperMesh';

export class FoldRenderer {
  private graphics: Phaser.GameObjects.Graphics;
  private lineGraphics: Phaser.GameObjects.Graphics;
  private readonly offsetX: number;
  private readonly offsetY: number;

  constructor(scene: Phaser.Scene, offsetX: number, offsetY: number) {
    this.graphics = scene.add.graphics();
    this.lineGraphics = scene.add.graphics();
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  render(polygons: Polygon[], foldLine: Line | null): void {
    this.graphics.clear();
    this.lineGraphics.clear();

    this.drawPolygonSet(polygons, 0xf8fafc, 1, 0xcbd5e1, 1);

    if (foldLine) {
      this.drawDashedLine(foldLine, 0xfbbf24, 4, 12, 10, 1);
    }
  }

  renderFoldPreview(preview: FoldPreview, progress: number): void {
    this.graphics.clear();
    this.lineGraphics.clear();

    this.drawPolygonSet(preview.fixed, 0xbfdbfe, 0.95, 0x93c5fd, 1);

    const reflectedMoving = preview.moving.map((polygon) => mirrorPolygonAcrossLine(polygon, preview.line));
    const animatedMoving = preview.moving.map((polygon, index) =>
      lerpPolygon(polygon, reflectedMoving[index] ?? polygon, progress),
    );

    this.drawShadow(preview.line, progress);
    this.drawThicknessStrip(preview.line, progress);
    this.drawPolygonSet(animatedMoving, 0xb7f3d0, 0.82, 0x86efac, 1);
    this.drawDashedLine(preview.line, 0xfbbf24, 5, 12, 8, 1 - progress);
  }

  private drawPolygonSet(
    polygons: Polygon[],
    fillColor: number,
    fillAlpha: number,
    strokeColor: number,
    strokeAlpha: number,
  ): void {
    for (const polygon of polygons) {
      const points = polygon.map((point) => new Phaser.Math.Vector2(point.x + this.offsetX, point.y + this.offsetY));
      this.graphics.fillStyle(fillColor, fillAlpha);
      this.graphics.fillPoints(points, true);
      this.graphics.lineStyle(3, strokeColor, strokeAlpha);
      this.graphics.strokePoints(points, true);
    }
  }

  private drawDashedLine(
    line: Line,
    color: number,
    thickness: number,
    dashLength: number,
    gapLength: number,
    alpha: number,
  ): void {
    const dx = line.to.x - line.from.x;
    const dy = line.to.y - line.from.y;
    const distance = Math.hypot(dx, dy);
    const dashCount = Math.max(1, Math.floor(distance / (dashLength + gapLength)));

    this.lineGraphics.lineStyle(thickness, color, alpha);

    for (let index = 0; index < dashCount; index += 1) {
      const startRatio = (index * (dashLength + gapLength)) / distance;
      const endRatio = Math.min(((index * (dashLength + gapLength)) + dashLength) / distance, 1);

      const startX = line.from.x + dx * startRatio + this.offsetX;
      const startY = line.from.y + dy * startRatio + this.offsetY;
      const endX = line.from.x + dx * endRatio + this.offsetX;
      const endY = line.from.y + dy * endRatio + this.offsetY;

      this.lineGraphics.beginPath();
      this.lineGraphics.moveTo(startX, startY);
      this.lineGraphics.lineTo(endX, endY);
      this.lineGraphics.strokePath();
    }
  }

  private drawShadow(line: Line, progress: number): void {
    const normal = this.getNormal(line);
    const offset = 18 + progress * 6;
    const alpha = 0.22 * Math.sin(progress * Math.PI);

    if (alpha <= 0) {
      return;
    }

    const shadowLine: Line = {
      from: {
        x: line.from.x + normal.x * offset,
        y: line.from.y + normal.y * offset,
      },
      to: {
        x: line.to.x + normal.x * offset,
        y: line.to.y + normal.y * offset,
      },
    };

    this.drawDashedLine(shadowLine, 0x000000, 10, 18, 10, alpha);
  }

  private drawThicknessStrip(line: Line, progress: number): void {
    const normal = this.getNormal(line);
    const thickness = 8 + 5 * Math.sin(progress * Math.PI);
    const outerOffset = thickness / 2;
    const innerOffset = -thickness / 2;

    const points = [
      new Phaser.Math.Vector2(
        line.from.x + normal.x * outerOffset + this.offsetX,
        line.from.y + normal.y * outerOffset + this.offsetY,
      ),
      new Phaser.Math.Vector2(
        line.to.x + normal.x * outerOffset + this.offsetX,
        line.to.y + normal.y * outerOffset + this.offsetY,
      ),
      new Phaser.Math.Vector2(
        line.to.x + normal.x * innerOffset + this.offsetX,
        line.to.y + normal.y * innerOffset + this.offsetY,
      ),
      new Phaser.Math.Vector2(
        line.from.x + normal.x * innerOffset + this.offsetX,
        line.from.y + normal.y * innerOffset + this.offsetY,
      ),
    ];

    this.graphics.fillStyle(0x94a3b8, 0.12 + 0.1 * Math.sin(progress * Math.PI));
    this.graphics.fillPoints(points, true);
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