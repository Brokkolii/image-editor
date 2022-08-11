import Line from "./line";

export default class Canvas {
  el: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  w: number;
  h: number;
  content: {
    lines: Line[];
    background: {
      image: HTMLImageElement;
      x: number;
      y: number;
      w: number;
      h: number;
    };
  };
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

    //  Image
    const bg = this.content.background;
    const displayPos = this.mapCoordsToDisplay(bg.x, bg.y, bg.w, bg.h);
    this.ctx.drawImage(bg.image, displayPos.x, displayPos.y, displayPos.w, displayPos.h);

    // Lines
    for (let i in this.content.lines) {
      const line = this.content.lines[i];

      this.ctx.strokeStyle = line.color;
      this.ctx.lineWidth = line.width * this.view.zoom;
      this.ctx.beginPath();

      let pointIndex = 0;
      let point = line.path[pointIndex];

      while (point) {
        const scaledPoint = this.mapCoordsToDisplay(point.x, point.y);
        if (pointIndex == 0) {
          this.ctx.moveTo(scaledPoint.x, scaledPoint.y);
        } else {
          this.ctx.lineTo(scaledPoint.x, scaledPoint.y);
        }
        point = line.path[++pointIndex];
      }

      this.ctx.stroke();
    }
  }

  loadBgImage(imgSrc: string) {
    const image = new Image();
    image.src = imgSrc;

    this.content = {
      lines: [],
      background: {
        image: image,
        w: image.width,
        h: image.height,
        x: 0 - image.width / 2,
        y: 0 - image.height / 2,
      },
    };

    this.setBgFullSize();

    image.onload = () => {
      this.draw();
    };
  }

  setBgFullSize() {
    this.view.offset.x = this.w / 2;
    this.view.offset.y = this.h / 2;
    const zoomWidth = (this.w - 20) / this.content.background.w;
    const zoomHeight = (this.h - 20) / this.content.background.h;
    this.view.zoom = Math.min(zoomHeight, zoomWidth);
    this.draw();
  }

  coordsOnBg(x: number, y: number) {
    return (
      x >= this.view.offset.x - (this.content.background.w * this.view.zoom) / 2 &&
      x <= this.view.offset.x + (this.content.background.w * this.view.zoom) / 2 &&
      y >= this.view.offset.y - (this.content.background.h * this.view.zoom) / 2 &&
      y <= this.view.offset.y + (this.content.background.h * this.view.zoom) / 2
    );
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
