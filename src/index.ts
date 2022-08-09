import "./css/main.scss";
import ImageEditor from "./js/image-editor";

export function init(el: HTMLElement, imgSrc: String) {
  return new ImageEditor(el, imgSrc);
}
