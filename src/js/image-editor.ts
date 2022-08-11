import Canvas from "./canvas";
import Line from "./line";
import icons from "./icons";

export default class ImageEditor {
  scope: ImageEditor;
  canvas: Canvas;
  tools = {
    move: {
      active: false,
      moving: false,
      lastDraw: new Date(),
      mouseDown: {
        x: 0,
        y: 0,
      },
      actions: {
        wheel: function (scope: ImageEditor, e: WheelEvent) {
          const modifier = e.deltaY / 1000 + 1;
          scope.canvas.view.zoom = scope.canvas.view.zoom * modifier;
          scope.canvas.draw();
        },
        mousedown: function (scope: ImageEditor, e: MouseEvent) {
          if (scope.canvas.coordsOnBg(e.x, e.y)) {
            scope.tools.move.moving = true;
            scope.canvas.el.style.cursor = "grabbing";
            scope.tools.move.mouseDown.x = e.x;
            scope.tools.move.mouseDown.y = e.y;
          }
        },
        mouseup: function (scope: ImageEditor, e: MouseEvent) {
          if (scope.tools.move.moving) {
            scope.tools.move.moving = false;
            scope.canvas.el.style.cursor = "auto";
            scope.canvas.draw();
          }
        },
        mousemove: function (scope: ImageEditor, e: MouseEvent) {
          if (scope.tools.move.moving) {
            if (new Date().getTime() - scope.tools.move.lastDraw.getTime() >= 20) {
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
      lastDraw: new Date(),
      mouseDown: {
        x: 0,
        y: 0,
      },
      actions: {
        wheel: function (scope: ImageEditor, e: WheelEvent) {
          const modifier = e.deltaY / 1000 + 1;
          scope.canvas.view.zoom = scope.canvas.view.zoom * modifier;
          scope.canvas.draw();
        },
        mousedown: function (scope: ImageEditor, e: MouseEvent) {
          if (scope.canvas.coordsOnBg(e.x, e.y)) {
            scope.tools.draw.moving = true;
            scope.canvas.content.lines.push(new Line(scope.settings.activeColor, scope.settings.activeWidth));
          }
        },
        mouseup: function (scope: ImageEditor, e: MouseEvent) {
          if (scope.tools.draw.moving) {
            scope.tools.draw.moving = false;
            scope.canvas.draw();
          }
        },
        mousemove: function (scope: ImageEditor, e: MouseEvent) {
          if (scope.tools.draw.moving) {
            if (scope.canvas.coordsOnBg(e.x, e.y)) {
              if (new Date().getTime() - scope.tools.draw.lastDraw.getTime() >= 20) {
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
  settings: {
    activeColor: string;
    colors: string[];
    activeWidth: number;
    widths: number[];
  };

  constructor(private container: HTMLElement, imgSrc?: string) {
    this.scope = this;
    this.canvas = new Canvas(this.container);

    this.settings = {
      activeColor: "red",
      colors: ["red", "green", "blue", "black", "white"],
      activeWidth: 4,
      widths: [2, 4, 8, 16],
    };

    if (imgSrc) this.canvas.loadBgImage(imgSrc);

    this.setControls();
    this.draw();
  }

  draw() {
    //remove old ui
    let scope = this;
    let oldUi = this.container.querySelector(".image-editor_ui");
    if (oldUi) oldUi.remove();

    let ui = document.createElement("div");
    ui.classList.add("image-editor_ui");

    ui.appendChild(drawTools());
    ui.appendChild(drawSettings());
    ui.appendChild(drawUtil());

    this.container.appendChild(ui);

    function drawTools() {
      let toolbox = document.createElement("div");
      toolbox.classList.add("image-editor_toolbox");

      let moveTool = document.createElement("button");
      if (scope.tools.move.active) {
        moveTool.classList.add("active");
      }
      moveTool.addEventListener("click", (e) => {
        scope.tools.move.active = true;
        scope.tools.draw.active = false;
        scope.draw();
      });
      moveTool.appendChild(icons.move);
      toolbox.appendChild(moveTool);

      let drawTool = document.createElement("button");
      if (scope.tools.draw.active) {
        drawTool.classList.add("active");
      }
      drawTool.addEventListener("click", (e) => {
        scope.tools.move.active = false;
        scope.tools.draw.active = true;
        scope.draw();
      });
      drawTool.appendChild(icons.draw);
      toolbox.appendChild(drawTool);

      return toolbox;
    }

    function drawSettings() {
      let settings = document.createElement("div");
      settings.classList.add("image-editor_settings");

      for (let i in scope.settings.colors) {
        let colorButton = document.createElement("button");
        if (scope.settings.colors[i] == scope.settings.activeColor) {
          colorButton.classList.add("active");
        }

        colorButton.addEventListener("click", (e) => {
          scope.settings.activeColor = scope.settings.colors[i];
          scope.draw();
        });

        let colorIcon = document.createElement("span");
        colorIcon.classList.add("colorIcon");
        colorIcon.style.backgroundColor = scope.settings.colors[i];
        colorButton.appendChild(colorIcon);

        settings.appendChild(colorButton);
      }

      for (let i in scope.settings.widths) {
        let widthButton = document.createElement("button");
        if (scope.settings.widths[i] == scope.settings.activeWidth) {
          widthButton.classList.add("active");
        }

        widthButton.addEventListener("click", (e) => {
          scope.settings.activeWidth = scope.settings.widths[i];
          scope.draw();
        });

        let widthIcon = document.createElement("span");
        widthIcon.classList.add("widthIcon");
        widthIcon.style.width = scope.settings.widths[i] + "px";
        widthIcon.style.height = scope.settings.widths[i] + "px";
        widthButton.appendChild(widthIcon);

        settings.appendChild(widthButton);
      }

      return settings;
    }

    function drawUtil() {
      let util = document.createElement("div");
      util.classList.add("image-editor_util");

      let changeZoomMode = document.createElement("button");
      changeZoomMode.addEventListener("click", (e) => {
        scope.canvas.setBgFullSize();
      });
      changeZoomMode.appendChild(icons.full);
      util.appendChild(changeZoomMode);

      return util;
    }
  }

  async getBlob() {
    this.scope.canvas.el.toBlob(
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

    function handleEvent(type: "wheel" | "mousedown" | "mouseup" | "mousemove", e: any) {
      for (const [key, value] of Object.entries(scope.tools)) {
        const tool = value;
        if (tool.active) {
          tool.actions[type](scope, e);
        }
      }
    }
  }
}
