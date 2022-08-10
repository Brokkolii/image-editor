export default class Canvas {
  constructor(container) {
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

    this.content = {
      lines: [],
      background: {
        image: new Image(),
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      },
    };

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

  loadBgImage(imgSrc) {
    let bg = this.content.background;
    bg.image.src = imgSrc;
    bg.w = bg.image.width;
    bg.h = bg.image.height;
    bg.x = 0 - bg.w / 2;
    bg.y = 0 - bg.h / 2;
    this.setBgFullSize();
    bg.image.onload = () => {
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

  coordsOnBg(x, y) {
    return (
      x >= this.view.offset.x - (this.content.background.w * this.view.zoom) / 2 &&
      x <= this.view.offset.x + (this.content.background.w * this.view.zoom) / 2 &&
      y >= this.view.offset.y - (this.content.background.h * this.view.zoom) / 2 &&
      y <= this.view.offset.y + (this.content.background.h * this.view.zoom) / 2
    );
  }

  mapCoordsToOrigin(x, y, w, h) {
    return {
      x: (x - this.view.offset.x) / this.view.zoom,
      y: (y - this.view.offset.y) / this.view.zoom,
      w: w / this.view.zoom,
      h: h / this.view.zoom,
    };
  }

  mapCoordsToDisplay(x, y, w, h) {
    return {
      x: x * this.view.zoom + this.view.offset.x,
      y: y * this.view.zoom + this.view.offset.y,
      w: w * this.view.zoom,
      h: h * this.view.zoom,
    };
  }
}
