export class Vector {
  constructor(
    public x: number,
    public y: number
  ) {}

  public add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  public subtract(other: Vector): Vector {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  public multiply(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  public magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  public normalize(): Vector {
    const mag = this.magnitude();
    return mag === 0 ? new Vector(0, 0) : this.multiply(1 / mag);
  }

  public distance(other: Vector): number {
    return this.subtract(other).magnitude();
  }
}