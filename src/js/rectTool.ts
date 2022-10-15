import Tool from "./tool";
import Rect from "./rect";
import ImageEditor from "./image-editor";
import icons from "./icons";

export default class RectTool extends Tool {
  constructor(current: boolean) {
    super(current);
    this.icon = icons.rect;
  }

  wheel(scope: ImageEditor, e: WheelEvent) {
    const modifier = e.deltaY / 1000 + 1;
    scope.canvas.view.zoom = scope.canvas.view.zoom * modifier;
    scope.canvas.draw();
  }
  mousedown(scope: ImageEditor, e: MouseEvent) {
    if (scope.canvas.coordsOnBg(e.x - scope.canvas.x, e.y - scope.canvas.y)) {
      scope.canvas.addHistory();
      this.active = true;
      const pos = scope.canvas.mapCoordsToOrigin(e.x - scope.canvas.x, e.y - scope.canvas.y);
      this.lastUpdate.pos.x = pos.x;
      this.lastUpdate.pos.y = pos.y;

      scope.canvas.content.push(new Rect(scope.settings.activeColor, scope.settings.activeWidth, pos.x, pos.y, 0, 0)); //TODO: Make function of canvas
    }
  }
  mouseup(scope: ImageEditor, e: MouseEvent) {
    this.active = false;
    scope.canvas.draw();
  }
  mousemove(scope: ImageEditor, e: MouseEvent) {
    if (this.active) {
      if (scope.canvas.coordsOnBg(e.x - scope.canvas.x, e.y - scope.canvas.y)) {
        if (new Date().getTime() - this.lastUpdate.time.getTime() >= 20) {
          this.lastUpdate.time = new Date();
          const originPos = scope.canvas.mapCoordsToOrigin(e.x - scope.canvas.x, e.y - scope.canvas.y);
          scope.canvas.content[scope.canvas.content.length - 1].updateRect(originPos.x, originPos.y);
          scope.canvas.draw();
        }
      } else {
        this.active = false;
        scope.canvas.draw();
      }
    }
  }
}
