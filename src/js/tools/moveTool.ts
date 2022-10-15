import Tool from "./tool";
import ImageEditor from "../image-editor";
import icons from "../util/icons";

export default class MoveTool extends Tool {
  constructor(current: boolean) {
    super(current);
    this.icon = icons.move;
  }

  wheel(scope: ImageEditor, e: WheelEvent) {
    const modifier = e.deltaY / 1000 + 1;
    scope.canvas.view.zoom = scope.canvas.view.zoom * modifier;
    scope.canvas.draw();
  }
  mousedown(scope: ImageEditor, e: MouseEvent) {
    if (scope.canvas.coordsOnBg(e.x - scope.canvas.x, e.y - scope.canvas.y)) {
      this.active = true;
      scope.canvas.el.style.cursor = "grabbing";
      this.lastUpdate.pos.x = e.x - scope.canvas.x;
      this.lastUpdate.pos.y = e.y - scope.canvas.y;
    }
  }
  mouseup(scope: ImageEditor, e: MouseEvent) {
    this.active = false;
    scope.canvas.el.style.cursor = "auto";
    scope.canvas.draw();
  }
  mousemove(scope: ImageEditor, e: MouseEvent) {
    if (this.active) {
      if (new Date().getTime() - this.lastUpdate.time.getTime() >= 20) {
        this.lastUpdate.time = new Date();
        const offsetX = e.x - scope.canvas.x - this.lastUpdate.pos.x;
        const offsetY = e.y - scope.canvas.y - this.lastUpdate.pos.y;
        this.lastUpdate.pos.x = e.x - scope.canvas.x;
        this.lastUpdate.pos.y = e.y - scope.canvas.y;
        scope.canvas.view.offset.x += offsetX;
        scope.canvas.view.offset.y += offsetY;
        scope.canvas.draw();
      }
    } else {
      if (scope.canvas.coordsOnBg(e.x - scope.canvas.x, e.y - scope.canvas.y)) {
        scope.canvas.el.style.cursor = "grab";
      } else {
        scope.canvas.el.style.cursor = "auto";
      }
    }
  }
}
