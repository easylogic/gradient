import { editor } from "../../../../editor/editor";
import MenuItem from "./MenuItem";

export default class Save extends MenuItem {
  getIcon() {
    return "save";
  }
  getTitle() {
    return "+ Save";
  }

  clickButton(e) {
    editor.save();

    this.emit("loadGradientList")
  }
}
