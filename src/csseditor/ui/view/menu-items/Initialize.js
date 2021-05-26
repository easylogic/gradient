import { editor } from "../../../../editor/editor";
import { CHANGE_SELECTION } from "../../../types/event";
import MenuItem from "./MenuItem";

export default class Initialize extends MenuItem {
  getIcon() {
    return "init";
  }
  getTitle() {
    return "Initialize";
  }

  clickButton(e) {
    editor.selection.current.init();

    this.emit("refreshCanvas")
    this.emit("selectGradient")
    this.emit("hideGradientListView");
  }
}
