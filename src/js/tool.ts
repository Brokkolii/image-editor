import ImageEditor from "./image-editor";

export default class Tool {
  current: boolean;
  active: boolean;
  lastUpdate: {
    time: Date;
    pos: {
      x: number;
      y: number;
    };
  };
  icon: HTMLElement;

  setCurrent(scope: ImageEditor) {
    for (const [key, value] of Object.entries(scope.tools)) {
      value.current = false;
    }
    this.current = true;
    scope.draw();
  }

  wheel(scope: ImageEditor, e: WheelEvent) {
    console.log("no wheel function set");
  }
  mousedown(scope: ImageEditor, e: MouseEvent) {
    console.log("no mousedown function set");
  }
  mouseup(scope: ImageEditor, e: MouseEvent) {
    console.log("no mouseup function set");
  }
  mousemove(scope: ImageEditor, e: MouseEvent) {
    console.log("no mousemove function set");
  }
  constructor(current: boolean) {
    this.current = current;
    this.active = false;
    this.lastUpdate = {
      time: new Date(),
      pos: {
        x: 0,
        y: 0,
      },
    };
    this.icon = document.createElement("i");
    this.icon.innerText = "?";
  }
}
