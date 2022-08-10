export default class Line {
  constructor(color, width, path) {
    this.color = color || "black";
    this.width = width || 2;
    this.path = path || [];
  }
  addPoint(x, y) {
    this.path.push({
      x: x,
      y: y,
    });
  }
}
