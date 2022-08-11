export default class Line {
  constructor(public color: string = "black", public width: number = 4, public path: { x: number; y: number }[] = []) {}
  addPoint(x: number, y: number) {
    this.path.push({
      x: x,
      y: y,
    });
  }
}
