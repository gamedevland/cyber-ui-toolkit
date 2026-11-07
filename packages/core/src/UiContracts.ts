import type { UiBounds } from './types.js';

export class UiContracts {
  static number(name: string, value: number, min = -Infinity, max = Infinity): void {
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new RangeError(`${name} must be finite and in [${min}, ${max}]`);
    }
  }

  static integer(name: string, value: number, min: number, max = Number.MAX_SAFE_INTEGER): void {
    this.number(name, value, min, max);
    if (!Number.isInteger(value)) throw new RangeError(`${name} must be an integer`);
  }

  static bounds(bounds: UiBounds): void {
    this.number('bounds.x', bounds.x);
    this.number('bounds.y', bounds.y);
    this.number('bounds.w', bounds.w, Number.EPSILON);
    this.number('bounds.h', bounds.h, Number.EPSILON);
  }
}
