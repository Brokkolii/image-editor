import Canvas from "./canvas";

export default class Rect {
  constructor(public color: string = "black", public width: number = 4, public x: number, public y: number, public w: number, public h: number) {}
  updateRect(bottomRightX: number, bottomRightY: number) {
    this.w = bottomRightX - this.x;
    this.h = bottomRightY - this.y;
  }
  draw(canvas: Canvas) {
    const pos = canvas.mapCoordsToDisplay(this.x, this.y, this.w, this.h);

    canvas.ctx.lineWidth = this.width * canvas.view.zoom;
    canvas.ctx.strokeStyle = this.color;
    canvas.ctx.beginPath();
    canvas.ctx.rect(pos.x, pos.y, pos.w, pos.h);
    canvas.ctx.stroke();
  }
}
