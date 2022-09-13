import Canvas from "./canvas";

export default class Circ {
  constructor(public color: string = "black", public width: number = 4, public x: number, public y: number, public r: number = 0) {}
  updateCirc(x: number, y: number) {
    this.r = Math.hypot(x - this.x, y - this.y);
  }
  draw(canvas: Canvas) {
    const pos = canvas.mapCoordsToDisplay(this.x, this.y);
    const r = this.r * canvas.view.zoom;

    canvas.ctx.lineWidth = this.width * canvas.view.zoom;
    canvas.ctx.strokeStyle = this.color;
    canvas.ctx.beginPath();
    canvas.ctx.arc(pos.x, pos.y, r, 0, 2 * Math.PI);
    canvas.ctx.stroke();
  }
}
