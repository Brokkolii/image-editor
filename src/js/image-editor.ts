import Canvas from "./canvas";
import DrawTool from "./drawTool";
import MoveTool from "./moveTool";
import RectTool from "./rectTool";
import icons from "./icons";

export default class ImageEditor {
  scope: ImageEditor;
  canvas: Canvas;
  tools: {
    move: MoveTool;
    draw: DrawTool;
    rect: RectTool;
  };

  settings: {
    activeColor: string;
    colors: string[];
    activeWidth: number;
    widths: number[];
  };

  constructor(private container: HTMLElement, imgSrc: string) {
    this.scope = this;
    this.canvas = new Canvas(this.container);

    this.tools = {
      move: new MoveTool(false),
      draw: new DrawTool(true),
      rect: new RectTool(false),
    };

    this.settings = {
      activeColor: "red",
      colors: ["red", "green", "blue", "black", "white"],
      activeWidth: 4,
      widths: [2, 4, 8, 16],
    };

    this.canvas.loadBgImage(imgSrc);

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

      for (const [key, value] of Object.entries(scope.tools)) {
        const tool = value;
        const toolButton = document.createElement("button");
        if (tool.current) {
          toolButton.classList.add("current");
        }
        toolButton.addEventListener("click", (e) => {
          tool.setCurrent(scope);
        });
        toolButton.appendChild(tool.icon);
        toolbox.appendChild(toolButton);
      }

      return toolbox;
    }

    function drawSettings() {
      let settings = document.createElement("div");
      settings.classList.add("image-editor_settings");

      for (let i in scope.settings.colors) {
        let colorButton = document.createElement("button");
        if (scope.settings.colors[i] == scope.settings.activeColor) {
          colorButton.classList.add("current");
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
          widthButton.classList.add("current");
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

    window.addEventListener("resize", () => {
      scope.canvas.setCanvasSize();
    });

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
        if (tool.current) {
          tool[type](scope, e);
        }
      }
    }
  }
}
