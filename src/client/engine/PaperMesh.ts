import {
  classifyPolygonSide,
  createRectangle,
  Line,
  mirrorPolygonAcrossLine,
  Polygon,
  splitPolygonByLine,
} from './Geometry';

export type FoldPreview = {
  fixed: Polygon[];
  moving: Polygon[];
  final: Polygon[];
  line: Line;
};

export class PaperMesh {
  private polygons: Polygon[];

  constructor(size: number) {
    this.polygons = [createRectangle(size)];
  }

  getPolygons(): Polygon[] {
    return this.polygons.map((polygon) => polygon.map((point) => ({ ...point })));
  }

  previewFold(line: Line): FoldPreview {
    const fixed: Polygon[] = [];
    const moving: Polygon[] = [];
    const final: Polygon[] = [];

    for (const polygon of this.polygons) {
      const [firstSide, secondSide] = splitPolygonByLine(polygon, line);

      if (firstSide.length < 3 || secondSide.length < 3) {
        const side = classifyPolygonSide(polygon, line);

        if (side === 'moving') {
          moving.push(polygon);
          final.push(mirrorPolygonAcrossLine(polygon, line));
        } else {
          fixed.push(polygon);
          final.push(polygon);
        }

        continue;
      }

      const side = classifyPolygonSide(firstSide, line) === 'moving' ? 'moving' : 'fixed';

      if (side === 'moving') {
        fixed.push(secondSide);
        moving.push(firstSide);
        final.push(secondSide, mirrorPolygonAcrossLine(firstSide, line));
      } else {
        fixed.push(firstSide);
        moving.push(secondSide);
        final.push(firstSide, mirrorPolygonAcrossLine(secondSide, line));
      }
    }

    return { fixed, moving, final, line };
  }

  split(line: Line): void {
    const nextPolygons: Polygon[] = [];

    for (const polygon of this.polygons) {
      const [positive, negative] = splitPolygonByLine(polygon, line);

      if (positive.length > 2) {
        nextPolygons.push(positive);
      }

      if (negative.length > 2) {
        nextPolygons.push(negative);
      }
    }

    this.polygons = nextPolygons.length > 0 ? nextPolygons : this.polygons;
  }

  commitFold(polygons: Polygon[]): void {
    this.polygons = polygons.map((polygon) => polygon.map((point) => ({ ...point })));
  }

  fold(line: Line): FoldPreview {
    const preview = this.previewFold(line);
    this.commitFold(preview.final);
    return preview;
  }
}