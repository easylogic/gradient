import BaseProperty from "./BaseProperty";
import { CLICK, CHANGE, INPUT } from "../../../../../util/Event";
import { Length } from "../../../../../editor/unit/Length";
import { editor } from "../../../../../editor/editor";
import { html } from "../../../../../util/functions/func";
import { EVENT } from "../../../../../util/UIElement";

const OutlineStyleLit = [
  "none",
  "hidden",
  "dotted",
  "dashed",
  "solid",
  "double",
  "groove",
  "ridge",
  "inset",
  "outset"
];

export default class OutlineProperty extends BaseProperty {
  getTitle() {
    return "Outline";
  }

  afterRender() {
    this.refresh();
  }

  getClassName() {
    return "outline";
  }

  getTemplateForOutlineProperty() {

    var current = editor.selection.current || {outline: {color: "white"}};

    return html`
      <div class="property-item outline-item">
        <div class="input-group">
          <div class="input-field">
            <div class="slider">
              <label>Width</label>
            </div>
            <div class="input-ui">
              <div class="input">
                <input type="number" min="0" max="100" value="0" ref="$width" />
              </div>
              <div class="select">
                <select class="unit" ref="$unit">
                  <option value="px">px</option>
                  <option value="em">em</option>
                </select>
              </div>
            </div>
          </div>
          <div class="input-field">
            <div class="slider">
              <label>Style</label>
            </div>
            <div class="input-ui">
              <div class="style">
                <select ref="$style">
                  ${OutlineStyleLit.map(it => {
                    return `<option value="${it}">${it}</option>`;
                  })}
                </select>
              </div>
            </div>
          </div>

          <div class="input-field">
            <div class="slider">
              <label>Color</label>
            </div>
            <div class="input-ui color-container">
              <ColorViewEditor ref='$color' key='outlineColor' value="${current.outline.color}" onchange="changeColor" />
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getBody() {
    return `
        ${this.getTemplateForOutlineProperty()}
    `;
  }

  refresh(){
    this.load();

    var current = editor.selection.current;

    if (current) {
      console.log(current.outline.color);
      this.children.$color.setValue(current.outline.color)
    }

  }

  [CHANGE("$unit")](e) {
    this.refreshOutlineInfo();
  }

  [INPUT("$width")](e) {
    this.refreshOutlineInfo();
  }

  [CHANGE("$style")](e) {
    this.refreshOutlineInfo();
  }

  refreshOutlineInfo() {
    var value = this.refs.$width.value;
    var unit = this.refs.$unit.value;
    var style = this.refs.$style.value;
    var color = this.children.$color.getValue()

    var current = editor.selection.current;

    if (current) {
      // ArtBoard, Layer ??? ????????? BackgroundImage ????????? ???????????????.
      current.setOutline({
        width: new Length(value, unit),
        style,
        color
      });

      this.refresh();

      this.emit("refreshCanvas");
    }
  }

  [EVENT("changeColor")]() {
    this.refreshOutlineInfo();
  }
}
