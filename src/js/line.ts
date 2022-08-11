import Canvas from "./canvas";

export default class Line {
  constructor(public color: string = "black", public width: number = 4, public path: { x: number; y: number }[] = []) {}
  addPoint(x: number, y: number) {
    this.path.push({
      x: x,
      y: y,
    });
  }
  draw(canvas: Canvas) {
    canvas.ctx.strokeStyle = this.color;
    canvas.ctx.lineWidth = this.width * canvas.view.zoom;
    canvas.ctx.beginPath();

    let pointIndex = 0;
    let point = this.path[pointIndex];

    while (point) {
      const scaledPoint = canvas.mapCoordsToDisplay(point.x, point.y);
      if (pointIndex == 0) {
        canvas.ctx.moveTo(scaledPoint.x, scaledPoint.y);
      } else {
        canvas.ctx.lineTo(scaledPoint.x, scaledPoint.y);
      }
      point = this.path[++pointIndex];
    }

    canvas.ctx.stroke();
  }
}
