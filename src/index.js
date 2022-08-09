import "./css/main.scss";
import ImageEditor from "./js/image-editor";

export function init(el, imgSrc) {
  return new ImageEditor(el, imgSrc);
}
