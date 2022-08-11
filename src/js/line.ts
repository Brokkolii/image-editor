export default class Line {
  constructor(public color: string, public width: number, public path: { x: number; y: number }[] = []) {}
  addPoint(x: number, y: number) {
    this.path.push({
      x: x,
      y: y,
    });
  }
}
