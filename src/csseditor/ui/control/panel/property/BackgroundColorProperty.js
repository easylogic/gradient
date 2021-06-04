import BaseProperty from "./BaseProperty";
import { editor } from "../../../../../editor/editor";
import { EMPTY_STRING } from "../../../../../util/css/types";
import { LOAD, CLICK, INPUT } from "../../../../../util/Event";
import { EVENT } from "../../../../../util/UIElement";
import {
  CHANGE_EDITOR,
  CHANGE_LAYER,
  CHANGE_SELECTION,
  CHANGE_ARTBOARD
} from "../../../../types/event";

export default class BackgroundColorProperty extends BaseProperty {
  getTitle() {
    return "Background Color";
  }

  getClassName() {
    return "background-color";
  }

  getBody() {
    var current = editor.selection.current || {backgroundColor: 'white'};

    return /*html*/`
            <div class='property-item background-color'>
              <ColorViewEditor ref='$color' key='background-color' value="${current.backgroundColor}" onchange="changeColor" />
            </div>
        `;
  }

  [EVENT(CHANGE_EDITOR, CHANGE_LAYER, CHANGE_ARTBOARD, CHANGE_SELECTION)]() {
    this.refresh();
  }

  refresh() {
    const current = editor.selection.current;
    this.children.$color.setValue(current.backgroundColor)
  }

  [EVENT('changeColor')] (key, color) {
    var current = editor.selection.current;
    if (current) {
      current.backgroundColor = color;
      this.emit("refreshCanvas", current);
    }
  }
}
