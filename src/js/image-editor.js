export default class ImageEditor {
  constructor(element, imgSrc) {
    // Prepare Canvas
    this.parentEl = element;
    this.parentEl.style.position = "relative";
    this.canvas = document.createElement("canvas");
    this.canvas.style.width = "100%";
    this.canvas.style.heigt = "100%";
    this.canvas.style.backgroundColor = "#f2f2f2";
    this.canvas.style.borderRadius = "4px";
    this.canvas.style.border = "1px solid #d3d3d3";
    this.parentEl.appendChild(this.canvas);
    this.context = this.canvas.getContext("2d");

    let canvasPos = this.canvas.getBoundingClientRect();
    this.canvas.height = canvasPos.height;
    this.canvas.width = canvasPos.width;
    this.left = canvasPos.left;
    this.top = canvasPos.top;

    this.state = {
      moveMode: "full",
      zoom: 1,
      offset: {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
      },
      paths: [],
      background: {
        image: new Image(),
        x: 0,
        y: 0,
      },
    };

    // Load Image
    this.state.background.image.src = imgSrc;
    this.state.background.x = this.canvas.width / 2 - this.state.background.image.width / 2;
    this.state.background.y = this.canvas.height / 2 - this.state.background.image.height / 2;
    this.state.background.image.style.display = "none";
    this.parentEl.appendChild(this.state.background.image);

    this.tools = {
      move: {
        active: true,
        moving: false,
        lastDraw: new Date(),
        mouseDown: {
          x: 0,
          y: 0,
        },
      },
      draw: {
        active: false,
        moving: false,
        lineWidth: 5,
        color: "red",
        lastDraw: new Date(),
        mouseDown: {
          x: 0,
          y: 0,
        },
      },
    };

    this.draw();
    this.setControls();
    this.setFullSize();
  }

  translateCoordinates(x, y) {
    return {
      x: x * this.state.zoom + this.state.offset.x,
      y: y * this.state.zoom + this.state.offset.y,
    };
  }

  draw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    //  Image
    const width = this.state.background.image.width * this.state.zoom;
    const height = this.state.background.image.height * this.state.zoom;

    const left = this.state.offset.x;
    const top = this.state.offset.y;

    this.context.drawImage(this.state.background.image, left, top, width, height);

    // Paths
    for (let i in this.state.paths) {
      for (let j in this.state.paths[i]) {
        const point = this.state.paths[i][parseInt(j)];
        const nextPoint = this.state.paths[i][parseInt(j) + 1];
        if (nextPoint) {
          this.context.strokeStyle = this.tools.draw.color;
          this.context.lineWidth = this.tools.draw.lineWidth;
          this.context.beginPath();

          const scaledPoint = this.translateCoordinates(point.x, point.y);
          this.context.moveTo(scaledPoint.x, scaledPoint.y);

          const scaledNextPoint = this.translateCoordinates(nextPoint.x, nextPoint.y);
          this.context.lineTo(scaledNextPoint.x, scaledNextPoint.y);
          this.context.stroke();
        }
      }
    }
    // Tools
    this.drawTools();
  }

  drawTools() {
    let oldToolbox = this.parentEl.querySelector(".toolbox");
    if (oldToolbox) oldToolbox.remove();
    let oldSettings = this.parentEl.querySelector(".setting");
    if (oldSettings) oldSettings.remove();

    let toolbox = document.createElement("div");
    toolbox.classList.add("toolbox");
    toolbox.style.position = "absolute";
    toolbox.style.top = "0px";
    toolbox.style.left = "0px";

    let moveTool = document.createElement("button");
    moveTool.innerText = "move";
    if (this.tools.move.active) {
      moveTool.style.backgroundColor = "red";
    } else {
      moveTool.style.backgroundColor = "unset";
    }
    moveTool.addEventListener("click", (e) => {
      console.log("move");
      this.tools.move.active = true;
      this.tools.draw.active = false;
      this.draw();
    });
    toolbox.appendChild(moveTool);

    let drawTool = document.createElement("button");
    drawTool.innerText = "draw";
    if (this.tools.draw.active) {
      drawTool.style.backgroundColor = "red";
    } else {
      drawTool.style.backgroundColor = "unset";
    }
    drawTool.addEventListener("click", (e) => {
      console.log("draw");
      this.tools.move.active = false;
      this.tools.draw.active = true;
      this.draw();
    });
    toolbox.appendChild(drawTool);

    let settings = document.createElement("div");
    toolbox.classList.add("settings");
    settings.style.position = "absolute";
    settings.style.top = "0px";
    settings.style.right = "0px";

    let changeZoomMode = document.createElement("button");
    changeZoomMode.innerText = "zoom";
    changeZoomMode.addEventListener("click", (e) => {
      if (this.state.moveMode == "custom" || this.state.moveMode == "normal") {
        this.state.moveMode = "full";
        this.setFullSize();
      } else {
        this.state.moveMode = "normal";
        this.setNormalSize();
      }
    });
    settings.appendChild(changeZoomMode);

    this.parentEl.appendChild(settings);
    this.parentEl.appendChild(toolbox);
  }

  setFullSize() {
    const zoomHeight = (this.canvas.height - 20) / this.state.background.image.height;
    const zoomWidth = (this.canvas.width - 20) / this.state.background.image.width;
    this.state.zoom = Math.min(zoomHeight, zoomWidth);
    this.state.offset.x = 0;
    this.state.offset.y = 0;
    this.draw();
  }

  setNormalSize() {
    this.state.zoom = 1;
    this.state.offset.x = 0;
    this.state.offset.y = 0;
    this.draw();
  }

  coordsOnImage(x, y) {
    return (
      x >= this.state.offset.x + this.canvas.width / 2 - (this.state.background.image.width * this.state.zoom) / 2 &&
      x <= this.state.offset.x + this.canvas.width / 2 + (this.state.background.image.width * this.state.zoom) / 2 &&
      y >= this.state.offset.y + this.canvas.height / 2 - (this.state.background.image.width * this.state.zoom) / 2 &&
      y <= this.state.offset.y + this.canvas.height / 2 + (this.state.background.image.width * this.state.zoom) / 2
    );
  }

  async getBlob() {
    this.canvas.toBlob(
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
      this.state.moveMode = "custom";
      const modifier = e.deltaY / 1000 + 1;
      this.state.zoom = this.state.zoom * modifier;
      this.draw();
    });

    this.parentEl.addEventListener("mousedown", (e) => {
      if (this.coordsOnImage(e.x, e.y)) {
        if (this.tools.move.active) {
          this.tools.move.moving = true;
          this.canvas.style.cursor = "grabbing";
          this.tools.move.mouseDown.x = e.x;
          this.tools.move.mouseDown.y = e.y;
        }

        if (this.tools.draw.active) {
          this.tools.draw.moving = true;
          this.state.paths.push([]);
        }
      }
    });

    this.parentEl.addEventListener("mouseup", (e) => {
      if (this.tools.move.active) {
        if (this.tools.move.moving) {
          this.tools.move.moving = false;
          this.canvas.style.cursor = "auto";
          this.state.moveMode = "custom";
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
            this.state.offset.x += offsetX;
            this.state.offset.y += offsetY;
            this.draw();
          }
        } else {
          if (this.coordsOnImage(e.x, e.y)) {
            this.canvas.style.cursor = "grab";
          } else {
            this.canvas.style.cursor = "auto";
          }
        }
      }
      if (this.tools.draw.active) {
        if (this.tools.draw.moving) {
          if (this.coordsOnImage(e.x, e.y)) {
            if (new Date() - this.tools.draw.lastDraw >= 20) {
              this.tools.draw.lastDraw = new Date();
              const x = (e.x - this.left - this.state.offset.x) / this.state.zoom;
              const y = (e.y - this.top - this.state.offset.y) / this.state.zoom;
              this.state.paths[this.state.paths.length - 1].push({ x: x, y: y });
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
