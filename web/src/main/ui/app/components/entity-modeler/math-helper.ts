export class Point {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  delta(p: Point): Point {
    return new Point(this.x + p.x, this.y + p.y);
  }

  add(p: Point) {
    return new Point(this.x + p.x, this.y + p.y);
  }

  subtract(p: Point) {
    return new Point(this.x - p.x, this.y - p.y);
  }

  multiply(n: number) {
    return new Point(this.x * n, this.y * n);
  }

  isOnLine(line: Line) {
    const SELECTION_FUZZINESS = 3;
    let leftPoint: Point;
    let rightPoint: Point;

    // Normalize start/end to left right to make the offset calc simpler.
    if (line.src.x <= line.dst.x) {
      leftPoint = line.src;
      rightPoint = line.dst;
    } else {
      leftPoint = line.dst;
      rightPoint = line.src;
    }

    // If point is out of bounds, no need to do further checks.
    if (this.x + SELECTION_FUZZINESS < leftPoint.x || rightPoint.x < this.x - SELECTION_FUZZINESS)
        return false;
    else if (this.y + SELECTION_FUZZINESS < Math.min(leftPoint.y, rightPoint.y) || Math.max(leftPoint.y, rightPoint.y) < this.y - SELECTION_FUZZINESS)
        return false;

    let deltaX = rightPoint.x - leftPoint.x;
    let deltaY = rightPoint.y - leftPoint.y;

    // If the line is straight, the earlier boundary check is enough to determine that the point is on the line.
    // Also prevents division by zero exceptions.
    if (deltaX == 0 || deltaY == 0)
        return true;

    let slope        = deltaY / deltaX;
    let offset       = leftPoint.y - leftPoint.x * slope;
    let calculatedY  = this.x * slope + offset;

    // Check calculated Y matches the points Y coord with some easing.
    let lineContains: boolean = this.y - SELECTION_FUZZINESS <= calculatedY && calculatedY <= this.y + SELECTION_FUZZINESS;

    return lineContains;
  }

  distance(p: Point): number {
    return Math.sqrt(
      ((p.x - this.x) * (p.x - this.x)) +
      ((p.y - this.y) * (p.y - this.y))
    );
  }

  get negated(): Point {
    return new Point(-this.x, -this.y);
  }
}

export class Line {
  src: Point;
  dst: Point;

  constructor(src: Point, dst: Point) {
    this.src = src;
    this.dst = dst;
  }

  get pointingLeft(): boolean {
    return this.src.x > this.dst.x;
  }

  get angle(): number {
    let dy = this.dst.y - this.src.y;
    let dx = this.dst.x - this.src.x;
    let theta = Math.atan2(dy, dx); // range (-PI, PI]
    theta *= 180 / Math.PI; // rads to degs, range (-180, 180]
    return theta;
  }
}

export class Rect {
  bottom: number;
  left: number;
  right: number;
  top: number;

  get height(): number {
    return this.bottom - this.top;
  }

  get width(): number {
    return this.right - this.left;
  }

  get center(): Point {
    return new Point(this.left + this.width / 2, this.top + this.height / 2);
  }

  get halfPoint(): Point {
    return new Point(this.width / 2, this.height / 2);
  }

  get topLeft(): Point {
    return new Point(this.left, this.top);
  }

  constructor(rect: ClientRect) {
    this.top = rect.top;
    this.bottom = rect.bottom;
    this.left = rect.left;
    this.right = rect.right;
  }

  get topEdge(): Line {
    return new Line(new Point(this.left, this.top), new Point(this.right, this.top));
  }

  get bottomEdge(): Line {
    return new Line(new Point(this.left, this.bottom), new Point(this.right, this.bottom));
  }

  get leftEdge(): Line {
    return new Line(new Point(this.left, this.top), new Point(this.left, this.bottom));
  }

  get rightEdge(): Line {
    return new Line(new Point(this.right, this.top), new Point(this.right, this.bottom));
  }

  multiply(n: number) {
    this.left *= n;
    this.top *= n;
    this.right *= n;
    this.bottom *= n;
  }

  offset(p: Point) {
    this.bottom += p.y;
    this.top += p.y;

    this.left += p.x;
    this.right += p.x;
  }

  getPointOfIntersection(line: Line): Point {
    let edges: Array<Line> = [
      this.topEdge,
      this.bottomEdge,
      this.leftEdge,
      this.rightEdge
    ];

    for (let edge of edges) {
      let denom = (edge.dst.y - edge.src.y) * (line.dst.x - line.src.x) - (edge.dst.x - edge.src.x) * (line.dst.y - line.src.y);
      if (denom === 0) {
        continue;
      }
      let ua = ((edge.dst.x - edge.src.x) * (line.src.y - edge.src.y) - (edge.dst.y - edge.src.y) * (line.src.x - edge.src.x)) / denom;
      let ub = ((line.dst.x - line.src.x) * (line.src.y - edge.src.y) - (line.dst.y - line.src.y) * (line.src.x - edge.src.x)) / denom;
      let seg1 = ua >= 0 && ua <= 1;
      let seg2 = ub >= 0 && ub <= 1;
      if (seg1 && seg2) {
        return new Point(line.src.x + ua * (line.dst.x - line.src.x), line.src.y + ua * (line.dst.y - line.src.y));
      }
    }

    return null;
  }
}
