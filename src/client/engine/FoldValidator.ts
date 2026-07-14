import { Line } from './Geometry';

export type FoldValidationInput = {
  expectedLine: Line;
  actualLine: Line;
};

const EPSILON = 0.00001;

const nearlyEqual = (left: number, right: number): boolean => Math.abs(left - right) < EPSILON;

export class FoldValidator {
  validate(input: FoldValidationInput): boolean {
    return (
      nearlyEqual(input.expectedLine.from.x, input.actualLine.from.x) &&
      nearlyEqual(input.expectedLine.from.y, input.actualLine.from.y) &&
      nearlyEqual(input.expectedLine.to.x, input.actualLine.to.x) &&
      nearlyEqual(input.expectedLine.to.y, input.actualLine.to.y)
    );
  }
}

export const foldValidator = new FoldValidator();