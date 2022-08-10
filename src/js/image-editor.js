export default class ImageEditor {
  constructor(element, imgSrc) {
    // Prepare Canvas
    this.parentEl = element;
    this.parentEl.classList.add("image-editor_container");

    this.tools = {
      move: {
        active: false,
        moving: false,
        lastDraw: new Date(),
        mouseDown: {
          x: 0,
          y: 0,
        },
      },
      draw: {
        active: true,
        moving: false,
        lineWidth: 2,
        color: "red",
        lastDraw: new Date(),
        mouseDown: {
          x: 0,
          y: 0,
        },
      },
    };

    this.canvas = {
      el: document.createElement("canvas"),
      ctx: null,
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      content: {
        paths: [],
        background: {
          image: new Image(),
          x: 0,
          y: 0,
          w: 0,
          h: 0,
        },
      },
    };

    this.view = {
      zoom: 1,
      offset: {
        x: this.canvas.w / 2,
        y: this.canvas.h / 2,
      },
    };

    this.canvas.el.classList.add("image-editor_canvas");

    this.parentEl.appendChild(this.canvas.el);
    this.canvas.ctx = this.canvas.el.getContext("2d");

    let canvasPos = this.canvas.el.getBoundingClientRect();
    this.canvas.el.height = canvasPos.height;
    this.canvas.el.width = canvasPos.width;

    this.canvas.x = canvasPos.left;
    this.canvas.y = canvasPos.top;
    this.canvas.w = canvasPos.width;
    this.canvas.h = canvasPos.height;
    // TODO: set on window resize

    if (imgSrc) this.loadBackgroundImage(imgSrc);

    this.setControls();

    this.draw();
  }

  loadBackgroundImage(imgSrc) {
    let bg = this.canvas.content.background;
    bg.image.src = imgSrc;
    bg.w = bg.image.width;
    bg.h = bg.image.height;
    bg.x = 0 - bg.w / 2;
    bg.y = 0 - bg.h / 2;
    this.setFullSize();
    bg.image.onload = () => {
      this.draw();
    };
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

  draw() {
    this.canvas.ctx.clearRect(0, 0, this.canvas.w, this.canvas.h);

    //  Image
    const bg = this.canvas.content.background;
    const displayPos = this.mapCoordsToDisplay(bg.x, bg.y, bg.w, bg.h);
    this.canvas.ctx.drawImage(bg.image, displayPos.x, displayPos.y, displayPos.w, displayPos.h);

    // Paths
    for (let i in this.canvas.content.paths) {
      const path = this.canvas.content.paths[i];

      this.canvas.ctx.strokeStyle = this.tools.draw.color;
      this.canvas.ctx.lineWidth = this.tools.draw.lineWidth * this.view.zoom;
      this.canvas.ctx.beginPath();

      let pointIndex = 0;
      let point = path[pointIndex];

      while (point) {
        const scaledPoint = this.mapCoordsToDisplay(point.x, point.y);
        if (pointIndex == 0) {
          this.canvas.ctx.moveTo(scaledPoint.x, scaledPoint.y);
        } else {
          this.canvas.ctx.lineTo(scaledPoint.x, scaledPoint.y);
        }
        point = path[++pointIndex];
      }

      this.canvas.ctx.stroke();
    }

    // Tools
    let oldToolbox = this.parentEl.querySelector(".image-editor_toolbox");
    if (oldToolbox) oldToolbox.remove();
    let oldSettings = this.parentEl.querySelector(".image-editor_settings");
    if (oldSettings) oldSettings.remove();

    let toolbox = document.createElement("div");
    toolbox.classList.add("image-editor_toolbox");

    let moveTool = document.createElement("button");
    moveTool.innerText = "move";
    if (this.tools.move.active) {
      moveTool.classList.add("active");
    }
    moveTool.addEventListener("click", (e) => {
      this.tools.move.active = true;
      this.tools.draw.active = false;
      this.draw();
    });
    toolbox.appendChild(moveTool);

    let drawTool = document.createElement("button");
    drawTool.innerText = "draw";
    if (this.tools.draw.active) {
      drawTool.classList.add("active");
    }
    drawTool.addEventListener("click", (e) => {
      this.tools.move.active = false;
      this.tools.draw.active = true;
      this.draw();
    });
    toolbox.appendChild(drawTool);

    let settings = document.createElement("div");
    settings.classList.add("image-editor_settings");

    let changeZoomMode = document.createElement("button");
    changeZoomMode.innerText = "zoom";
    changeZoomMode.addEventListener("click", (e) => {
      this.setFullSize();
      this.draw();
    });
    settings.appendChild(changeZoomMode);

    this.parentEl.appendChild(settings);
    this.parentEl.appendChild(toolbox);
  }

  setFullSize() {
    const zoomWidth = (this.canvas.w - 20) / this.canvas.content.background.w;
    const zoomHeight = (this.canvas.h - 20) / this.canvas.content.background.h;
    this.view.zoom = Math.min(zoomHeight, zoomWidth);
    this.view.offset.x = this.canvas.w / 2;
    this.view.offset.y = this.canvas.h / 2;
  }

  coordsOnBackground(x, y) {
    return (
      x >= this.view.offset.x - (this.canvas.content.background.w * this.view.zoom) / 2 &&
      x <= this.view.offset.x + (this.canvas.content.background.w * this.view.zoom) / 2 &&
      y >= this.view.offset.y - (this.canvas.content.background.h * this.view.zoom) / 2 &&
      y <= this.view.offset.y + (this.canvas.content.background.h * this.view.zoom) / 2
    );
  }

  async getBlob() {
    this.canvas.el.toBlob(
      (blob) => {
        blob.text().then((text) => {
          return text;
        });
      },
      "image/jpeg",
      0.95
    );
  }

  setControls() {
    this.parentEl.addEventListener("wheel", (e) => {
      const modifier = e.deltaY / 1000 + 1;
      this.view.zoom = this.view.zoom * modifier;
      this.draw();
    });

    this.parentEl.addEventListener("mousedown", (e) => {
      if (this.coordsOnBackground(e.x, e.y)) {
        if (this.tools.move.active) {
          this.tools.move.moving = true;
          this.canvas.el.style.cursor = "grabbing";
          this.tools.move.mouseDown.x = e.x;
          this.tools.move.mouseDown.y = e.y;
        }

        if (this.tools.draw.active) {
          this.tools.draw.moving = true;
          this.canvas.content.paths.push([]);
        }
      }
    });

    this.parentEl.addEventListener("mouseup", (e) => {
      if (this.tools.move.active) {
        if (this.tools.move.moving) {
          this.tools.move.moving = false;
          this.canvas.el.style.cursor = "auto";
          this.draw();
        }
      }
      if (this.tools.draw.active) {
        if (this.tools.draw.moving) {
          this.tools.draw.moving = false;
          this.draw();
        }
      }
    });

    this.parentEl.addEventListener("mousemove", (e) => {
      if (this.tools.move.active) {
        if (this.tools.move.moving) {
          if (new Date() - this.tools.move.lastDraw >= 20) {
            this.tools.move.lastDraw = new Date();
            const offsetX = e.x - this.tools.move.mouseDown.x;
            const offsetY = e.y - this.tools.move.mouseDown.y;
            this.tools.move.mouseDown.x = e.x;
            this.tools.move.mouseDown.y = e.y;
            this.view.offset.x += offsetX;
            this.view.offset.y += offsetY;
            this.draw();
          }
        } else {
          if (this.coordsOnBackground(e.x, e.y)) {
            this.canvas.el.style.cursor = "grab";
          } else {
            this.canvas.el.style.cursor = "auto";
          }
        }
      }
      if (this.tools.draw.active) {
        if (this.tools.draw.moving) {
          if (this.coordsOnBackground(e.x, e.y)) {
            if (new Date() - this.tools.draw.lastDraw >= 20) {
              this.tools.draw.lastDraw = new Date();

              const originPos = this.mapCoordsToOrigin(e.x - this.canvas.x, e.y - this.canvas.y);
              this.canvas.content.paths[this.canvas.content.paths.length - 1].push({ x: originPos.x, y: originPos.y });
              this.draw();
            }
          } else {
            this.tools.draw.moving = false;
            this.draw();
          }
        }
      }
    });
  }
}
