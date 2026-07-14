export type Point = {
  x: number;
  y: number;
};

export type Line = {
  from: Point;
  to: Point;
};

export type Polygon = Point[];

export type FoldSide = 'fixed' | 'moving';

const EPSILON = 0.00001;

export const createRectangle = (size: number): Polygon => [
  { x: 0, y: 0 },
  { x: size, y: 0 },
  { x: size, y: size },
  { x: 0, y: size },
];

export const toPoint = (value: [number, number]): Point => ({
  x: value[0],
  y: value[1],
});

export const toLine = (value: { from: [number, number]; to: [number, number] }): Line => ({
  from: toPoint(value.from),
  to: toPoint(value.to),
});

const signedDistance = (point: Point, line: Line): number => {
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;
  return (point.x - line.from.x) * dy - (point.y - line.from.y) * dx;
};

const intersection = (start: Point, end: Point, line: Line): Point => {
  const x1 = start.x;
  const y1 = start.y;
  const x2 = end.x;
  const y2 = end.y;
  const x3 = line.from.x;
  const y3 = line.from.y;
  const x4 = line.to.x;
  const y4 = line.to.y;
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (Math.abs(denominator) < EPSILON) {
    return { x: x2, y: y2 };
  }

  const px =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denominator;
  const py =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denominator;

  return { x: px, y: py };
};

const pushUniquePoint = (polygon: Polygon, point: Point): void => {
  const lastPoint = polygon[polygon.length - 1];

  if (lastPoint && Math.abs(lastPoint.x - point.x) < EPSILON && Math.abs(lastPoint.y - point.y) < EPSILON) {
    return;
  }

  polygon.push(point);
};

export const splitPolygonByLine = (polygon: Polygon, line: Line): [Polygon, Polygon] => {
  const positive: Polygon = [];
  const negative: Polygon = [];

  if (polygon.length < 3) {
    return [positive, negative];
  }

  for (let index = 0; index < polygon.length; index += 1) {
    const current = polygon[index]!;
    const next = polygon[(index + 1) % polygon.length]!;
    const currentSide = signedDistance(current, line);
    const nextSide = signedDistance(next, line);

    if (currentSide >= -EPSILON) {
      pushUniquePoint(positive, current);
    }

    if (currentSide <= EPSILON) {
      pushUniquePoint(negative, current);
    }

    if ((currentSide > EPSILON && nextSide < -EPSILON) || (currentSide < -EPSILON && nextSide > EPSILON)) {
      const point = intersection(current, next, line);
      pushUniquePoint(positive, point);
      pushUniquePoint(negative, point);
    }
  }

  return [positive, negative];
};

export const reflectPointAcrossLine = (point: Point, line: Line): Point => {
  const dx = line.to.x - line.from.x;
  const dy = line.to.y - line.from.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared < EPSILON) {
    return { x: point.x, y: point.y };
  }

  const px = point.x - line.from.x;
  const py = point.y - line.from.y;
  const dot = (px * dx + py * dy) / lengthSquared;
  const projX = line.from.x + dot * dx;
  const projY = line.from.y + dot * dy;

  return {
    x: projX * 2 - point.x,
    y: projY * 2 - point.y,
  };
};

export const mirrorPolygonAcrossLine = (polygon: Polygon, line: Line): Polygon =>
  polygon.map((point) => reflectPointAcrossLine(point, line));

export const lerpPoint = (start: Point, end: Point, amount: number): Point => ({
  x: start.x + (end.x - start.x) * amount,
  y: start.y + (end.y - start.y) * amount,
});

export const lerpPolygon = (start: Polygon, end: Polygon, amount: number): Polygon =>
  start.map((point, index) => lerpPoint(point, end[index] ?? point, amount));

export const classifyPolygonSide = (polygon: Polygon, line: Line): FoldSide => {
  const centroid = polygonCentroid(polygon);
  const distance = signedDistance(centroid, line);

  return distance >= 0 ? 'fixed' : 'moving';
};

export const polygonCentroid = (polygon: Polygon): Point => {
  const sum = polygon.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x,
      y: accumulator.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: sum.x / polygon.length,
    y: sum.y / polygon.length,
  };
};