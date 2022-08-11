import Line from "./line";
import Rect from "./rect";
import Background from "./background";

export default class Canvas {
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  h: number;
  content: any[];
  background: Background;
  view: {
    zoom: number;
    offset: {
      x: number;
      y: number;
    };
  };

  constructor(private container: HTMLElement) {
    this.el = document.createElement("canvas");
    this.el.classList.add("image-editor_canvas");

    container.appendChild(this.el);
    container.classList.add("image-editor_container");

    this.ctx = this.el.getContext("2d");

    const canvasPos = this.el.getBoundingClientRect();
    this.el.height = canvasPos.height;
    this.el.width = canvasPos.width;

    this.x = canvasPos.left;
    this.y = canvasPos.top;
    this.w = canvasPos.width;
    this.h = canvasPos.height;
    // TODO: set on window resize

    this.content = [];

    this.view = {
      zoom: 1,
      offset: {
        x: this.w / 2,
        y: this.h / 2,
      },
    };
  }

  draw() {
    this.ctx.clearRect(0, 0, this.w, this.h);

    this.background.draw(this);

    for (let i in this.content) {
      this.content[i].draw(this);
    }
  }

  loadBgImage(imgSrc: string) {
    this.background = new Background(imgSrc);

    this.setBgFullSize();

    this.background.image.onload = () => {
      this.draw();
    };
  }

  setBgFullSize() {
    this.view.offset.x = this.w / 2;
    this.view.offset.y = this.h / 2;
    const zoomWidth = (this.w - 20) / this.background.w;
    const zoomHeight = (this.h - 20) / this.background.h;
    this.view.zoom = Math.min(zoomHeight, zoomWidth);
    this.draw();
  }

  coordsOnBg(x: number, y: number) {
    return x >= this.view.offset.x - (this.background.w * this.view.zoom) / 2 && x <= this.view.offset.x + (this.background.w * this.view.zoom) / 2 && y >= this.view.offset.y - (this.background.h * this.view.zoom) / 2 && y <= this.view.offset.y + (this.background.h * this.view.zoom) / 2;
  }

  mapCoordsToOrigin(x: number, y: number, w?: number, h?: number) {
    return {
      x: (x - this.view.offset.x) / this.view.zoom,
      y: (y - this.view.offset.y) / this.view.zoom,
      w: w / this.view.zoom,
      h: h / this.view.zoom,
    };
  }

  mapCoordsToDisplay(x: number, y: number, w?: number, h?: number) {
    return {
      x: x * this.view.zoom + this.view.offset.x,
      y: y * this.view.zoom + this.view.offset.y,
      w: w * this.view.zoom,
      h: h * this.view.zoom,
    };
  }
}
