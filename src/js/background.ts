import Canvas from "./canvas";

export default class Background {
  image: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(imgSrc: string) {
    this.image = new Image();
    this.image.src = imgSrc;
    this.w = this.image.width;
    this.h = this.image.height;
    this.x = 0 - this.w / 2;
    this.y = 0 - this.h / 2;
  }

  draw(canvas: Canvas) {
    const pos = canvas.mapCoordsToDisplay(this.x, this.y, this.w, this.h);
    canvas.ctx.drawImage(this.image, pos.x, pos.y, pos.w, pos.h);
  }
}
