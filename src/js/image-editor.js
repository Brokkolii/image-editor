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
        actions: {
          wheel: function (scope, e) {
            const modifier = e.deltaY / 1000 + 1;
            scope.canvas.view.zoom = scope.canvas.view.zoom * modifier;
            scope.canvas.draw();
          },
          mousedown: function (scope, e) {
            if (scope.canvas.coordsOnBg(e.x, e.y)) {
              scope.tools.move.moving = true;
              scope.canvas.el.style.cursor = "grabbing";
              scope.tools.move.mouseDown.x = e.x;
              scope.tools.move.mouseDown.y = e.y;
            }
          },
          mouseup: function (scope, e) {
            if (scope.tools.move.moving) {
              scope.tools.move.moving = false;
              scope.canvas.el.style.cursor = "auto";
              scope.canvas.draw();
            }
          },
          mousemove: function (scope, e) {
            if (scope.tools.move.moving) {
              if (new Date() - scope.tools.move.lastDraw >= 20) {
                scope.tools.move.lastDraw = new Date();
                const offsetX = e.x - scope.tools.move.mouseDown.x;
                const offsetY = e.y - scope.tools.move.mouseDown.y;
                scope.tools.move.mouseDown.x = e.x;
                scope.tools.move.mouseDown.y = e.y;
                scope.canvas.view.offset.x += offsetX;
                scope.canvas.view.offset.y += offsetY;
                scope.canvas.draw();
              }
            } else {
              if (scope.canvas.coordsOnBg(e.x, e.y)) {
                scope.canvas.el.style.cursor = "grab";
              } else {
                scope.canvas.el.style.cursor = "auto";
              }
            }
          },
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
        actions: {
          wheel: function (scope, e) {
            const modifier = e.deltaY / 1000 + 1;
            scope.canvas.view.zoom = scope.canvas.view.zoom * modifier;
            scope.canvas.draw();
          },
          mousedown: function (scope, e) {
            if (scope.canvas.coordsOnBg(e.x, e.y)) {
              scope.tools.draw.moving = true;
              scope.canvas.content.lines.push(new Line(scope.tools.draw.color, scope.tools.draw.lineWidth));
            }
          },
          mouseup: function (scope, e) {
            if (scope.tools.draw.moving) {
              scope.tools.draw.moving = false;
              scope.canvas.draw();
            }
          },
          mousemove: function (scope, e) {
            if (scope.tools.draw.moving) {
              if (scope.canvas.coordsOnBg(e.x, e.y)) {
                if (new Date() - scope.tools.draw.lastDraw >= 20) {
                  scope.tools.draw.lastDraw = new Date();
                  const originPos = scope.canvas.mapCoordsToOrigin(e.x - scope.canvas.x, e.y - scope.canvas.y);
                  scope.canvas.content.lines[scope.canvas.content.lines.length - 1].addPoint(originPos.x, originPos.y);
                  scope.canvas.draw();
                }
              } else {
                scope.tools.draw.moving = false;
                scope.canvas.draw();
              }
            }
          },
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
    let scope = this;

    this.container.addEventListener("wheel", (e) => {
      handleEvent("wheel", e);
    });

    this.container.addEventListener("mousedown", (e) => {
      handleEvent("mousedown", e);
    });

    this.container.addEventListener("mouseup", (e) => {
      handleEvent("mouseup", e);
    });

    this.container.addEventListener("mousemove", (e) => {
      handleEvent("mousemove", e);
    });

    function handleEvent(type, e) {
      for (const [key, value] of Object.entries(scope.tools)) {
        const tool = value;
        if (tool.active) {
          tool.actions[type](scope, e);
        }
      }
    }
  }
}
