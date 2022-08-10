import Canvas from "./canvas";
import Line from "./line";

export default class ImageEditor {
  constructor(element, imgSrc) {
    this.container = element;

    this.canvas = new Canvas(this.container);

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

    if (imgSrc) this.canvas.loadBgImage(imgSrc);

    this.setControls();

    this.draw();
  }

  draw() {
    // Tools
    let oldToolbox = this.container.querySelector(".image-editor_toolbox");
    if (oldToolbox) oldToolbox.remove();
    let oldSettings = this.container.querySelector(".image-editor_settings");
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
      this.canvas.setBgFullSize();
      this.draw();
    });
    settings.appendChild(changeZoomMode);

    this.container.appendChild(settings);
    this.container.appendChild(toolbox);
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
    this.container.addEventListener("wheel", (e) => {
      const modifier = e.deltaY / 1000 + 1;
      this.canvas.view.zoom = this.canvas.view.zoom * modifier;
      this.canvas.draw();
    });

    this.container.addEventListener("mousedown", (e) => {
      if (this.canvas.coordsOnBg(e.x, e.y)) {
        if (this.tools.move.active) {
          this.tools.move.moving = true;
          this.canvas.el.style.cursor = "grabbing";
          this.tools.move.mouseDown.x = e.x;
          this.tools.move.mouseDown.y = e.y;
        }

        if (this.tools.draw.active) {
          this.tools.draw.moving = true;
          this.canvas.content.lines.push(new Line(this.tools.draw.color, this.tools.draw.lineWidth));
        }
      }
    });

    this.container.addEventListener("mouseup", (e) => {
      if (this.tools.move.active) {
        if (this.tools.move.moving) {
          this.tools.move.moving = false;
          this.canvas.el.style.cursor = "auto";
          this.canvas.draw();
        }
      }
      if (this.tools.draw.active) {
        if (this.tools.draw.moving) {
          this.tools.draw.moving = false;
          this.canvas.draw();
        }
      }
    });

    this.container.addEventListener("mousemove", (e) => {
      if (this.tools.move.active) {
        if (this.tools.move.moving) {
          if (new Date() - this.tools.move.lastDraw >= 20) {
            this.tools.move.lastDraw = new Date();
            const offsetX = e.x - this.tools.move.mouseDown.x;
            const offsetY = e.y - this.tools.move.mouseDown.y;
            this.tools.move.mouseDown.x = e.x;
            this.tools.move.mouseDown.y = e.y;
            this.canvas.view.offset.x += offsetX;
            this.canvas.view.offset.y += offsetY;
            this.canvas.draw();
          }
        } else {
          if (this.canvas.coordsOnBg(e.x, e.y)) {
            this.canvas.el.style.cursor = "grab";
          } else {
            this.canvas.el.style.cursor = "auto";
          }
        }
      }
      if (this.tools.draw.active) {
        if (this.tools.draw.moving) {
          if (this.canvas.coordsOnBg(e.x, e.y)) {
            if (new Date() - this.tools.draw.lastDraw >= 20) {
              this.tools.draw.lastDraw = new Date();
              const originPos = this.canvas.mapCoordsToOrigin(e.x - this.canvas.x, e.y - this.canvas.y);
              this.canvas.content.lines[this.canvas.content.lines.length - 1].addPoint(originPos.x, originPos.y);
              this.canvas.draw();
            }
          } else {
            this.tools.draw.moving = false;
            this.canvas.draw();
          }
        }
      }
    });
  }
}
